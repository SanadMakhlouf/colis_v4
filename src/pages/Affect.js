import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import "./Affect.css";

const Affect = () => {
  const { user } = useAuth();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAffect = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // 1. Vérifier si le colis existe
      const { data: colis, error: colisError } = await supabase
        .from("shipments")
        .select("*")
        .eq("tracking_number", trackingNumber.toUpperCase())
        .single();

      if (colisError || !colis) {
        setMessage("Colis non trouvé.");
        setLoading(false);
        return;
      }

      // 2. Vérifier si l'utilisateur est un livreur en utilisant la table auth.users
      const { data: livreurData, error: livreurError } = await supabase
        .from("auth_users_view") // This should be a view that joins auth.users with necessary tables
        .select("id, email, metadata")
        .eq("email", email.toLowerCase())
        .single();

      if (livreurError || !livreurData) {
        console.error("Erreur recherche livreur:", livreurError);
        setMessage("Livreur non trouvé avec cet email.");
        setLoading(false);
        return;
      }

      // Vérifier le rôle dans les métadonnées
      const userRole = livreurData.metadata?.role;
      if (userRole !== "livreur") {
        setMessage("Cette personne n'est pas un livreur.");
        setLoading(false);
        return;
      }

      // 3. Affecter le colis au livreur
      const { error: updateError } = await supabase
        .from("shipments")
        .update({
          livreur_id: livreurData.id,
          status: "in_transit",
        })
        .eq("tracking_number", trackingNumber.toUpperCase());

      if (updateError) {
        console.error("Erreur mise à jour:", updateError);
        setMessage("Erreur lors de l'affectation du colis.");
        setLoading(false);
        return;
      }

      setMessage("Le colis a été affecté au livreur avec succès !");
      setEmail("");
      setTrackingNumber("");
    } catch (error) {
      console.error("Erreur complète:", error);
      setMessage("Une erreur est survenue.");
    }

    setLoading(false);
  };

  return (
    <div className="affect-container">
      <Sidebar />
      <div className="affect-content">
        <h1>Affecter un colis à un livreur</h1>

        <form onSubmit={handleAffect} className="affect-form">
          <div className="form-group">
            <label htmlFor="tracking_number">Numéro de suivi</label>
            <input
              type="text"
              id="tracking_number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Entrez le numéro de suivi"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="deliverer_email">Email du livreur</label>
            <input
              type="email"
              id="deliverer_email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez l'email du livreur"
              required
            />
          </div>

          {message && (
            <div
              className={`message ${
                message.includes("succès") ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Affectation en cours..." : "Affecter"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Affect;
