import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import "./DepotDashboard.css";


const DepotDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalParcels: 0,
    assignedParcels: 0,
    deliveredParcels: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  const [isScanning,setIsScanning] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      fetchStats();
    }
  }, [user, loading]);

  const fetchStats = async () => {
    try {
      setDataLoading(true);

      // Récupérer les statistiques des colis
      const { data: parcels, error: parcelsError } = await supabase
        .from("shipments")
        .select("status");

      if (parcelsError) throw parcelsError;

      const totalParcels = parcels.length;
      const assignedParcels = parcels.filter(
        (p) => p.status === "assigne"
      ).length;
      const deliveredParcels = parcels.filter(
        (p) => p.status === "livre"
      ).length;

      setStats({
        totalParcels,
        assignedParcels,
        deliveredParcels,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error.message);
    }
  };

  






  if (loading || dataLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="depot-dashboard">
      <header className="dashboard-header">
        <h1>Tableau de Bord - Dépôt</h1>
        <div className="user-info">
          <span>Bienvenue, {user.user_metadata?.full_name || user.email}</span>
          <button onClick={handleLogout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i>
            Déconnexion
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        <Link to="/affect" className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-truck-loading"></i>
          </div>
          <h3>Affecter un Colis</h3>
          <p>Assigner des colis aux livreurs</p>
        </Link>

        <Link to="/depot/search-colis" className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-search"></i>
          </div>
          <h3>Rechercher un Colis</h3>
          <p>Rechercher par tracking, livreur ou client</p>
        </Link>

        <Link to="/depot/update-status" className="dashboard-card">
          <div className="card-icon">
            <i className="fas fa-edit"></i>
          </div>
          <h3>Modifier État</h3>
          <p>Mettre à jour le statut des colis</p>
        </Link>

        <div className="dashboard-card stats">
          <div className="card-icon">
            <i className="fas fa-chart-bar"></i>
          </div>
          <h3>Statistiques</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.totalParcels}</span>
              <span className="stat-label">Total Colis</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.assignedParcels}</span>
              <span className="stat-label">Assignés</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.deliveredParcels}</span>
              <span className="stat-label">Livrés</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepotDashboard;
