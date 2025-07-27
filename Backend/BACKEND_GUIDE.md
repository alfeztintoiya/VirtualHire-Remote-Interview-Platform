# VirtualHire - Backend Developer Guide

## Overview

The VirtualHire backend is built with Node.js and Express.js, providing a robust API for user authentication, interview management, and real-time communication. This guide will help you understand the backend architecture and development patterns.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Socket.io** - Real-time bidirectional communication
- **bcrypt** - Password hashing
- **node-cron** - Scheduled tasks
- **cors** - Cross-origin resource sharing

## Project Structure

```
Backend/
├── controllers/           # Request handlers and business logic
│   ├── authentications.js    # Authentication operations
│   └── interview.js          # Interview management
├── middlewares/          # Custom middleware functions
│   └── authentication.js     # JWT verification middleware
├── model/               # Database schemas and models
│   ├── user.js              # User model
│   └── interview.js         # Interview model
├── routes/              # API route definitions
│   ├── authRoutes.js        # Authentication endpoints
│   └── interviewRoutes.js   # Interview endpoints
├── services/            # Business logic services
│   └── authentication.js    # Authentication service layer
├── jobs/                # Background jobs and scheduled tasks
│   └── interviewStatusCron.js # Interview status management
├── public/              # Static files
│   └── images/
│       └── userAvatar.png   # Default user avatar
├── app.js               # Main application file
├── signalingServer.js   # WebRTC signaling server
└── package.json         # Dependencies and scripts
```

## Database Models

