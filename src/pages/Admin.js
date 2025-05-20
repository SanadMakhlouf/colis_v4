import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    try {
      // Appeler la fonction RPC personnalisée de Supabase
      const { data, error } = await supabase.rpc('update_user_to_livreur', {
        user_email: email
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        content: `Le rôle de l'utilisateur ${email} a été mis à jour en livreur avec succès.`
      });
      setEmail('');

    } catch (error) {
      console.error('Erreur:', error.message);
      setMessage({
        type: 'error',
        content: `Erreur lors de la mise à jour: ${error.message}`
      });
    }
  };

  // Rediriger si l'utilisateur n'est pas connecté
  if (!user) {
    navigate('/login');
    return null;
  }

  // Vérifier si l'utilisateur est admin
  if (userRole !== 'admin') {
    return (
      <div className="error-container">
        <h2>Accès non autorisé</h2>
        <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="logo-container">
          <img src="/logo192.png" alt="Colis Logo" className="logo" />
          <span className="logo-text">COLIS</span>
        </div>
        <h1>Administration</h1>
        <div className="user-info">
          <span>{user?.email} (Admin)</span>
          <button onClick={signOut} className="btn btn-secondary">Déconnexion</button>
        </div>
      </header>

      <main className="admin-content">
        <section className="admin-section">
          <h2>Définir un utilisateur comme livreur</h2>
          <form onSubmit={handleSubmit} className="update-role-form">
            {message.content && (
              <div className={`form-message ${message.type}`}>
                {message.content}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email de l'utilisateur</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Entrez l'email de l'utilisateur"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Définir comme livreur
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Admin; 