// ============================================================================
// CRM EXPERT JUDICIAIRE - CYCLE COMPLET D'UNE RÉUNION
// ============================================================================
// Affiche le cycle complet : Convocation → Réunion → Notes/Photos → CR → Désordres
// Chaque réunion (R1, R2, R3...) a son propre cycle

import React, { useState } from 'react';
import {
  Send, Users, Calendar, FileText, Camera, Mic, ClipboardList,
  CheckCircle, Circle, ChevronDown, ChevronRight, MapPin, Clock,
  AlertTriangle, Play, Eye, Edit, Plus, ArrowRight, Building
} from 'lucide-react';
import { Card, Badge, Button, ModalBase } from '../ui';
import { TYPES_REUNION, STATUTS_REUNION } from '../../data';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// ÉTAPES DU CYCLE
// ============================================================================

const ETAPES_CYCLE = [
  {
    id: 'convocation',
    label: 'Convocation',
    icon: Send,
    description: 'Envoyer les convocations aux parties'
  },
  {
    id: 'reunion',
    label: 'Réunion',
    icon: Users,
    description: 'Tenir la réunion d\'expertise'
  },
  {
    id: 'notes-photos',
    label: 'Notes & Photos',
    icon: Camera,
    description: 'Prises de notes, photos, constats'
  },
  {
    id: 'compte-rendu',
    label: 'Compte-rendu',
    icon: FileText,
    description: 'Rédiger et envoyer le CR'
  }
];

// ============================================================================
// CALCUL STATUT ÉTAPE
// ============================================================================

const getEtapeStatut = (reunion, etapeId) => {
  switch (etapeId) {
    case 'convocation':
      if (reunion.convocations_envoyees) return 'complete';
      if (reunion.date_reunion) return 'a-faire';
      return 'non-commence';

    case 'reunion':
      if (reunion.statut === 'terminee') return 'complete';
      if (reunion.statut === 'en-cours') return 'en-cours';
      if (reunion.convocations_envoyees) return 'a-faire';
      return 'bloque';

    case 'notes-photos':
      if (reunion.notes || (reunion.photos && reunion.photos.length > 0)) return 'complete';
      if (reunion.statut === 'terminee' || reunion.statut === 'en-cours') return 'a-faire';
      return 'bloque';

    case 'compte-rendu':
      if (reunion.compte_rendu_envoye) return 'complete';
      if (reunion.compte_rendu) return 'en-cours';
      if (reunion.statut === 'terminee') return 'a-faire';
      return 'bloque';

    default:
      return 'non-commence';
  }
};

// ============================================================================
// BADGE ÉTAPE
// ============================================================================

const EtapeBadge = ({ statut }) => {
  switch (statut) {
    case 'complete':
      return (
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      );
    case 'en-cours':
      return (
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
          <Play className="w-3 h-3 text-white" />
        </div>
      );
    case 'a-faire':
      return (
        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
          <AlertTriangle className="w-3 h-3 text-white" />
        </div>
      );
    case 'bloque':
      return (
        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
          <Circle className="w-3 h-3 text-gray-500" />
        </div>
      );
    default:
      return (
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
          <Circle className="w-3 h-3 text-gray-400" />
        </div>
      );
  }
};

// ============================================================================
// COMPOSANT CYCLE D'UNE RÉUNION
// ============================================================================

