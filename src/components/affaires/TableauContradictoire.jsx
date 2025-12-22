// ============================================================================
// CRM EXPERT JUDICIAIRE - TABLEAU DE SUIVI DU CONTRADICTOIRE
// ============================================================================
// Affiche une matrice visuelle de qui a reçu quoi et quand
// Permet de prouver le respect du contradictoire (Art. 16 CPC)

import React, { useMemo, useState } from 'react';
import {
  Check, X, Clock, AlertTriangle, Send, Mail,
  Download, Eye, Users, FileText, Calendar,
  ChevronDown, ChevronRight, RefreshCw
} from 'lucide-react';
import { Card, Badge, Button, ModalBase, useToast } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// TYPES DE DOCUMENTS À SUIVRE
// ============================================================================

const TYPES_DOCUMENTS = [
  { id: 'ordonnance', label: 'Ordonnance', phase: 1 },
  { id: 'convocation', label: 'Convocation', phase: 3, perReunion: true },
  { id: 'compte-rendu', label: 'Compte-rendu', phase: 3, perReunion: true },
  { id: 'pieces-complementaires', label: 'Pièces complémentaires', phase: 3 },
  { id: 'pre-rapport', label: 'Pré-rapport', phase: 5 },
  { id: 'dire', label: 'Dire', phase: 4, parPartie: true },
  { id: 'rapport-final', label: 'Rapport final', phase: 6 }
];

// ============================================================================
// CALCUL DE LA MATRICE
// ============================================================================

const calculerMatrice = (affaire) => {
  const parties = affaire.parties || [];
  const reunions = affaire.reunions || [];
  const documents = affaire.documents || [];
  const dires = affaire.dires || [];

  // Structure: { documentId: { partieId: { statut, date, mode } } }
  const matrice = {};

  // Initialiser pour chaque type de document
  TYPES_DOCUMENTS.forEach(typeDoc => {
    if (typeDoc.perReunion) {
      // Un document par réunion
      reunions.forEach(reunion => {
        const docId = `${typeDoc.id}-r${reunion.numero}`;
        matrice[docId] = {
          type: typeDoc.id,
          label: `${typeDoc.label} R${reunion.numero}`,
          reunion: reunion.numero,
          parties: {}
        };

        parties.forEach(partie => {
          // Vérifier si la partie a reçu ce document
          const envoi = documents.find(d =>
            d.type === typeDoc.id &&
            d.reunion_numero === reunion.numero &&
            d.destinataire_id === partie.id
          );

          matrice[docId].parties[partie.id] = envoi
            ? { statut: 'recu', date: envoi.date_reception || envoi.date_envoi, mode: envoi.mode_envoi }
            : reunion.convocations_envoyees && typeDoc.id === 'convocation'
              ? { statut: 'envoye', date: reunion.date_convocations }
              : { statut: 'non-envoye' };
        });
      });
    } else if (typeDoc.parPartie) {
      // Documents émis par les parties (dires)
      const docId = typeDoc.id;
      matrice[docId] = {
        type: typeDoc.id,
        label: typeDoc.label,
        parties: {}
      };

      parties.forEach(partie => {
        const direPartie = dires.find(d => d.partie_id === partie.id);
        matrice[docId].parties[partie.id] = direPartie
          ? { statut: 'recu', date: direPartie.date_reception, emetteur: true }
          : { statut: 'en-attente', delai: affaire.date_limite_dires };
      });
    } else {
      // Documents uniques
      const docId = typeDoc.id;
      matrice[docId] = {
        type: typeDoc.id,
        label: typeDoc.label,
        parties: {}
      };

      parties.forEach(partie => {
        // Chercher si ce document a été envoyé/reçu
        let envoi;

        if (typeDoc.id === 'ordonnance') {
          // L'ordonnance est reçue par tous au début
          envoi = affaire.date_ordonnance ? { date: affaire.date_ordonnance, statut: 'recu' } : null;
        } else if (typeDoc.id === 'pre-rapport') {
          envoi = documents.find(d => d.type === 'pre-rapport' && d.destinataire_id === partie.id);
        } else if (typeDoc.id === 'rapport-final') {
          envoi = documents.find(d => d.type === 'rapport-final' && d.destinataire_id === partie.id);
        }

        matrice[docId].parties[partie.id] = envoi
          ? { statut: envoi.statut || 'recu', date: envoi.date || envoi.date_envoi, mode: envoi.mode_envoi }
          : { statut: 'non-envoye' };
      });
    }
  });

  return matrice;
};

// ============================================================================
// ICÔNE DE STATUT
// ============================================================================

