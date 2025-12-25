// ============================================================================
// CRM EXPERT JUDICIAIRE - ILLUSTRATIONS SVG POUR ÉTATS VIDES
// Illustrations vectorielles légères et professionnelles
// ============================================================================

import React from 'react';

// ============================================================================
// Illustration: Dossiers vides (Affaires)
// ============================================================================
export const IllustrationDossiers = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Dossier arrière */}
    <rect x="25" y="35" width="60" height="50" rx="4" fill="#E5E7EB" />
    <path d="M25 39C25 36.7909 26.7909 35 29 35H45L50 42H81C83.2091 42 85 43.7909 85 46V81C85 83.2091 83.2091 85 81 85H29C26.7909 85 25 83.2091 25 81V39Z" fill="#D1D5DB" />

    {/* Dossier avant */}
    <rect x="35" y="45" width="55" height="45" rx="4" fill="#2563EB" opacity="0.1" />
    <path d="M35 49C35 46.7909 36.7909 45 39 45H52L57 52H86C88.2091 52 90 53.7909 90 56V86C90 88.2091 88.2091 90 86 90H39C36.7909 90 35 88.2091 35 86V49Z" fill="#2563EB" opacity="0.2" />

    {/* Icône + */}
    <circle cx="62" cy="70" r="12" fill="#2563EB" opacity="0.3" />
    <path d="M62 64V76M56 70H68" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />

    {/* Étoiles décoratives */}
    <circle cx="95" cy="30" r="2" fill="#2563EB" opacity="0.4" />
    <circle cx="20" cy="50" r="1.5" fill="#2563EB" opacity="0.3" />
    <circle cx="100" cy="70" r="1" fill="#2563EB" opacity="0.2" />
  </svg>
);

// ============================================================================
// Illustration: Documents vides
// ============================================================================
export const IllustrationDocuments = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Document arrière */}
    <rect x="35" y="25" width="50" height="65" rx="4" fill="#E5E7EB" />
    <path d="M35 25h35l15 15v46a4 4 0 01-4 4H39a4 4 0 01-4-4V29a4 4 0 014-4z" fill="#D1D5DB" />

    {/* Document avant */}
    <rect x="30" y="30" width="50" height="65" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="2" />
    <path d="M65 30v12a4 4 0 004 4h11" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />

    {/* Lignes de texte */}
    <rect x="40" y="55" width="30" height="3" rx="1.5" fill="#2563EB" opacity="0.3" />
    <rect x="40" y="63" width="25" height="3" rx="1.5" fill="#E5E7EB" />
    <rect x="40" y="71" width="28" height="3" rx="1.5" fill="#E5E7EB" />
    <rect x="40" y="79" width="20" height="3" rx="1.5" fill="#E5E7EB" />

    {/* Décor */}
    <circle cx="90" cy="45" r="2" fill="#2563EB" opacity="0.4" />
    <circle cx="25" cy="65" r="1.5" fill="#2563EB" opacity="0.3" />
  </svg>
);

// ============================================================================
// Illustration: Photos vides
// ============================================================================
export const IllustrationPhotos = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cadre photo arrière */}
    <rect x="30" y="30" width="50" height="45" rx="4" fill="#E5E7EB" />

    {/* Cadre photo avant */}
    <rect x="40" y="40" width="50" height="45" rx="4" fill="white" stroke="#2563EB" strokeWidth="2" opacity="0.5" />

    {/* Montagne et soleil */}
    <circle cx="55" cy="55" r="6" fill="#2563EB" opacity="0.3" />
    <path d="M45 80L60 65L72 75L85 60" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />

    {/* Icône appareil photo */}
    <rect x="55" y="70" width="20" height="15" rx="3" fill="#2563EB" opacity="0.2" />
    <circle cx="65" cy="77" r="4" stroke="#2563EB" strokeWidth="1.5" opacity="0.4" />
    <rect x="60" y="68" width="10" height="3" rx="1" fill="#2563EB" opacity="0.2" />

    {/* Décor */}
    <circle cx="95" cy="35" r="2" fill="#2563EB" opacity="0.4" />
    <circle cx="25" cy="55" r="1.5" fill="#2563EB" opacity="0.3" />
  </svg>
);