### User Model (model/user.js)

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["interviewer", "candidate", "admin"],
    default: "candidate",
  },
  avatar: {
    type: String,
    default: "/images/userAvatar.png",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

### Interview Model (model/interview.js)

```javascript
const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    default: 60,
  },
  status: {
    type: String,
    enum: ["scheduled", "in-progress", "completed", "cancelled"],
    default: "scheduled",
  },
  roomId: {
    type: String,
    unique: true,
    required: true,
  },
  interviewType: {
    type: String,
    enum: ["technical", "behavioral", "system-design"],
    default: "technical",
  },
  programmingLanguage: {
    type: String,
    enum: ["javascript", "python", "java", "cpp", "csharp"],
    default: "javascript",
  },
  feedback: {
    interviewer: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comments: String,
    },
    candidate: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comments: String,
    },
  },
  codeSubmissions: [
    {
      timestamp: Date,
      code: String,
      language: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate unique room ID
interviewSchema.pre("save", function (next) {
  if (!this.roomId) {
    this.roomId = `interview_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Interview", interviewSchema);
```

## Controllers

### Authentication Controller (controllers/authentications.js)

```javascript
const User = require("../model/user");
const jwt = require("jsonwebtoken");
const authService = require("../services/authentication");

class AuthController {
  // User registration
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and password are required",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Create new user
      const user = new User({ name, email, password, role });
      await user.save();

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      // Find user and verify password
      const user = await User.findOne({ email, isActive: true });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Generate JWT token
      const token = authService.generateToken(user._id);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { name, avatar } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (avatar) updateData.avatar = avatar;
      updateData.updatedAt = new Date();

      const user = await User.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
        select: "-password",
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new AuthController();
```

### Interview Controller (controllers/interview.js)

```javascript
const Interview = require("../model/interview");
const User = require("../model/user");

class InterviewController {
  // Create new interview
  async createInterview(req, res) {
    try {
      const {
        title,
        description,
        candidateEmail,
        scheduledTime,
        duration,
        interviewType,
        programmingLanguage,
      } = req.body;

      // Find candidate by email
      const candidate = await User.findOne({ email: candidateEmail });
      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      // Create interview
      const interview = new Interview({
        title,
        description,
        interviewer: req.user.id,
        candidate: candidate._id,
        scheduledTime: new Date(scheduledTime),
        duration,
        interviewType,
        programmingLanguage,
      });

      await interview.save();
      await interview.populate(["interviewer", "candidate"], "name email");

      res.status(201).json({
        success: true,
        message: "Interview scheduled successfully",
        data: interview,
      });
    } catch (error) {
      console.error("Create interview error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user interviews
  async getUserInterviews(req, res) {
    try {
      const { status, upcoming } = req.query;
      const query = {
        $or: [{ interviewer: req.user.id }, { candidate: req.user.id }],
      };

      if (status) {
        query.status = status;
      }

      if (upcoming === "true") {
        query.scheduledTime = { $gte: new Date() };
      }

      const interviews = await Interview.find(query)
        .populate("interviewer", "name email")
        .populate("candidate", "name email")
        .sort({ scheduledTime: -1 });

      res.json({
        success: true,
        data: interviews,
      });
    } catch (error) {
      console.error("Get interviews error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get interview by ID or room ID
  async getInterview(req, res) {
    try {
      const { id } = req.params;

      // Try to find by ID first, then by room ID
      let interview = await Interview.findById(id)
        .populate("interviewer", "name email")
        .populate("candidate", "name email");

      if (!interview) {
        interview = await Interview.findOne({ roomId: id })
          .populate("interviewer", "name email")
          .populate("candidate", "name email");
      }

      if (!interview) {
        return res.status(404).json({
          success: false,
          message: "Interview not found",
        });
      }

      // Check if user is authorized to view this interview
      const userId = req.user.id;
      if (
        interview.interviewer._id.toString() !== userId &&
        interview.candidate._id.toString() !== userId
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: interview,
      });
    } catch (error) {
      console.error("Get interview error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update interview status
  async updateInterviewStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const interview = await Interview.findById(id);
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: "Interview not found",
        });
      }

      interview.status = status;
      interview.updatedAt = new Date();
      await interview.save();

      res.json({
        success: true,
        message: "Interview status updated",
        data: interview,
      });
    } catch (error) {
      console.error("Update interview status error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Submit code during interview
  async submitCode(req, res) {
    try {
      const { id } = req.params;
      const { code, language } = req.body;

      const interview = await Interview.findById(id);
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: "Interview not found",
        });
      }

      interview.codeSubmissions.push({
        timestamp: new Date(),
        code,
        language,
      });

      await interview.save();

      res.json({
        success: true,
        message: "Code submitted successfully",
      });
    } catch (error) {
      console.error("Submit code error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Submit feedback
  async submitFeedback(req, res) {
    try {
      const { id } = req.params;
      const { rating, comments, type } = req.body; // type: 'interviewer' or 'candidate'

      const interview = await Interview.findById(id);
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: "Interview not found",
        });
      }

      interview.feedback[type] = { rating, comments };
      await interview.save();

      res.json({
        success: true,
        message: "Feedback submitted successfully",
      });
    } catch (error) {
      console.error("Submit feedback error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new InterviewController();
```

## Middleware

### Authentication Middleware (middlewares/authentication.js)

```javascript
const jwt = require("jsonwebtoken");
const User = require("../model/user");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Role-based authorization
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorize,
};
```

## Services

### Authentication Service (services/authentication.js)

```javascript
const jwt = require("jsonwebtoken");

class AuthService {
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }
}

module.exports = new AuthService();
```

## Routes

### Authentication Routes (routes/authRoutes.js)

```javascript
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authentications");
const { authenticateToken } = require("../middlewares/authentication");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", authenticateToken, authController.getProfile);
router.put("/profile", authenticateToken, authController.updateProfile);

module.exports = router;
```

### Interview Routes (routes/interviewRoutes.js)

```javascript
const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interview");
const {
  authenticateToken,
  authorize,
} = require("../middlewares/authentication");

// All interview routes require authentication
router.use(authenticateToken);

// Interview CRUD operations
router.post(
  "/",
  authorize(["interviewer", "admin"]),
  interviewController.createInterview
);
router.get("/", interviewController.getUserInterviews);
router.get("/:id", interviewController.getInterview);
router.put("/:id/status", interviewController.updateInterviewStatus);

// Interview actions
router.post("/:id/code", interviewController.submitCode);
router.post("/:id/feedback", interviewController.submitFeedback);

module.exports = router;
```

## WebRTC Signaling Server (signalingServer.js)

```javascript
const { Server } = require("socket.io");

class SignalingServer {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    this.rooms = new Map(); // Store room information
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Join interview room
      socket.on("join-room", ({ roomId, userId }) => {
        socket.join(roomId);

        // Add user to room tracking
        if (!this.rooms.has(roomId)) {
          this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add({ socketId: socket.id, userId });

        // Notify other users in the room
        socket.to(roomId).emit("user-joined", { userId, socketId: socket.id });

        console.log(`User ${userId} joined room ${roomId}`);
      });

      // Handle WebRTC offer
      socket.on("offer", ({ offer, roomId, targetSocketId }) => {
        socket.to(targetSocketId).emit("offer", {
          offer,
          senderSocketId: socket.id,
        });
      });

      // Handle WebRTC answer
      socket.on("answer", ({ answer, roomId, targetSocketId }) => {
        socket.to(targetSocketId).emit("answer", {
          answer,
          senderSocketId: socket.id,
        });
      });

      // Handle ICE candidates
      socket.on("ice-candidate", ({ candidate, roomId, targetSocketId }) => {
        socket.to(targetSocketId).emit("ice-candidate", {
          candidate,
          senderSocketId: socket.id,
        });
      });

      // Handle code editor changes
      socket.on("code-change", ({ roomId, code, language }) => {
        socket.to(roomId).emit("code-change", { code, language });
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        // Remove user from all rooms
        this.rooms.forEach((users, roomId) => {
          const userToRemove = Array.from(users).find(
            (user) => user.socketId === socket.id
          );
          if (userToRemove) {
            users.delete(userToRemove);
            socket
              .to(roomId)
              .emit("user-left", { userId: userToRemove.userId });

            if (users.size === 0) {
              this.rooms.delete(roomId);
            }
          }
        });
      });
    });
  }

  getRoomUsers(roomId) {
    return this.rooms.get(roomId) || new Set();
  }
}

module.exports = SignalingServer;
```

## Background Jobs

### Interview Status Cron Job (jobs/interviewStatusCron.js)

```javascript
const cron = require("node-cron");
const Interview = require("../model/interview");

class InterviewStatusCron {
  start() {
    // Run every minute to check for status updates
    cron.schedule("* * * * *", async () => {
      try {
        await this.updateInterviewStatuses();
      } catch (error) {
        console.error("Cron job error:", error);
      }
    });

    console.log("Interview status cron job started");
  }

  async updateInterviewStatuses() {
    const now = new Date();

    // Mark interviews as in-progress if they've started
    await Interview.updateMany(
      {
        status: "scheduled",
        scheduledTime: { $lte: now },
      },
      {
        status: "in-progress",
        updatedAt: now,
      }
    );

    // Mark interviews as completed if they've exceeded duration
    const inProgressInterviews = await Interview.find({
      status: "in-progress",
    });

    for (const interview of inProgressInterviews) {
      const endTime = new Date(
        interview.scheduledTime.getTime() + interview.duration * 60000
      );
      if (now > endTime) {
        interview.status = "completed";
        interview.updatedAt = now;
        await interview.save();
      }
    }
  }
}

module.exports = new InterviewStatusCron();
```

## Main Application File (app.js)

```javascript
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

// Import services
const SignalingServer = require("./signalingServer");
const InterviewStatusCron = require("./jobs/interviewStatusCron");

const app = express();
const server = http.createServer(app);

// Initialize signaling server
const signalingServer = new SignalingServer(server);

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/virtualhire", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Start cron jobs after database connection
    InterviewStatusCron.start();
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "VirtualHire API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`VirtualHire backend server running on port ${PORT}`);
});

module.exports = app;
```

## Environment Configuration

### Environment Variables (.env)

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/virtualhire

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload Configuration
MAX_FILE_SIZE=10mb
UPLOAD_PATH=./public/uploads
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register

Register a new user

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "candidate"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "candidate"
  }
}
```

#### POST /api/auth/login

User login

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "candidate"
    }
  }
}
```

### Interview Endpoints

#### POST /api/interviews

Create a new interview (Interviewer only)

**Headers:**

```
Authorization: Bearer your_jwt_token
```

**Request Body:**

```json
{
  "title": "Frontend Developer Interview",
  "description": "React and JavaScript assessment",
  "candidateEmail": "candidate@example.com",
  "scheduledTime": "2024-01-15T10:00:00Z",
  "duration": 60,
  "interviewType": "technical",
  "programmingLanguage": "javascript"
}
```

#### GET /api/interviews

Get user's interviews

**Headers:**

```
Authorization: Bearer your_jwt_token
```

**Query Parameters:**

- `status` (optional): Filter by interview status
- `upcoming` (optional): Get only upcoming interviews

## Development Workflow

### Getting Started

1. **Install Dependencies**

   ```bash
   cd Backend
   npm install
   ```

2. **Environment Setup**
   Create `.env` file with required environment variables

3. **Start MongoDB**

   ```bash
   mongod
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Testing

