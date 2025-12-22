// ============================================================================
// CRM EXPERT JUDICIAIRE - SYSTÈME D'ALERTES DÉLAIS LÉGAUX
// ============================================================================
// Calcule et affiche les alertes pour les délais légaux de l'expertise
// Art. 267 CPC: 8j réponse juge | Art. 160 CPC: 8j convocation | Art. 276 CPC: 1 mois dires

import React, { useMemo } from 'react';
import {
  AlertTriangle, Bell, Clock, Calendar, CheckCircle,
  Send, Users, FileText, MessageSquare, Banknote,
  AlertCircle, ArrowRight
} from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { formatDateFr, calculerDelaiRestant } from '../../utils/helpers';

// ============================================================================
// CALCUL DES ALERTES
// ============================================================================

const calculerAlertes = (affaire) => {
  const alertes = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. RÉPONSE AU JUGE (8 jours - Art. 267 CPC)
  if (affaire.date_ordonnance && !affaire.reponse_juge) {
    const dateOrdonnance = new Date(affaire.date_ordonnance);
    const dateLimite = new Date(dateOrdonnance);
    dateLimite.setDate(dateLimite.getDate() + 8);
    const joursRestants = Math.ceil((dateLimite - today) / (1000 * 60 * 60 * 24));

    alertes.push({
      id: 'reponse-juge',
      type: joursRestants <= 0 ? 'critique' : joursRestants <= 3 ? 'urgent' : 'info',
      titre: 'Réponse au juge',
      description: `Accepter ou refuser la mission (Art. 267 CPC)`,
      dateLimite: dateLimite,
      joursRestants,
      action: 'reponse-juge',
      actionLabel: 'Répondre',
      icon: Send
    });
  }

  // 2. PROVISION NON REÇUE
  if (!affaire.provision_recue && affaire.reponse_juge === 'acceptee') {
    const dateReponse = affaire.date_reponse_juge ? new Date(affaire.date_reponse_juge) : new Date(affaire.date_ordonnance);
    const joursAttente = Math.ceil((today - dateReponse) / (1000 * 60 * 60 * 24));

    if (joursAttente > 15) {
      alertes.push({
        id: 'provision',
        type: joursAttente > 30 ? 'urgent' : 'warning',
        titre: 'Provision en attente',
        description: `Consignation non reçue depuis ${joursAttente} jours`,
        joursRestants: null,
        action: 'relance-provision',
        actionLabel: 'Relancer',
        icon: Banknote
      });
    }
  }

  // 3. CONVOCATION À ENVOYER (8 jours avant réunion - Art. 160 CPC)
  const reunions = affaire.reunions || [];
  reunions.forEach(reunion => {
    if (reunion.date_reunion && !reunion.convocations_envoyees) {
      const dateReunion = new Date(reunion.date_reunion);
      const dateLimiteConvoc = new Date(dateReunion);
      dateLimiteConvoc.setDate(dateLimiteConvoc.getDate() - 8);
      const joursRestants = Math.ceil((dateLimiteConvoc - today) / (1000 * 60 * 60 * 24));

      if (joursRestants <= 10) {
        alertes.push({
          id: `convocation-r${reunion.numero}`,
          type: joursRestants <= 0 ? 'critique' : joursRestants <= 3 ? 'urgent' : 'warning',
          titre: `Convocation R${reunion.numero}`,
          description: `Envoyer avant le ${formatDateFr(dateLimiteConvoc)} (8j min avant réunion)`,
          dateLimite: dateLimiteConvoc,
          joursRestants,
          action: 'convocation',
          actionLabel: 'Convoquer',
          actionData: { reunionId: reunion.id, numero: reunion.numero },
          icon: Users
        });
      }
    }
  });

  // 4. COMPTE-RENDU À RÉDIGER (après réunion terminée)
  reunions.forEach(reunion => {
    if (reunion.statut === 'terminee' && !reunion.compte_rendu_envoye) {
      const dateReunion = new Date(reunion.date_reunion);
      const joursDepuis = Math.ceil((today - dateReunion) / (1000 * 60 * 60 * 24));

      if (joursDepuis >= 1) {
        alertes.push({
          id: `compte-rendu-r${reunion.numero}`,
          type: joursDepuis > 15 ? 'urgent' : joursDepuis > 7 ? 'warning' : 'info',
          titre: `Compte-rendu R${reunion.numero}`,
          description: `Réunion terminée il y a ${joursDepuis} jour${joursDepuis > 1 ? 's' : ''}`,
          joursRestants: null,
          action: 'compte-rendu',
          actionLabel: 'Rédiger',
          actionData: { reunionId: reunion.id, numero: reunion.numero },
          icon: FileText
        });
      }
    }
  });

  // 5. DIRES EN ATTENTE DE RÉPONSE
  const dires = affaire.dires || [];
  dires.forEach(dire => {
    if (dire.statut === 'recu' || dire.statut === 'en-analyse') {
      const dateReception = new Date(dire.date_reception);
      const dateLimite = dire.date_limite_reponse ? new Date(dire.date_limite_reponse) : null;

      if (dateLimite) {
        const joursRestants = Math.ceil((dateLimite - today) / (1000 * 60 * 60 * 24));

        alertes.push({
          id: `dire-${dire.id}`,
          type: joursRestants <= 0 ? 'critique' : joursRestants <= 7 ? 'urgent' : 'warning',
          titre: `Dire de ${dire.partie_nom || 'partie'}`,
          description: joursRestants <= 0
            ? 'Délai expiré !'
            : `Répondre avant le ${formatDateFr(dateLimite)}`,
          dateLimite,
          joursRestants,
          action: 'repondre-dire',
          actionLabel: 'Répondre',
          actionData: { direId: dire.id },
          icon: MessageSquare
        });
      }
    }
  });

  // 6. DÉLAI MISSION (échéance fixée par le juge)
  if (affaire.date_echeance) {
    const dateEcheance = new Date(affaire.date_echeance);
    const joursRestants = Math.ceil((dateEcheance - today) / (1000 * 60 * 60 * 24));

    if (joursRestants <= 30) {
      alertes.push({
        id: 'echeance-mission',
        type: joursRestants <= 0 ? 'critique' : joursRestants <= 15 ? 'urgent' : 'warning',
        titre: 'Échéance mission',
        description: joursRestants <= 0
          ? 'Délai dépassé ! Demander prorogation'
          : `${joursRestants} jour${joursRestants > 1 ? 's' : ''} restant${joursRestants > 1 ? 's' : ''}`,
        dateLimite: dateEcheance,
        joursRestants,
        action: 'prorogation',
        actionLabel: joursRestants <= 0 ? 'Prorogation' : 'Voir',
        icon: Calendar
      });
    }
  }

  // 7. PÉRIODE ESTIVALE (15 juillet - 15 septembre)
  const mois = today.getMonth(); // 0-11
  const jour = today.getDate();
  if ((mois === 6 && jour >= 1) || mois === 7 || (mois === 8 && jour <= 20)) {
    // On approche ou on est dans la période estivale
    const debutEstival = new Date(today.getFullYear(), 6, 15); // 15 juillet
    const finEstival = new Date(today.getFullYear(), 8, 15); // 15 septembre

    if (today >= debutEstival && today <= finEstival) {
      alertes.push({
        id: 'periode-estivale',
        type: 'info',
        titre: 'Période estivale',
        description: 'Aucun délai ne doit expirer entre le 15/07 et le 15/09',
        joursRestants: null,
        action: null,
        icon: Calendar
      });
    }
  }

  // Trier par priorité (critique > urgent > warning > info)
  const priorite = { critique: 0, urgent: 1, warning: 2, info: 3 };
  alertes.sort((a, b) => priorite[a.type] - priorite[b.type]);

  return alertes;
};