const CycleReunionCard = ({
  reunion,
  parties,
  desordres,
  onConvoquer,
  onDemarrerReunion,
  onPrendreNotes,
  onRedigerCR,
  onVoirDesordres,
  onAjouterDesordre
}) => {
  const [expanded, setExpanded] = useState(reunion.statut !== 'terminee');

  const statutInfo = STATUTS_REUNION.find(s => s.id === reunion.statut) || STATUTS_REUNION[0];
  const typeInfo = TYPES_REUNION.find(t => t.id === reunion.type) || TYPES_REUNION[0];

  // Désordres liés à cette réunion
  const desordresReunion = desordres?.filter(d => d.reunion_numero === reunion.numero) || [];

  // Calculer la progression
  const etapesStatuts = ETAPES_CYCLE.map(etape => ({
    ...etape,
    statut: getEtapeStatut(reunion, etape.id)
  }));
  const etapesCompletes = etapesStatuts.filter(e => e.statut === 'complete').length;
  const progression = Math.round((etapesCompletes / ETAPES_CYCLE.length) * 100);

  // Prochaine action
  const prochaineEtape = etapesStatuts.find(e => e.statut === 'a-faire' || e.statut === 'en-cours');

  const getStatutColor = () => {
    if (reunion.statut === 'terminee') return 'border-green-300 bg-green-50';
    if (reunion.statut === 'en-cours') return 'border-blue-300 bg-blue-50';
    if (reunion.statut === 'annulee') return 'border-red-300 bg-red-50';
    return 'border-[#e5e5e5] bg-white';
  };

  return (
    <Card className={`border-2 ${getStatutColor()} overflow-hidden`}>
      {/* En-tête cliquable */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Numéro de réunion */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl ${
              reunion.statut === 'terminee'
                ? 'bg-green-500 text-white'
                : reunion.statut === 'en-cours'
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#c9a227] text-white'
            }`}>
              R{reunion.numero}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#1a1a1a]">
                  Réunion n°{reunion.numero}
                </h3>
                <Badge variant={
                  reunion.statut === 'terminee' ? 'success' :
                  reunion.statut === 'en-cours' ? 'info' :
                  reunion.statut === 'annulee' ? 'error' : 'warning'
                }>
                  {statutInfo.label}
                </Badge>
              </div>
              <p className="text-sm text-[#737373]">{typeInfo.label}</p>

              {/* Date si définie */}
              {reunion.date_reunion && (
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="flex items-center gap-1 text-[#525252]">
                    <Calendar className="w-4 h-4" />
                    {formatDateFr(reunion.date_reunion)}
                  </span>
                  {reunion.heure_debut && (
                    <span className="flex items-center gap-1 text-[#737373]">
                      <Clock className="w-4 h-4" />
                      {reunion.heure_debut}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Progression */}
            <div className="text-right">
              <div className="text-sm font-medium text-[#1a1a1a]">{progression}%</div>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    progression === 100 ? 'bg-green-500' : 'bg-[#c9a227]'
                  }`}
                  style={{ width: `${progression}%` }}
                />
              </div>
            </div>

            <ChevronDown className={`w-5 h-5 text-[#a3a3a3] transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Contenu étendu */}
      {expanded && (
        <div className="border-t border-[#e5e5e5]">
          {/* Pipeline des étapes */}
          <div className="p-4 bg-[#fafafa]">
            <div className="flex items-center justify-between">
              {etapesStatuts.map((etape, index) => {
                const Icon = etape.icon;
                const isLast = index === etapesStatuts.length - 1;

                return (
                  <React.Fragment key={etape.id}>
                    <div className="flex flex-col items-center">
                      <EtapeBadge statut={etape.statut} />
                      <div className="mt-2 flex flex-col items-center">
                        <Icon className={`w-5 h-5 ${
                          etape.statut === 'complete' ? 'text-green-600' :
                          etape.statut === 'en-cours' || etape.statut === 'a-faire' ? 'text-[#1a1a1a]' :
                          'text-gray-400'
                        }`} />
                        <span className={`text-xs mt-1 ${
                          etape.statut === 'complete' ? 'text-green-600 font-medium' :
                          etape.statut === 'en-cours' || etape.statut === 'a-faire' ? 'text-[#1a1a1a]' :
                          'text-gray-400'
                        }`}>
                          {etape.label}
                        </span>
                      </div>
                    </div>

                    {!isLast && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        etapesStatuts[index + 1].statut !== 'bloque' && etapesStatuts[index + 1].statut !== 'non-commence'
                          ? 'bg-[#c9a227]'
                          : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Action principale */}
          {prochaineEtape && (
            <div className="p-4 border-t border-[#e5e5e5]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#c9a227] flex items-center justify-center">
                    <prochaineEtape.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1a1a1a]">Prochaine étape : {prochaineEtape.label}</p>
                    <p className="text-sm text-[#737373]">{prochaineEtape.description}</p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={() => {
                    switch (prochaineEtape.id) {
                      case 'convocation': onConvoquer?.(reunion); break;
                      case 'reunion': onDemarrerReunion?.(reunion); break;
                      case 'notes-photos': onPrendreNotes?.(reunion); break;
                      case 'compte-rendu': onRedigerCR?.(reunion); break;
                    }
                  }}
                >
                  {prochaineEtape.id === 'convocation' && 'Convoquer'}
                  {prochaineEtape.id === 'reunion' && 'Démarrer'}
                  {prochaineEtape.id === 'notes-photos' && 'Prendre notes'}
                  {prochaineEtape.id === 'compte-rendu' && 'Rédiger CR'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Infos lieu */}
          {reunion.lieu && (
            <div className="px-4 py-3 border-t border-[#e5e5e5] flex items-center gap-2 text-sm text-[#737373]">
              <MapPin className="w-4 h-4" />
              {reunion.lieu}
            </div>
          )}

          {/* Désordres constatés lors de cette réunion */}
          <div className="p-4 border-t border-[#e5e5e5]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-[#1a1a1a] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#737373]" />
                Désordres constatés lors de R{reunion.numero}
              </h4>
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => onAjouterDesordre?.(reunion.numero)}
              >
                Ajouter
              </Button>
            </div>

            {desordresReunion.length > 0 ? (
              <div className="space-y-2">
                {desordresReunion.map((desordre, index) => (
                  <div
                    key={desordre.id || index}
                    className="p-3 bg-[#fafafa] rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#c9a227]">D{index + 1}</span>
                      <span className="text-sm text-[#1a1a1a]">{desordre.designation || desordre.titre}</span>
                      {desordre.photos?.length > 0 && (
                        <Badge variant="info" size="sm">
                          <Camera className="w-3 h-3 mr-1" />
                          {desordre.photos.length}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => onVoirDesordres?.(desordre)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#a3a3a3] italic">
                Aucun désordre constaté lors de cette réunion
              </p>
            )}
          </div>

          {/* Statistiques rapides */}
          {reunion.statut === 'terminee' && (
            <div className="px-4 py-3 bg-green-50 border-t border-green-200 flex items-center gap-6 text-sm">
              {reunion.presents?.length > 0 && (
                <span className="flex items-center gap-1 text-green-700">
                  <Users className="w-4 h-4" />
                  {reunion.presents.length} présent{reunion.presents.length > 1 ? 's' : ''}
                </span>
              )}
              {reunion.notes && (
                <span className="flex items-center gap-1 text-green-700">
                  <ClipboardList className="w-4 h-4" />
                  Notes prises
                </span>
              )}
              {reunion.photos?.length > 0 && (
                <span className="flex items-center gap-1 text-green-700">
                  <Camera className="w-4 h-4" />
                  {reunion.photos.length} photo{reunion.photos.length > 1 ? 's' : ''}
                </span>
              )}
              {desordresReunion.length > 0 && (
                <span className="flex items-center gap-1 text-green-700">
                  <Building className="w-4 h-4" />
                  {desordresReunion.length} désordre{desordresReunion.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL - LISTE DES CYCLES
// ============================================================================

export const CycleReunion = ({
  affaire,
  onConvoquer,
  onDemarrerReunion,
  onPrendreNotes,
  onRedigerCR,
  onVoirDesordres,
  onAjouterDesordre,
  onAjouterReunion
}) => {
  const reunions = affaire.reunions || [];
  const parties = affaire.parties || [];
  const desordres = affaire.pathologies || [];

  // Trier par numéro
  const reunionsSorted = [...reunions].sort((a, b) => a.numero - b.numero);

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Opérations d'expertise</h3>
          <p className="text-sm text-[#737373]">
            {reunions.length} réunion{reunions.length > 1 ? 's' : ''} •
            Cycle : Convocation → Réunion → Notes → Compte-rendu
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={onAjouterReunion}
        >
          Nouvelle réunion
        </Button>
      </div>

      {/* Liste des cycles */}
      {reunionsSorted.length > 0 ? (
        <div className="space-y-4">
          {reunionsSorted.map(reunion => (
            <CycleReunionCard
              key={reunion.id || reunion.numero}
              reunion={reunion}
              parties={parties}
              desordres={desordres}
              onConvoquer={onConvoquer}
              onDemarrerReunion={onDemarrerReunion}
              onPrendreNotes={onPrendreNotes}
              onRedigerCR={onRedigerCR}
              onVoirDesordres={onVoirDesordres}
              onAjouterDesordre={onAjouterDesordre}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-[#d4d4d4]" />
          <p className="font-medium text-[#737373]">Aucune réunion planifiée</p>
          <p className="text-sm text-[#a3a3a3] mt-1 mb-4">
            Planifiez votre première réunion d'expertise (R1)
          </p>
          <Button variant="primary" icon={Plus} onClick={onAjouterReunion}>
            Planifier R1
          </Button>
        </Card>
      )}
    </div>
  );
};

export default CycleReunion;
