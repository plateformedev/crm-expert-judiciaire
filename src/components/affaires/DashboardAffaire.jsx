// ============================================================================
// CRM EXPERT JUDICIAIRE - DASHBOARD CONTEXTUEL AFFAIRE
// Bandeau intelligent avec prochaine action et KPIs
// ============================================================================

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, AlertTriangle, Clock, Euro, Users, Calendar,
  FileText, Send, CheckCircle, Target, TrendingUp, Shield,
  Banknote, CalendarPlus, MessageSquare, FileCheck, Receipt,
  Play, ChevronRight, Sparkles, Zap
} from 'lucide-react';
import { Card, Badge, Button, ProgressBar } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// DÉFINITION DES PHASES (simplifié de 12 étapes à 5 phases)
// ============================================================================

const PHASES = [
  {
    id: 'preparation',
    label: 'Préparation',
    description: 'Acceptation et configuration du dossier',
    etapes: ['assignation', 'reponse-juge', 'saisie-dossier', 'provision'],
    icon: FileText,
    color: 'blue'
  },
  {
    id: 'operations',
    label: 'Opérations',
    description: 'Réunions d\'expertise sur site',
    etapes: ['convocation-r1', 'reunion-r1', 'compte-rendu-r1', 'reunions-supplementaires'],
    icon: Calendar,
    color: 'purple'
  },
  {
    id: 'echanges',
    label: 'Échanges',
    description: 'Dires des parties et réponses',
    etapes: ['dires'],
    icon: MessageSquare,
    color: 'amber'
  },
  {
    id: 'redaction',
    label: 'Rédaction',
    description: 'Note de synthèse et rapport final',
    etapes: ['note-synthese', 'rapport-final'],
    icon: FileCheck,
    color: 'green'
  },
  {
    id: 'cloture',
    label: 'Clôture',
    description: 'Taxation et archivage',
    etapes: ['taxation'],
    icon: Receipt,
    color: 'gold'
  }
];

// ============================================================================
// ACTIONS RECOMMANDÉES
// ============================================================================

const ACTIONS_CONFIG = {
  'accepter-mission': {
    label: 'Accepter la mission',
    description: 'Répondre au juge dans les 15 jours',
    icon: Send,
    color: 'blue',
    priority: 'high',
    action: 'reponse-juge'
  },
  'saisir-parties': {
    label: 'Ajouter les parties',
    description: 'Identifier demandeurs et défendeurs',
    icon: Users,
    color: 'purple',
    priority: 'high',
    tab: 'dossier'
  },
  'verifier-provision': {
    label: 'Vérifier la provision',
    description: 'Confirmer la réception de la consignation',
    icon: Banknote,
    color: 'green',
    priority: 'medium',
    tab: 'finances'
  },
  'planifier-r1': {
    label: 'Planifier la réunion R1',
    description: 'Fixer date et lieu de la première expertise',
    icon: CalendarPlus,
    color: 'amber',
    priority: 'high',
    tab: 'operations'
  },
  'envoyer-convocations': {
    label: 'Envoyer les convocations',
    description: 'Convoquer toutes les parties (J-21 minimum)',
    icon: Send,
    color: 'blue',
    priority: 'high',
    action: 'convocation'
  },
  'saisir-desordres': {
    label: 'Constater les désordres',
    description: 'Documenter les pathologies observées',
    icon: AlertTriangle,
    color: 'red',
    priority: 'medium',
    tab: 'operations'
  },
  'rediger-cr': {
    label: 'Rédiger le compte-rendu',
    description: 'Formaliser les opérations de la réunion',
    icon: FileText,
    color: 'purple',
    priority: 'medium',
    action: 'compte-rendu'
  },
  'traiter-dires': {
    label: 'Répondre aux dires',
    description: 'Traiter les observations des parties',
    icon: MessageSquare,
    color: 'amber',
    priority: 'high',
    tab: 'echanges'
  },
  'rediger-synthese': {
    label: 'Rédiger la note de synthèse',
    description: 'Préparer le pré-rapport pour observations',
    icon: FileCheck,
    color: 'green',
    priority: 'medium',
    tab: 'production'
  },
  'finaliser-rapport': {
    label: 'Finaliser le rapport',
    description: 'Clôturer et déposer le rapport définitif',
    icon: FileCheck,
    color: 'green',
    priority: 'high',
    tab: 'production'
  },
  'demander-taxation': {
    label: 'Demander la taxation',
    description: 'Soumettre l\'état de frais au tribunal',
    icon: Receipt,
    color: 'gold',
    priority: 'medium',
    tab: 'finances'
  },
  'mission-complete': {
    label: 'Mission terminée',
    description: 'Toutes les étapes ont été complétées',
    icon: CheckCircle,
    color: 'green',
    priority: 'none'
  }
};

