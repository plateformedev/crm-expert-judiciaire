// ============================================================================
// CRM EXPERT JUDICIAIRE - WORKFLOW TUNNEL HORIZONTAL
// Design Google avec panneau contextuel et outils intégrés
// ============================================================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileInput, Send, ClipboardList, Banknote, CalendarPlus, Users,
  FileText, MessageSquare, CalendarRange, FileSearch, FileCheck, Receipt,
  Check, Clock, AlertTriangle, ChevronRight, ChevronDown, Play, X,
  Camera, Mic, BookOpen, Calculator, Target, Shield, MapPin, Phone,
  FileEdit, Download, Printer, Mail, CheckCircle, Circle
} from 'lucide-react';
import { Card, Badge, Button, ProgressBar } from '../ui';
import { ETAPES_TUNNEL } from '../../data';

// Map des icônes
const ICONS = {
  FileInput, Send, ClipboardList, Banknote, CalendarPlus, Users,
  FileText, MessageSquare, CalendarRange, FileSearch, FileCheck, Receipt
};

// ============================================================================
// OUTILS CONTEXTUELS PAR ÉTAPE
// ============================================================================

const OUTILS_PAR_ETAPE = {
  'reunion-r1': [
    { id: 'photos', label: 'Photos', icon: Camera, color: 'blue', path: '/photos' },
    { id: 'dictee', label: 'Dictée', icon: Mic, color: 'purple', path: '/outils/dictee' },
    { id: 'dtu', label: 'DTU', icon: BookOpen, color: 'green', path: '/excellence/dtu' },
    { id: 'qualification', label: 'Qualifier', icon: Target, color: 'amber', path: '/excellence/qualification' },
    { id: 'chrono', label: 'Chrono', icon: Clock, color: 'red', path: '/outils/chronometre' },
    { id: 'calcul', label: 'Calculs', icon: Calculator, color: 'indigo', path: '/outils/calculatrice' },
  ],
  'reunions-supplementaires': [
    { id: 'photos', label: 'Photos', icon: Camera, color: 'blue', path: '/photos' },
    { id: 'dictee', label: 'Dictée', icon: Mic, color: 'purple', path: '/outils/dictee' },
    { id: 'dtu', label: 'DTU', icon: BookOpen, color: 'green', path: '/excellence/dtu' },
    { id: 'qualification', label: 'Qualifier', icon: Target, color: 'amber', path: '/excellence/qualification' },
  ],
  'note-synthese': [
    { id: 'rapport', label: 'Rédiger', icon: FileEdit, color: 'blue', path: '/rapport' },
    { id: 'jurisprudence', label: 'Jurisprudence', icon: Shield, color: 'purple', path: '/excellence/jurisprudence' },
    { id: 'imputabilite', label: 'Imputabilité', icon: Target, color: 'amber', path: '/imputabilite' },
  ],
  'rapport-final': [
    { id: 'rapport', label: 'Finaliser', icon: FileCheck, color: 'green', path: '/rapport' },
    { id: 'opalexe', label: 'OPALEXE', icon: Download, color: 'blue', path: '/excellence/opalexe' },
    { id: 'print', label: 'Imprimer', icon: Printer, color: 'gray', action: 'print' },
  ],
  'convocation-r1': [
    { id: 'mail', label: 'Email', icon: Mail, color: 'blue', action: 'mail' },
    { id: 'print', label: 'Imprimer', icon: Printer, color: 'gray', action: 'print' },
    { id: 'parties', label: 'Parties', icon: Users, color: 'purple', tab: 'parties' },
  ],
};

// ============================================================================
// COMPOSANT: Étape horizontale compacte
// ============================================================================

