// ============================================================================
// CRM EXPERT JUDICIAIRE - WORKFLOW TUNNEL (12 ÉTAPES)
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  FileInput, Send, ClipboardList, Banknote, CalendarPlus, Users,
  FileText, MessageSquare, CalendarRange, FileSearch, FileCheck, Receipt,
  Check, Clock, AlertTriangle, ChevronRight, ChevronDown, Play
} from 'lucide-react';
import { Card, Badge, Button, ProgressBar } from '../ui';
import { ETAPES_TUNNEL } from '../../data';

// Map des icônes
const ICONS = {
  FileInput, Send, ClipboardList, Banknote, CalendarPlus, Users,
  FileText, MessageSquare, CalendarRange, FileSearch, FileCheck, Receipt
};

// ============================================================================
// COMPOSANT: Étape individuelle du tunnel
// ============================================================================

const EtapeTunnel = ({ etape, status, isActive, isCurrent, onClick, delaiRestant }) => {
  const Icon = ICONS[etape.icon] || FileText;

  const getStatusStyle = () => {
    if (status === 'completed') {
      return 'bg-green-100 border-green-500 text-green-700';
    }
    if (status === 'in-progress' || isCurrent) {
      return 'bg-amber-100 border-amber-500 text-amber-700 animate-pulse';
    }
    if (status === 'skipped') {
      return 'bg-gray-100 border-gray-300 text-gray-400';
    }
    return 'bg-white border-gray-200 text-gray-400';
  };

  const getIconStyle = () => {
    if (status === 'completed') return 'bg-green-500 text-white';
    if (status === 'in-progress' || isCurrent) return 'bg-amber-500 text-white';
    if (status === 'skipped') return 'bg-gray-300 text-white';
    return 'bg-gray-100 text-gray-400';
  };

  return (
    <div
      className={`relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${getStatusStyle()}`}
      onClick={onClick}
    >
      {/* Numéro / Icône */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconStyle()}`}>
        {status === 'completed' ? (
          <Check className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">#{etape.numero}</span>
          <span className="font-medium truncate">{etape.label}</span>
          {!etape.obligatoire && (
            <span className="text-xs text-gray-400">(optionnel)</span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{etape.description}</p>
      </div>

      {/* Délai restant */}
      {delaiRestant !== null && status !== 'completed' && (
        <div className={`text-xs font-medium px-2 py-1 rounded ${
          delaiRestant <= 3 ? 'bg-red-100 text-red-600' :
          delaiRestant <= 7 ? 'bg-amber-100 text-amber-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          J-{delaiRestant}
        </div>
      )}

      {/* Flèche */}
      <ChevronRight className="w-4 h-4 text-gray-300" />
    </div>
  );
};

// ============================================================================
// COMPOSANT: Tunnel complet avec progression
// ============================================================================

