# VirtualHire - Critical Code Architecture & Design Decisions

## Table of Contents
1. [Core Architecture Overview](#core-architecture-overview)
2. [Critical Backend Components](#critical-backend-components)
3. [Critical Frontend Components](#critical-frontend-components)
4. [Real-time Communication Flow](#real-time-communication-flow)
5. [Authentication & Security](#authentication--security)
6. [Database Design](#database-design)
7. [Design Decisions & Alternatives](#design-decisions--alternatives)

---

## Core Architecture Overview

### Why This Architecture?

VirtualHire uses a **client-server architecture with real-time communication**:

```
┌─────────────────┐    WebRTC P2P     ┌─────────────────┐
│   React Client  │◄─────────────────►│   React Client  │
│   (Interviewer) │                   │   (Candidate)   │
└─────────┬───────┘                   └─────────┬───────┘
          │                                     │
          │ HTTP/WS                             │ HTTP/WS
          │                                     │
          ▼                                     ▼
    ┌─────────────────────────────────────────────────────┐
    │            Node.js Backend Server                   │
    │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐│
    │  │   Express   │  │   Socket.io  │  │   MongoDB   ││
    │  │   (HTTP)    │  │  (WebSocket) │  │ (Database)  ││
    │  └─────────────┘  └──────────────┘  └─────────────┘│
    └─────────────────────────────────────────────────────┘
```

**Why not alternatives?**
- ❌ **Microservices**: Overkill for this scope; adds complexity
- ❌ **GraphQL**: REST is simpler for CRUD operations
- ❌ **Firebase**: Need custom WebRTC signaling logic

---

## Critical Backend Components

### 1. WebRTC Signaling Server (`signalingServer.js`)

**THE MOST CRITICAL COMPONENT** - Enables real-time video communication

```javascript
class SignalingServer {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    this.rooms = new Map(); // Track active rooms
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      // 1. User joins interview room
      socket.on('join-room', ({ roomId, userId }) => {
        socket.join(roomId);
        this.addUserToRoom(roomId, socket.id, userId);
        
        // Notify others in room
        socket.to(roomId).emit('user-joined', { 
          userId, 
          socketId: socket.id 
        });
      });

      // 2. WebRTC Offer (Initiator -> Receiver)
      socket.on('offer', ({ offer, roomId, targetSocketId }) => {
        socket.to(targetSocketId).emit('offer', {
          offer,
          senderSocketId: socket.id
        });
      });

      // 3. WebRTC Answer (Receiver -> Initiator)  
      socket.on('answer', ({ answer, roomId, targetSocketId }) => {
        socket.to(targetSocketId).emit('answer', {
          answer,
          senderSocketId: socket.id
        });
      });

      // 4. ICE Candidates (Bidirectional)
      socket.on('ice-candidate', ({ candidate, roomId, targetSocketId }) => {
        socket.to(targetSocketId).emit('ice-candidate', {
          candidate,
          senderSocketId: socket.id
        });
      });

      // 5. Real-time code collaboration
      socket.on('code-change', ({ roomId, code, language }) => {
        socket.to(roomId).emit('code-change', { code, language });
      });
    });
  }
}
```

**WHY this approach?**
✅ **Socket.io over native WebSocket**: Auto-reconnection, fallbacks  
✅ **Room-based communication**: Isolates interview sessions  
✅ **Target-specific messaging**: Direct peer communication  

**WHY NOT alternatives?**
❌ **Native WebSocket**: No auto-reconnection, more complex  
❌ **Server-side video processing**: Expensive, adds latency  
❌ **Third-party services (Twilio, Agora)**: Cost, vendor lock-in  

### 2. Authentication Middleware (`middlewares/authentication.js`)

**SECURITY CRITICAL** - Protects all API endpoints

```javascript
const authenticateToken = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // 2. Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Get user from database (fresh data)
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
```

**WHY this approach?**
✅ **JWT over sessions**: Stateless, scalable  
✅ **Database lookup**: Fresh user data, handle deactivated users  
✅ **Bearer token**: Industry standard  

**WHY NOT alternatives?**
❌ **Session-based auth**: Requires session store, not scalable  
❌ **Basic auth**: Insecure for web apps  
❌ **OAuth only**: Overkill for this use case  

### 3. Interview Controller (`controllers/interview.js`)

**BUSINESS LOGIC CORE** - Manages interview lifecycle

```javascript
class InterviewController {
  async createInterview(req, res) {
    try {
      const {
        title,
        description, 
        candidateEmail,
        scheduledTime,
        duration,
        interviewType,
        programmingLanguage
      } = req.body;

      // 1. Validate candidate exists
      const candidate = await User.findOne({ email: candidateEmail });
      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }

      // 2. Create interview with auto-generated roomId
      const interview = new Interview({
        title,
        description,
        interviewer: req.user.id, // From auth middleware
        candidate: candidate._id,
        scheduledTime: new Date(scheduledTime),
        duration,
        interviewType,
        programmingLanguage
        // roomId auto-generated in pre-save hook
      });

      await interview.save();
      
      // 3. Populate user details for response
      await interview.populate(['interviewer', 'candidate'], 'name email');

      res.status(201).json({
        success: true,
        message: 'Interview scheduled successfully',
        data: interview
      });
    } catch (error) {
      console.error('Create interview error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
```

**WHY this approach?**
✅ **Email-based candidate lookup**: User-friendly  
✅ **Auto-generated roomId**: Unique, secure  
✅ **Populate related data**: Reduces frontend API calls  

---

## Critical Frontend Components

### 1. WebRTC Component (`components/ui/WebRTC/WebRTCComponent.tsx`)

**MOST COMPLEX FRONTEND COMPONENT** - Handles video calls

```typescript
interface WebRTCProps {
  roomId: string;
  userId: string;
  onConnectionStatusChange: (status: string) => void;
}

export const WebRTCComponent: React.FC<WebRTCProps> = ({ 
  roomId, 
  userId, 
  onConnectionStatusChange 
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    initializeWebRTC();
    return () => cleanup();
  }, []);

  const initializeWebRTC = async () => {
    try {
      // 1. Get user media (camera + microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // 2. Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // 3. Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // 4. Handle remote stream
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // 5. Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            roomId,
            targetSocketId: remoteSocketId
          });
        }
      };

      setPeerConnection(pc);

      // 6. Initialize socket connection
      const socketConnection = io(SOCKET_URL);
      setSocket(socketConnection);

      // Join room
      socketConnection.emit('join-room', { roomId, userId });

      // Handle signaling events
      setupSignalingEventHandlers(socketConnection, pc);

    } catch (error) {
      console.error('WebRTC initialization failed:', error);
      onConnectionStatusChange('failed');
    }
  };

  const setupSignalingEventHandlers = (socket: Socket, pc: RTCPeerConnection) => {
    socket.on('user-joined', async ({ userId: joinedUserId, socketId }) => {
      // Create and send offer to new user
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socket.emit('offer', {
        offer,
        roomId,
        targetSocketId: socketId
      });
    });

    socket.on('offer', async ({ offer, senderSocketId }) => {
      // Receive offer and send answer
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socket.emit('answer', {
        answer,
        roomId,
        targetSocketId: senderSocketId
      });
    });

    socket.on('answer', async ({ answer }) => {
      await pc.setRemoteDescription(answer);
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      await pc.addIceCandidate(candidate);
    });
  };

  return (
    <div className="webrtc-container">
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="local-video"
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="remote-video"
      />
    </div>
  );
};
```

**WHY this approach?**
✅ **Direct WebRTC**: Low latency, high quality  
✅ **STUN servers**: NAT traversal for most networks  
✅ **React hooks**: Clean state management  
✅ **useRef for video elements**: Direct DOM access needed  

**WHY NOT alternatives?**
❌ **WebRTC libraries (simple-peer)**: Less control, abstracts important details  
❌ **TURN servers**: Expensive, not always needed  
❌ **Screen sharing only**: Need face-to-face interaction  

### 2. Protected Route Component (`components/ui/ProtectedRoute.tsx`)

**SECURITY CRITICAL** - Client-side route protection

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // 1. Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // 2. Verify token with backend
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.data);
        setIsAuthenticated(true);
      } else {
        // Token invalid, remove it
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    }
  };

  // Loading state
  if (isAuthenticated === null) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Authenticated, render protected content
  return <>{children}</>;
};
```

**WHY this approach?**
✅ **Server verification**: Don't trust client-side JWT parsing  
✅ **Loading state**: Better UX during auth check  
✅ **Auto-redirect**: Seamless user experience  

**WHY NOT alternatives?**
❌ **Client-side JWT decoding**: Can be manipulated  
❌ **Context-only auth**: Need per-route verification  
❌ **No loading state**: Poor UX with auth flicker  

---

## Real-time Communication Flow

### The Complete WebRTC Handshake Process

```
Interviewer (Browser A)              Backend Server              Candidate (Browser B)
        │                                │                                │
        │ 1. connect to socket.io        │                                │
        ├─────────────────────────────►  │                                │
        │                                │ 2. connect to socket.io        │
        │                                │  ◄─────────────────────────────┤
        │                                │                                │
        │ 3. join-room {roomId, userId}  │                                │
        ├─────────────────────────────►  │                                │
        │                                │ 4. join-room {roomId, userId}  │
        │                                │  ◄─────────────────────────────┤
        │                                │                                │
        │ 5. user-joined event           │ 6. user-joined event           │
        │  ◄─────────────────────────────┤─────────────────────────────►  │
        │                                │                                │
        │ 7. createOffer()               │                                │
        │ 8. setLocalDescription()       │                                │
        │ 9. offer via socket            │                                │
        ├─────────────────────────────►  │ 10. relay offer                │
        │                                ├─────────────────────────────►  │
        │                                │ 11. setRemoteDescription()     │
        │                                │ 12. createAnswer()             │
        │                                │ 13. setLocalDescription()      │
        │                                │ 14. answer via socket          │
        │ 15. relay answer               │  ◄─────────────────────────────┤
        │  ◄─────────────────────────────┤                                │
        │ 16. setRemoteDescription()     │                                │
        │                                │                                │
        │ 17. ICE candidates exchange (bidirectional)                     │
        │ ◄─────────────────────────────────────────────────────────────► │
        │                                │                                │
        │ 18. Direct P2P connection established                           │
        │ ◄═══════════════════════════════════════════════════════════════► │
        │             (Video, Audio, Data)                                │
```

**WHY this complex flow?**
✅ **NAT traversal**: Most networks block direct connections  
✅ **Signaling server**: Coordinate the handshake  
✅ **P2P after handshake**: Reduces server load, improves latency  

---

## Authentication & Security

### JWT Token Flow

```typescript
// Backend: Generate token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Frontend: Store and use token
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store in localStorage (persistent across browser sessions)
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
};

// API calls with token
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  return fetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};
```

**WHY JWT over sessions?**
✅ **Stateless**: No server-side storage needed  
✅ **Scalable**: Works across multiple servers  
✅ **Mobile-friendly**: Easy to implement in mobile apps  

**WHY localStorage over cookies?**
✅ **Explicit control**: Manual token management  
✅ **CORS-friendly**: No cookie domain issues  
❌ **XSS vulnerable**: But mitigated by Content Security Policy  

---

## Database Design

### User Model Design Decisions

```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true                    // WHY: Remove whitespace
  },
  email: {
    type: String,
    required: true,
    unique: true,                 // WHY: Login identifier
    lowercase: true,              // WHY: Case-insensitive login
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6                  // WHY: Basic security requirement
  },
  role: {
    type: String,
    enum: ['interviewer', 'candidate', 'admin'],  // WHY: Type safety
    default: 'candidate'          // WHY: Most users are candidates
  },
  isActive: {
    type: Boolean,
    default: true                 // WHY: Soft delete capability
  },
  lastLogin: Date,                // WHY: Audit trail
  createdAt: {
    type: Date,
    default: Date.now             // WHY: Audit trail
  }
});

