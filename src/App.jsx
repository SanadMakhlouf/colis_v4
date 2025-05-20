import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MyShipments from './pages/MyShipments';
import Reservation from './pages/Reservation';
import Tracking from './pages/Tracking';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

// Route protégée avec vérification du rôle
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

  // Si l'utilisateur n'est pas connecté, redirection vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si un rôle spécifique est requis et que l'utilisateur n'a pas ce rôle
  if (requiredRole && userRole !== requiredRole) {
    // Rediriger les admin vers le dashboard admin et les clients vers le dashboard client
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Route du dashboard qui redirige selon le rôle
const DashboardRoute = () => {
  const { userRole, loading } = useAuth();

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

  // Rediriger selon le rôle
  if (userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  } else {
    return <Dashboard />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tracking" element={<Tracking />} />
      
      {/* Route dashboard qui redirige selon le rôle */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardRoute />
          </ProtectedRoute>
        } 
      />

      {/* Routes protégées pour tous les utilisateurs authentifiés */}
      <Route 
        path="/my-shipments" 
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

      {/* Routes protégées pour les admin uniquement */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <Admin />
          </ProtectedRoute>
        } 
      />

      {/* Page d'accueil */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      {/* 404 - Page non trouvée */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App; 