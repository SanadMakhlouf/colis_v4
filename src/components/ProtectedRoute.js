import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
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
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    switch (userRole) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "livreur":
        return <Navigate to="/LivreurDashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
