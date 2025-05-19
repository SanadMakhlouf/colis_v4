import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Reservation from './pages/Reservation';
import Demo from './pages/Demo';
import Tracking from './pages/Tracking';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Auth Context
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Loading Component
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Chargement...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/reservation" element={<ProtectedRoute><Reservation /></ProtectedRoute>} />
          <Route path="/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/demo" element={<Demo />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