export const WorkflowTunnel = ({ affaire, onEtapeClick, currentEtape }) => {
  const [expanded, setExpanded] = useState(true);

  // Calculer le statut de chaque étape en fonction des données de l'affaire
  const etapesStatus = useMemo(() => {
    if (!affaire) return {};

    const status = {};

    // 1. Assignation reçue
    status['assignation'] = affaire.date_ordonnance ? 'completed' : 'pending';

    // 2. Réponse au juge
    if (affaire.reponse_juge) {
      status['reponse-juge'] = 'completed';
    } else if (status['assignation'] === 'completed') {
      status['reponse-juge'] = 'in-progress';
    } else {
      status['reponse-juge'] = 'pending';
    }

    // 3. Saisie du dossier
    const hasSaisieDossier = affaire.tribunal && affaire.mission && (affaire.parties?.length > 0);
    if (hasSaisieDossier) {
      status['saisie-dossier'] = 'completed';
    } else if (status['reponse-juge'] === 'completed') {
      status['saisie-dossier'] = 'in-progress';
    } else {
      status['saisie-dossier'] = 'pending';
    }

    // 4. Vérification provision
    if (affaire.provision_recue) {
      status['provision'] = 'completed';
    } else if (status['saisie-dossier'] === 'completed') {
      status['provision'] = 'in-progress';
    } else {
      status['provision'] = 'pending';
    }

    // 5. Convocation R1
    const r1 = affaire.reunions?.find(r => r.numero === 1);
    if (r1?.convocations_envoyees) {
      status['convocation-r1'] = 'completed';
    } else if (status['provision'] === 'completed') {
      status['convocation-r1'] = 'in-progress';
    } else {
      status['convocation-r1'] = 'pending';
    }

    // 6. Réunion R1
    if (r1?.statut === 'terminee') {
      status['reunion-r1'] = 'completed';
    } else if (status['convocation-r1'] === 'completed') {
      status['reunion-r1'] = 'in-progress';
    } else {
      status['reunion-r1'] = 'pending';
    }

    // 7. Compte-rendu R1
    if (r1?.compte_rendu) {
      status['compte-rendu-r1'] = 'completed';
    } else if (status['reunion-r1'] === 'completed') {
      status['compte-rendu-r1'] = 'in-progress';
    } else {
      status['compte-rendu-r1'] = 'pending';
    }

    // 8. Dires des parties (optionnel)
    const diresTraites = affaire.dires?.filter(d => d.statut === 'repondu').length || 0;
    const diresTotal = affaire.dires?.length || 0;
    if (diresTotal > 0 && diresTraites === diresTotal) {
      status['dires'] = 'completed';
    } else if (diresTotal > 0) {
      status['dires'] = 'in-progress';
    } else {
      status['dires'] = 'skipped'; // Optionnel, pas de dires reçus
    }

    // 9. Réunions supplémentaires (optionnel)
    const reunionsSupp = affaire.reunions?.filter(r => r.numero > 1) || [];
    const reunionsSuppTerminees = reunionsSupp.filter(r => r.statut === 'terminee');
    if (reunionsSupp.length > 0 && reunionsSuppTerminees.length === reunionsSupp.length) {
      status['reunions-supplementaires'] = 'completed';
    } else if (reunionsSupp.length > 0) {
      status['reunions-supplementaires'] = 'in-progress';
    } else {
      status['reunions-supplementaires'] = 'skipped';
    }

    // 10. Note de synthèse
    const hasNoteSynthese = affaire.documents?.some(d => d.type === 'note-synthese' || d.type === 'pre-rapport');
    if (hasNoteSynthese) {
      status['note-synthese'] = 'completed';
    } else if (status['compte-rendu-r1'] === 'completed') {
      status['note-synthese'] = 'in-progress';
    } else {
      status['note-synthese'] = 'pending';
    }

    // 11. Rapport final
    const hasRapportFinal = affaire.documents?.some(d => d.type === 'rapport-final');
    if (hasRapportFinal) {
      status['rapport-final'] = 'completed';
    } else if (status['note-synthese'] === 'completed') {
      status['rapport-final'] = 'in-progress';
    } else {
      status['rapport-final'] = 'pending';
    }

    // 12. Taxation
    if (affaire.statut === 'termine' && affaire.taxation_demandee) {
      status['taxation'] = 'completed';
    } else if (status['rapport-final'] === 'completed') {
      status['taxation'] = 'in-progress';
    } else {
      status['taxation'] = 'pending';
    }

    return status;
  }, [affaire]);

  // Calculer la progression globale
  const progression = useMemo(() => {
    const etapesObligatoires = ETAPES_TUNNEL.filter(e => e.obligatoire);
    const completees = etapesObligatoires.filter(e => etapesStatus[e.id] === 'completed').length;
    return Math.round((completees / etapesObligatoires.length) * 100);
  }, [etapesStatus]);

  // Trouver l'étape en cours
  const etapeEnCours = useMemo(() => {
    return ETAPES_TUNNEL.find(e => etapesStatus[e.id] === 'in-progress');
  }, [etapesStatus]);

  // Calculer le délai restant pour une étape
  const getDelaiRestant = (etape) => {
    if (!etape.delaiJours || !affaire) return null;
    // Logique simplifiée - à améliorer selon les dates réelles
    return etape.delaiJours;
  };

  return (
    <Card className="p-5">
      {/* En-tête avec progression */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#d4af37] rounded-xl flex items-center justify-center">
            <Play className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-[#1a1a1a]">Avancement du dossier</h3>
            {etapeEnCours && (
              <p className="text-sm text-[#737373]">
                Étape en cours : <span className="text-[#c9a227] font-medium">{etapeEnCours.label}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-2xl font-light text-[#c9a227]">{progression}%</span>
            <p className="text-xs text-[#a3a3a3]">complété</p>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#a3a3a3] transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mt-4">
        <ProgressBar value={progression} color="gold" size="md" />
      </div>

      {/* Liste des étapes */}
      {expanded && (
        <div className="mt-6 space-y-2">
          {ETAPES_TUNNEL.map((etape) => (
            <EtapeTunnel
              key={etape.id}
              etape={etape}
              status={etapesStatus[etape.id]}
              isCurrent={currentEtape === etape.id}
              onClick={() => onEtapeClick && onEtapeClick(etape)}
              delaiRestant={getDelaiRestant(etape)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Mini tunnel (version compacte pour le header)
// ============================================================================

export const MiniWorkflowTunnel = ({ affaire, onEtapeClick }) => {
  // Calculer le statut de chaque étape (même logique simplifiée)
  const getEtapeStatus = (etapeId) => {
    if (!affaire) return 'pending';

    switch (etapeId) {
      case 'assignation':
        return affaire.date_ordonnance ? 'completed' : 'pending';
      case 'reponse-juge':
        return affaire.reponse_juge ? 'completed' : (affaire.date_ordonnance ? 'in-progress' : 'pending');
      case 'saisie-dossier':
        return (affaire.tribunal && affaire.parties?.length > 0) ? 'completed' : 'pending';
      case 'provision':
        return affaire.provision_recue ? 'completed' : 'pending';
      case 'convocation-r1':
        return affaire.reunions?.find(r => r.numero === 1)?.convocations_envoyees ? 'completed' : 'pending';
      case 'reunion-r1':
        return affaire.reunions?.find(r => r.numero === 1)?.statut === 'terminee' ? 'completed' : 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {ETAPES_TUNNEL.slice(0, 7).map((etape, index) => {
        const status = getEtapeStatus(etape.id);
        const Icon = ICONS[etape.icon] || FileText;

        return (
          <React.Fragment key={etape.id}>
            <button
              onClick={() => onEtapeClick && onEtapeClick(etape)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                status === 'completed' ? 'bg-green-100 text-green-700' :
                status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-400'
              }`}
              title={etape.label}
            >
              {status === 'completed' ? (
                <Check className="w-3 h-3" />
              ) : (
                <Icon className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">{etape.numero}</span>
            </button>
            {index < 6 && (
              <div className={`w-4 h-0.5 ${status === 'completed' ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
      <span className="text-xs text-gray-400 ml-1">+5</span>
    </div>
  );
};

export default WorkflowTunnel;
