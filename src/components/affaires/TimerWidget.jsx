// ============================================================================
// CRM EXPERT JUDICIAIRE - WIDGET TIMER FLOTTANT
// Affiche le temps de travail sur une affaire avec contrôle play/pause
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, X, ChevronUp, ChevronDown } from 'lucide-react';

// ============================================================================
// HOOK: useControllableTimer
// Timer avec contrôle manuel play/pause et sauvegarde automatique
// ============================================================================

export const useControllableTimer = (affaireId, tauxHoraire = 90) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true); // Démarre automatiquement
  const [totalSecondsAffaire, setTotalSecondsAffaire] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const affaireIdRef = useRef(affaireId);
  const accumulatedSecondsRef = useRef(0);

  // Charger le temps total de l'affaire au montage
  useEffect(() => {
    if (!affaireId) return;

    try {
      const stored = localStorage.getItem('crm_demo_affaires');
      if (stored) {
        const affaires = JSON.parse(stored);
        const affaire = affaires.find(a => a.id === affaireId);
        if (affaire && affaire.vacations) {
          const total = affaire.vacations.reduce((acc, v) => acc + (v.duree_secondes || 0), 0);
          setTotalSecondsAffaire(total);
        }
      }
    } catch (e) {
      console.error('Erreur chargement temps:', e);
    }

    startTimeRef.current = Date.now();
  }, [affaireId]);

  // Gérer le timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Mettre à jour la ref
  useEffect(() => {
    affaireIdRef.current = affaireId;
  }, [affaireId]);

  // Sauvegarder le temps à la fermeture
  useEffect(() => {
    return () => {
      const dureeSecondes = seconds;
      if (dureeSecondes >= 10 && affaireIdRef.current) {
        saveTime(affaireIdRef.current, dureeSecondes, tauxHoraire);
      }
    };
  }, [seconds, tauxHoraire]);

  // Fonction de sauvegarde
  const saveTime = (id, duree, taux) => {
    try {
      const stored = localStorage.getItem('crm_demo_affaires');
      if (stored) {
        const affaires = JSON.parse(stored);
        const index = affaires.findIndex(a => a.id === id);

        if (index !== -1) {
          if (!affaires[index].vacations) {
            affaires[index].vacations = [];
          }

          affaires[index].vacations.push({
            id: `auto-${Date.now()}`,
            type: 'consultation',
            description: 'Temps de consultation',
            date_vacation: new Date().toISOString().split('T')[0],
            duree_secondes: duree,
            duree_heures: Math.round(duree / 36) / 100,
            taux_horaire: taux,
            montant: Math.round((duree / 3600) * taux * 100) / 100,
            auto: true
          });

          localStorage.setItem('crm_demo_affaires', JSON.stringify(affaires));
        }
      }
    } catch (e) {
      console.error('Erreur sauvegarde temps:', e);
    }
  };

  // Contrôles
  const toggle = () => setIsRunning(prev => !prev);
  const pause = () => setIsRunning(false);
  const resume = () => setIsRunning(true);

  // Formater la durée
  const formatDuree = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDureeCompact = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}min`;
    return `${m}min`;
  };

  // Calculs
  const sessionHeures = seconds / 3600;
  const totalHeures = (totalSecondsAffaire + seconds) / 3600;
  const sessionMontant = sessionHeures * tauxHoraire;
  const totalMontant = totalHeures * tauxHoraire;

  return {
    seconds,
    isRunning,
    toggle,
    pause,
    resume,
    sessionFormatted: formatDuree(seconds),
    sessionCompact: formatDureeCompact(seconds),
    totalFormatted: formatDureeCompact(totalSecondsAffaire + seconds),
    sessionMontant: Math.round(sessionMontant * 100) / 100,
    totalMontant: Math.round(totalMontant * 100) / 100,
    tauxHoraire
  };
};

// ============================================================================
// COMPOSANT: TimerWidget
// Widget flottant compact en bas à droite
// ============================================================================

export const TimerWidget = ({ affaireId, affaireRef, tauxHoraire = 90 }) => {
  const timer = useControllableTimer(affaireId, tauxHoraire);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-[#c9a227] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#b08d20] transition-colors"
        title="Afficher le timer"
      >
        <Timer className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl border border-[#e5e5e5] overflow-hidden min-w-[200px]">
        {/* En-tête compact */}
        <div
          className="px-3 py-2 bg-[#1a1a1a] text-white flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${timer.isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <Timer className="w-4 h-4" />
            <span className="font-mono text-sm font-medium">{timer.sessionFormatted}</span>
          </div>
          <div className="flex items-center gap-1">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <button
              onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Contenu étendu */}
        {isExpanded && (
          <div className="p-3 space-y-3">
            {/* Référence affaire */}
            {affaireRef && (
              <p className="text-xs text-[#737373] truncate">
                {affaireRef}
              </p>
            )}

            {/* Bouton Play/Pause */}
            <button
              onClick={timer.toggle}
              className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
                timer.isRunning
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {timer.isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Reprendre
                </>
              )}
            </button>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-[#f5f5f5] rounded-lg p-2">
                <p className="text-[10px] uppercase text-[#737373]">Session</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{timer.sessionMontant.toFixed(2)} €</p>
              </div>
              <div className="bg-[#f5e6c8] rounded-lg p-2">
                <p className="text-[10px] uppercase text-[#9a7b1c]">Total</p>
                <p className="text-sm font-semibold text-[#c9a227]">{timer.totalMontant.toFixed(2)} €</p>
              </div>
            </div>

            {/* Temps total affaire */}
            <div className="text-center text-xs text-[#737373]">
              Temps total : <span className="font-medium text-[#1a1a1a]">{timer.totalFormatted}</span>
              <span className="text-[#a3a3a3]"> ({timer.tauxHoraire}€/h)</span>
            </div>
          </div>
        )}

        {/* Version compacte : juste le bouton play/pause */}
        {!isExpanded && (
          <div className="px-3 py-2 flex items-center justify-between bg-[#fafafa]">
            <span className="text-xs text-[#737373]">{timer.sessionMontant.toFixed(2)} €</span>
            <button
              onClick={(e) => { e.stopPropagation(); timer.toggle(); }}
              className={`p-1.5 rounded-lg ${
                timer.isRunning
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-green-100 text-green-600'
              }`}
            >
              {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerWidget;
