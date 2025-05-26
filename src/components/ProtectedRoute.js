import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, userRole, loading } = useAuth();

  console.log("ProtectedRoute - Required Role:", requiredRole);
  console.log("ProtectedRoute - User Role:", userRole);
  console.log("ProtectedRoute - User:", user);

  if (loading) {
    console.log("ProtectedRoute - Loading...");
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute - No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    console.log(
      "ProtectedRoute - Checking role:",
      userRole,
      "against required:",
      requiredRole
    );
    if (userRole !== requiredRole) {
      console.log(
        "ProtectedRoute - Role mismatch, redirecting based on role:",
        userRole
      );
      switch (userRole) {
        case "admin":
          return <Navigate to="/admin" replace />;
        case "livreur":
          return <Navigate to="/LivreurDashboard" replace />;
        case "depot":
          return <Navigate to="/depot/dashboard" replace />;
        default:
          return <Navigate to="/dashboard" replace />;
      }
    }
  }

  console.log("ProtectedRoute - Access granted");
  return children;
};

export default ProtectedRoute;
