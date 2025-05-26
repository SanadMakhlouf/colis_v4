import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import { Navigate, Link } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Modal from "../components/Modal";
import Sidebar from "../components/Sidebar";
import ShipmentLabel from "../components/ShipmentLabel";
import StatusBadge from "../components/StatusBadge";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [shipments, setShipments] = useState({
    current: [],
    past: [],
    all: [],
  });
  const [notifications, setNotifications] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      fetchUserData();
    }
  }, [user, loading]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchUserData = async () => {
    try {
      setDataLoading(true);

      // Récupérer les colis de l'utilisateur
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from("shipments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (shipmentsError) throw shipmentsError;

      // Séparer les colis en cours et livrés
      const current = shipmentsData.filter((s) => s.status !== "delivered");
      const past = shipmentsData.filter((s) => s.status === "delivered");
      const all = shipmentsData;

      setShipments({ current, past, all });

      // Récupérer les notifications
      const { data: notificationsData, error: notificationsError } =
        await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

      if (notificationsError) throw notificationsError;

      setNotifications(notificationsData || []);
      setUnreadCount(notificationsData.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications);

    if (unreadCount > 0) {
      try {
        // Marquer toutes les notifications comme lues
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", user.id)
          .eq("is_read", false);

        if (error) throw error;

        // Mettre à jour l'état local
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour des notifications:",
          error
        );
      }
    }
  };

  const handleShipmentClick = (shipment) => {
    setSelectedShipment(shipment);
    setIsModalOpen(true);
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
      <button className="mobile-menu-button" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>

      <div
        className={`sidebar-container ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
        <Sidebar />
      </div>

      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Tableau de Bord</h1>
          <div className="user-info">
            <div
              className="notifications-icon"
              onClick={handleNotificationClick}
            >
              <i className="fas fa-bell"></i>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>
            <span>{user.email}</span>
            <div className="user-avatar">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {showNotifications && (
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <h3>Notifications</h3>
              <small>{notifications.length} notifications</small>
            </div>
            {notifications.length === 0 ? (
              <p className="no-notifications">Aucune notification</p>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${
                      notification.is_read ? "read" : "unread"
                    }`}
                  >
                    <p>{notification.message}</p>
                    <small>
                      {new Date(notification.created_at).toLocaleString(
                        "fr-FR"
                      )}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-box"></i>
            </div>
            <div className="stat-details">
              <h3>Colis en Cours</h3>
              <p>{shipments.current.length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-details">
              <h3>Colis Livrés</h3>
              <p>{shipments.past.length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-bell"></i>
            </div>
            <div className="stat-details">
              <h3>Notifications</h3>
              <p>{notifications.length}</p>
            </div>
          </div>
        </div>

        <div className="main-section">
          <div className="section-header">
            <h2>Mes Colis</h2>
            <Link to="/reservation" className="btn btn-primary">
              Nouveau Colis
            </Link>
          </div>

          <div className="shipments-list">
            {shipments.all.map((shipment) => (
              <div
                key={shipment.id}
                className="shipment-card"
                onClick={() => handleShipmentClick(shipment)}
              >
                <div className="shipment-header">
                  <h3>Colis #{shipment.tracking_number}</h3>
                  <StatusBadge status={shipment.status} withIcon />
                </div>
                <div className="shipment-details">
                  <p>
                    <strong>De:</strong> {shipment.origin}
                  </p>
                  <p>
                    <strong>Vers:</strong> {shipment.destination}
                  </p>
                  <p>
                    <strong>Date d'envoi:</strong>{" "}
                    {formatDate(shipment.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedShipment && (
          <>
            <div className="shipment-details">
              <h3>Détails du Colis #{selectedShipment.tracking_number}</h3>
              <div className="shipment-info">
                <div className="detail-item">
                  <div className="detail-label">Statut</div>
                  <div className="detail-value">
                    <StatusBadge
                      status={selectedShipment.status}
                      withIcon
                      isActive
                    />
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">Origine</div>
                  <div className="detail-value">{selectedShipment.origin}</div>
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
  );
};

export default Dashboard;
