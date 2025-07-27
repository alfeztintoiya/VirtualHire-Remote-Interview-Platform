# VirtualHire - Frontend Developer Guide

## Overview

The VirtualHire frontend is built with React, TypeScript, and Vite, providing a modern and responsive user interface for conducting remote technical interviews. This guide will help you understand the codebase structure and development patterns.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **WebRTC** - Real-time video communication
- **Socket.io** - Real-time communication with backend

## Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── interviewLogo.jpeg # VirtualHire logo
│   └── vite.svg           # Vite logo
├── src/
│   ├── components/        # Reusable components
│   │   └── ui/           # Base UI components
│   │       ├── WebRTC/   # Video conference components
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── CodeEditor.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── Loader.tsx
│   │       ├── Navbar.tsx
│   │       ├── popover.tsx
│   │       ├── ProtectedRoute.tsx
│   │       ├── select.tsx
│   │       ├── sonner.tsx
│   │       ├── StartCallDialog.tsx
│   │       └── textarea.tsx
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Home.tsx
│   │   ├── InterviewRoom.tsx
│   │   ├── Login.tsx
│   │   ├── Schedule.tsx
│   │   └── Signup.tsx
│   ├── hooks/             # Custom React hooks
│   │   └── useSubtitles.tsx
│   ├── lib/               # Utility functions
│   │   └── utils.ts
│   ├── constants/         # Application constants
│   │   └── index.ts
│   ├── assets/            # Static assets
│   │   └── react.svg
│   ├── App.tsx            # Main application component
│   ├── App.css            # Global styles
│   ├── main.tsx           # Application entry point
│   ├── index.css          # Tailwind CSS imports
│   └── vite-env.d.ts      # Vite type definitions
├── components.json        # shadcn/ui configuration
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json      # App-specific TypeScript config
├── tsconfig.node.json     # Node-specific TypeScript config
└── vite.config.ts         # Vite configuration
```

## Key Components

### Authentication Components

#### Login.tsx

- Handles user authentication
- Form validation using controlled components
- JWT token storage and management
- Redirects to dashboard upon successful login

#### Signup.tsx

- User registration functionality
- Input validation and error handling
- Password strength requirements
- Auto-redirect to login after successful registration

#### ProtectedRoute.tsx

- Route protection based on authentication status
- JWT token validation
- Automatic redirect to login for unauthenticated users

### Dashboard Components

#### Dashboard.tsx

- Main interface after login
- Displays upcoming interviews
- Quick actions for scheduling and joining interviews
- Interview status tracking

#### Navbar.tsx

- Navigation component across all pages
- User profile dropdown
- Logout functionality
- Responsive design for mobile devices

### Interview Components

#### InterviewRoom.tsx

- Main interview interface
- Integrates video calling and code editor
- Real-time communication management
- Interview controls and settings

#### CodeEditor.tsx

- Built-in code editor for technical interviews
- Syntax highlighting for multiple languages
- Real-time collaboration features
- Code execution capabilities

#### WebRTC Components

##### WebRTCComponent.tsx

```typescript
interface WebRTCProps {
  roomId: string;
  userId: string;
  onConnectionStatusChange: (status: string) => void;
}
```

- Main video conferencing logic
- Peer-to-peer connection management
- Audio/video stream handling
- Screen sharing capabilities

##### CameraPreview.tsx

- Pre-interview camera and microphone testing
- Device selection (multiple cameras/microphones)
- Audio/video quality testing
- Device permission handling

##### MeetingSetupDialog.tsx

- Pre-meeting setup interface
- Device configuration
- Audio/video preview
- Network connectivity check

### UI Components (shadcn/ui)

The project uses shadcn/ui components for consistent design:

- **Button**: Various button styles and variants
- **Card**: Content containers with consistent styling
- **Dialog**: Modal dialogs for forms and confirmations
- **Input**: Form input components with validation
- **Calendar**: Date picker for interview scheduling
- **Select**: Dropdown selection components

### Custom Hooks

#### useSubtitles.tsx

```typescript
interface SubtitleOptions {
  language: string;
  continuous: boolean;
}

