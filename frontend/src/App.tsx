import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import InterviewRoom from "./pages/InterviewRoom";
import Navbar from './components/ui/Navbar';
import Home from './pages/Home';
import ProtectedRoute from "./components/ui/ProtectedRoute";

const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        <Route path="/interview-room" element={<ProtectedRoute><InterviewRoom/></ProtectedRoute>} />
      </Routes>
    </>
  );
};

export default App;
