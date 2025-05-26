import React from "react";
import PropTypes from "prop-types";
import "./StatusBadge.css";

const StatusBadge = ({ status, withIcon, isActive, className }) => {
  // Fonction pour normaliser le statut (enlever les accents et mettre en minuscules)
  const normalizeStatus = (status) => {
    return status
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_");
  };

  // Construction des classes CSS
  const badgeClasses = [
    "status-badge",
    normalizeStatus(status),
    withIcon && "with-icon",
    isActive && "active-status",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Fonction pour obtenir l'icône appropriée selon le statut
  const getStatusIcon = () => {
    if (!withIcon) return null;

    switch (normalizeStatus(status)) {
      case "processing":
      case "recu":
        return "🔄";
      case "assigned":
      case "assigne":
        return "📋";
      case "in_transit":
      case "en_cours":
        return "🚚";
      case "delivered":
      case "livre":
        return "✅";
      case "returned":
      case "retour":
        return "↩️";
      case "picked_up":
      case "recupere":
        return "📦";
      case "cancelled":
        return "❌";
      default:
        return "📝";
    }
  };

  return (
    <span className={badgeClasses}>
      {withIcon && <span className="status-icon">{getStatusIcon()}</span>}
      {status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  withIcon: PropTypes.bool,
  isActive: PropTypes.bool,
  className: PropTypes.string,
};

StatusBadge.defaultProps = {
  withIcon: false,
  isActive: false,
  className: "",
};

export default StatusBadge;
