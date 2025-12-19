// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE ALERTES INTELLIGENTES
// Calcul automatique de tous les délais légaux et métier
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell, AlertTriangle, Clock, Calendar, Scale, FileText,
  CheckCircle, XCircle, ChevronRight, Filter, RefreshCw,
  Mail, Gavel, Shield, Euro, Users, Eye, Trash2,
  AlertCircle, Timer, CalendarClock, BellRing, Settings
} from 'lucide-react';
import { Card, Badge, Button, ProgressBar, EmptyState } from '../ui';
import { formatDateFr, joursEntre } from '../../utils/helpers';

// ============================================================================
// CONFIGURATION DES DÉLAIS LÉGAUX
// ============================================================================

export const DELAIS_LEGAUX = {
  // Délais CPC
  convocation: {
    code: 'CONV',
    label: 'Convocation parties',
    delaiJours: 8,
    reference: 'Art. 160 CPC',
    description: 'Délai minimum entre convocation et réunion',
    type: 'pre-evenement',
    criticite: 'haute',
    consequence: 'Nullité de la réunion si non respecté'
  },
  observationsPreRapport: {
    code: 'OBS_PR',
    label: 'Observations pré-rapport',
    delaiJours: 30,
    reference: 'Art. 276 CPC',
    description: 'Délai pour observations des parties sur note de synthèse',
    type: 'post-evenement',
    criticite: 'haute',
    consequence: 'Vice de procédure'
  },
  reponsesDires: {
    code: 'REP_DIRE',
    label: 'Réponse aux dires',
    delaiJours: 21,
    reference: 'Art. 276 CPC',
    description: 'Délai raisonnable pour répondre aux dires',
    type: 'post-evenement',
    criticite: 'moyenne',
    consequence: 'Retard procédure'
  },
  depotRapport: {
    code: 'DEPOT',
    label: 'Dépôt rapport final',
    delaiJours: null, // Fixé par ordonnance
    reference: 'Ordonnance',
    description: 'Date limite de dépôt du rapport',
    type: 'echeance',
    criticite: 'critique',
    consequence: 'Dessaisissement possible'
  },
  
  // Délais garanties construction
  gpa: {
    code: 'GPA',
    label: 'Garantie Parfait Achèvement',
    delaiJours: 365,
    reference: 'Art. 1792-6 CC',
    description: '1 an à compter de la réception',
    type: 'garantie',
    criticite: 'haute',
    consequence: 'Prescription de l\'action'
  },
  biennale: {
    code: 'GB',
    label: 'Garantie Biennale',
    delaiJours: 730,
    reference: 'Art. 1792-3 CC',
    description: '2 ans à compter de la réception',
    type: 'garantie',
    criticite: 'haute',
    consequence: 'Prescription de l\'action'
  },
  decennale: {
    code: 'GD',
    label: 'Garantie Décennale',
    delaiJours: 3650,
    reference: 'Art. 1792 CC',
    description: '10 ans à compter de la réception',
    type: 'garantie',
    criticite: 'moyenne',
    consequence: 'Prescription de l\'action'
  },
  
  // Délais administratifs
  prorogation: {
    code: 'PROROG',
    label: 'Demande prorogation',
    delaiJours: 15,
    reference: 'Usage',
    description: 'Délai avant échéance pour demander prorogation',
    type: 'pre-evenement',
    criticite: 'haute',
    consequence: 'Dessaisissement si échéance dépassée'
  },
  provisionRelance: {
    code: 'PROV',
    label: 'Relance provision',
    delaiJours: 30,
    reference: 'Usage',
    description: 'Délai après consignation pour relancer',
    type: 'post-evenement',
    criticite: 'moyenne',
    consequence: 'Retard mission'
  }
};

// ============================================================================
// MOTEUR DE CALCUL DES ALERTES
// ============================================================================

