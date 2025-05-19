import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { Navigate, Link } from 'react-router-dom';
import Modal from '../components/Modal';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [shipments, setShipments] = useState({
    current: [],
    past: []
  });
  const [notifications, setNotifications] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      fetchUserData();
    }
  }, [user, loading]);

  const fetchUserData = async () => {
    try {
      setDataLoading(true);

      // Récupérer les colis de l'utilisateur
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (shipmentsError) throw shipmentsError;

      // Séparer les colis en cours et livrés
      const current = shipmentsData.filter(s => s.status !== 'delivered');
      const past = shipmentsData.filter(s => s.status === 'delivered');

      setShipments({ current, past });

      // Récupérer les notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notificationsError) throw notificationsError;

      // Marquer les notifications comme lues
      const unreadNotifications = notificationsData.filter(n => !n.is_read);
      if (unreadNotifications.length > 0) {
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', unreadNotifications.map(n => n.id));

        if (updateError) throw updateError;
      }

      setNotifications(notificationsData || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleShipmentClick = (shipment) => {
    setSelectedShipment(shipment);
    setIsModalOpen(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'processing':
        return 'status-processing';
      case 'in_transit':
        return 'status-in-transit';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <Sidebar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Tableau de Bord</h1>
          <div className="user-info">
            <span>{user.email}</span>
            <div className="user-avatar">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

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

        <div className="dashboard-main">
          <div className="main-section">
            <div className="section-header">
              <h2>Mes Colis</h2>
              <Link to="/reservation" className="btn btn-primary">Nouveau Colis</Link>
            </div>
            {shipments.current.length === 0 ? (
              <p>Aucun colis en cours</p>
            ) : (
              <div className="shipments-list">
                {shipments.current.map(shipment => (
                  <div 
                    key={shipment.id} 
                    className="shipment-card"
                    onClick={() => handleShipmentClick(shipment)}
                  >
                    <div className="shipment-header">
                      <h3>Colis #{shipment.tracking_number}</h3>
                      <span className={`status-badge ${getStatusBadgeClass(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </div>
                    <div className="shipment-details">
                      <p><strong>De:</strong> {shipment.origin}</p>
                      <p><strong>Vers:</strong> {shipment.destination}</p>
                      <p><strong>Date d'envoi:</strong> {formatDate(shipment.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="notifications-section">
            <h2>Notifications Récentes</h2>
            {notifications.length === 0 ? (
              <p>Aucune notification</p>
            ) : (
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div key={notification.id} className={`notification-card ${notification.is_read ? 'read' : 'unread'}`}>
                    <div className="notification-content">
                      <p>{notification.message}</p>
                      <small>{new Date(notification.created_at).toLocaleString('fr-FR')}</small>
                    </div>
                    {!notification.is_read && <div className="notification-badge">Nouveau</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedShipment && (
          <div className="shipment-details">
            <h3>Détails du Colis #{selectedShipment.tracking_number}</h3>
            
            <div className="detail-item">
              <div className="detail-label">Statut</div>
              <div className="detail-value">
                <span className={`status-badge ${getStatusBadgeClass(selectedShipment.status)}`}>
                  {selectedShipment.status}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Origine</div>
              <div className="detail-value">{selectedShipment.origin}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Destination</div>
              <div className="detail-value">{selectedShipment.destination}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Poids</div>
              <div className="detail-value">{selectedShipment.weight} kg</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Description</div>
              <div className="detail-value">{selectedShipment.description}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Date de création</div>
              <div className="detail-value">{formatDate(selectedShipment.created_at)}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Livraison estimée</div>
              <div className="detail-value">
                {selectedShipment.estimated_delivery ? formatDate(selectedShipment.estimated_delivery) : 'Non définie'}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard; 