import React from 'react';
import { Link } from 'react-router-dom';
import './Demo.css';

const Demo = () => {
  return (
    <div className="demo-page">
      <header className="header">
        <div className="logo-container">
          <img src="/logo192.png" alt="Colis Logo" className="logo" />
          <span className="logo-text">COLIS</span>
        </div>
        <nav className="main-nav">
          <ul>
            <li><a href="#features">Fonctionnalités</a></li>
            <li><a href="#resources">Ressources</a></li>
            <li><a href="#webinars">Webinaires</a></li>
            <li><a href="#blog">Blog</a></li>
          </ul>
        </nav>
        <div className="language-selector">
          <span>FR</span>
        </div>
        <Link to="/" className="btn btn-secondary">Retour</Link>
      </header>

      <main className="demo-content">
        <div className="demo-container">
          <h1>Réserver une Démo</h1>
          <p>Complétez le formulaire ci-dessous pour réserver une démonstration personnalisée de notre plateforme logistique.</p>
          
          <form className="demo-form">
            <div className="form-group">
              <label htmlFor="name">Nom complet</label>
              <input type="text" id="name" name="name" placeholder="Votre nom" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email professionnel</label>
              <input type="email" id="email" name="email" placeholder="votre@email.com" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="company">Entreprise</label>
              <input type="text" id="company" name="company" placeholder="Nom de votre entreprise" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Téléphone</label>
              <input type="tel" id="phone" name="phone" placeholder="+33 1 23 45 67 89" />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message (optionnel)</label>
              <textarea id="message" name="message" placeholder="Partagez vos besoins spécifiques..."></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary btn-large">Envoyer la demande</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Demo; 