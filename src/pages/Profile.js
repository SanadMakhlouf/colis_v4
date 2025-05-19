import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import Sidebar from '../components/Sidebar';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation des mots de passe
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
      setLoading(false);
      return;
    }

    try {
      // Note: Dans une vraie application, vous devriez vérifier l'ancien mot de passe
      // avant de permettre le changement. Ceci est juste pour la démonstration.
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès!' });
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      setMessage({ type: 'error', text: 'Une erreur est survenue lors du changement de mot de passe.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="dashboard-content">
        <div className="profile-page">
          <div className="profile-container">
            <h1>Mon Profil</h1>
            
            <div className="profile-section">
              <h2>Informations Personnelles</h2>
              <div className="profile-info">
                <div className="info-item">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
                <div className="info-item">
                  <label>ID Utilisateur</label>
                  <p>{user?.id}</p>
                </div>
                <div className="info-item">
                  <label>Date d'inscription</label>
                  <p>{new Date(user?.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>Changer le Mot de Passe</h2>
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Mot de passe actuel</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">Nouveau mot de passe</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {message.text && (
                  <div className={`message ${message.type}`}>
                    {message.text}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 