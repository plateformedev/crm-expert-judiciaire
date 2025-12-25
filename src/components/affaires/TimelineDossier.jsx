// ============================================================================
// CRM EXPERT JUDICIAIRE - TIMELINE DU DOSSIER
// ============================================================================

import React, { useMemo, useState } from 'react';
import {
  Clock, FileText, Users, Calendar, Send, Inbox, MessageSquare,
  FileCheck, Check, AlertTriangle, Play, Pause, Flag, Euro,
  Gavel, Scale, ChevronDown, ChevronUp, Filter, Download
} from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// CONSTANTES
// ============================================================================

const TYPES_EVENEMENT = {
  ordonnance: {
    label: 'Ordonnance',
    icon: Gavel,
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-500'
  },
  reponse_juge: {
    label: 'Réponse au juge',
    icon: Send,
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-500'
  },
  provision: {
    label: 'Provision',
    icon: Euro,
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-500'
  },
  convocation: {
    label: 'Convocation',
    icon: Send,
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-500'
  },
  reunion: {
    label: 'Réunion',
    icon: Users,
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-500'
  },
  compte_rendu: {
    label: 'Compte-rendu',
    icon: FileText,
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-500'
  },
  dire: {
    label: 'Dire',
    icon: MessageSquare,
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-500'
  },
  reponse_dire: {
    label: 'Réponse dire',
    icon: MessageSquare,
    color: 'teal',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-500'
  },
  document: {
    label: 'Document',
    icon: FileText,
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-500'
  },
  note_synthese: {
    label: 'Note de synthèse',
    icon: FileCheck,
    color: 'pink',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-500'
  },
  rapport_final: {
    label: 'Rapport final',
    icon: FileCheck,
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-500'
  },
  taxation: {
    label: 'Taxation',
    icon: Scale,
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-500'
  },
  autre: {
    label: 'Autre',
    icon: Flag,
    color: 'slate',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-500'
  }
};

// ============================================================================
// COMPOSANT: Élément de timeline
// ============================================================================