// Pre-save hook for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);    // WHY: 10 rounds = good security/performance balance
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

**WHY bcrypt over other hashing?**
✅ **Adaptive**: Can increase cost factor over time  
✅ **Salt included**: Prevents rainbow table attacks  
✅ **Industry standard**: Well-tested and trusted  

**WHY NOT alternatives?**
❌ **Plain text**: Obviously insecure  
❌ **MD5/SHA1**: Too fast, vulnerable to rainbow tables  
❌ **Argon2**: Newer but bcrypt is more widely supported  

### Interview Model Relationships

```javascript
const interviewSchema = new mongoose.Schema({
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',                  // WHY: Relational integrity
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: String,
    unique: true,                 // WHY: Prevent room conflicts
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'          // WHY: Clear state machine
  },
  codeSubmissions: [{             // WHY: Array for multiple submissions
    timestamp: Date,
    code: String,
    language: String
  }]
});

// Auto-generate unique roomId
interviewSchema.pre('save', function(next) {
  if (!this.roomId) {
    this.roomId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});
```

**WHY MongoDB over SQL?**
✅ **Flexible schema**: Interview data varies by type  
✅ **JSON-like**: Matches JavaScript objects naturally  
✅ **Embedded arrays**: Code submissions fit naturally  

**WHY NOT alternatives?**
❌ **PostgreSQL**: More complex for this use case  
❌ **SQLite**: Not suitable for production web apps  
❌ **Firebase**: Vendor lock-in, WebRTC signaling complexity  

