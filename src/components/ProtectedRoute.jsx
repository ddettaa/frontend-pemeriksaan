import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const currentUser = authService.getCurrentUser();
  console.log("ProtectedRoute - Current User:", currentUser); // Log current user
  console.log("ProtectedRoute - Allowed Roles:", allowedRoles); // Log allowed roles

  if (!currentUser) {
    console.log("ProtectedRoute - No user found, redirecting to login"); // Log redirect reason
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  const userRole = currentUser.user.role.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

  if (allowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
    console.log("ProtectedRoute - User role not allowed:", userRole); // Log role mismatch
    // Role not authorized, redirect to home page
    return <Navigate to="/" replace />;
  }

  console.log("ProtectedRoute - Access granted"); // Log successful access
  return children;
};

export default ProtectedRoute;
