// ============================================================================
// CRM EXPERT JUDICIAIRE - BANNIÈRE MODE DÉMONSTRATION
// Informe clairement l'utilisateur qu'il est en mode démo
// ============================================================================

import React, { useState } from 'react';
import { AlertTriangle, X, Info, Database, RefreshCw } from 'lucide-react';

// ============================================================================
// COMPOSANT: Bannière de démonstration
// ============================================================================

export const DemoBanner = ({ onResetData }) => {
  const [dismissed, setDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  if (dismissed) return null;

  return (
    <>
      {/* Bannière principale */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Mode Démonstration - Les données sont stockées localement et non sauvegardées sur un serveur
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Plus d'informations"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Masquer la bannière"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'information */}
      {showInfo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowInfo(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-amber-500 text-white p-6">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-8 h-8" />
                <h2 className="text-xl font-semibold">Mode Démonstration</h2>
              </div>
              <p className="text-amber-100 text-sm">
                Explorez toutes les fonctionnalités avec des données fictives
              </p>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1a1a1a]">Données locales uniquement</p>
                    <p className="text-sm text-[#737373]">
                      Vos données sont stockées dans le navigateur (localStorage) et non sur un serveur distant.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1a1a1a]">Données de test</p>
                    <p className="text-sm text-[#737373]">
                      Des affaires et contacts fictifs sont pré-remplis pour vous permettre de tester l'application.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1a1a1a]">Fonctionnalités simulées</p>
                    <p className="text-sm text-[#737373]">
                      Certaines fonctionnalités comme l'envoi de mails ou l'export PDF sont simulées.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bouton reset */}
              <div className="pt-4 border-t border-[#e5e5e5]">
                <button
                  onClick={() => {
                    if (onResetData) {
                      onResetData();
                    } else {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#525252] rounded-xl transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réinitialiser les données de démonstration
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#EFF6FF] px-6 py-4">
              <button
                onClick={() => setShowInfo(false)}
                className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
              >
                Compris, continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================================
// COMPOSANT: Indicateur de mode démo discret
// ============================================================================

export const DemoIndicator = () => {
  return (
    <div className="fixed bottom-4 right-4 z-30">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium border border-amber-200 shadow-sm">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
        Mode démo
      </div>
    </div>
  );
};

export default DemoBanner;
