import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Landing.css";
import logo from "../assets/akm_consulting_logo_sansbg.png";

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <img src={logo} alt="akm logo" />
            <span>Akm transport</span>
          </div>
          <div className="navbar-links">
            <a href="#services">Services</a>
            <a href="#features">Fonctionnalités</a>
            <a href="#about">À propos</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="navbar-buttons">
            {user ? (
              <>
                <Link to="/reservation" className="btn btn-primary">
                  Nouvel Envoi
                </Link>
                <Link to="/dashboard" className="btn btn-secondary">
                  Tableau de Bord
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-login">
                  Connexion
                </Link>
                <Link to="/register" className="btn btn-register">
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Image */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Livraison de Colis Simplifiée</h1>
            <p>
              Une solution moderne pour suivre et gérer vos envois en toute
              simplicité
            </p>
            <div className="hero-buttons">
              {user ? (
                <Link to="/reservation" className="btn btn-primary">
                  Nouvel Envoi
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary">
                    Commencer
                  </Link>
                  <Link to="/tracking" className="btn btn-secondary">
                    Suivre un colis
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Livraison de colis"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" id="services">
        <h2>Nos Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <i className="fas fa-truck"></i>
            <h3>Livraison Rapide</h3>
            <p>Livraison express dans toute la France en 24-48h</p>
          </div>
          <div className="service-card">
            <i className="fas fa-map-marker-alt"></i>
            <h3>Suivi en Temps Réel</h3>
            <p>Suivez vos colis en temps réel avec notre système de tracking</p>
          </div>
          <div className="service-card">
            <i className="fas fa-shield-alt"></i>
            <h3>Assurance Incluse</h3>
            <p>Tous vos envois sont automatiquement assurés</p>
          </div>
          <div className="service-card">
            <i className="fas fa-clock"></i>
            <h3>Service 24/7</h3>
            <p>Notre service client est disponible 24h/24 et 7j/7</p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <h3>50K+</h3>
            <p>Colis Livrés</p>
          </div>
          <div className="stat-item">
            <h3>98%</h3>
            <p>Satisfaction Client</p>
          </div>
          <div className="stat-item">
            <h3>24h</h3>
            <p>Délai Moyen</p>
          </div>
          <div className="stat-item">
            <h3>100+</h3>
            <p>Villes Desservies</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <h2>Pourquoi Nous Choisir ?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-mobile-alt"></i>
            <h3>Application Mobile</h3>
            <p>Gérez vos envois depuis votre smartphone</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-chart-line"></i>
            <h3>Rapports Détaillés</h3>
            <p>Suivez vos statistiques et performances</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-handshake"></i>
            <h3>Partenaires de Confiance</h3>
            <p>Réseau de transporteurs certifiés</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Prêt à Commencer ?</h2>
          <p>Rejoignez des milliers d'utilisateurs satisfaits</p>
          <Link to="/register" className="btn btn-primary">
            Créer un Compte
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>À Propos</h4>
            <ul>
              <li>
                <a href="#about">Notre Histoire</a>
              </li>
              <li>
                <a href="#team">Notre Équipe</a>
              </li>
              <li>
                <a href="#careers">Carrières</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li>
                <a href="#express">Livraison Express</a>
              </li>
              <li>
                <a href="#international">International</a>
              </li>
              <li>
                <a href="#business">Solutions Business</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li>
                <a href="#support">Support</a>
              </li>
              <li>
                <a href="#contact">Contactez-nous</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Colis. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
