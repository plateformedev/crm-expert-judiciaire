// ============================================================================
// CRM EXPERT JUDICIAIRE - Point d'entrée principal
// ============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

// ============================================================================
// Configuration globale
// ============================================================================

// Désactiver les warnings React StrictMode en développement si nécessaire
const isDev = import.meta.env.DEV;

// ============================================================================
// Gestion des erreurs globales
// ============================================================================

window.addEventListener('error', (event) => {
  console.error('Erreur globale:', event.error);
  // En production, envoyer à un service de monitoring
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejetée:', event.reason);
  // En production, envoyer à un service de monitoring
});

// ============================================================================
// Rendu de l'application
// ============================================================================

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// ============================================================================
// Hot Module Replacement (développement)
// ============================================================================

if (isDev && import.meta.hot) {
  import.meta.hot.accept();
}

// ============================================================================
// Performance monitoring (optionnel)
// ============================================================================

// Web Vitals reporting
const reportWebVitals = async (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};

// Log des métriques en développement
if (isDev) {
  reportWebVitals(console.log);
}
