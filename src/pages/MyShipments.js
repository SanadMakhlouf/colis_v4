import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Modal from "../components/Modal";
import Sidebar from "../components/Sidebar";
import ShipmentLabel from "../components/ShipmentLabel";
import "./MyShipments.css";

const MyShipments = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchShipments();
  }, [user]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des colis:", error);
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

  const handleShipmentClick = (shipment) => {
    setSelectedShipment(shipment);
    setIsModalOpen(true);
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.tracking_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || shipment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="myshipments-container">
      <Sidebar />
      <div className="myshipments-content">
        <div className="myshipments-header">
          <h1>Mes Colis</h1>
          <div className="search-filters">
            <input
              type="text"
              placeholder="Rechercher un colis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">Tous les statuts</option>
              <option value="processing">En traitement</option>
              <option value="in_transit">En transit</option>
              <option value="delivered">Livré</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des colis...</p>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="no-shipments">
            <p>Aucun colis trouvé</p>
          </div>
        ) : (
          <div className="shipments-grid">
            {filteredShipments.map((shipment) => (
              <div
                key={shipment.id}
                className="shipment-card"
                onClick={() => handleShipmentClick(shipment)}
              >
                <div className="shipment-header">
                  <h3>Colis #{shipment.tracking_number}</h3>
                  <span
                    className={`status-badge ${getStatusBadgeClass(
                      shipment.status
                    )}`}
                  >
                    {shipment.status}
                  </span>
                </div>
                <div className="shipment-details">
                  <p>
                    <strong>Destination:</strong> {shipment.destination}
                  </p>
                  <p>
                    <strong>Destinataire:</strong> {shipment.receiver_name}
                  </p>
                  <p>
                    <strong>Date d'envoi:</strong>{" "}
                    {formatDate(shipment.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {selectedShipment && (
            <>
              <div className="shipment-details">
                <h3>Détails du Colis #{selectedShipment.tracking_number}</h3>
                <div className="shipment-info">
                  <div className="detail-item">
                    <div className="detail-label">Statut</div>
                    <div className="detail-value">
                      <span
                        className={`status-badge ${getStatusBadgeClass(
                          selectedShipment.status
                        )}`}
                      >
                        {selectedShipment.status}
                      </span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Destinataire</div>
                    <div className="detail-value">
                      {selectedShipment.receiver_name}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Téléphone</div>
                    <div className="detail-value">
                      {selectedShipment.receiver_phone}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Email</div>
                    <div className="detail-value">
                      {selectedShipment.receiver_email}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Adresse</div>
                    <div className="detail-value">
                      {selectedShipment.receiver_address}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Origine</div>
                    <div className="detail-value">
                      {selectedShipment.origin}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Destination</div>
                    <div className="detail-value">
                      {selectedShipment.destination}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Poids</div>
                    <div className="detail-value">
                      {selectedShipment.weight} kg
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Description</div>
                    <div className="detail-value">
                      {selectedShipment.description}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Date de création</div>
                    <div className="detail-value">
                      {formatDate(selectedShipment.created_at)}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Livraison estimée</div>
                    <div className="detail-value">
                      {selectedShipment.estimated_delivery
                        ? formatDate(selectedShipment.estimated_delivery)
                        : "Non définie"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <PDFDownloadLink
                  document={<ShipmentLabel shipment={selectedShipment} />}
                  fileName={`bordereau-${selectedShipment.tracking_number}.pdf`}
                  className="print-button"
                >
                  {({ blob, url, loading, error }) =>
                    loading ? "Préparation du PDF..." : "Imprimer le Bordereau"
                  }
                </PDFDownloadLink>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MyShipments;