// ============================================================================
// Illustration: Recherche vide
// ============================================================================
export const IllustrationRecherche = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Loupe */}
    <circle cx="50" cy="50" r="25" stroke="#2563EB" strokeWidth="4" opacity="0.3" />
    <circle cx="50" cy="50" r="18" stroke="#E5E7EB" strokeWidth="3" />
    <path d="M68 68L85 85" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" opacity="0.5" />

    {/* Point d'interrogation */}
    <path d="M45 42C45 38 48 35 52 35C56 35 59 38 59 42C59 46 56 48 52 50V54" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
    <circle cx="52" cy="60" r="2" fill="#2563EB" opacity="0.4" />

    {/* Décor */}
    <circle cx="90" cy="30" r="2" fill="#2563EB" opacity="0.4" />
    <circle cx="25" cy="70" r="1.5" fill="#2563EB" opacity="0.3" />
    <circle cx="95" cy="75" r="1" fill="#2563EB" opacity="0.2" />
  </svg>
);

// ============================================================================
// Illustration: Calendrier vide (Réunions)
// ============================================================================
export const IllustrationCalendrier = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Calendrier */}
    <rect x="25" y="35" width="70" height="60" rx="6" fill="white" stroke="#E5E7EB" strokeWidth="2" />
    <rect x="25" y="35" width="70" height="16" rx="6" fill="#2563EB" opacity="0.2" />

    {/* Anneaux */}
    <rect x="40" y="28" width="4" height="14" rx="2" fill="#2563EB" opacity="0.4" />
    <rect x="76" y="28" width="4" height="14" rx="2" fill="#2563EB" opacity="0.4" />

    {/* Grille jours */}
    <rect x="33" y="58" width="10" height="10" rx="2" fill="#E5E7EB" />
    <rect x="48" y="58" width="10" height="10" rx="2" fill="#E5E7EB" />
    <rect x="63" y="58" width="10" height="10" rx="2" fill="#2563EB" opacity="0.3" />
    <rect x="78" y="58" width="10" height="10" rx="2" fill="#E5E7EB" />

    <rect x="33" y="73" width="10" height="10" rx="2" fill="#E5E7EB" />
    <rect x="48" y="73" width="10" height="10" rx="2" fill="#E5E7EB" />
    <rect x="63" y="73" width="10" height="10" rx="2" fill="#E5E7EB" />
    <rect x="78" y="73" width="10" height="10" rx="2" fill="#E5E7EB" />

    {/* Décor */}
    <circle cx="100" cy="30" r="2" fill="#2563EB" opacity="0.4" />
    <circle cx="20" cy="60" r="1.5" fill="#2563EB" opacity="0.3" />
  </svg>
);

// ============================================================================
// Illustration: Contacts vides (Sapiteurs/Parties)
// ============================================================================
export const IllustrationContacts = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Personne principale */}
    <circle cx="60" cy="45" r="18" fill="#2563EB" opacity="0.2" />
    <circle cx="60" cy="40" r="10" fill="#2563EB" opacity="0.3" />
    <path d="M42 75C42 62 50 55 60 55C70 55 78 62 78 75" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" opacity="0.3" />

    {/* Personne gauche (plus petite) */}
    <circle cx="30" cy="55" r="8" fill="#E5E7EB" />
    <path d="M20 80C20 72 24 68 30 68C36 68 40 72 40 80" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />

    {/* Personne droite (plus petite) */}
    <circle cx="90" cy="55" r="8" fill="#E5E7EB" />
    <path d="M80 80C80 72 84 68 90 68C96 68 100 72 100 80" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />

    {/* Icône + */}
    <circle cx="60" cy="90" r="10" fill="#2563EB" opacity="0.2" />
    <path d="M60 85V95M55 90H65" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

    {/* Décor */}
    <circle cx="100" cy="35" r="2" fill="#2563EB" opacity="0.4" />
    <circle cx="20" cy="40" r="1.5" fill="#2563EB" opacity="0.3" />
  </svg>
);

