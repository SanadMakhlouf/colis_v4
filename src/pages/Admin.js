import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const Admin = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [livreurEmail, setLivreurEmail] = useState("");
  const [depotEmail, setDepotEmail] = useState("");
  const [message, setMessage] = useState({ type: "", content: "", target: "" });

  const handleLivreurSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", content: "", target: "livreur" });

    try {
      const { data, error } = await supabase.rpc("update_user_to_livreur", {
        user_email: livreurEmail,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        content: `Le rôle de l'utilisateur ${livreurEmail} a été mis à jour en livreur avec succès.`,
        target: "livreur",
      });
      setLivreurEmail("");
    } catch (error) {
      console.error("Erreur:", error.message);
      setMessage({
        type: "error",
        content: `Erreur lors de la mise à jour: ${error.message}`,
      });
    }
  };

  const handleDepotSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", content: "" });

    try {
      const { data, error } = await supabase.rpc("update_user_to_depot", {
        user_email: depotEmail,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        content: `Le rôle de l'utilisateur ${depotEmail} a été mis à jour en dépôt avec succès.`,
      });
      setDepotEmail("");
    } catch (error) {
      console.error("Erreur:", error.message);
      setMessage({
        type: "error",
        content: `Erreur lors de la mise à jour: ${error.message}`,
      });
    }
  };

  // Rediriger si l'utilisateur n'est pas connecté
  if (!user) {
    navigate("/login");
    return null;
  }

  // Vérifier si l'utilisateur est admin
  if (userRole !== "admin") {
    return (
      <div className="error-container">
        <h2>Accès non autorisé</h2>
        <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-primary"
        >
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
          <button onClick={signOut} className="btn btn-secondary">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="admin-content">
        <section className="admin-section">
          <h2>Définir un utilisateur comme livreur</h2>
          <form onSubmit={handleLivreurSubmit} className="update-role-form">
            {message.content && message.type === "livreur" && (
              <div className={`form-message ${message.type}`}>
                {message.content}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="livreurEmail">Email de l'utilisateur</label>
              <input
                type="email"
                id="livreurEmail"
                value={livreurEmail}
                onChange={(e) => setLivreurEmail(e.target.value)}
                required
                placeholder="Entrez l'email de l'utilisateur"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Définir comme livreur
            </button>
          </form>
        </section>

        <section className="admin-section">
          <h2>Définir un utilisateur comme dépôt</h2>
          <form onSubmit={handleDepotSubmit} className="update-role-form">
            {message.content && message.type === "depot" && (
              <div className={`form-message ${message.type}`}>
                {message.content}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="depotEmail">Email de l'utilisateur</label>
              <input
                type="email"
                id="depotEmail"
                value={depotEmail}
                onChange={(e) => setDepotEmail(e.target.value)}
                required
                placeholder="Entrez l'email de l'utilisateur"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Définir comme dépôt
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Admin;