const TimelineItem = ({ evenement, isFirst, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const config = TYPES_EVENEMENT[evenement.type] || TYPES_EVENEMENT.autre;
  const Icon = config.icon;

  return (
    <div className="relative flex gap-4">
      {/* Ligne verticale */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center z-10 border-2 ${config.borderColor}`}>
          <Icon className={`w-5 h-5 ${config.textColor}`} />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-[#e5e5e5] mt-2" />
        )}
      </div>

      {/* Contenu */}
      <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
        <div
          className={`p-4 bg-white border border-[#e5e5e5] rounded-xl hover:shadow-md transition-shadow cursor-pointer`}
          onClick={() => setExpanded(!expanded)}
        >
          {/* En-tête */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={config.color}>{config.label}</Badge>
                <span className="text-xs text-[#a3a3a3]">
                  {evenement.date ? formatDateFr(evenement.date) : 'Date inconnue'}
                </span>
                {evenement.heure && (
                  <span className="text-xs text-[#a3a3a3]">à {evenement.heure}</span>
                )}
              </div>
              <h4 className="font-medium text-[#1a1a1a] mt-1">
                {evenement.titre}
              </h4>
              {evenement.sousTitre && (
                <p className="text-sm text-[#737373]">{evenement.sousTitre}</p>
              )}
            </div>

            {evenement.details && (
              <button className="p-1 hover:bg-[#f5f5f5] rounded">
                {expanded ? (
                  <ChevronUp className="w-4 h-4 text-[#a3a3a3]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#a3a3a3]" />
                )}
              </button>
            )}
          </div>

          {/* Détails expansibles */}
          {expanded && evenement.details && (
            <div className="mt-3 pt-3 border-t border-[#e5e5e5]">
              <p className="text-sm text-[#525252] whitespace-pre-wrap">
                {evenement.details}
              </p>
            </div>
          )}

          {/* Métadonnées */}
          {evenement.metadata && (
            <div className="mt-2 flex flex-wrap gap-2">
              {evenement.metadata.map((meta, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-[#f5f5f5] rounded text-[#737373]">
                  {meta}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT: Timeline du dossier
// ============================================================================

export const TimelineDossier = ({ affaire }) => {
  const [filterType, setFilterType] = useState('tous');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Construire la liste des événements
  const evenements = useMemo(() => {
    const events = [];

    // 1. Ordonnance de désignation
    if (affaire.date_ordonnance) {
      events.push({
        type: 'ordonnance',
        date: affaire.date_ordonnance,
        titre: 'Ordonnance de désignation',
        sousTitre: affaire.tribunal,
        details: affaire.mission ? `Mission : ${affaire.mission}` : null,
        metadata: [
          `RG ${affaire.rg || '---'}`,
          affaire.provision_montant ? `Provision : ${parseFloat(affaire.provision_montant).toLocaleString('fr-FR')} €` : null
        ].filter(Boolean)
      });
    }

    // 2. Réponse au juge
    if (affaire.date_reponse_juge) {
      const reponseLabel = affaire.reponse_juge === 'acceptee' ? 'Mission acceptée' :
                          affaire.reponse_juge === 'refusee' ? 'Mission refusée' :
                          'Récusation demandée';
      events.push({
        type: 'reponse_juge',
        date: affaire.date_reponse_juge,
        titre: reponseLabel,
        metadata: affaire.motif_refus ? [`Motif : ${affaire.motif_refus}`] : null
      });
    }

    // 3. Réception provision
    if (affaire.provision_date_reception) {
      events.push({
        type: 'provision',
        date: affaire.provision_date_reception,
        titre: 'Provision reçue',
        sousTitre: `${parseFloat(affaire.provision_montant || 0).toLocaleString('fr-FR')} €`
      });
    }

    // 4. Consignations supplémentaires
    (affaire.consignations_supplementaires || []).forEach((c, i) => {
      if (c.date_demande) {
        events.push({
          type: 'provision',
          date: c.date_demande,
          titre: `Demande de consignation n°${i + 2}`,
          sousTitre: `${parseFloat(c.montant || 0).toLocaleString('fr-FR')} €`
        });
      }
      if (c.date_reception) {
        events.push({
          type: 'provision',
          date: c.date_reception,
          titre: `Consignation n°${i + 2} reçue`,
          sousTitre: `${parseFloat(c.montant || 0).toLocaleString('fr-FR')} €`
        });
      }
    });

    // 5. Réunions
    (affaire.reunions || []).forEach(reunion => {
      // Convocation
      if (reunion.date_convocation) {
        events.push({
          type: 'convocation',
          date: reunion.date_convocation,
          titre: `Convocation réunion R${reunion.numero}`,
          sousTitre: reunion.lieu,
          metadata: [`Pour le ${reunion.date_reunion ? formatDateFr(reunion.date_reunion) : '---'}`]
        });
      }

      // Réunion
      if (reunion.date_reunion) {
        const statut = reunion.statut === 'terminee' ? 'Réunion terminée' :
                      reunion.statut === 'annulee' ? 'Réunion annulée' :
                      'Réunion planifiée';
        events.push({
          type: 'reunion',
          date: reunion.date_reunion,
          heure: reunion.heure,
          titre: `Réunion R${reunion.numero}`,
          sousTitre: `${reunion.type || 'Expertise'} - ${reunion.lieu || 'Sur site'}`,
          details: reunion.notes,
          metadata: [
            statut,
            reunion.presents?.length ? `${reunion.presents.length} présent(s)` : null,
            reunion.duree_heures ? `${reunion.duree_heures}h` : null
          ].filter(Boolean)
        });
      }

      // Compte-rendu
      if (reunion.compte_rendu) {
        events.push({
          type: 'compte_rendu',
          date: reunion.date_compte_rendu || reunion.date_reunion,
          titre: `Compte-rendu R${reunion.numero}`,
          details: reunion.compte_rendu.substring(0, 200) + (reunion.compte_rendu.length > 200 ? '...' : '')
        });
      }
    });

    // 6. Dires
    (affaire.dires || []).forEach(dire => {
      // Réception du dire
      events.push({
        type: 'dire',
        date: dire.date || dire.date_reception,
        titre: `Dire reçu`,
        sousTitre: dire.partie_nom || dire.partie_id,
        details: dire.contenu?.substring(0, 200) + (dire.contenu?.length > 200 ? '...' : ''),
        metadata: [dire.objet]
      });

      // Réponse au dire
      if (dire.reponse && dire.date_reponse) {
        events.push({
          type: 'reponse_dire',
          date: dire.date_reponse,
          titre: 'Réponse au dire',
          sousTitre: dire.partie_nom || dire.partie_id,
          details: dire.reponse?.substring(0, 200) + (dire.reponse?.length > 200 ? '...' : '')
        });
      }
    });

    // 7. Documents
    (affaire.documents || []).forEach(doc => {
      // Éviter les doublons avec les événements déjà traités
      if (['note-synthese', 'rapport-final'].includes(doc.type)) return;

      events.push({
        type: 'document',
        date: doc.date || doc.date_creation,
        titre: doc.direction === 'recu' ? 'Document reçu' : 'Document envoyé',
        sousTitre: doc.nom || doc.titre,
        metadata: [doc.type]
      });
    });

    // 8. Note de synthèse
    if (affaire.note_synthese_date) {
      events.push({
        type: 'note_synthese',
        date: affaire.note_synthese_date,
        titre: 'Note de synthèse',
        sousTitre: 'Pré-rapport envoyé aux parties'
      });
    }

    // 9. Rapport final
    if (affaire.rapport_final_date) {
      events.push({
        type: 'rapport_final',
        date: affaire.rapport_final_date,
        titre: 'Rapport final',
        sousTitre: affaire.rapport_final_verrouille ? 'Rapport déposé' : 'En cours de rédaction',
        metadata: affaire.rapport_final_date_depot ? [`Déposé le ${formatDateFr(affaire.rapport_final_date_depot)}`] : null
      });
    }

    // 10. Taxation
    if (affaire.taxation_demandee) {
      events.push({
        type: 'taxation',
        date: affaire.taxation_date_demande,
        titre: 'Demande de taxation',
        sousTitre: affaire.taxation_montant_demande ? `${parseFloat(affaire.taxation_montant_demande).toLocaleString('fr-FR')} €` : null
      });
    }

    if (affaire.taxation_date_decision) {
      events.push({
        type: 'taxation',
        date: affaire.taxation_date_decision,
        titre: 'Décision de taxation',
        sousTitre: affaire.taxation_montant_accorde ? `${parseFloat(affaire.taxation_montant_accorde).toLocaleString('fr-FR')} € accordés` : 'Montant à définir'
      });
    }

    return events;
  }, [affaire]);

  // Filtrer et trier
  const evenementsFiltres = useMemo(() => {
    let filtered = evenements;

    // Filtrer par type
    if (filterType !== 'tous') {
      filtered = filtered.filter(e => e.type === filterType);
    }

    // Trier par date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [evenements, filterType, sortOrder]);

  // Types présents dans les événements
  const typesPresents = useMemo(() => {
    const types = new Set(evenements.map(e => e.type));
    return Array.from(types);
  }, [evenements]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a]">Historique du dossier</h2>
          <p className="text-sm text-[#737373]">
            {evenements.length} événement{evenements.length > 1 ? 's' : ''} enregistré{evenements.length > 1 ? 's' : ''}
          </p>
        </div>

        <Button variant="secondary" icon={Download}>
          Exporter
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#737373]" />
            <span className="text-sm text-[#737373]">Filtrer :</span>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
          >
            <option value="tous">Tous les événements</option>
            {typesPresents.map(type => (
              <option key={type} value={type}>
                {TYPES_EVENEMENT[type]?.label || type}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-[#737373]">Ordre :</span>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-[#e5e5e5] rounded-xl text-sm hover:bg-[#f5f5f5] flex items-center gap-1"
            >
              {sortOrder === 'desc' ? 'Plus récent' : 'Plus ancien'}
              {sortOrder === 'desc' ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      {evenementsFiltres.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="w-12 h-12 text-[#e5e5e5] mx-auto mb-4" />
          <p className="text-[#737373]">Aucun événement à afficher</p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="space-y-0">
            {evenementsFiltres.map((evt, index) => (
              <TimelineItem
                key={`${evt.type}-${evt.date}-${index}`}
                evenement={evt}
                isFirst={index === 0}
                isLast={index === evenementsFiltres.length - 1}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Résumé rapide */}
      <Card className="p-4 bg-[#EFF6FF]">
        <h3 className="text-sm font-medium text-[#1a1a1a] mb-3">Résumé</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(TYPES_EVENEMENT).map(([type, config]) => {
            const count = evenements.filter(e => e.type === type).length;
            if (count === 0) return null;

            return (
              <button
                key={type}
                onClick={() => setFilterType(filterType === type ? 'tous' : type)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                  filterType === type
                    ? `${config.bgColor} ${config.borderColor} border-2`
                    : 'bg-white border-[#e5e5e5] hover:border-[#2563EB]'
                }`}
              >
                <config.icon className={`w-4 h-4 ${config.textColor}`} />
                <span className="text-sm">{config.label}</span>
                <Badge variant={config.color} className="text-xs">{count}</Badge>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default TimelineDossier;
