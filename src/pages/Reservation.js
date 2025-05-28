import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import "./Reservation.css";

const Reservation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [price, setPrice] = useState(0);

  const [formData, setFormData] = useState({
    // Étape 1 : Informations du colis
    parcelType: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    destination: "",
    description: "",
    // Étape 2 : Informations du destinataire
    receiver_name: "",
    receiver_phone: "",
    receiver_email: "",
    receiver_address: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Calcul du prix pour les champs weight et parcelType
    if (name === "weight" || name === "parcelType") {
      const basePrice = 10;
      const weightMultiplier = parseFloat(formData.weight) || 0;
      const typeMultiplier = formData.parcelType === "fragile" ? 1.5 : 1;
      const calculatedPrice = basePrice + weightMultiplier * typeMultiplier;
      setPrice(calculatedPrice.toFixed(2));
    }

    // Gestion de l'autocomplétion d'adresse
    if (name === "receiver_address" && value.length > 2) {
      fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
          value
        )}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data && data.features) {
            setAddressSuggestions(data.features);
          } else {
            setAddressSuggestions([]);
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des adresses:", error);
          setAddressSuggestions([]);
        });
    } else if (name === "receiver_address") {
      setAddressSuggestions([]);
    }

    // Gestion de l'autocomplétion des villes
    if (name === "destination" && value.length > 2) {
      setError(null); // Réinitialiser les erreurs précédentes
      fetch(
        `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(
          value
        )}&maxRows=10&username=didou&featureClass=P&
        style=FULL&lang=fr&cities=cities15000`
      )
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            if (errorData.status?.value === 10) {
              throw new Error(
                "Le compte GeoNames n'est pas correctement configuré. Veuillez réessayer dans quelques minutes."
              );
            } else if (errorData.status?.value === 18) {
              throw new Error(
                "Limite quotidienne atteinte. Veuillez réessayer demain."
              );
            } else if (errorData.status?.value === 19) {
              throw new Error(
                "Limite horaire atteinte. Veuillez réessayer dans une heure."
              );
            } else {
              throw new Error(
                errorData.status?.message || `Erreur: ${response.status}`
              );
            }
          }
          return response.json();
        })
        .then((data) => {
          if (data.status) {
            throw new Error(data.status.message || "Erreur API");
          }
          if (data && data.geonames && data.geonames.length > 0) {
            const cities = data.geonames.map((city) => ({
              properties: {
                label: `${city.name}${
                  city.countryName ? `, ${city.countryName}` : ""
                }${city.adminName1 ? ` (${city.adminName1})` : ""}`,
                city: city.name,
                country: city.countryName,
                population: city.population,
                region: city.adminName1,
              },
            }));
            setCitySuggestions(cities);
          } else {
            setCitySuggestions([]);
            setError("Aucune ville trouvée pour cette recherche.");
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la recherche des villes:", error);
          setCitySuggestions([]);
          setError(error.message);
        });
    } else if (name === "destination") {
      setCitySuggestions([]);
      setError(null);
    }
  };

  const handleAddressSelect = (suggestion) => {
    if (suggestion && suggestion.properties) {
      const fullAddress = suggestion.properties.label;
      setFormData((prev) => ({
        ...prev,
        receiver_address: fullAddress,
      }));
      setAddressSuggestions([]);
    }
  };

  const handleCitySelect = (suggestion) => {
    if (suggestion && suggestion.properties) {
      const city = suggestion.properties.label;
      setFormData((prev) => ({
        ...prev,
        destination: city,
      }));
      setCitySuggestions([]);
    }
  };

  const nextStep = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const generateTrackingNumber = () => {
    const prefix = "COL";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}${timestamp}${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      const trackingNumber = generateTrackingNumber();
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

      const { data: shipmentData, error: shipmentError } = await supabase
        .from("shipments")
        .insert([
          {
            tracking_number: trackingNumber,
            user_id: user.id,
            status: "processing",
            origin: "France",
            destination: formData.destination,
            weight: parseFloat(formData.weight),
            description: formData.description,
            estimated_delivery: estimatedDelivery.toISOString(),
            receiver_name: formData.receiver_name,
            receiver_phone: formData.receiver_phone,
            receiver_email: formData.receiver_email,
            receiver_address: formData.receiver_address,
          },
        ])
        .select();

      if (shipmentError) {
        console.error("Erreur Supabase (shipments):", shipmentError);
        throw new Error(
          `Erreur lors de l'enregistrement du colis: ${shipmentError.message}`
        );
      }

      // Créer une notification pour l'utilisateur
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            user_id: user.id,
            message: `Votre colis ${trackingNumber} a été enregistré avec succès.`,
            is_read: false,
          },
        ]);

      if (notificationError) {
        console.error("Erreur Supabase (notifications):", notificationError);
      }

      navigate("/dashboard", {
        state: {
          message: "Votre colis a été enregistré avec succès !",
          trackingNumber: trackingNumber,
        },
      });
    } catch (error) {
      console.error("Erreur complète:", error);
      setError(
        error.message ||
          "Une erreur est survenue lors de l'enregistrement du colis. Veuillez réessayer."
      );
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

        <div className="steps-indicator">
          <div className={`step ${currentStep === 1 ? "active" : ""}`}>
            1. Informations du colis
          </div>
          <div className={`step ${currentStep === 2 ? "active" : ""}`}>
            2. Informations du destinataire
          </div>
        </div>

        {currentStep === 1 ? (
          <form onSubmit={nextStep}>
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
              {Array.isArray(citySuggestions) && citySuggestions.length > 0 && (
                <ul className="address-suggestions">
                  {citySuggestions.map(
                    (suggestion, index) =>
                      suggestion &&
                      suggestion.properties && (
                        <li
                          key={index}
                          onClick={() => handleCitySelect(suggestion)}
                        >
                          <div className="city-info">
                            <span className="city-name">
                              {suggestion.properties.city}
                            </span>
                            {suggestion.properties.country && (
                              <span className="country-name">
                                {suggestion.properties.country}
                              </span>
                            )}
                          </div>
                          {suggestion.properties.population && (
                            <span className="population">
                              {new Intl.NumberFormat("fr-FR").format(
                                suggestion.properties.population
                              )}{" "}
                              hab.
                            </span>
                          )}
                        </li>
                      )
                  )}
                </ul>
              )}
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
              <button type="submit" className="btn-primary" disabled={loading}>
                Suivant
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="receiver_name">Nom du destinataire</label>
              <input
                type="text"
                id="receiver_name"
                name="receiver_name"
                value={formData.receiver_name}
                onChange={handleInputChange}
                placeholder="Nom complet du destinataire"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="receiver_phone">Téléphone</label>
              <input
                type="tel"
                id="receiver_phone"
                name="receiver_phone"
                value={formData.receiver_phone}
                onChange={handleInputChange}
                placeholder="Numéro de téléphone"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="receiver_email">Email</label>
              <input
                type="email"
                id="receiver_email"
                name="receiver_email"
                value={formData.receiver_email}
                onChange={handleInputChange}
                placeholder="Adresse email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="receiver_address">Adresse complète</label>
              <textarea
                id="receiver_address"
                name="receiver_address"
                value={formData.receiver_address}
                onChange={handleInputChange}
                placeholder="Adresse de livraison complète"
                rows="3"
                required
              />
              {Array.isArray(addressSuggestions) &&
                addressSuggestions.length > 0 && (
                  <ul className="address-suggestions">
                    {addressSuggestions.map(
                      (suggestion, index) =>
                        suggestion &&
                        suggestion.properties && (
                          <li
                            key={index}
                            onClick={() => handleAddressSelect(suggestion)}
                          >
                            {suggestion.properties.label}
                          </li>
                        )
                    )}
                  </ul>
                )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={prevStep}
                disabled={loading}
              >
                Retour
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Enregistrement..." : "Confirmer l'envoi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Reservation;