---

## Design Decisions & Alternatives

### 1. Why React + TypeScript?

**CHOSEN: React with TypeScript**
```typescript
interface InterviewProps {
  interview: Interview;
  onStatusChange: (status: InterviewStatus) => void;
}

const InterviewCard: React.FC<InterviewProps> = ({ interview, onStatusChange }) => {
  // Type safety ensures correct prop usage
  return (
    <div>
      <h3>{interview.title}</h3>
      <button onClick={() => onStatusChange('in-progress')}>
        Start Interview
      </button>
    </div>
  );
};
```

**WHY React?**
✅ **Component-based**: Reusable UI components  
✅ **Large ecosystem**: Many WebRTC libraries  
✅ **Virtual DOM**: Efficient updates for real-time features  

**WHY TypeScript?**
✅ **Type safety**: Catch errors at compile time  
✅ **Better IDE support**: IntelliSense, refactoring  
✅ **Self-documenting**: Interface definitions as documentation  

**WHY NOT alternatives?**
❌ **Vue.js**: Smaller ecosystem for WebRTC  
❌ **Angular**: Too heavy for this project scope  
❌ **Plain JavaScript**: Error-prone for complex applications  

### 2. Why Vite over Create React App?

**CHOSEN: Vite**
```javascript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'  // WHY: Avoid CORS in development
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {              // WHY: Code splitting for performance
          vendor: ['react', 'react-dom'],
          webrtc: ['socket.io-client']
        }
      }
    }
  }
});
```

