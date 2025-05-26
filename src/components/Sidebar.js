import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./Sidebar.css";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Vérifier si l'utilisateur est un livreur
  const isLivreur = user?.user_metadata?.role === "livreur";

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        <img src="/logo192.png" alt="Colis Logo" className="logo" />
        <h2>COLIS</h2>
      </div>
      <nav className="sidebar-nav">
        {isLivreur ? (
          // Navigation pour les livreurs
          <>
            <NavLink
              to="/livreur/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <i className="fas fa-home"></i>
              Tableau de bord
            </NavLink>
            <NavLink
              to="/livreur/mes-colis"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <i className="fas fa-box"></i>
              Mes Colis
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <i className="fas fa-user"></i>
              Mon Profil
            </NavLink>
          </>
        ) : (
          // Navigation pour les clients
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <i className="fas fa-home"></i>
              Tableau de bord
            </NavLink>
            <NavLink
              to="/myshipments"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <i className="fas fa-box"></i>
              Mes Colis
            </NavLink>
            <NavLink
              to="/reservation"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <i className="fas fa-plus"></i>
              Nouveau Colis
            </NavLink>
            <NavLink
              to="/tracking"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <i className="fas fa-search"></i>
              Suivi de Colis
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <i className="fas fa-user"></i>
              Mon Profil
            </NavLink>
          </>
        )}
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn btn-logout">
          <i className="fas fa-sign-out-alt"></i>
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
