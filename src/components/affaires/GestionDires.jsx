// ============================================================================
// CRM EXPERT JUDICIAIRE - GESTION DES DIRES DES PARTIES
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  MessageSquare, Plus, Calendar, User, FileText, Check, Clock,
  AlertTriangle, ChevronDown, Edit, Trash2, Eye, Send, X
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase } from '../ui';
import { STATUTS_DIRE } from '../../data';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// COMPOSANT: Carte d'un dire
// ============================================================================

const DireCard = ({ dire, parties, onEdit, onRepondre, onVoir }) => {
  const [expanded, setExpanded] = useState(false);

  const statutInfo = STATUTS_DIRE.find(s => s.id === dire.statut) || STATUTS_DIRE[0];
  const partie = parties?.find(p => p.id === dire.partie_id);
  const partieName = partie?.raison_sociale || `${partie?.prenom || ''} ${partie?.nom || 'Partie inconnue'}`.trim();

  // Calculer si le délai de réponse est proche
  const getDelaiRestant = () => {
    if (!dire.date_reception || dire.statut === 'repondu') return null;
    const dateReception = new Date(dire.date_reception);
    const dateLimit = new Date(dateReception);
    dateLimit.setDate(dateLimit.getDate() + 30); // 30 jours pour répondre
    const today = new Date();
    const diffTime = dateLimit - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const delaiRestant = getDelaiRestant();
  const isUrgent = delaiRestant !== null && delaiRestant <= 7;

  return (
    <Card className={`border-l-4 ${
      dire.statut === 'repondu' ? 'border-l-green-500' :
      dire.statut === 'rejete' ? 'border-l-red-500' :
      isUrgent ? 'border-l-amber-500' :
      'border-l-blue-500'
    }`}>
      {/* En-tête */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              dire.statut === 'repondu' ? 'bg-green-100 text-green-600' :
              dire.statut === 'rejete' ? 'bg-red-100 text-red-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              <MessageSquare className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-[#1a1a1a]">{dire.objet || 'Dire sans objet'}</p>
                <Badge variant={
                  statutInfo.color === 'green' ? 'success' :
                  statutInfo.color === 'red' ? 'error' :
                  statutInfo.color === 'amber' ? 'warning' : 'info'
                }>
                  {statutInfo.label}
                </Badge>
              </div>
              <p className="text-sm text-[#737373]">
                De : {partieName}
              </p>
              <p className="text-xs text-[#a3a3a3] mt-1">
                Reçu le {dire.date_reception ? formatDateFr(dire.date_reception) : '---'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {delaiRestant !== null && dire.statut !== 'repondu' && (
              <div className={`text-xs font-medium px-2 py-1 rounded ${
                delaiRestant <= 0 ? 'bg-red-100 text-red-600' :
                delaiRestant <= 7 ? 'bg-amber-100 text-amber-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {delaiRestant <= 0 ? 'Délai dépassé' : `J-${delaiRestant}`}
              </div>
            )}
            <ChevronDown className={`w-5 h-5 text-[#a3a3a3] transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Contenu étendu */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[#e5e5e5] space-y-4">
          {/* Contenu du dire */}
          <div>
            <p className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-1">Contenu du dire</p>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-[#525252] whitespace-pre-wrap">
                {dire.contenu || 'Pas de contenu détaillé'}
              </p>
            </div>
          </div>

          {/* Pièces jointes */}
          {dire.pieces_jointes?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-1">
                Pièces jointes ({dire.pieces_jointes.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {dire.pieces_jointes.map((piece, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                    <FileText className="w-3 h-3" />
                    {piece}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Réponse de l'expert */}
          {dire.reponse && (
            <div>
              <p className="text-xs uppercase tracking-wider text-green-600 mb-1">Réponse de l'expert</p>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-[#525252] whitespace-pre-wrap">{dire.reponse}</p>
                {dire.date_reponse && (
                  <p className="text-xs text-[#a3a3a3] mt-2">
                    Répondu le {formatDateFr(dire.date_reponse)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {dire.statut !== 'repondu' && dire.statut !== 'rejete' && (
              <Button variant="primary" size="sm" icon={Send} onClick={() => onRepondre(dire)}>
                Répondre
              </Button>
            )}
            {dire.statut === 'repondu' && (
              <Button variant="secondary" size="sm" icon={Eye} onClick={() => onVoir(dire)}>
                Voir la réponse
              </Button>
            )}
            <Button variant="secondary" size="sm" icon={Edit} onClick={() => onEdit(dire)}>
              Modifier
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Liste des dires
// ============================================================================

export const GestionDires = ({ affaire, onUpdate }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReponseModal, setShowReponseModal] = useState(false);
  const [selectedDire, setSelectedDire] = useState(null);

  const dires = affaire.dires || [];
  const parties = affaire.parties || [];

  // Stats
  const stats = useMemo(() => ({
    total: dires.length,
    enAttente: dires.filter(d => d.statut === 'recu' || d.statut === 'en-analyse').length,
    repondus: dires.filter(d => d.statut === 'repondu').length,
    rejetes: dires.filter(d => d.statut === 'rejete').length
  }), [dires]);

  // Ajouter un dire
  const handleAddDire = (data) => {
    const newDire = {
      id: `dire-${Date.now()}`,
      ...data,
      statut: 'recu',
      created_at: new Date().toISOString()
    };

    onUpdate({
      dires: [...dires, newDire]
    });
    setShowAddModal(false);
  };

  // Mettre à jour un dire
  const handleUpdateDire = (direId, updates) => {
    onUpdate({
      dires: dires.map(d =>
        d.id === direId ? { ...d, ...updates } : d
      )
    });
  };

  // Répondre à un dire
  const openReponse = (dire) => {
    setSelectedDire(dire);
    setShowReponseModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-light text-[#1a1a1a]">{stats.total}</p>
          <p className="text-xs uppercase tracking-wider text-[#a3a3a3]">Total</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-light text-blue-600">{stats.enAttente}</p>
          <p className="text-xs uppercase tracking-wider text-[#a3a3a3]">En attente</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-light text-green-600">{stats.repondus}</p>
          <p className="text-xs uppercase tracking-wider text-[#a3a3a3]">Répondus</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-light text-red-600">{stats.rejetes}</p>
          <p className="text-xs uppercase tracking-wider text-[#a3a3a3]">Rejetés</p>
        </Card>
      </div>

      {/* Dires en attente - alerte */}
      {stats.enAttente > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800">
              <span className="font-medium">{stats.enAttente} dire{stats.enAttente > 1 ? 's' : ''}</span> en attente de réponse.
              Vous devez répondre à chaque dire dans votre rapport.
            </p>
          </div>
        </Card>
      )}

      {/* Liste des dires */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-[#1a1a1a]">
            Dires des parties
          </h3>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            Enregistrer un dire
          </Button>
        </div>

        {dires.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-[#a3a3a3] mx-auto mb-3" />
            <p className="text-[#737373]">Aucun dire reçu</p>
            <p className="text-sm text-[#a3a3a3] mt-1">
              Les dires sont les observations écrites des parties que l'expert doit traiter.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {dires.map(dire => (
              <DireCard
                key={dire.id}
                dire={dire}
                parties={parties}
                onEdit={(d) => {
                  setSelectedDire(d);
                  setShowAddModal(true);
                }}
                onRepondre={openReponse}
                onVoir={openReponse}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal ajout dire */}
      {showAddModal && (
        <ModalAjoutDire
          dire={selectedDire}
          parties={parties}
          onClose={() => {
            setShowAddModal(false);
            setSelectedDire(null);
          }}
          onSave={selectedDire ?
            (data) => {
              handleUpdateDire(selectedDire.id, data);
              setShowAddModal(false);
              setSelectedDire(null);
            } : handleAddDire
          }
        />
      )}

      {/* Modal réponse */}
      {showReponseModal && selectedDire && (
        <ModalReponseDire
          dire={selectedDire}
          onClose={() => {
            setShowReponseModal(false);
            setSelectedDire(null);
          }}
          onSave={(reponse) => {
            handleUpdateDire(selectedDire.id, {
              reponse,
              date_reponse: new Date().toISOString(),
              statut: 'repondu'
            });
            setShowReponseModal(false);
            setSelectedDire(null);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// MODAL: Ajout d'un dire
// ============================================================================

const ModalAjoutDire = ({ dire, parties, onClose, onSave }) => {
  const [data, setData] = useState({
    partie_id: dire?.partie_id || '',
    date_reception: dire?.date_reception || new Date().toISOString().split('T')[0],
    objet: dire?.objet || '',
    contenu: dire?.contenu || '',
    pieces_jointes: dire?.pieces_jointes || []
  });

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title={dire ? 'Modifier le dire' : 'Enregistrer un dire'}
      size="md"
    >
      <div className="space-y-4">
        {/* Partie */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
            Partie émettrice
          </label>
          <select
            value={data.partie_id}
            onChange={(e) => handleChange('partie_id', e.target.value)}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
            required
          >
            <option value="">Sélectionner une partie</option>
            {parties.map(p => (
              <option key={p.id} value={p.id}>
                {p.raison_sociale || `${p.prenom || ''} ${p.nom}`.trim()} ({p.type})
              </option>
            ))}
          </select>
        </div>

        {/* Date de réception */}
        <Input
          label="Date de réception"
          type="date"
          value={data.date_reception}
          onChange={(e) => handleChange('date_reception', e.target.value)}
          required
        />

        {/* Objet */}
        <Input
          label="Objet du dire"
          value={data.objet}
          onChange={(e) => handleChange('objet', e.target.value)}
          placeholder="Ex: Contestation du diagnostic..."
        />

        {/* Contenu */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
            Contenu du dire
          </label>
          <textarea
            value={data.contenu}
            onChange={(e) => handleChange('contenu', e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
            placeholder="Copier/coller ou résumer le contenu du dire..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => onSave(data)}
            disabled={!data.partie_id || !data.date_reception}
          >
            {dire ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// MODAL: Réponse à un dire
// ============================================================================

const ModalReponseDire = ({ dire, onClose, onSave }) => {
  const [reponse, setReponse] = useState(dire.reponse || '');

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title="Réponse au dire"
      size="lg"
    >
      <div className="space-y-4">
        {/* Rappel du dire */}
        <div className="p-4 bg-blue-50 rounded-xl">
          <p className="text-xs uppercase tracking-wider text-blue-600 mb-2">Dire de la partie</p>
          <p className="font-medium text-[#1a1a1a]">{dire.objet}</p>
          <p className="text-sm text-[#525252] mt-2 whitespace-pre-wrap">{dire.contenu}</p>
        </div>

        {/* Réponse */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
            Votre réponse
          </label>
          <textarea
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
            placeholder="Rédigez votre réponse à ce dire...

L'expert répond que...

Cette réponse sera intégrée dans le rapport final."
          />
        </div>

        {/* Info */}
        <div className="p-3 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Cette réponse sera intégrée dans le rapport final. Vous devez répondre de manière motivée à chaque dire.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            icon={Check}
            className="flex-1"
            onClick={() => onSave(reponse)}
            disabled={!reponse.trim()}
          >
            Valider la réponse
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

export default GestionDires;
