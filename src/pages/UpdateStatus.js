import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import "./UpdateStatus.css";
import { Html5QrcodeScanner } from "html5-qrcode";

const UpdateStatus = () => {
  const { user } = useAuth();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isScanning, setIsScanning] = useState(false);

  const handleTrackingSearch = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSelectedShipment(null);

    if (!trackingNumber.trim()) {
      setMessage({
        type: "error",
        text: "Veuillez entrer un numéro de suivi.",
      });
      return;
    }

    try {
      console.log("Recherche du colis avec le numéro:", trackingNumber.trim());

      const { data: shipment, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("tracking_number", trackingNumber.trim())
        .single();

      if (error) {
        console.error("Erreur lors de la recherche:", error);
        setMessage({
          type: "error",
          text: "Aucun colis trouvé avec ce numéro de suivi.",
        });
        return;
      }

      if (!shipment) {
        setMessage({
          type: "error",
          text: "Aucun colis trouvé avec ce numéro de suivi.",
        });
        return;
      }

      console.log("Colis trouvé:", shipment);

      setSelectedShipment(shipment);
      setMessage({
        type: "success",
        text: `Colis #${shipment.tracking_number} trouvé avec succès.`,
      });
      setTrackingNumber("");
    } catch (error) {
      console.error("Erreur détaillée:", error);
      setMessage({
        type: "error",
        text: `Erreur: ${
          error.message ||
          "Une erreur est survenue lors de la recherche du colis."
        }`,
      });
    }
  };

  useEffect(() => {
    let scanner = null;
    if (isScanning) {
      scanner = new Html5QrcodeScanner("reader", {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      scanner.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isScanning]);

  const onScanSuccess = async (decodedText) => {
    setIsScanning(false);
    setTrackingNumber(decodedText);
    // Créer une fonction séparée pour la recherche sans event
    try {
      console.log("Recherche du colis avec le numéro:", decodedText.trim());

      const { data: shipment, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("tracking_number", decodedText.trim())
        .single();

      if (error) {
        console.error("Erreur lors de la recherche:", error);
        setMessage({
          type: "error",
          text: "Aucun colis trouvé avec ce numéro de suivi.",
        });
        return;
      }

      if (!shipment) {
        setMessage({
          type: "error",
          text: "Aucun colis trouvé avec ce numéro de suivi.",
        });
        return;
      }

      console.log("Colis trouvé:", shipment);

      setSelectedShipment(shipment);
      setMessage({
        type: "success",
        text: `Colis #${shipment.tracking_number} trouvé avec succès.`,
      });
      setTrackingNumber("");
    } catch (error) {
      console.error("Erreur détaillée:", error);
      setMessage({
        type: "error",
        text: `Erreur: ${
          error.message ||
          "Une erreur est survenue lors de la recherche du colis."
        }`,
      });
    }
  };

  const onScanError = (error) => {
    console.warn(error);
  };

  const toggleScanner = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
      setSelectedShipment(null);
      setMessage({ type: "", text: "" });
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      if (!selectedShipment || !selectedShipment.id) {
        setMessage({ type: "error", text: "Aucun colis sélectionné." });
        return;
      }

      // Mettre à jour le statut du colis
      const { data: updatedShipment, error: updateError } = await supabase
        .from("shipments")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedShipment.id)
        .select()
        .single();

      if (updateError) {
        console.error("Erreur de mise à jour:", updateError);
        throw new Error(
          `Erreur lors de la mise à jour du statut: ${updateError.message}`
        );
      }

      if (!updatedShipment) {
        throw new Error("Le colis n'a pas été trouvé après la mise à jour");
      }

      // Créer une notification pour le client
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: selectedShipment.user_id,
          message: `Le statut de votre colis #${
            selectedShipment.tracking_number
          } a été mis à jour: ${getStatusText(newStatus)}`,
          is_read: false,
          created_at: new Date().toISOString(),
        });

      if (notificationError) {
        console.error("Erreur de notification:", notificationError);
        throw new Error(
          `Erreur lors de la création de la notification: ${notificationError.message}`
        );
      }

      setMessage({
        type: "success",
        text: `Statut mis à jour avec succès: ${getStatusText(newStatus)}`,
      });

      // Mettre à jour l'état local
      setSelectedShipment((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error("Erreur complète:", error);
      setMessage({
        type: "error",
        text:
          error.message ||
          "Une erreur est survenue lors de la mise à jour du statut.",
      });
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fonction pour obtenir le texte du statut en français
  const getStatusText = (status) => {
    switch (status) {
      case "recu":
        return "Reçu";
      case "assigne":
        return "Assigné au livreur";
      case "en_cours":
        return "En cours de livraison";
      case "livre":
        return "Livré";
      case "retour":
        return "Retour";
      case "recupere":
        return "Récupéré par le destinataire";
      default:
        return status;
    }
  };

  return (
    <div className="update-status-page">
      <div className="update-status-container">
        <h1>Mise à jour du Statut</h1>
        <p className="description">
          Recherchez un colis par son numéro de suivi pour mettre à jour son
          statut.
        </p>

        {/* Tracking Search */}
        <div className="tracking-section">
          <form onSubmit={handleTrackingSearch} className="tracking-form">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Numéro de suivi"
              required
            />
            <button type="submit" className="btn btn-primary">
              Rechercher
            </button>
          </form>
          <button
            onClick={toggleScanner}
            className={`btn ${isScanning ? "btn-danger" : "btn-secondary"}`}
          >
            {isScanning ? "Arrêter le scan" : "Scanner QR Code"}
          </button>

          {isScanning && (
            <div className="scanner-container">
              <div id="reader"></div>
            </div>
          )}

          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          {selectedShipment && (
            <div className="shipment-details">
              <h3>Détails du Colis #{selectedShipment.tracking_number}</h3>
              <div className="shipment-info">
                <p>
                  <strong>Statut actuel:</strong>{" "}
                  {getStatusText(selectedShipment.status)}
                </p>

                <p>
                  <strong>Destination:</strong> {selectedShipment.destination}
                </p>
                <p>
                  <strong>Date de création:</strong>{" "}
                  {formatDate(selectedShipment.created_at)}
                </p>
                <p>
                  <strong>Dernière mise à jour:</strong>{" "}
                  {formatDate(selectedShipment.updated_at)}
                </p>
              </div>
              <div className="status-actions">
                <h4>Changer le statut:</h4>
                <div className="status-buttons">
                  <button
                    onClick={() => handleStatusChange("recu")}
                    className={`btn btn-secondary ${
                      selectedShipment.status === "recu" ? "active" : ""
                    }`}
                  >
                    Reçu
                  </button>
                  <button
                    onClick={() => handleStatusChange("assigne")}
                    className={`btn btn-secondary ${
                      selectedShipment.status === "assigne" ? "active" : ""
                    }`}
                  >
                    Assigné
                  </button>
                  <button
                    onClick={() => handleStatusChange("en_cours")}
                    className={`btn btn-secondary ${
                      selectedShipment.status === "en_cours" ? "active" : ""
                    }`}
                  >
                    En cours
                  </button>
                  <button
                    onClick={() => handleStatusChange("livre")}
                    className={`btn btn-secondary ${
                      selectedShipment.status === "livre" ? "active" : ""
                    }`}
                  >
                    Livré
                  </button>
                  <button
                    onClick={() => handleStatusChange("retour")}
                    className={`btn btn-secondary ${
                      selectedShipment.status === "retour" ? "active" : ""
                    }`}
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => handleStatusChange("recupere")}
                    className={`btn btn-secondary ${
                      selectedShipment.status === "recupere" ? "active" : ""
                    }`}
                  >
                    Récupéré
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateStatus;
