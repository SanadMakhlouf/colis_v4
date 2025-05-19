import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        <img src="/logo192.png" alt="Colis Logo" className="logo" />
        <h2>COLIS</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className={isActive('/dashboard') ? 'active' : ''}>
            <Link to="/dashboard">Tableau de Bord</Link>
          </li>
          <li className={isActive('/reservation') ? 'active' : ''}>
            <Link to="/reservation">Nouvel Envoi</Link>
          </li>
          <li className={isActive('/tracking') ? 'active' : ''}>
            <Link to="/tracking">Suivi de Colis</Link>
          </li>
          <li className={isActive('/profile') ? 'active' : ''}>
            <Link to="/profile">Mon Profil</Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button onClick={() => supabase.auth.signOut()} className="btn btn-logout">
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 