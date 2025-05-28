import React, { useState } from "react";
import { supabase } from "../supabase";
import Modal from "../components/Modal";
import "./Tracking.css";

const Tracking = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShipment(null);

    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("tracking_number", trackingNumber.toUpperCase())
        .single();

      if (error) throw error;

      if (data) {
        setShipment(data);
        setIsModalOpen(true);
      } else {
        setError("Aucun colis trouvé avec ce numéro de suivi.");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      setError("Une erreur est survenue lors de la recherche du colis.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "processing":
        return "status-processing";
      case "in_transit":
        return "status-in-transit";
      case "delivered":
        return "status-delivered";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        <h1>Suivi de Colis</h1>
        <p className="tracking-description">
          Entrez le numéro de suivi de votre colis pour voir son statut et ses
          détails.
        </p>

        <form onSubmit={handleSearch} className="tracking-form">
          <div className="form-group">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Numéro de suivi (ex: COL123456)"
              className="tracking-input"
              required
            />
            <button
              type="submit"
              className="tracking-button"
              disabled={loading}
            >
              {loading ? "Recherche..." : "Rechercher"}
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {shipment && (
            <div className="shipment-details">
              <h3>Détails du Colis #{shipment.tracking_number}</h3>

              <div className="detail-item">
                <div className="detail-label">Statut</div>
                <div className="detail-value">
                  <span
                    className={`status-badge ${getStatusBadgeClass(
                      shipment.status
                    )}`}
                  >
                    {shipment.status}
                  </span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Origine</div>
                <div className="detail-value">{shipment.origin}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Destination</div>
                <div className="detail-value">{shipment.destination}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Poids</div>
                <div className="detail-value">{shipment.weight} kg</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Description</div>
                <div className="detail-value">{shipment.description}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Date de création</div>
                <div className="detail-value">
                  {formatDate(shipment.created_at)}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Livraison estimée</div>
                <div className="detail-value">
                  {shipment.estimated_delivery
                    ? formatDate(shipment.estimated_delivery)
                    : "Non définie"}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Tracking;
