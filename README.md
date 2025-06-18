# VirtualHire

<div align="center">
  <img src="frontend/public/interviewLogo.jpeg" alt="VirtualHire Logo" width="200"/>
</div>

A modern, real-time video interviewing platform that enables seamless remote technical interviews with built-in code editor support. VirtualHire revolutionizes the way companies conduct technical interviews by providing a comprehensive suite of tools for both interviewers and candidates.

## Features

- 💻 Real-time video conferencing using WebRTC
- 🔒 Secure authentication system
- 📝 Built-in code editor for technical interviews
- 📅 Interview scheduling system
- 🎙️ Real-time speech-to-text subtitles
- 🎯 Interactive dashboard for interview management
- 🔐 Protected routes and secure sessions
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

### Frontend

- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- WebRTC for real-time communication
- Code editor for technical interviews
- React Router for navigation

### Backend

- Node.js
- Express.js
- MongoDB (with Mongoose)
- WebSocket for signaling server
- JWT for authentication
- Cron jobs for interview status management

## Project Structure

```
├── Backend/                # Backend server implementation
│   ├── controllers/        # Request handlers
│   ├── middlewares/       # Custom middleware functions
│   ├── model/            # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── jobs/             # Scheduled tasks
│
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions
│   └── public/           # Static assets
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd RemoteInterviewPlatform
   ```

2. Install backend dependencies

   ```bash
   cd Backend
   npm install
   ```

3. Install frontend dependencies

   ```bash
   cd frontend
   npm install
   ```

4. Set up environment variables
   Create a `.env` file in both the backend and frontend directories with the necessary environment variables.

### Running the Application

1. Start the backend server

   ```bash
   cd Backend
   npm start
   ```

2. Start the frontend development server
   ```bash
   cd frontend
   npm run dev
   ```

## Main Features Explanation

### Real-time Video Conferencing

The platform uses WebRTC for peer-to-peer video communication, implemented in the `WebRTCComponent.tsx`. This enables high-quality, low-latency video calls between interviewers and candidates.

### Code Editor

Built-in code editor component (`CodeEditor.tsx`) allows candidates to write and execute code during technical interviews. The editor supports syntax highlighting and multiple programming languages.

### Interview Scheduling

The platform includes a comprehensive interview scheduling system with:

- Calendar integration for selecting interview slots
- Automated notifications
- Status tracking
- Cron jobs for managing interview states

### Authentication System

Secure authentication implemented using JWT tokens, with protected routes ensuring only authorized access to various platform features.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