export const useSubtitles = (options: SubtitleOptions) => {
  // Speech-to-text implementation
  // Real-time subtitle generation
  // Language support
};
```

## State Management

The application uses React's built-in state management:

- **useState**: Local component state
- **useEffect**: Side effects and lifecycle management
- **useContext**: Global state sharing (auth, theme)
- **Custom hooks**: Reusable stateful logic

### Authentication State

```typescript
interface AuthContext {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
```

## API Integration

### API Client Setup

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    return response.json();
  }
}
```

### API Endpoints

- **Authentication**

  - `POST /api/auth/login` - User login
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/logout` - User logout

- **Interviews**

  - `GET /api/interviews` - Get user interviews
  - `POST /api/interviews` - Create new interview
  - `PUT /api/interviews/:id` - Update interview
  - `DELETE /api/interviews/:id` - Delete interview

- **Users**
  - `GET /api/users/profile` - Get user profile
  - `PUT /api/users/profile` - Update user profile

## WebRTC Implementation

### Peer Connection Setup

```typescript
class WebRTCManager {
  private peerConnection: RTCPeerConnection;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  constructor(private socketClient: Socket) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    this.setupEventHandlers();
  }

  async initializeLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      return this.localStream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  }
}
```

### Signaling Protocol

The frontend communicates with the backend signaling server using Socket.io:

```typescript
interface SignalingEvents {
  "join-room": { roomId: string; userId: string };
  offer: { offer: RTCSessionDescription; roomId: string };
  answer: { answer: RTCSessionDescription; roomId: string };
  "ice-candidate": { candidate: RTCIceCandidate; roomId: string };
  "user-joined": { userId: string };
  "user-left": { userId: string };
}
```

## Routing

```typescript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/:roomId"
          element={
            <ProtectedRoute>
              <InterviewRoom />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
```

## Development Workflow

### Getting Started

1. **Install Dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Environment Setup**
   Create `.env` file in the frontend directory:

   ```bash
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=ws://localhost:5000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Code Style Guidelines

#### TypeScript Best Practices

```typescript
// Use interfaces for object types
interface User {
  id: string;
  name: string;
  email: string;
  role: "interviewer" | "candidate";
}

// Use proper typing for component props
interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// Use proper error handling
const fetchUserData = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    throw new Error("User data not available");
  }
};
```

#### Component Structure

```typescript
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

export const Component: React.FC<ComponentProps> = ({ title, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FormData | null>(null);

  useEffect(() => {
    // Initialize component
    return () => {
      // Cleanup
    };
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2>{title}</h2>
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Loading..." : "Submit"}
      </Button>
    </Card>
  );
};
```

### Testing

#### Unit Testing Setup

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

#### Example Test

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { Button } from "./Button";

describe("Button Component", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Performance Optimization

### Code Splitting

```typescript
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const InterviewRoom = lazy(() => import("./pages/InterviewRoom"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview/:id" element={<InterviewRoom />} />
      </Routes>
    </Suspense>
  );
}
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from "react";

const ExpensiveComponent = memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map((item) => ({ ...item, processed: true }));
  }, [data]);

  const handleUpdate = useCallback(
    (id: string) => {
      onUpdate(id);
    },
    [onUpdate]
  );

  return (
    <div>
      {processedData.map((item) => (
        <div key={item.id} onClick={() => handleUpdate(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
});
```

## Deployment

### Build Process

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

### Environment Variables

Production environment variables:

```bash
VITE_API_URL=https://api.virtualhire.com
VITE_SOCKET_URL=wss://api.virtualhire.com
```

## Troubleshooting

### Common Issues

1. **WebRTC Connection Issues**

   - Check STUN/TURN server configuration
   - Verify network connectivity
   - Check browser permissions for camera/microphone

2. **Build Errors**

   - Clear node_modules and reinstall dependencies
   - Check TypeScript configuration
   - Verify all imports are correct

3. **Development Server Issues**
   - Check port availability (default: 5173)
   - Verify environment variables
   - Clear Vite cache: `rm -rf node_modules/.vite`

## Contributing

1. Follow the established code style and patterns
2. Write tests for new components and features
3. Update documentation for significant changes
4. Use meaningful commit messages
5. Test thoroughly before submitting pull requests

For more information, refer to the main project README.md file.