// ============================================================================
// COMPOSANT CARTE ALERTE
// ============================================================================

const AlerteCard = ({ alerte, onAction }) => {
  const Icon = alerte.icon;

  const getStyles = () => {
    switch (alerte.type) {
      case 'critique':
        return {
          bg: 'bg-red-50 border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          badge: 'error'
        };
      case 'urgent':
        return {
          bg: 'bg-amber-50 border-amber-200',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          badge: 'warning'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50 border-orange-200',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          badge: 'warning'
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          badge: 'info'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`p-4 rounded-xl border ${styles.bg} flex items-center gap-4`}>
      {/* Icône */}
      <div className={`w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${styles.iconColor}`} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-[#1a1a1a]">{alerte.titre}</span>
          {alerte.joursRestants !== null && (
            <Badge variant={styles.badge} size="sm">
              {alerte.joursRestants <= 0
                ? 'Dépassé'
                : `J-${alerte.joursRestants}`
              }
            </Badge>
          )}
        </div>
        <p className="text-sm text-[#737373]">{alerte.description}</p>
      </div>

      {/* Action */}
      {alerte.action && onAction && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAction(alerte.action, alerte.actionData)}
          className="flex-shrink-0"
        >
          {alerte.actionLabel}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const AlertesDelais = ({ affaire, onAction, compact = false }) => {
  const alertes = useMemo(() => calculerAlertes(affaire), [affaire]);

  // Si aucune alerte, afficher un message positif
  if (alertes.length === 0) {
    return (
      <Card className="p-4 bg-green-50 border border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-800">Aucune alerte</p>
            <p className="text-sm text-green-600">Tous les délais sont respectés</p>
          </div>
        </div>
      </Card>
    );
  }

  // Mode compact : seulement les alertes critiques et urgentes
  const alertesAffichees = compact
    ? alertes.filter(a => a.type === 'critique' || a.type === 'urgent')
    : alertes;

  if (compact && alertesAffichees.length === 0) {
    return null;
  }

  // Compteurs par type
  const compteurs = {
    critique: alertes.filter(a => a.type === 'critique').length,
    urgent: alertes.filter(a => a.type === 'urgent').length,
    warning: alertes.filter(a => a.type === 'warning').length,
    info: alertes.filter(a => a.type === 'info').length
  };

  return (
    <Card className="overflow-hidden">
      {/* En-tête */}
      <div className="p-4 bg-[#f7f7f7] border-b border-[#e5e5e5] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#c9a227] flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1a1a1a]">Alertes & Délais</h3>
            <p className="text-sm text-[#737373]">
              {alertes.length} alerte{alertes.length > 1 ? 's' : ''} active{alertes.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Badges compteurs */}
        <div className="flex items-center gap-2">
          {compteurs.critique > 0 && (
            <Badge variant="error">{compteurs.critique} critique{compteurs.critique > 1 ? 's' : ''}</Badge>
          )}
          {compteurs.urgent > 0 && (
            <Badge variant="warning">{compteurs.urgent} urgent{compteurs.urgent > 1 ? 's' : ''}</Badge>
          )}
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="p-4 space-y-3">
        {alertesAffichees.map(alerte => (
          <AlerteCard
            key={alerte.id}
            alerte={alerte}
            onAction={onAction}
          />
        ))}

        {/* Lien voir plus si mode compact */}
        {compact && alertes.length > alertesAffichees.length && (
          <button
            onClick={() => onAction && onAction('voir-toutes-alertes')}
            className="w-full py-2 text-sm text-[#0381fe] hover:text-[#0066cc] font-medium"
          >
            Voir toutes les alertes ({alertes.length})
          </button>
        )}
      </div>
    </Card>
  );
};

export default AlertesDelais;