**WHY Vite?**
✅ **Fast HMR**: Instant updates during development  
✅ **ES modules**: Modern bundling approach  
✅ **Built-in TypeScript**: No additional configuration  

**WHY NOT Create React App?**
❌ **Slow builds**: Webpack is slower than Vite  
❌ **Complex eject**: Hard to customize build process  
❌ **Large bundle size**: Less optimization options  

### 3. Why Socket.io over Native WebSockets?

**CHOSEN: Socket.io**
```javascript
// Auto-reconnection and fallbacks
const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],  // WHY: Fallback support
  reconnection: true,                    // WHY: Handle network issues
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Room-based communication
socket.emit('join-room', { roomId, userId });
socket.to(roomId).emit('user-joined', { userId });
```

**WHY Socket.io?**
✅ **Auto-reconnection**: Handles network issues  
✅ **Transport fallbacks**: Works behind restrictive firewalls  
✅ **Room support**: Built-in namespace isolation  
✅ **Error handling**: Better than raw WebSocket  

**WHY NOT native WebSocket?**
❌ **Manual reconnection**: Complex to implement reliably  
❌ **No fallbacks**: Fails behind some corporate firewalls  
❌ **No rooms**: Would need to implement room logic manually  

### 4. Why JWT over Session-based Auth?