const StatutIcon = ({ statut, date, mode, emetteur }) => {
  const getConfig = () => {
    switch (statut) {
      case 'recu':
        return {
          icon: Check,
          bg: 'bg-green-100',
          color: 'text-green-600',
          tooltip: `Reçu${date ? ` le ${formatDateFr(date)}` : ''}${mode ? ` (${mode})` : ''}`
        };
      case 'envoye':
        return {
          icon: Send,
          bg: 'bg-blue-100',
          color: 'text-blue-600',
          tooltip: `Envoyé${date ? ` le ${formatDateFr(date)}` : ''}`
        };
      case 'en-attente':
        return {
          icon: Clock,
          bg: 'bg-amber-100',
          color: 'text-amber-600',
          tooltip: 'En attente'
        };
      case 'non-envoye':
        return {
          icon: null,
          bg: 'bg-gray-100',
          color: 'text-gray-400',
          tooltip: 'Non envoyé'
        };
      case 'non-concerne':
        return {
          icon: null,
          bg: 'bg-gray-50',
          color: 'text-gray-300',
          tooltip: 'Non concerné'
        };
      default:
        return {
          icon: AlertTriangle,
          bg: 'bg-red-100',
          color: 'text-red-600',
          tooltip: 'Problème'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div
      className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center cursor-help`}
      title={config.tooltip}
    >
      {Icon ? (
        <Icon className={`w-4 h-4 ${config.color}`} />
      ) : (
        <span className={`text-lg ${config.color}`}>–</span>
      )}
    </div>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const TableauContradictoire = ({ affaire, onRelance, onEnvoyer }) => {
  const { addToast } = useToast();
  const [expanded, setExpanded] = useState(true);

  const parties = affaire.parties || [];
  const matrice = useMemo(() => calculerMatrice(affaire), [affaire]);

  // Statistiques
  const stats = useMemo(() => {
    let total = 0;
    let recus = 0;
    let enAttente = 0;

    Object.values(matrice).forEach(doc => {
      Object.values(doc.parties).forEach(statut => {
        if (statut.statut !== 'non-concerne') {
          total++;
          if (statut.statut === 'recu' || statut.statut === 'envoye') recus++;
          if (statut.statut === 'en-attente') enAttente++;
        }
      });
    });

    return { total, recus, enAttente, pourcentage: total > 0 ? Math.round((recus / total) * 100) : 0 };
  }, [matrice]);

  if (parties.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-[#737373]">
          <Users className="w-12 h-12 mx-auto mb-3 text-[#d4d4d4]" />
          <p className="font-medium">Aucune partie au dossier</p>
          <p className="text-sm mt-1">Ajoutez des parties pour suivre le contradictoire</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* En-tête */}
      <div
        className="p-4 bg-[#f7f7f7] border-b border-[#e5e5e5] flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0381fe] flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1a1a1a]">Suivi du Contradictoire</h3>
            <p className="text-sm text-[#737373]">
              {stats.recus}/{stats.total} documents transmis ({stats.pourcentage}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stats.enAttente > 0 && (
            <Badge variant="warning">{stats.enAttente} en attente</Badge>
          )}
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-[#737373]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[#737373]" />
          )}
        </div>
      </div>

      {/* Tableau */}
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* En-tête avec noms des parties */}
            <thead>
              <tr className="bg-[#fafafa]">
                <th className="text-left p-3 text-sm font-medium text-[#737373] border-b border-[#e5e5e5] min-w-[200px]">
                  Document
                </th>
                {parties.map(partie => (
                  <th
                    key={partie.id}
                    className="text-center p-3 text-sm font-medium text-[#1a1a1a] border-b border-[#e5e5e5] min-w-[100px]"
                  >
                    <div className="truncate max-w-[120px]" title={partie.nom}>
                      {partie.nom}
                    </div>
                    <div className="text-xs text-[#737373] font-normal">
                      {partie.role || partie.qualite}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Corps du tableau */}
            <tbody>
              {Object.entries(matrice).map(([docId, doc]) => (
                <tr key={docId} className="hover:bg-[#fafafa]">
                  <td className="p-3 text-sm text-[#1a1a1a] border-b border-[#e5e5e5]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#a3a3a3]" />
                      {doc.label}
                    </div>
                  </td>
                  {parties.map(partie => {
                    const statut = doc.parties[partie.id] || { statut: 'non-envoye' };
                    return (
                      <td
                        key={partie.id}
                        className="p-3 text-center border-b border-[#e5e5e5]"
                      >
                        <div className="flex justify-center">
                          <StatutIcon
                            statut={statut.statut}
                            date={statut.date}
                            mode={statut.mode}
                            emetteur={statut.emetteur}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Actions */}
      {expanded && (
        <div className="p-4 bg-[#fafafa] border-t border-[#e5e5e5] flex items-center justify-between">
          <p className="text-sm text-[#737373]">
            <span className="inline-flex items-center gap-1 mr-4">
              <Check className="w-4 h-4 text-green-600" /> Reçu
            </span>
            <span className="inline-flex items-center gap-1 mr-4">
              <Send className="w-4 h-4 text-blue-600" /> Envoyé
            </span>
            <span className="inline-flex items-center gap-1 mr-4">
              <Clock className="w-4 h-4 text-amber-600" /> En attente
            </span>
          </p>

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => {
              addToast('Export du tableau contradictoire (fonctionnalité à venir)', 'info');
            }}
          >
            Exporter preuve
          </Button>
        </div>
      )}
    </Card>
  );
};

export default TableauContradictoire;