// ============================================================================
// COMPOSANT: Indicateur de phase
// ============================================================================

const PhaseIndicator = ({ phase, status, isActive, onClick }) => {
  const Icon = phase.icon;

  const getStatusStyle = () => {
    if (status === 'completed') return 'bg-green-500 text-white ring-green-500';
    if (status === 'in-progress') return 'bg-[#2563EB] text-white ring-[#2563EB] animate-pulse';
    return 'bg-gray-100 text-gray-400 ring-gray-200';
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 p-3 rounded-2xl transition-all min-w-[80px]
        ${isActive ? 'bg-[#fef9e7] ring-2 ring-[#2563EB]' : 'hover:bg-gray-50'}
      `}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ring-2 ${getStatusStyle()}`}>
        {status === 'completed' ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <Icon className="w-6 h-6" />
        )}
      </div>
      <span className={`text-xs font-medium text-center ${
        status === 'completed' ? 'text-green-600' :
        status === 'in-progress' ? 'text-[#2563EB]' :
        'text-gray-500'
      }`}>
        {phase.label}
      </span>
    </button>
  );
};

// ============================================================================
// COMPOSANT: Carte KPI
// ============================================================================

const KpiCard = ({ icon: Icon, label, value, variant = 'default', onClick }) => {
  const variants = {
    default: 'bg-gray-50 text-gray-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-amber-50 text-amber-600',
    error: 'bg-red-50 text-red-600',
    info: 'bg-blue-50 text-blue-600',
    gold: 'bg-[#fef9e7] text-[#2563EB]'
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${variants[variant]}
        ${onClick ? 'hover:opacity-80 cursor-pointer' : ''}
      `}
    >
      <Icon className="w-5 h-5" />
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </button>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL: Dashboard Affaire
// ============================================================================

export const DashboardAffaire = ({ affaire, onAction, onNavigate }) => {
  const navigate = useNavigate();

  // Calculer le statut de chaque phase
  const phasesStatus = useMemo(() => {
    if (!affaire) return {};

    const status = {};

    // Phase Préparation
    const prepComplete = affaire.reponse_juge &&
                         affaire.tribunal &&
                         affaire.parties?.length > 0 &&
                         affaire.provision_recue;
    const prepStarted = affaire.date_ordonnance;
    status.preparation = prepComplete ? 'completed' : (prepStarted ? 'in-progress' : 'pending');

    // Phase Opérations
    const r1 = affaire.reunions?.find(r => r.numero === 1);
    const opsComplete = r1?.compte_rendu;
    const opsStarted = r1?.convocations_envoyees || affaire.reunions?.length > 0;
    status.operations = opsComplete ? 'completed' :
                       (status.preparation === 'completed' && opsStarted ? 'in-progress' : 'pending');

    // Phase Échanges
    const diresTotal = affaire.dires?.length || 0;
    const diresTraites = affaire.dires?.filter(d => d.reponse).length || 0;
    status.echanges = diresTotal > 0 && diresTraites === diresTotal ? 'completed' :
                     (diresTotal > 0 ? 'in-progress' : 'skipped');

    // Phase Rédaction
    const hasNoteSynthese = affaire.note_synthese || affaire.documents?.some(d => d.type === 'note-synthese');
    const hasRapportFinal = affaire.rapport_final_verrouille || affaire.documents?.some(d => d.type === 'rapport-final');
    status.redaction = hasRapportFinal ? 'completed' :
                      (hasNoteSynthese || status.operations === 'completed' ? 'in-progress' : 'pending');

    // Phase Clôture
    status.cloture = affaire.taxation_demandee ? 'completed' :
                    (status.redaction === 'completed' ? 'in-progress' : 'pending');

    return status;
  }, [affaire]);

  // Calculer la progression globale
  const progression = useMemo(() => {
    const weights = { preparation: 20, operations: 35, echanges: 10, redaction: 25, cloture: 10 };
    let total = 0;

    Object.entries(phasesStatus).forEach(([phase, status]) => {
      if (status === 'completed') total += weights[phase];
      else if (status === 'in-progress') total += weights[phase] * 0.5;
    });

    return Math.round(total);
  }, [phasesStatus]);

  // Déterminer la prochaine action recommandée
  const nextAction = useMemo(() => {
    if (!affaire) return null;

    // Phase Préparation
    if (!affaire.reponse_juge && affaire.date_ordonnance) {
      return ACTIONS_CONFIG['accepter-mission'];
    }
    if (!affaire.parties?.length) {
      return ACTIONS_CONFIG['saisir-parties'];
    }
    if (!affaire.provision_recue) {
      return ACTIONS_CONFIG['verifier-provision'];
    }

    // Phase Opérations
    const r1 = affaire.reunions?.find(r => r.numero === 1);
    if (!r1) {
      return ACTIONS_CONFIG['planifier-r1'];
    }
    if (!r1.convocations_envoyees) {
      return ACTIONS_CONFIG['envoyer-convocations'];
    }
    if (r1.statut !== 'terminee') {
      return null; // Attendre la réunion
    }
    if (!r1.compte_rendu) {
      return ACTIONS_CONFIG['rediger-cr'];
    }
    if (!affaire.pathologies?.length) {
      return ACTIONS_CONFIG['saisir-desordres'];
    }

    // Phase Échanges
    const diresNonTraites = affaire.dires?.filter(d => !d.reponse) || [];
    if (diresNonTraites.length > 0) {
      return ACTIONS_CONFIG['traiter-dires'];
    }

    // Phase Rédaction
    const hasNoteSynthese = affaire.note_synthese || affaire.documents?.some(d => d.type === 'note-synthese');
    if (!hasNoteSynthese) {
      return ACTIONS_CONFIG['rediger-synthese'];
    }
    const hasRapportFinal = affaire.rapport_final_verrouille;
    if (!hasRapportFinal) {
      return ACTIONS_CONFIG['finaliser-rapport'];
    }

    // Phase Clôture
    if (!affaire.taxation_demandee) {
      return ACTIONS_CONFIG['demander-taxation'];
    }

    return ACTIONS_CONFIG['mission-complete'];
  }, [affaire]);

  // Calculer les alertes
  const alertes = useMemo(() => {
    const result = [];

    if (!affaire) return result;

    // Délai réponse juge (15 jours)
    if (!affaire.reponse_juge && affaire.date_ordonnance) {
      const dateOrd = new Date(affaire.date_ordonnance);
      const limite = new Date(dateOrd);
      limite.setDate(limite.getDate() + 15);
      const joursRestants = Math.ceil((limite - new Date()) / (1000 * 60 * 60 * 24));
      if (joursRestants <= 5) {
        result.push({
          type: 'error',
          message: joursRestants <= 0 ? 'Délai réponse dépassé !' : `Répondre au juge (J-${joursRestants})`
        });
      }
    }

    // Échéance mission
    if (affaire.date_echeance) {
      const echeance = new Date(affaire.date_echeance);
      const joursRestants = Math.ceil((echeance - new Date()) / (1000 * 60 * 60 * 24));
      if (joursRestants <= 30) {
        result.push({
          type: joursRestants <= 7 ? 'error' : 'warning',
          message: joursRestants <= 0 ? 'Échéance dépassée !' : `Échéance dans ${joursRestants} jours`
        });
      }
    }

    // Provision non reçue
    if (!affaire.provision_recue && affaire.provision_montant) {
      result.push({
        type: 'warning',
        message: 'Provision en attente'
      });
    }

    // Dires non traités
    const diresNonTraites = affaire.dires?.filter(d => !d.reponse).length || 0;
    if (diresNonTraites > 0) {
      result.push({
        type: 'info',
        message: `${diresNonTraites} dire${diresNonTraites > 1 ? 's' : ''} à traiter`
      });
    }

    return result;
  }, [affaire]);

  // Calculer les KPIs
  const kpis = useMemo(() => {
    if (!affaire) return [];

    const result = [];

    // Échéance
    if (affaire.date_echeance) {
      const echeance = new Date(affaire.date_echeance);
      const joursRestants = Math.ceil((echeance - new Date()) / (1000 * 60 * 60 * 24));
      result.push({
        icon: Clock,
        label: 'Échéance',
        value: joursRestants > 0 ? `J-${joursRestants}` : 'Dépassée',
        variant: joursRestants <= 7 ? 'error' : joursRestants <= 30 ? 'warning' : 'default'
      });
    }

    // Provision
    if (affaire.provision_montant) {
      result.push({
        icon: Euro,
        label: 'Provision',
        value: `${parseFloat(affaire.provision_montant).toLocaleString('fr-FR')} €`,
        variant: affaire.provision_recue ? 'success' : 'warning'
      });
    }

    // Parties
    result.push({
      icon: Users,
      label: 'Parties',
      value: affaire.parties?.length || 0,
      variant: (affaire.parties?.length || 0) > 0 ? 'default' : 'warning'
    });

    // Réunions
    result.push({
      icon: Calendar,
      label: 'Réunions',
      value: affaire.reunions?.length || 0,
      variant: 'default'
    });

    return result;
  }, [affaire]);

  // Handlers
  const handleActionClick = () => {
    if (!nextAction) return;

    if (nextAction.tab) {
      onNavigate && onNavigate({ tab: nextAction.tab });
    } else if (nextAction.action) {
      onAction && onAction(nextAction.action);
    }
  };

  const handlePhaseClick = (phase) => {
    // Naviguer vers l'onglet correspondant
    const tabMapping = {
      preparation: 'dossier',
      operations: 'operations',
      echanges: 'echanges',
      redaction: 'production',
      cloture: 'finances'
    };
    onNavigate && onNavigate({ tab: tabMapping[phase.id] });
  };

  if (!affaire) return null;

  const ActionIcon = nextAction?.icon || Target;

  return (
    <div className="space-y-4">
      {/* Alertes urgentes */}
      {alertes.filter(a => a.type === 'error').length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            {alertes.filter(a => a.type === 'error').map((alerte, idx) => (
              <p key={idx} className="text-sm font-medium text-red-700">{alerte.message}</p>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard principal */}
      <Card className="p-0 overflow-hidden">
        {/* Header avec action recommandée */}
        <div className="p-5 bg-gradient-to-r from-[#EFF6FF] to-white border-b border-[#e5e5e5]">
          <div className="flex items-center justify-between gap-6">
            {/* Action recommandée */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                  Prochaine étape
                </span>
              </div>

              {nextAction && nextAction.priority !== 'none' ? (
                <button
                  onClick={handleActionClick}
                  className="group flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-[#2563EB] hover:bg-[#fef9e7] transition-all w-full text-left"
                >
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
                    ${nextAction.priority === 'high' ? 'bg-[#2563EB] text-white' : 'bg-[#fef9e7] text-[#2563EB]'}
                  `}>
                    <ActionIcon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1a1a1a] text-lg">{nextAction.label}</h3>
                    <p className="text-sm text-[#737373]">{nextAction.description}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-[#2563EB] group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border-2 border-green-200">
                  <div className="w-14 h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-700 text-lg">Mission terminée</h3>
                    <p className="text-sm text-green-600">Toutes les étapes ont été complétées</p>
                  </div>
                </div>
              )}
            </div>

            {/* Progression circulaire */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40" cy="40" r="36"
                    fill="none"
                    stroke="#e5e5e5"
                    strokeWidth="6"
                  />
                  <circle
                    cx="40" cy="40" r="36"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${progression * 2.26} 226`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#1a1a1a]">{progression}%</span>
                </div>
              </div>
              <span className="text-xs text-[#737373] font-medium">Avancement</span>
            </div>
          </div>
        </div>

        {/* Phases de la mission */}
        <div className="p-5 border-b border-[#e5e5e5]">
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
            {PHASES.map((phase, index) => (
              <React.Fragment key={phase.id}>
                <PhaseIndicator
                  phase={phase}
                  status={phasesStatus[phase.id]}
                  isActive={phasesStatus[phase.id] === 'in-progress'}
                  onClick={() => handlePhaseClick(phase)}
                />
                {index < PHASES.length - 1 && (
                  <div className={`
                    flex-1 h-1 min-w-[20px] max-w-[60px] rounded-full
                    ${phasesStatus[phase.id] === 'completed' ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="p-4 bg-[#fafafa]">
          <div className="flex items-center gap-3 overflow-x-auto">
            {kpis.map((kpi, idx) => (
              <KpiCard key={idx} {...kpi} />
            ))}

            {/* Alertes non critiques */}
            {alertes.filter(a => a.type !== 'error').map((alerte, idx) => (
              <div
                key={`alert-${idx}`}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap
                  ${alerte.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}
                `}
              >
                <AlertTriangle className="w-4 h-4" />
                {alerte.message}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardAffaire;
