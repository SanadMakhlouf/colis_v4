import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import './Reservation.css';

const Reservation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    parcelType: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    destination: '',
    description: '',
  });

  const [price, setPrice] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Simuler le calcul du prix
    if (name === 'weight' || name === 'parcelType') {
      const basePrice = 10;
      const weightMultiplier = parseFloat(value) || 0;
      const typeMultiplier = formData.parcelType === 'fragile' ? 1.5 : 1;
      const calculatedPrice = basePrice + (weightMultiplier * typeMultiplier);
      setPrice(calculatedPrice.toFixed(2));
    }
  };

  const generateTrackingNumber = () => {
    const prefix = 'COL';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const trackingNumber = generateTrackingNumber();
      // Calculer la date de livraison estimée (par exemple, 3 jours ouvrables)
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

      console.log('Données du colis à enregistrer:', {
        tracking_number: trackingNumber,
        user_id: user.id,
        status: 'processing',
        origin: 'France',
        destination: formData.destination,
        weight: parseFloat(formData.weight),
        description: formData.description,
        estimated_delivery: estimatedDelivery.toISOString()
      });

      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .insert([
          {
            tracking_number: trackingNumber,
            user_id: user.id,
            status: 'processing',
            origin: 'France',
            destination: formData.destination,
            weight: parseFloat(formData.weight),
            description: formData.description,
            estimated_delivery: estimatedDelivery.toISOString()
          }
        ])
        .select();

      if (shipmentError) {
        console.error('Erreur Supabase (shipments):', shipmentError);
        throw new Error(`Erreur lors de l'enregistrement du colis: ${shipmentError.message}`);
      }

      console.log('Colis enregistré avec succès:', shipmentData);

      // Créer une notification pour l'utilisateur
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: user.id,
            message: `Votre colis ${trackingNumber} a été enregistré avec succès.`,
            is_read: false
          }
        ]);

      if (notificationError) {
        console.error('Erreur Supabase (notifications):', notificationError);
        // On continue même si la notification échoue
      }

      // Rediriger vers le tableau de bord avec un message de succès
      navigate('/dashboard', { 
        state: { 
          message: 'Votre colis a été enregistré avec succès !',
          trackingNumber: trackingNumber
        }
      });

    } catch (error) {
      console.error('Erreur complète:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'enregistrement du colis. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservation-container">
      <div className="reservation-card">
        <h1>Réserver un Envoi</h1>
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <small>Veuillez vérifier vos informations et réessayer.</small>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="parcelType">Type de Colis</label>
            <select
              id="parcelType"
              name="parcelType"
              value={formData.parcelType}
              onChange={handleInputChange}
              required
            >
              <option value="">Sélectionnez un type</option>
              <option value="standard">Standard</option>
              <option value="fragile">Fragile</option>
              <option value="express">Express</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="weight">Poids (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              min="0.1"
              step="0.1"
              required
            />
          </div>

          <div className="dimensions-group">
            <h3>Dimensions (cm)</h3>
            <div className="dimensions-inputs">
              <div className="form-group">
                <label htmlFor="length">Longueur</label>
                <input
                  type="number"
                  id="length"
                  name="length"
                  value={formData.length}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="width">Largeur</label>
                <input
                  type="number"
                  id="width"
                  name="width"
                  value={formData.width}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="height">Hauteur</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="destination">Destination</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="Ville de destination"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description du contenu</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez brièvement le contenu du colis"
              rows="3"
              required
            />
          </div>

          <div className="price-display">
            <h3>Prix estimé</h3>
            <p className="price">{price} €</p>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Réserver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Reservation; 