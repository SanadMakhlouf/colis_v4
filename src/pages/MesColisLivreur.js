import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import Sidebar from "../components/Sidebar";
import "./LivreurDashboard.css";

const MesColisLivreur = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      fetchShipments();
    }
  }, [user]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("livreur_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setShipments(data || []);
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des colis",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      recu: "Reçu",
      assigne: "Assigné",
      en_cours: "En cours de livraison",
      livre: "Livré",
      retour: "Retourné",
      recupere: "Récupéré",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const statusClassMap = {
      recu: "status-recu",
      assigne: "status-assigne",
      en_cours: "status-en-cours",
      livre: "status-livre",
      retour: "status-retour",
      recupere: "status-recupere",
    };
    return statusClassMap[status] || "";
  };

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

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1>Mes Colis</h1>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <div className="shipments-list">
            {shipments.length === 0 ? (
              <p>Aucun colis assigné pour le moment.</p>
            ) : (
              <div className="shipments-grid">
                {shipments.map((shipment) => (
                  <div key={shipment.id} className="shipment-card">
                    <div className="shipment-header">
                      <h3>Colis #{shipment.tracking_number}</h3>
                      <span
                        className={`status-badge ${getStatusClass(
                          shipment.status
                        )}`}
                      >
                        {getStatusText(shipment.status)}
                      </span>
                    </div>
                    <div className="shipment-details">
                      <p>
                        <strong>Origine:</strong> {shipment.origin_address}
                      </p>
                      <p>
                        <strong>Destination:</strong>{" "}
                        {shipment.destination_address}
                      </p>
                      <p>
                        <strong>Date de création:</strong>{" "}
                        {formatDate(shipment.created_at)}
                      </p>
                      <p>
                        <strong>Dernière mise à jour:</strong>{" "}
                        {formatDate(shipment.updated_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesColisLivreur;
