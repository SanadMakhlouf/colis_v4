import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import "./DepotDashboard.css";
import StatusBadge from "../components/StatusBadge";

const DepotDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalParcels: 0,
    assignedParcels: 0,
    deliveredParcels: 0,
    processingParcels: 0,
    inTransitParcels: 0,
    receivedParcels: 0,
  });
  const [recentParcels, setRecentParcels] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      fetchStats();
      fetchRecentParcels();
    }
  }, [user, loading]);

  const fetchStats = async () => {
    try {
      setDataLoading(true);

      const { data: parcels, error: parcelsError } = await supabase
        .from("shipments")
        .select("status");

      if (parcelsError) throw parcelsError;

      const stats = {
        totalParcels: parcels.length,
        assignedParcels: parcels.filter((p) => p.status === "assigne").length,
        deliveredParcels: parcels.filter((p) => p.status === "livre").length,
        processingParcels: parcels.filter((p) => p.status === "processing")
          .length,
        inTransitParcels: parcels.filter((p) => p.status === "en_cours").length,
        receivedParcels: parcels.filter((p) => p.status === "recu").length,
      };

      setStats(stats);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchRecentParcels = async () => {
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("status", "recu") // Filtrer uniquement les colis avec le statut "recu"
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentParcels(data);
    } catch (error) {
      console.error("Erreur lors du chargement des colis récents:", error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getStatusLabel = (status) => {
    switch (status) {
      case "processing":
        return "En traitement";
      case "assigne":
        return "Assigné";
      case "livre":
        return "Livré";
      case "en_cours":
        return "En cours";
      default:
        return status;
    }
  };

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
            <i className="fas fa-chart-pie"></i>
          </div>
          <h3>Statistiques</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.totalParcels}</span>
              <span className="stat-label">Total Colis</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.receivedParcels}</span>
              <span className="stat-label">Reçus</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.processingParcels}</span>
              <span className="stat-label">En traitement</span>
            </div>

            <div className="stat-item">
              <span className="stat-value">{stats.inTransitParcels}</span>
              <span className="stat-label">En cours</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.deliveredParcels}</span>
              <span className="stat-label">Livrés</span>
            </div>
          </div>
        </div>

        <div className="recent-parcels-section">
          <h2>Colis Reçus Récemment</h2>
          <div className="parcels-list">
            {recentParcels.map((parcel) => (
              <div key={parcel.id} className="parcel-card">
                <div className="parcel-header">
                  <span className="tracking-number">
                    {parcel.tracking_number}
                  </span>
                  <StatusBadge status="Reçu" withIcon={true} />
                </div>
                <div className="parcel-details">
                  <div className="detail-row">
                    <i className="fas fa-user"></i>
                    <span>Destinataire :{parcel.receiver_name}</span>
                  </div>
                  <div className="detail-row">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>Distination : {parcel.destination}</span>
                  </div>
                  <div className="detail-row">
                    <i className="fas fa-calendar-alt"></i>
                    <span> {formatDate(parcel.created_at)}</span>
                  </div>
                </div>
                
              </div>
            ))}
            {recentParcels.length === 0 && (
              <div className="no-parcels-message">
                <i className="fas fa-inbox"></i>
                <p>Aucun colis reçu pour le moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepotDashboard;