// ============================================================================
// Illustration: Notifications vides
// ============================================================================
export const IllustrationNotifications = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cloche */}
    <path
      d="M60 25C48 25 38 35 38 47V60C38 65 33 70 33 70H87C87 70 82 65 82 60V47C82 35 72 25 60 25Z"
      fill="#2563EB"
      opacity="0.2"
    />
    <path
      d="M60 25C48 25 38 35 38 47V60C38 65 33 70 33 70H87C87 70 82 65 82 60V47C82 35 72 25 60 25Z"
      stroke="#2563EB"
      strokeWidth="2.5"
      opacity="0.4"
    />

    {/* Battant */}
    <circle cx="60" cy="80" r="6" fill="#2563EB" opacity="0.3" />

    {/* Anneau */}
    <circle cx="60" cy="20" r="4" fill="#2563EB" opacity="0.4" />

    {/* Checkmark (tout est à jour) */}
    <circle cx="75" cy="35" r="12" fill="#059669" opacity="0.2" />
    <path d="M70 35L74 39L82 31" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Décor */}
    <circle cx="95" cy="55" r="2" fill="#2563EB" opacity="0.4" />
    <circle cx="25" cy="45" r="1.5" fill="#2563EB" opacity="0.3" />
  </svg>
);

// ============================================================================
// Illustration: Succès / Terminé
// ============================================================================
export const IllustrationSucces = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cercle principal */}
    <circle cx="60" cy="60" r="35" fill="#059669" opacity="0.1" />
    <circle cx="60" cy="60" r="28" stroke="#059669" strokeWidth="3" opacity="0.3" />

    {/* Checkmark */}
    <path
      d="M45 60L55 70L78 47"
      stroke="#059669"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Étoiles */}
    <circle cx="95" cy="35" r="3" fill="#059669" opacity="0.4" />
    <circle cx="25" cy="45" r="2" fill="#059669" opacity="0.3" />
    <circle cx="90" cy="85" r="2" fill="#059669" opacity="0.3" />
    <circle cx="30" cy="80" r="1.5" fill="#059669" opacity="0.2" />

    {/* Sparkles */}
    <path d="M100 60L103 57L100 54L97 57L100 60Z" fill="#059669" opacity="0.4" />
    <path d="M20 65L22 63L20 61L18 63L20 65Z" fill="#059669" opacity="0.3" />
  </svg>
);

// ============================================================================
// Illustration: Erreur
// ============================================================================
export const IllustrationErreur = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cercle principal */}
    <circle cx="60" cy="60" r="35" fill="#DC2626" opacity="0.1" />
    <circle cx="60" cy="60" r="28" stroke="#DC2626" strokeWidth="3" opacity="0.3" />

    {/* X */}
    <path d="M48 48L72 72M72 48L48 72" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />

    {/* Décor */}
    <circle cx="95" cy="35" r="2" fill="#DC2626" opacity="0.3" />
    <circle cx="25" cy="55" r="1.5" fill="#DC2626" opacity="0.2" />
  </svg>
);

// ============================================================================
// Illustration: Tableau de bord vide
// ============================================================================
export const IllustrationDashboard = ({ className = '', size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Graphique barres */}
    <rect x="20" y="70" width="12" height="25" rx="2" fill="#2563EB" opacity="0.3" />
    <rect x="38" y="55" width="12" height="40" rx="2" fill="#2563EB" opacity="0.4" />
    <rect x="56" y="40" width="12" height="55" rx="2" fill="#2563EB" opacity="0.5" />
    <rect x="74" y="50" width="12" height="45" rx="2" fill="#2563EB" opacity="0.4" />
    <rect x="92" y="60" width="12" height="35" rx="2" fill="#2563EB" opacity="0.3" />

    {/* Ligne de tendance */}
    <path
      d="M26 65L44 52L62 35L80 45L98 55"
      stroke="#2563EB"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 4"
      opacity="0.5"
    />

    {/* Flèche montante */}
    <path
      d="M95 25L100 20L105 25M100 20V32"
      stroke="#059669"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Décor */}
    <circle cx="15" cy="40" r="2" fill="#2563EB" opacity="0.3" />
    <circle cx="110" cy="80" r="1.5" fill="#2563EB" opacity="0.2" />
  </svg>
);

// ============================================================================
// EXPORT
// ============================================================================

export default {
  IllustrationDossiers,
  IllustrationDocuments,
  IllustrationPhotos,
  IllustrationRecherche,
  IllustrationCalendrier,
  IllustrationContacts,
  IllustrationNotifications,
  IllustrationSucces,
  IllustrationErreur,
  IllustrationDashboard
};