const EtapeHorizontale = ({ etape, status, isSelected, onClick, isFirst, isLast }) => {
  const Icon = ICONS[etape.icon] || FileText;

  const getStatusStyle = () => {
    if (status === 'completed') return { bg: 'bg-[#34a853]', ring: 'ring-[#34a853]', text: 'text-white' };
    if (status === 'in-progress') return { bg: 'bg-[#c9a227]', ring: 'ring-[#c9a227]', text: 'text-white' };
    if (status === 'skipped') return { bg: 'bg-[#dadce0]', ring: 'ring-[#dadce0]', text: 'text-[#5f6368]' };
    return { bg: 'bg-white', ring: 'ring-[#dadce0]', text: 'text-[#9aa0a6]' };
  };

  const style = getStatusStyle();

  return (
    <div className="flex items-center">
      {/* Connecteur gauche */}
      {!isFirst && (
        <div className={`w-6 h-0.5 ${status === 'completed' ? 'bg-[#34a853]' : status === 'in-progress' ? 'bg-[#c9a227]' : 'bg-[#dadce0]'}`} />
      )}

      {/* Étape */}
      <button
        onClick={onClick}
        className={`
          relative flex flex-col items-center p-2 rounded-2xl transition-all duration-200
          ${isSelected ? 'bg-[#fef9e7] ring-2 ring-[#c9a227]' : 'hover:bg-[#f1f3f4]'}
        `}
        title={`${etape.label}\n${etape.description}`}
      >
        {/* Icône / Check */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center ring-2 transition-all
          ${style.bg} ${style.ring} ${style.text}
          ${status === 'in-progress' ? 'animate-pulse' : ''}
        `}>
          {status === 'completed' ? (
            <Check className="w-5 h-5" />
          ) : (
            <span className="text-sm font-medium">{etape.numero}</span>
          )}
        </div>

        {/* Label */}
        <span className={`
          mt-1 text-[10px] font-medium max-w-[60px] text-center leading-tight truncate
          ${status === 'completed' ? 'text-[#34a853]' :
            status === 'in-progress' ? 'text-[#c9a227]' :
            'text-[#5f6368]'}
        `}>
          {etape.label.split(' ')[0]}
        </span>

        {/* Indicateur optionnel */}
        {!etape.obligatoire && status !== 'completed' && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#dadce0] rounded-full" title="Optionnel" />
        )}
      </button>

      {/* Connecteur droit */}
      {!isLast && (
        <div className={`w-6 h-0.5 ${status === 'completed' ? 'bg-[#34a853]' : 'bg-[#dadce0]'}`} />
      )}
    </div>
  );
};

// ============================================================================
// COMPOSANT: Panneau contextuel d'étape
// ============================================================================

const PanneauContextuel = ({ etape, affaire, onClose, onNavigate }) => {
  const navigate = useNavigate();
  const outils = OUTILS_PAR_ETAPE[etape.id] || [];

  const handleOutilClick = (outil) => {
    if (outil.path) {
      if (outil.path.startsWith('/')) {
        // Navigation relative à l'affaire ou absolue
        if (outil.path === '/photos' || outil.path === '/rapport' || outil.path === '/imputabilite') {
          navigate(`/affaires/${affaire.id}${outil.path}`);
        } else {
          navigate(outil.path);
        }
      }
    } else if (outil.tab) {
      onNavigate && onNavigate({ tab: outil.tab });
    } else if (outil.action) {
      // Actions spéciales
      console.log('Action:', outil.action);
    }
    onClose();
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-[#e8f0fe] text-[#1967d2] hover:bg-[#d2e3fc]',
      green: 'bg-[#e6f4ea] text-[#1e8e3e] hover:bg-[#ceead6]',
      amber: 'bg-[#fef7e0] text-[#f29900] hover:bg-[#feefc3]',
      purple: 'bg-[#f3e8fd] text-[#8430ce] hover:bg-[#e9d5fc]',
      red: 'bg-[#fce8e6] text-[#d93025] hover:bg-[#f8d7d2]',
      indigo: 'bg-[#e8eaf6] text-[#3f51b5] hover:bg-[#c5cae9]',
      gray: 'bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]',
    };
    return colors[color] || colors.gray;
  };

  return (
    <Card className="p-4 mt-4 bg-white border border-[#dadce0]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#c9a227] bg-[#fef9e7] px-2 py-0.5 rounded-full">
              Étape {etape.numero}
            </span>
            {!etape.obligatoire && (
              <span className="text-xs text-[#9aa0a6]">(optionnel)</span>
            )}
          </div>
          <h3 className="text-lg font-medium text-[#202124] mt-1">{etape.label}</h3>
          <p className="text-sm text-[#5f6368]">{etape.description}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[#f1f3f4] rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-[#5f6368]" />
        </button>
      </div>

      {/* Outils rapides */}
      {outils.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-3">
            Outils rapides
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {outils.map(outil => {
              const Icon = outil.icon;
              return (
                <button
                  key={outil.id}
                  onClick={() => handleOutilClick(outil)}
                  className={`
                    flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all
                    ${getColorClasses(outil.color)}
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{outil.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Checklist rapide pour les réunions */}
      {(etape.id === 'reunion-r1' || etape.id === 'reunions-supplementaires') && (
        <div className="mt-4 pt-4 border-t border-[#e8eaed]">
          <p className="text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-3">
            Checklist réunion
          </p>
          <div className="space-y-2">
            {[
              'Vérifier présence des parties',
              'Prendre photos générales',
              'Identifier et qualifier les désordres',
              'Effectuer les mesures',
              'Poser questions aux parties'
            ].map((item, idx) => (
              <label key={idx} className="flex items-center gap-3 text-sm text-[#3c4043] cursor-pointer hover:bg-[#f1f3f4] p-2 rounded-lg -mx-2">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#c9a227]" />
                {item}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Délai légal */}
      {etape.delaiJours && (
        <div className="mt-4 pt-4 border-t border-[#e8eaed]">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-[#5f6368]" />
            <span className="text-[#5f6368]">Délai recommandé:</span>
            <span className="font-medium text-[#202124]">{etape.delaiJours} jours</span>
          </div>
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Tunnel complet horizontal
// ============================================================================

export const WorkflowTunnel = ({ affaire, onEtapeClick, onNavigate }) => {
  const [selectedEtape, setSelectedEtape] = useState(null);

  // Calculer le statut de chaque étape
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
      status['dires'] = 'skipped';
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

  const handleEtapeClick = (etape) => {
    if (selectedEtape?.id === etape.id) {
      setSelectedEtape(null);
    } else {
      setSelectedEtape(etape);
    }
    onEtapeClick && onEtapeClick(etape);
  };

  return (
    <Card className="p-5">
      {/* Header compact */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-medium text-[#202124]">Avancement</h3>
          {etapeEnCours && (
            <Badge variant="gold">{etapeEnCours.label}</Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-light text-[#c9a227]">{progression}%</span>
        </div>
      </div>

      {/* Barre de progression */}
      <ProgressBar value={progression} color="gold" size="sm" showLabel={false} />

      {/* Tunnel horizontal scrollable */}
      <div className="mt-5 overflow-x-auto pb-2">
        <div className="flex items-center min-w-max">
          {ETAPES_TUNNEL.map((etape, index) => (
            <EtapeHorizontale
              key={etape.id}
              etape={etape}
              status={etapesStatus[etape.id]}
              isSelected={selectedEtape?.id === etape.id}
              onClick={() => handleEtapeClick(etape)}
              isFirst={index === 0}
              isLast={index === ETAPES_TUNNEL.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Panneau contextuel */}
      {selectedEtape && (
        <PanneauContextuel
          etape={selectedEtape}
          affaire={affaire}
          onClose={() => setSelectedEtape(null)}
          onNavigate={onNavigate}
        />
      )}
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Mini tunnel pour header (inchangé mais avec style Google)
// ============================================================================

export const MiniWorkflowTunnel = ({ affaire, onEtapeClick }) => {
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

        return (
          <React.Fragment key={etape.id}>
            <button
              onClick={() => onEtapeClick && onEtapeClick(etape)}
              className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
                ${status === 'completed' ? 'bg-[#34a853] text-white' :
                  status === 'in-progress' ? 'bg-[#c9a227] text-white animate-pulse' :
                  'bg-[#f1f3f4] text-[#9aa0a6]'}
              `}
              title={etape.label}
            >
              {status === 'completed' ? (
                <Check className="w-4 h-4" />
              ) : (
                etape.numero
              )}
            </button>
            {index < 6 && (
              <div className={`w-3 h-0.5 ${status === 'completed' ? 'bg-[#34a853]' : 'bg-[#dadce0]'}`} />
            )}
          </React.Fragment>
        );
      })}
      <span className="text-xs text-[#9aa0a6] ml-1 whitespace-nowrap">+5</span>
    </div>
  );
};
