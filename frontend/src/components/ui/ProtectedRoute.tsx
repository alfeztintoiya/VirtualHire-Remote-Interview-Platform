import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Check if the user is authenticated. This example checks for a "token" in the cookies.
  const isAuthenticated = document.cookie.includes("token");

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect to the login page.
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the children components.
  return children;
};

export default ProtectedRoute;
