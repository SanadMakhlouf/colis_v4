import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    // Validate password strength
    if (password.length < 6) {
      return setError("Le mot de passe doit contenir au moins 6 caractères.");
    }

    setLoading(true);

    try {
      // Register the user with Supabase
      const { user, error } = await signUp(email, password, {
        data: {
          role: "client",
          full_name: name,
        },
      });

      if (error) throw error;

      // La redirection est gérée dans le contexte d'authentification
    } catch (error) {
      console.error("Error during registration:", error.message);
      setError(
        error.message || "Une erreur est survenue lors de l'inscription."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Créer un Compte</h2>
            <p>Inscrivez-vous pour commencer à utiliser nos services</p>
          </div>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nom complet</label>
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="Entrez votre nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Créez un mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-control"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? "Inscription en cours..." : "S'inscrire"}
              </button>
            </div>
          </form>
          <div className="auth-footer">
            <p>
              Vous avez déjà un compte? <Link to="/login">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
