import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const roleMap = {
  3: "dokter",
  4: "perawat",
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const currentUser = authService.getCurrentUser();
  console.log("ProtectedRoute - Current User:", currentUser);
  console.log("ProtectedRoute - Allowed Roles:", allowedRoles);

  if (!currentUser) {
    console.log("ProtectedRoute - No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  const userRole = roleMap[currentUser?.role];
  if (!userRole) {
    console.log("ProtectedRoute - Role tidak dikenali:", currentUser?.role);
    return <Navigate to="/login" replace />;
  }

  const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase());

  if (!normalizedAllowedRoles.includes(userRole)) {
    console.log("ProtectedRoute - Role not allowed:", userRole);
    return <Navigate to="/" replace />;
  }

  console.log("ProtectedRoute - Access granted");
  return children;
};

export default ProtectedRoute;
