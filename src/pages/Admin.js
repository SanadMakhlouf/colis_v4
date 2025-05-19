import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Only initialize when auth is not loading and user exists
    if (!authLoading && user) {
      initializeAdmin();
    }
  }, [user, authLoading]);

  const initializeAdmin = async () => {
    try {
      console.log('Vérification des droits administrateur pour:', user.email);
      setLoading(true);

      // Fetch user profile to verify admin role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError);
        throw profileError;
      }

      if (!profileData) {
        console.error('Aucun profil trouvé pour cet utilisateur');
        return;
      }

      console.log('Profil administrateur chargé:', profileData);
      setUserProfile(profileData);

      // Verify admin role
      if (profileData.role !== 'admin') {
        console.warn('Tentative d\'accès non autorisé au panneau admin par:', user.email);
        navigate('/dashboard');
        return;
      }

      // Load users only if admin role is confirmed
      await fetchUsers();

    } catch (error) {
      console.error('Erreur lors de l\'initialisation du panneau admin:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Chargement des utilisateurs...');
      
      // Get all users from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        throw error;
      }
      
      console.log(`${data?.length || 0} utilisateurs récupérés`);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      console.log(`Modification du rôle de l'utilisateur ${userId} en ${newRole}`);
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error);
        throw error;
      }
      
      console.log('Rôle mis à jour avec succès');
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error.message);
    }
  };

  // Show loading when either auth is loading or component data is loading
  if (authLoading || loading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du panneau administrateur...</p>
        </div>
      </div>
    );
  }

  // If auth is done loading but no user is found, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  // If no user profile was found or user is not admin, show an error
  if (!userProfile || userProfile.role !== 'admin') {
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
        <h1>Tableau de Bord Administrateur</h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <button onClick={signOut} className="btn btn-secondary">Déconnexion</button>
        </div>
      </header>

      <main className="admin-content">
        <section className="admin-section">
          <h2>Gestion des Utilisateurs</h2>
          
          <div className="users-table-container">
            {users.length === 0 ? (
              <p>Aucun utilisateur trouvé</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Date de création</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <select 
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="role-select"
                        >
                          <option value="client">Client</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin; 