export const AlertEngine = {
  // Calculer toutes les alertes pour une affaire
  calculerAlertesAffaire(affaire) {
    const alertes = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Échéance mission (si définie)
    if (affaire.date_echeance) {
      const echeance = new Date(affaire.date_echeance);
      const joursRestants = joursEntre(today, echeance);
      
      alertes.push({
        id: `${affaire.id}-echeance`,
        affaireId: affaire.id,
        affaireRef: affaire.reference,
        type: 'echeance',
        code: 'DEPOT',
        titre: 'Échéance mission',
        description: `Dépôt du rapport avant le ${formatDateFr(echeance)}`,
        dateEcheance: echeance,
        joursRestants,
        reference: 'Ordonnance',
        criticite: this.calculerCriticite(joursRestants, 'echeance'),
        statut: joursRestants < 0 ? 'depassee' : joursRestants <= 7 ? 'critique' : 'active',
        actions: joursRestants <= 15 ? ['Demander prorogation', 'Accélérer rédaction'] : []
      });

      // Alerte prorogation si < 15 jours
      if (joursRestants > 0 && joursRestants <= 15) {
        alertes.push({
          id: `${affaire.id}-prorogation`,
          affaireId: affaire.id,
          affaireRef: affaire.reference,
          type: 'action',
          code: 'PROROG',
          titre: 'Demander une prorogation',
          description: 'Échéance proche, envisager demande de prorogation au JCE',
          dateEcheance: echeance,
          joursRestants,
          reference: DELAIS_LEGAUX.prorogation.reference,
          criticite: 'haute',
          statut: 'action_requise',
          actions: ['Rédiger demande prorogation']
        });
      }
    }

    // 2. Garanties construction (si date réception connue)
    if (affaire.date_reception_ouvrage) {
      const dateReception = new Date(affaire.date_reception_ouvrage);
      
      // GPA
      const finGPA = new Date(dateReception);
      finGPA.setFullYear(finGPA.getFullYear() + 1);
      const joursGPA = joursEntre(today, finGPA);
      
      if (joursGPA > -30 && joursGPA < 60) { // Afficher 30j après expiration et 60j avant
        alertes.push({
          id: `${affaire.id}-gpa`,
          affaireId: affaire.id,
          affaireRef: affaire.reference,
          type: 'garantie',
          code: 'GPA',
          titre: 'Garantie Parfait Achèvement',
          description: joursGPA < 0 
            ? `GPA expirée depuis ${Math.abs(joursGPA)} jours` 
            : `GPA expire le ${formatDateFr(finGPA)}`,
          dateEcheance: finGPA,
          joursRestants: joursGPA,
          reference: DELAIS_LEGAUX.gpa.reference,
          criticite: joursGPA < 0 ? 'info' : joursGPA <= 30 ? 'haute' : 'moyenne',
          statut: joursGPA < 0 ? 'expiree' : 'active'
        });
      }

      // Biennale
      const finBiennale = new Date(dateReception);
      finBiennale.setFullYear(finBiennale.getFullYear() + 2);
      const joursBiennale = joursEntre(today, finBiennale);
      
      if (joursBiennale > -30 && joursBiennale < 90) {
        alertes.push({
          id: `${affaire.id}-biennale`,
          affaireId: affaire.id,
          affaireRef: affaire.reference,
          type: 'garantie',
          code: 'GB',
          titre: 'Garantie Biennale',
          description: joursBiennale < 0 
            ? `Biennale expirée depuis ${Math.abs(joursBiennale)} jours` 
            : `Biennale expire le ${formatDateFr(finBiennale)}`,
          dateEcheance: finBiennale,
          joursRestants: joursBiennale,
          reference: DELAIS_LEGAUX.biennale.reference,
          criticite: joursBiennale < 0 ? 'info' : joursBiennale <= 60 ? 'haute' : 'moyenne',
          statut: joursBiennale < 0 ? 'expiree' : 'active'
        });
      }

      // Décennale
      const finDecennale = new Date(dateReception);
      finDecennale.setFullYear(finDecennale.getFullYear() + 10);
      const joursDecennale = joursEntre(today, finDecennale);
      
      if (joursDecennale > -30 && joursDecennale < 180) {
        alertes.push({
          id: `${affaire.id}-decennale`,
          affaireId: affaire.id,
          affaireRef: affaire.reference,
          type: 'garantie',
          code: 'GD',
          titre: 'Garantie Décennale',
          description: joursDecennale < 0 
            ? `Décennale expirée depuis ${Math.abs(joursDecennale)} jours` 
            : `Décennale expire le ${formatDateFr(finDecennale)}`,
          dateEcheance: finDecennale,
          joursRestants: joursDecennale,
          reference: DELAIS_LEGAUX.decennale.reference,
          criticite: joursDecennale < 0 ? 'info' : joursDecennale <= 90 ? 'haute' : 'moyenne',
          statut: joursDecennale < 0 ? 'expiree' : 'active'
        });
      }
    }

    // 3. Provision non reçue
    if (affaire.provision_montant && !affaire.provision_recue) {
      const dateOrdonnance = affaire.date_ordonnance ? new Date(affaire.date_ordonnance) : new Date(affaire.created_at);
      const joursAttente = joursEntre(dateOrdonnance, today);
      
      if (joursAttente >= 30) {
        alertes.push({
          id: `${affaire.id}-provision`,
          affaireId: affaire.id,
          affaireRef: affaire.reference,
          type: 'financier',
          code: 'PROV',
          titre: 'Provision non reçue',
          description: `Provision de ${parseFloat(affaire.provision_montant).toLocaleString('fr-FR')}€ en attente depuis ${joursAttente} jours`,
          joursRestants: -joursAttente,
          reference: 'Suivi financier',
          criticite: joursAttente > 60 ? 'haute' : 'moyenne',
          statut: 'action_requise',
          actions: ['Relancer le greffe', 'Vérifier consignation']
        });
      }
    }

    // 4. Réunions à venir
    if (affaire.reunions) {
      affaire.reunions.forEach(reunion => {
        if (reunion.statut !== 'terminee' && reunion.statut !== 'annulee') {
          const dateReunion = new Date(reunion.date_reunion);
          const joursAvant = joursEntre(today, dateReunion);
          
          // Rappel réunion proche
          if (joursAvant >= 0 && joursAvant <= 7) {
            alertes.push({
              id: `${affaire.id}-reunion-${reunion.id}`,
              affaireId: affaire.id,
              affaireRef: affaire.reference,
              type: 'reunion',
              code: 'REUN',
              titre: `Réunion n°${reunion.numero} dans ${joursAvant} jour(s)`,
              description: `${formatDateFr(dateReunion)} - ${reunion.lieu || 'Lieu à confirmer'}`,
              dateEcheance: dateReunion,
              joursRestants: joursAvant,
              reference: 'Calendrier',
              criticite: joursAvant <= 2 ? 'haute' : 'moyenne',
              statut: 'active',
              actions: joursAvant <= 2 ? ['Préparer documents', 'Vérifier présences'] : []
            });
          }

          // Vérification délai convocation
          if (reunion.date_convocation) {
            const dateConvoc = new Date(reunion.date_convocation);
            const delaiConvoc = joursEntre(dateConvoc, dateReunion);
            
            if (delaiConvoc < 8 && joursAvant >= 0) {
              alertes.push({
                id: `${affaire.id}-convoc-${reunion.id}`,
                affaireId: affaire.id,
                affaireRef: affaire.reference,
                type: 'procedure',
                code: 'CONV',
                titre: 'Délai convocation non respecté',
                description: `Réunion n°${reunion.numero} : ${delaiConvoc} jours entre convocation et réunion (minimum 8j requis)`,
                dateEcheance: dateReunion,
                joursRestants: joursAvant,
                reference: DELAIS_LEGAUX.convocation.reference,
                criticite: 'critique',
                statut: 'alerte',
                actions: ['Reporter la réunion', 'Régulariser convocation']
              });
            }
          }
        }
      });
    }

    // 5. Dires en attente de réponse
    if (affaire.dires) {
      affaire.dires.forEach(dire => {
        if (dire.statut !== 'repondu' && dire.statut !== 'clos') {
          const dateReception = new Date(dire.date_reception);
          const joursAttente = joursEntre(dateReception, today);
          
          if (joursAttente >= 14) {
            alertes.push({
              id: `${affaire.id}-dire-${dire.id}`,
              affaireId: affaire.id,
              affaireRef: affaire.reference,
              type: 'dire',
              code: 'REP_DIRE',
              titre: `Dire n°${dire.numero} en attente`,
              description: `Reçu il y a ${joursAttente} jours - ${dire.objet || 'Sans objet'}`,
              joursRestants: DELAIS_LEGAUX.reponsesDires.delaiJours - joursAttente,
              reference: DELAIS_LEGAUX.reponsesDires.reference,
              criticite: joursAttente > 21 ? 'haute' : 'moyenne',
              statut: 'action_requise',
              actions: ['Rédiger réponse', 'Voir le dire']
            });
          }
        }
      });
    }

    return alertes.sort((a, b) => {
      // Tri par criticité puis par jours restants
      const ordresCriticite = { critique: 0, haute: 1, moyenne: 2, info: 3 };
      const diffCriticite = (ordresCriticite[a.criticite] || 3) - (ordresCriticite[b.criticite] || 3);
      if (diffCriticite !== 0) return diffCriticite;
      return (a.joursRestants || 999) - (b.joursRestants || 999);
    });
  },

  // Calculer la criticité selon les jours restants
  calculerCriticite(joursRestants, type) {
    if (joursRestants < 0) return 'critique';
    
    switch (type) {
      case 'echeance':
        if (joursRestants <= 7) return 'critique';
        if (joursRestants <= 30) return 'haute';
        if (joursRestants <= 60) return 'moyenne';
        return 'basse';
      case 'garantie':
        if (joursRestants <= 30) return 'haute';
        if (joursRestants <= 90) return 'moyenne';
        return 'basse';
      default:
        if (joursRestants <= 3) return 'critique';
        if (joursRestants <= 7) return 'haute';
        if (joursRestants <= 14) return 'moyenne';
        return 'basse';
    }
  },

  // Calculer alertes pour toutes les affaires
  calculerToutesAlertes(affaires) {
    return affaires.flatMap(affaire => this.calculerAlertesAffaire(affaire));
  }
};