#### Unit Testing Setup

```bash
npm install --save-dev jest supertest
```

#### Example Test

```javascript
const request = require("supertest");
const app = require("../app");

describe("Authentication", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "candidate",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
    });
  });
});
```

## Security Best Practices

### Password Security

- Use bcrypt for password hashing
- Enforce minimum password requirements
- Implement password reset functionality

### JWT Security

- Use strong, random JWT secrets
- Implement token expiration
- Consider refresh token implementation

### Input Validation

```javascript
const { body, validationResult } = require("express-validator");

const validateRegistration = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("name").trim().isLength({ min: 2 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];
```

### CORS Configuration

```javascript
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

## Deployment

### Production Configuration

#### Environment Variables

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://production_mongodb_uri
JWT_SECRET=super_secure_production_secret
```

#### Process Management with PM2

```bash
npm install -g pm2
pm2 start app.js --name "virtualhire-backend"
pm2 startup
pm2 save
```

### Docker Setup

#### Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "app.js"]
```

#### docker-compose.yml

```yaml
version: "3.8"

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/virtualhire
    depends_on:
      - mongo

  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## Monitoring and Logging

### Request Logging

```javascript
const morgan = require("morgan");

app.use(
  morgan("combined", {
    stream: {
      write: (message) => {
        console.log(message.trim());
      },
    },
  })
);
```

### Error Logging

```javascript
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**

   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

2. **JWT Token Issues**

   - Verify JWT secret configuration
   - Check token expiration
   - Validate token format

3. **WebRTC Signaling Issues**
   - Check Socket.io configuration
   - Verify CORS settings
   - Test WebSocket connection

## Contributing

1. Follow the established code structure and patterns
2. Write comprehensive tests for new features
3. Use proper error handling and logging
4. Update API documentation for new endpoints
5. Follow security best practices

For more information, refer to the main project README.md file.