**CHOSEN: JWT**
```javascript
// Stateless authentication
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Client stores token
localStorage.setItem('token', token);

// Server validates without state
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(decoded.userId);
```

**WHY JWT?**
✅ **Stateless**: No server-side session storage  
✅ **Scalable**: Works across multiple server instances  
✅ **Mobile-friendly**: Easy to implement in mobile apps  
✅ **Decentralized**: Can be verified without database lookup  

**WHY NOT session-based?**
❌ **Stateful**: Requires session store (Redis, database)  
❌ **Server memory**: Sessions consume server memory  
❌ **Scaling issues**: Need shared session store for multiple servers  

### 5. Why This Database Schema Design?

**CHOSEN: Document-based with References**
```javascript
// User collection (normalized)
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  role: "interviewer"
}

// Interview collection (with references)
{
  _id: ObjectId("..."),
  interviewer: ObjectId("..."),     // WHY: Reference for flexibility
  candidate: ObjectId("..."),
  codeSubmissions: [               // WHY: Embedded for performance
    {
      timestamp: Date,
      code: "console.log('hello')",
      language: "javascript"
    }
  ]
}
```

**WHY this hybrid approach?**
✅ **References for users**: Users change independently  
✅ **Embedded submissions**: Code submissions are part of interview  
✅ **Flexible queries**: Can populate or not based on needs  

**WHY NOT full normalization?**
❌ **Too many joins**: Would need multiple queries for interview details  
❌ **Complex aggregation**: MongoDB aggregation can be complex  

**WHY NOT full denormalization?**
❌ **Data inconsistency**: User name changes wouldn't propagate  
❌ **Storage waste**: Duplicate user data in every interview  

---

## Performance Optimizations

### Frontend Optimizations

```typescript
// 1. Code splitting for large components
const InterviewRoom = lazy(() => import('./pages/InterviewRoom'));

// 2. Memoization for expensive calculations
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => processExpensiveOperation(item));
  }, [data]);

  return <div>{processedData}</div>;
});

// 3. Debounced code editor updates
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

### Backend Optimizations

```javascript
// 1. Database indexing
userSchema.index({ email: 1 });              // Login queries
interviewSchema.index({ interviewer: 1 });   // User's interviews
interviewSchema.index({ candidate: 1 });     // Candidate's interviews
interviewSchema.index({ roomId: 1 });        // Room lookup

// 2. Selective field population
const interviews = await Interview.find(query)
  .populate('interviewer', 'name email')      // Only needed fields
  .populate('candidate', 'name email')
  .select('-codeSubmissions');                // Exclude large arrays

// 3. Caching with appropriate TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedUser = async (userId) => {
  const cached = cache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const user = await User.findById(userId);
  cache.set(userId, { data: user, timestamp: Date.now() });
  return user;
};
```

---

## Security Considerations

### Input Validation & Sanitization

```javascript
// Backend validation
const { body, validationResult } = require('express-validator');

const validateInterview = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),                    // WHY: Prevent XSS
  body('candidateEmail')
    .isEmail()
    .normalizeEmail(),            // WHY: Consistent email format
  body('scheduledTime')
    .isISO8601()                  // WHY: Prevent date injection
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

### CORS Configuration

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,              // WHY: Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,      // 15 minutes
  max: 5,                        // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth/login', loginLimiter);
```

---

## Conclusion

VirtualHire's architecture prioritizes:

1. **Real-time Performance**: WebRTC for low-latency video, Socket.io for reliable signaling
2. **Security**: JWT authentication, input validation, CORS protection
3. **Scalability**: Stateless design, MongoDB flexibility, modular components
4. **Developer Experience**: TypeScript safety, clear separation of concerns
5. **User Experience**: Optimistic updates, error handling, responsive design

Each technology choice was made to balance simplicity, performance, security, and maintainability for a remote interview platform's specific requirements.