// ============================================================================
// COMPOSANT CENTRE D'ALERTES
// ============================================================================

export const CentreAlertes = ({ affaires = [], onAlertClick, onDismiss }) => {
  const [filter, setFilter] = useState('all');
  const [showDismissed, setShowDismissed] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);

  const alertes = useMemo(() => {
    let all = AlertEngine.calculerToutesAlertes(affaires);
    
    if (!showDismissed) {
      all = all.filter(a => !dismissedIds.includes(a.id));
    }
    
    if (filter !== 'all') {
      all = all.filter(a => a.type === filter);
    }
    
    return all;
  }, [affaires, filter, showDismissed, dismissedIds]);

  const stats = useMemo(() => ({
    total: alertes.length,
    critiques: alertes.filter(a => a.criticite === 'critique').length,
    hautes: alertes.filter(a => a.criticite === 'haute').length,
    moyennes: alertes.filter(a => a.criticite === 'moyenne').length
  }), [alertes]);

  const handleDismiss = (alerteId) => {
    setDismissedIds(prev => [...prev, alerteId]);
    onDismiss && onDismiss(alerteId);
  };

  const filters = [
    { id: 'all', label: 'Toutes', icon: Bell },
    { id: 'echeance', label: 'Échéances', icon: Calendar },
    { id: 'garantie', label: 'Garanties', icon: Shield },
    { id: 'procedure', label: 'Procédure', icon: Scale },
    { id: 'dire', label: 'Dires', icon: FileText },
    { id: 'reunion', label: 'Réunions', icon: Users },
    { id: 'financier', label: 'Finances', icon: Euro }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wider">Total alertes</p>
              <p className="text-3xl font-light">{stats.total}</p>
            </div>
            <Bell className="w-8 h-8 text-white/40" />
          </div>
        </Card>
        
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 uppercase tracking-wider">Critiques</p>
              <p className="text-3xl font-light text-red-700">{stats.critiques}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-300" />
          </div>
        </Card>
        
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 uppercase tracking-wider">Hautes</p>
              <p className="text-3xl font-light text-orange-700">{stats.hautes}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-300" />
          </div>
        </Card>
        
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 uppercase tracking-wider">Moyennes</p>
              <p className="text-3xl font-light text-amber-700">{stats.moyennes}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-300" />
          </div>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {filters.map(f => {
            const Icon = f.icon;
            const count = f.id === 'all' ? alertes.length : alertes.filter(a => a.type === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${
                  filter === f.id
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-[#f5f5f5] text-[#525252] hover:bg-[#e5e5e5]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {f.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    filter === f.id ? 'bg-white/20' : 'bg-[#e5e5e5]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        <label className="flex items-center gap-2 text-sm text-[#737373]">
          <input
            type="checkbox"
            checked={showDismissed}
            onChange={(e) => setShowDismissed(e.target.checked)}
            className="rounded"
          />
          Afficher masquées
        </label>
      </div>

      {/* Liste des alertes */}
      {alertes.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Aucune alerte"
          description="Toutes vos échéances sont sous contrôle"
        />
      ) : (
        <div className="space-y-3">
          {alertes.map(alerte => (
            <AlerteCard
              key={alerte.id}
              alerte={alerte}
              onClick={() => onAlertClick && onAlertClick(alerte)}
              onDismiss={() => handleDismiss(alerte.id)}
              dismissed={dismissedIds.includes(alerte.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CARTE ALERTE INDIVIDUELLE
// ============================================================================

const AlerteCard = ({ alerte, onClick, onDismiss, dismissed }) => {
  const criticiteStyles = {
    critique: 'border-l-red-500 bg-red-50',
    haute: 'border-l-orange-500 bg-orange-50',
    moyenne: 'border-l-amber-500 bg-amber-50',
    basse: 'border-l-blue-500 bg-blue-50',
    info: 'border-l-gray-400 bg-gray-50'
  };

  const criticiteIcons = {
    critique: <AlertTriangle className="w-5 h-5 text-red-500" />,
    haute: <AlertCircle className="w-5 h-5 text-orange-500" />,
    moyenne: <Clock className="w-5 h-5 text-amber-500" />,
    basse: <Bell className="w-5 h-5 text-blue-500" />,
    info: <Bell className="w-5 h-5 text-gray-400" />
  };

  const typeIcons = {
    echeance: Calendar,
    garantie: Shield,
    procedure: Scale,
    dire: FileText,
    reunion: Users,
    financier: Euro,
    action: Timer
  };

  const TypeIcon = typeIcons[alerte.type] || Bell;

  return (
    <Card
      className={`p-4 border-l-4 cursor-pointer hover:shadow-md transition-all ${
        criticiteStyles[alerte.criticite]
      } ${dismissed ? 'opacity-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Icône criticité */}
        <div className="flex-shrink-0 mt-1">
          {criticiteIcons[alerte.criticite]}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon className="w-4 h-4 text-[#737373]" />
            <span className="text-xs text-[#a3a3a3] uppercase tracking-wider">{alerte.affaireRef}</span>
            <Badge variant={alerte.criticite === 'critique' ? 'error' : alerte.criticite === 'haute' ? 'warning' : 'default'}>
              {alerte.code}
            </Badge>
          </div>
          
          <h4 className="font-medium text-[#1a1a1a] mb-1">{alerte.titre}</h4>
          <p className="text-sm text-[#737373]">{alerte.description}</p>
          
          {/* Référence légale */}
          <p className="text-xs text-[#a3a3a3] mt-2">{alerte.reference}</p>
          
          {/* Actions suggérées */}
          {alerte.actions && alerte.actions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {alerte.actions.map((action, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); }}
                  className="px-3 py-1 bg-white border border-[#e5e5e5] rounded-full text-xs text-[#525252] hover:border-[#c9a227] hover:text-[#c9a227] transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Délai et actions */}
        <div className="flex-shrink-0 text-right">
          {alerte.joursRestants !== undefined && (
            <div className={`text-lg font-medium ${
              alerte.joursRestants < 0 ? 'text-red-600' :
              alerte.joursRestants <= 7 ? 'text-orange-600' :
              'text-[#1a1a1a]'
            }`}>
              {alerte.joursRestants < 0 
                ? `${Math.abs(alerte.joursRestants)}j dépassé`
                : `${alerte.joursRestants}j`
              }
            </div>
          )}
          {alerte.dateEcheance && (
            <div className="text-xs text-[#a3a3a3]">
              {formatDateFr(alerte.dateEcheance)}
            </div>
          )}
          
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            className="mt-2 p-1 text-[#a3a3a3] hover:text-red-500 transition-colors"
            title="Masquer cette alerte"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// WIDGET ALERTES POUR DASHBOARD
// ============================================================================

export const AlertesWidget = ({ affaires = [], limit = 5, onViewAll }) => {
  const alertes = useMemo(() => {
    return AlertEngine.calculerToutesAlertes(affaires)
      .filter(a => a.criticite === 'critique' || a.criticite === 'haute')
      .slice(0, limit);
  }, [affaires, limit]);

  if (alertes.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-[#1a1a1a]">Aucune alerte critique</h3>
            <p className="text-sm text-[#737373]">Toutes vos échéances sont sous contrôle</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <BellRing className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-[#1a1a1a]">Alertes prioritaires</h3>
            <p className="text-sm text-[#737373]">{alertes.length} action(s) requise(s)</p>
          </div>
        </div>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Voir tout <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {alertes.map(alerte => (
          <div
            key={alerte.id}
            className={`p-3 rounded-xl border-l-4 ${
              alerte.criticite === 'critique' 
                ? 'border-l-red-500 bg-red-50' 
                : 'border-l-orange-500 bg-orange-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#a3a3a3] mb-1">{alerte.affaireRef}</p>
                <p className="font-medium text-sm text-[#1a1a1a]">{alerte.titre}</p>
              </div>
              <Badge variant={alerte.criticite === 'critique' ? 'error' : 'warning'}>
                {alerte.joursRestants < 0 
                  ? `${Math.abs(alerte.joursRestants)}j dépassé`
                  : `${alerte.joursRestants}j`
                }
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ============================================================================
// HOOK POUR LES ALERTES
// ============================================================================

export const useAlertes = (affaires) => {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (affaires && affaires.length > 0) {
      const calculated = AlertEngine.calculerToutesAlertes(affaires);
      setAlertes(calculated);
    }
    setLoading(false);
  }, [affaires]);

  const stats = useMemo(() => ({
    total: alertes.length,
    critiques: alertes.filter(a => a.criticite === 'critique').length,
    hautes: alertes.filter(a => a.criticite === 'haute').length,
    parType: alertes.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {})
  }), [alertes]);

  return { alertes, stats, loading };
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  CentreAlertes,
  AlertesWidget,
  AlertEngine,
  useAlertes,
  DELAIS_LEGAUX
};
