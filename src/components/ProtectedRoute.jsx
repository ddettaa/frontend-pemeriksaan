import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        console.log("ProtectedRoute - Current User:", user);
        setCurrentUser(user);
      } catch (error) {
        console.error("ProtectedRoute - Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return null; // atau bisa ganti dengan spinner

  if (!currentUser) {
    console.log("ProtectedRoute - No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  const userRole = currentUser.user?.role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase());

  if (!normalizedAllowedRoles.includes(userRole)) {
    console.log("ProtectedRoute - Role not allowed:", userRole);
    return <Navigate to="/" replace />;
  }

  console.log("ProtectedRoute - Access granted");
  return children;
};

export default ProtectedRoute;
