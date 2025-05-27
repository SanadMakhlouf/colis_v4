import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import "./SearchColis.css";

const SearchColis = () => {
  const { user } = useAuth();
  const [searchType, setSearchType] = useState("tracking");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      if (searchType === "client") {
        const results = await handleSearchByClientName(searchQuery);
        if (results.length > 0) {
          setSearchResults(results);
        } else {
          setError("Aucun colis trouvé pour ce client.");
        }
      } else {
        // Recherche par numéro de tracking
        const { data, error } = await supabase
          .from("shipments")
          .select("*")
          .ilike("tracking_number", `%${searchQuery}%`);

        if (error) throw error;

        if (data && data.length > 0) {
          setSearchResults(data);
        } else {
          setError("Aucun colis trouvé avec ce numéro de suivi.");
        }
      }
    } catch (error) {
      console.error("Erreur de recherche:", error);
      setError("Une erreur est survenue lors de la recherche.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByClientName = async (query) => {
    try {
      // Utiliser la fonction existante get_user_by_email
      const { data: userData, error: userError } = await supabase.rpc(
        "get_user_by_email",
        {
          p_email: query,
        }
      );

      if (userError) {
        console.error(
          "Erreur lors de la recherche des utilisateurs:",
          userError
        );
        throw userError;
      }

      if (!userData || !userData.id) {
        return [];
      }

      // Récupérer les colis pour l'utilisateur trouvé
      const { data: shipments, error: shipmentError } = await supabase
        .from("shipments")
        .select("*")
        .eq("user_id", userData.id);

      if (shipmentError) {
        console.error("Erreur lors de la recherche des colis:", shipmentError);
        throw shipmentError;
      }

      return shipments || [];
    } catch (error) {
      console.error("Error in handleSearchByClientName:", error);
      throw error;
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

  const handleParcelClick = (parcel) => {
    setSelectedParcel(parcel);
    setIsModalOpen(true);
  };

  return (
    <div className="search-colis">
      <div className="search-container">
        <h1>Rechercher un Colis</h1>
        <p className="search-description">
          Recherchez un colis par son numéro de suivi ou par nom de client.
        </p>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-type">
            <label>
              <input
                type="radio"
                value="tracking"
                checked={searchType === "tracking"}
                onChange={(e) => setSearchType(e.target.value)}
              />
              Numéro de Tracking
            </label>
            <label>
              <input
                type="radio"
                value="client"
                checked={searchType === "client"}
                onChange={(e) => setSearchType(e.target.value)}
              />
              Nom du Client
            </label>
          </div>

          <div className="search-input">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchType === "tracking"
                  ? "Entrez le numéro de tracking"
                  : "Entrez le nom du client"
              }
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Recherche..." : "Rechercher"}
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="search-results">
          {searchResults.length > 0 && (
            <div className="results-grid">
              {searchResults.map((parcel) => (
                <div
                  key={parcel.id}
                  className="parcel-card"
                  onClick={() => handleParcelClick(parcel)}
                >
                  <div className="parcel-header">
                    <StatusBadge status={parcel.status} withIcon />
                    <span className="tracking-number">
                      {parcel.tracking_number}
                    </span>
                  </div>
                  <div className="parcel-summary">
                    <p>
                      <strong>Destination:</strong> {parcel.destination}
                    </p>
                    <p>
                      <strong>Date:</strong> {formatDate(parcel.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {selectedParcel && (
            <div className="shipment-details">
              <h3>Détails du Colis #{selectedParcel.tracking_number}</h3>

              <div className="detail-item">
                <div className="detail-label">Statut</div>
                <div className="detail-value">
                  <StatusBadge
                    status={selectedParcel.status}
                    withIcon
                    isActive
                  />
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Origine</div>
                <div className="detail-value">{selectedParcel.origin}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Destination</div>
                <div className="detail-value">{selectedParcel.destination}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Poids</div>
                <div className="detail-value">{selectedParcel.weight} kg</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Description</div>
                <div className="detail-value">
                  {selectedParcel.description || "Aucune description"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Date de création</div>
                <div className="detail-value">
                  {formatDate(selectedParcel.created_at)}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Dernière mise à jour</div>
                <div className="detail-value">
                  {formatDate(selectedParcel.updated_at)}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default SearchColis;
