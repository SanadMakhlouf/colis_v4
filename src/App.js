import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reservation from "./pages/Reservation";
import Tracking from "./pages/Tracking";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import LivreurDashboard from "./pages/LivreurDashboard";
import MyShipments from "./pages/MyShipments";
import Affect from "./pages/Affect";
// Composant Demo (temporaire pour développement)

// Auth Context
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// Loading Component
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Chargement...</p>
    </div>
  </div>
);

// Route du dashboard qui redirige selon le rôle
const DashboardRoute = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Rediriger selon le rôle
  switch (userRole) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "livreur":
      return <Navigate to="/LivreurDashboard" replace />;
    default: // client
      return <Dashboard />;
  }
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Route dashboard qui redirige selon le rôle */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRoute />
              </ProtectedRoute>
            }
          />

          {/* Routes protégées pour les clients uniquement */}
          <Route
            path="/myshipments"
            element={
              <ProtectedRoute requiredRole="client">
                <MyShipments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reservation"
            element={
              <ProtectedRoute requiredRole="client">
                <Reservation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tracking"
            element={
              <ProtectedRoute>
                <Tracking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Routes protégées pour les admin uniquement */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* Route protégée pour les livreurs */}
          <Route
            path="/LivreurDashboard"
            element={
              <ProtectedRoute requiredRole="livreur">
                <LivreurDashboard />
              </ProtectedRoute>
            }
          />

          {/* Nouvelle route pour l'affectation des colis */}
          <Route
            path="/affect"
            element={
              <ProtectedRoute requiredRole="admin">
                <Affect />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
