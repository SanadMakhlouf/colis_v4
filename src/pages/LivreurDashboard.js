import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import { Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./LivreurDashboard.css";

const LivreurDashboard = () => {
  const { user, loading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({
    totalShipments: 0,
    totalRevenue: 0,
    totalIncidents: 0,
  });
  const [shipments, setShipments] = useState([]);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!loading && user) {
      fetchData();
    }
  }, [user, loading]);

  const fetchData = async () => {
    try {
      setDataLoading(true);

      // Récupération simple de tous les colis qui sont assignés au livreur
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from("shipments")
        .select("*")
        .eq("livreur_id", user.id)
        .order("created_at", { ascending: false });

      if (shipmentsError) throw shipmentsError;

      setShipments(shipmentsData || []);

      // Calculer les statistiques
      const totalShipments = shipmentsData.length;
      const totalRevenue = shipmentsData.reduce(
        (sum, shipment) => sum + (shipment.price || 0),
        0
      );
      const totalIncidents = shipmentsData.filter(
        (s) => s.status === "incident"
      ).length;

      setStats({ totalShipments, totalRevenue, totalIncidents });
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des données. Veuillez rafraîchir la page.",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleTrackingSearch = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSelectedShipment(null);

    if (!trackingNumber.trim()) {
      setMessage({
        type: "error",
        text: "Veuillez entrer un numéro de suivi.",
      });
      return;
    }

    try {
      console.log("Recherche du colis avec le numéro:", trackingNumber.trim());

      // Recherche simple dans la table shipments
      const { data: shipment, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("tracking_number", trackingNumber.trim())
        .single();

      if (error) {
        console.error("Erreur lors de la recherche:", error);
        setMessage({
          type: "error",
          text: "Aucun colis trouvé avec ce numéro de suivi.",
        });
        return;
      }

      if (!shipment) {
        setMessage({
          type: "error",
          text: "Aucun colis trouvé avec ce numéro de suivi.",
        });
        return;
      }

      console.log("Colis trouvé:", shipment);

      setSelectedShipment(shipment);
      setMessage({
        type: "success",
        text: `Colis #${shipment.tracking_number} trouvé avec succès.`,
      });
      setTrackingNumber("");
    } catch (error) {
      console.error("Erreur détaillée:", error);
      setMessage({
        type: "error",
        text: `Erreur: ${
          error.message ||
          "Une erreur est survenue lors de la recherche du colis."
        }`,
      });
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      if (!selectedShipment || !selectedShipment.id) {
        setMessage({ type: "error", text: "Aucun colis sélectionné." });
        return;
      }

      // Mettre à jour le statut du colis
      const { data: updatedShipment, error: updateError } = await supabase
        .from("shipments")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedShipment.id)
        .select()
        .single();

      if (updateError) {
        console.error("Erreur de mise à jour:", updateError);
        throw new Error(
          `Erreur lors de la mise à jour du statut: ${updateError.message}`
        );
      }

      if (!updatedShipment) {
        throw new Error("Le colis n'a pas été trouvé après la mise à jour");
      }

      // Créer une notification pour le client
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: selectedShipment.user_id,
          message: `Le statut de votre colis #${
            selectedShipment.tracking_number
          } a été mis à jour: ${getStatusText(newStatus)}`,
          is_read: false,
          created_at: new Date().toISOString(),
        });

      if (notificationError) {
        console.error("Erreur de notification:", notificationError);
        throw new Error(
          `Erreur lors de la création de la notification: ${notificationError.message}`
        );
      }

      setMessage({
        type: "success",
        text: `Statut mis à jour avec succès: ${getStatusText(newStatus)}`,
      });

      // Mettre à jour l'état local
      setSelectedShipment((prev) => ({ ...prev, status: newStatus }));

      // Rafraîchir les données
      await fetchData();
    } catch (error) {
      console.error("Erreur complète:", error);
      setMessage({
        type: "error",
        text:
          error.message ||
          "Une erreur est survenue lors de la mise à jour du statut.",
      });
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fonction pour obtenir le texte du statut en français
  const getStatusText = (status) => {
    switch (status) {
      case "processing":
        return "En traitement";
      case "in_transit":
        return "En transit";
      case "delivered":
        return "Livré";
      case "incident":
        return "Incident signalé";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (dataLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-content">
        <div className="admin-dashboard">
          <h1>Tableau de Bord Livreur</h1>

          {/* KPI Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Colis</h3>
              <p>{stats.totalShipments}</p>
            </div>
            <div className="stat-card">
              <h3>Revenu Total</h3>
              <p>{stats.totalRevenue.toFixed(2)} €</p>
            </div>
            <div className="stat-card">
              <h3>Incidents</h3>
              <p>{stats.totalIncidents}</p>
            </div>
          </div>

          {/* Tracking Search */}
          <div className="tracking-section">
            <h2>Traiter un Colis</h2>
            <form onSubmit={handleTrackingSearch} className="tracking-form">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Numéro de suivi"
                required
              />
              <button type="submit" className="btn btn-primary">
                Rechercher
              </button>
            </form>

            {message.text && (
              <div className={`message ${message.type}`}>{message.text}</div>
            )}

            {selectedShipment && (
              <div className="shipment-details">
                <h3>Détails du Colis #{selectedShipment.tracking_number}</h3>
                <div className="shipment-info">
                  <p>
                    <strong>Statut actuel:</strong>{" "}
                    {getStatusText(selectedShipment.status)}
                  </p>
                  <p>
                    <strong>De:</strong> {selectedShipment.origin}
                  </p>
                  <p>
                    <strong>Vers:</strong> {selectedShipment.destination}
                  </p>
                  <p>
                    <strong>Date de création:</strong>{" "}
                    {formatDate(selectedShipment.created_at)}
                  </p>
                  <p>
                    <strong>Dernière mise à jour:</strong>{" "}
                    {formatDate(selectedShipment.updated_at)}
                  </p>
                </div>
                <div className="status-actions">
                  <h4>Changer le statut:</h4>
                  <div className="status-buttons">
                    <button
                      onClick={() => handleStatusChange("processing")}
                      className={`btn btn-secondary ${
                        selectedShipment.status === "processing" ? "active" : ""
                      }`}
                    >
                      En traitement
                    </button>
                    <button
                      onClick={() => handleStatusChange("in_transit")}
                      className={`btn btn-secondary ${
                        selectedShipment.status === "in_transit" ? "active" : ""
                      }`}
                    >
                      En transit
                    </button>
                    <button
                      onClick={() => handleStatusChange("delivered")}
                      className={`btn btn-secondary ${
                        selectedShipment.status === "delivered" ? "active" : ""
                      }`}
                    >
                      Livré
                    </button>
                    <button
                      onClick={() => handleStatusChange("incident")}
                      className={`btn btn-secondary ${
                        selectedShipment.status === "incident" ? "active" : ""
                      }`}
                    >
                      Incident
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shipments List */}
          <div className="section">
            <h2>Colis Récents</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Statut</th>
                    <th>Origine</th>
                    <th>Destination</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.slice(0, 5).map((shipment) => (
                    <tr key={shipment.id}>
                      <td>{shipment.tracking_number}</td>
                      <td>{getStatusText(shipment.status)}</td>
                      <td>{shipment.origin}</td>
                      <td>{shipment.destination}</td>
                      <td>{formatDate(shipment.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivreurDashboard;
