// ============================================================================
// CRM EXPERT JUDICIAIRE - GESTION DES CONSIGNATIONS
// Suivi des provisions et consignations complémentaires
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Euro, Plus, Check, Clock, AlertTriangle, Send, FileText,
  TrendingUp, Calendar, Banknote, PiggyBank, ChevronRight,
  RefreshCw, Mail, Download, Eye, Trash2, Edit
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// CONSTANTES
// ============================================================================

const STATUTS_CONSIGNATION = [
  { id: 'demandee', label: 'Demandée', color: 'blue', icon: Send },
  { id: 'accordee', label: 'Accordée', color: 'amber', icon: Check },
  { id: 'versee', label: 'Versée', color: 'green', icon: Banknote },
  { id: 'refusee', label: 'Refusée', color: 'red', icon: AlertTriangle }
];

// ============================================================================
// COMPOSANT: Carte de consignation
// ============================================================================

const ConsignationCard = ({ consignation, numero, onEdit, onDelete }) => {
  const statut = STATUTS_CONSIGNATION.find(s => s.id === consignation.statut) || STATUTS_CONSIGNATION[0];
  const StatusIcon = statut.icon;

  const joursAttente = consignation.date_demande && consignation.statut !== 'versee'
    ? Math.floor((new Date() - new Date(consignation.date_demande)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className={`p-4 border-l-4 ${
      consignation.statut === 'versee' ? 'border-l-green-500' :
      consignation.statut === 'refusee' ? 'border-l-red-500' :
      consignation.statut === 'accordee' ? 'border-l-amber-500' :
      'border-l-blue-500'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            consignation.statut === 'versee' ? 'bg-green-100' :
            consignation.statut === 'refusee' ? 'bg-red-100' :
            consignation.statut === 'accordee' ? 'bg-amber-100' :
            'bg-blue-100'
          }`}>
            <StatusIcon className={`w-5 h-5 ${
              consignation.statut === 'versee' ? 'text-green-600' :
              consignation.statut === 'refusee' ? 'text-red-600' :
              consignation.statut === 'accordee' ? 'text-amber-600' :
              'text-blue-600'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-[#1a1a1a]">
                {numero === 0 ? 'Provision initiale' : `Consignation n°${numero}`}
              </h4>
              <Badge variant={statut.color}>{statut.label}</Badge>
            </div>
            <p className="text-2xl font-light text-[#1a1a1a] mt-1">
              {parseFloat(consignation.montant || 0).toLocaleString('fr-FR')} €
            </p>

            {/* Dates */}
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-[#737373]">
              {consignation.date_demande && (
                <span className="flex items-center gap-1">
                  <Send className="w-3 h-3" />
                  Demandée le {formatDateFr(consignation.date_demande)}
                </span>
              )}
              {consignation.date_ordonnance && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Ordonnance du {formatDateFr(consignation.date_ordonnance)}
                </span>
              )}
              {consignation.date_reception && (
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="w-3 h-3" />
                  Reçue le {formatDateFr(consignation.date_reception)}
                </span>
              )}
            </div>

            {/* Alerte délai */}
            {joursAttente && joursAttente > 30 && (
              <div className="mt-2 px-2 py-1 bg-amber-50 rounded text-xs text-amber-700 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                En attente depuis {joursAttente} jours
              </div>
            )}

            {/* Motif si refusée */}
            {consignation.statut === 'refusee' && consignation.motif_refus && (
              <p className="mt-2 text-sm text-red-600">
                Motif : {consignation.motif_refus}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(consignation)}
            className="p-2 text-[#737373] hover:text-[#c9a227] hover:bg-[#faf8f3] rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          {numero > 0 && (
            <button
              onClick={() => onDelete(consignation)}
              className="p-2 text-[#737373] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Modal ajout/édition consignation
// ============================================================================

const ModalConsignation = ({ isOpen, onClose, onSave, consignation, isProvision }) => {
  const [formData, setFormData] = useState({
    montant: consignation?.montant || '',
    statut: consignation?.statut || 'demandee',
    date_demande: consignation?.date_demande || new Date().toISOString().split('T')[0],
    date_ordonnance: consignation?.date_ordonnance || '',
    date_reception: consignation?.date_reception || '',
    motif: consignation?.motif || '',
    motif_refus: consignation?.motif_refus || ''
  });

  const handleSubmit = () => {
    if (!formData.montant) return;
    onSave({
      ...consignation,
      ...formData,
      montant: parseFloat(formData.montant)
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={isProvision ? 'Provision initiale' : consignation?.id ? 'Modifier la consignation' : 'Nouvelle consignation'}
      size="md"
    >
      <div className="space-y-4">
        {/* Montant */}
        <Input
          label="Montant (€)"
          type="number"
          value={formData.montant}
          onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
          placeholder="Ex: 3000"
          required
        />

        {/* Statut */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
            Statut
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STATUTS_CONSIGNATION.map(statut => {
              const Icon = statut.icon;
              return (
                <button
                  key={statut.id}
                  onClick={() => setFormData({ ...formData, statut: statut.id })}
                  className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-colors ${
                    formData.statut === statut.id
                      ? 'border-[#c9a227] bg-[#faf8f3]'
                      : 'border-[#e5e5e5] hover:border-[#c9a227]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${
                    statut.id === 'versee' ? 'text-green-600' :
                    statut.id === 'refusee' ? 'text-red-600' :
                    statut.id === 'accordee' ? 'text-amber-600' :
                    'text-blue-600'
                  }`} />
                  <span className="text-sm font-medium">{statut.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date demande */}
        <Input
          label="Date de demande"
          type="date"
          value={formData.date_demande}
          onChange={(e) => setFormData({ ...formData, date_demande: e.target.value })}
        />

        {/* Date ordonnance si accordée */}
        {(formData.statut === 'accordee' || formData.statut === 'versee') && (
          <Input
            label="Date de l'ordonnance"
            type="date"
            value={formData.date_ordonnance}
            onChange={(e) => setFormData({ ...formData, date_ordonnance: e.target.value })}
          />
        )}

        {/* Date réception si versée */}
        {formData.statut === 'versee' && (
          <Input
            label="Date de réception"
            type="date"
            value={formData.date_reception}
            onChange={(e) => setFormData({ ...formData, date_reception: e.target.value })}
          />
        )}

        {/* Motif de la demande */}
        {!isProvision && (
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
              Motif de la demande
            </label>
            <textarea
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] text-sm"
              placeholder="Ex: Complexité technique, besoin de sapiteur..."
            />
          </div>
        )}

        {/* Motif de refus */}
        {formData.statut === 'refusee' && (
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
              Motif du refus
            </label>
            <textarea
              value={formData.motif_refus}
              onChange={(e) => setFormData({ ...formData, motif_refus: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] text-sm"
              placeholder="Motif du refus du juge..."
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!formData.montant}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL: Gestion des consignations
// ============================================================================

export const GestionConsignations = ({ affaire, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingConsignation, setEditingConsignation] = useState(null);
  const [isProvision, setIsProvision] = useState(false);

  // Préparer les données
  const provision = useMemo(() => ({
    id: 'provision',
    montant: affaire.provision_montant || 0,
    statut: affaire.provision_recue ? 'versee' : (affaire.date_ordonnance ? 'accordee' : 'demandee'),
    date_demande: affaire.date_ordonnance,
    date_ordonnance: affaire.date_ordonnance,
    date_reception: affaire.provision_date_reception
  }), [affaire]);

  const consignations = affaire.consignations_supplementaires || [];

  // Calculs
  const totaux = useMemo(() => {
    const provisionMontant = parseFloat(affaire.provision_montant) || 0;
    const provisionRecue = affaire.provision_recue ? provisionMontant : 0;

    const consignationsTotal = consignations.reduce(
      (sum, c) => sum + (parseFloat(c.montant) || 0), 0
    );
    const consignationsRecues = consignations
      .filter(c => c.statut === 'versee')
      .reduce((sum, c) => sum + (parseFloat(c.montant) || 0), 0);

    return {
      totalDemande: provisionMontant + consignationsTotal,
      totalRecu: provisionRecue + consignationsRecues,
      enAttente: (provisionMontant + consignationsTotal) - (provisionRecue + consignationsRecues)
    };
  }, [affaire, consignations]);

  // Ouvrir modal pour nouvelle consignation
  const handleAddConsignation = () => {
    setEditingConsignation(null);
    setIsProvision(false);
    setShowModal(true);
  };

  // Ouvrir modal pour édition
  const handleEditConsignation = (consignation) => {
    setEditingConsignation(consignation);
    setIsProvision(consignation.id === 'provision');
    setShowModal(true);
  };

  // Sauvegarder consignation
  const handleSaveConsignation = (data) => {
    if (isProvision || editingConsignation?.id === 'provision') {
      // Mettre à jour la provision principale
      onUpdate({
        provision_montant: data.montant,
        provision_recue: data.statut === 'versee',
        provision_date_reception: data.date_reception
      });
    } else if (editingConsignation) {
      // Modifier une consignation existante
      const updatedConsignations = consignations.map(c =>
        c.id === editingConsignation.id ? { ...c, ...data } : c
      );
      onUpdate({ consignations_supplementaires: updatedConsignations });
    } else {
      // Ajouter nouvelle consignation
      const newConsignation = {
        ...data,
        id: Date.now().toString(),
        numero: consignations.length + 1
      };
      onUpdate({
        consignations_supplementaires: [...consignations, newConsignation]
      });
    }
  };

  // Supprimer consignation
  const handleDeleteConsignation = (consignation) => {
    if (confirm('Supprimer cette consignation ?')) {
      const updatedConsignations = consignations.filter(c => c.id !== consignation.id);
      onUpdate({ consignations_supplementaires: updatedConsignations });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a]">Consignations</h2>
          <p className="text-sm text-[#737373]">
            Suivi des provisions et consignations complémentaires
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleAddConsignation}>
          Demander une consignation
        </Button>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Euro className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#737373] uppercase">Total demandé</p>
              <p className="text-2xl font-light text-[#1a1a1a]">
                {totaux.totalDemande.toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#737373] uppercase">Total reçu</p>
              <p className="text-2xl font-light text-[#1a1a1a]">
                {totaux.totalRecu.toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 bg-gradient-to-br ${totaux.enAttente > 0 ? 'from-amber-50' : 'from-green-50'} to-white`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${totaux.enAttente > 0 ? 'bg-amber-500' : 'bg-green-500'} rounded-xl flex items-center justify-center`}>
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#737373] uppercase">En attente</p>
              <p className="text-2xl font-light text-[#1a1a1a]">
                {totaux.enAttente.toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Barre de progression */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#737373]">Taux de recouvrement</span>
          <span className="text-sm font-medium">
            {totaux.totalDemande > 0
              ? Math.round((totaux.totalRecu / totaux.totalDemande) * 100)
              : 0}%
          </span>
        </div>
        <div className="h-3 bg-[#e5e5e5] rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${totaux.totalDemande > 0 ? (totaux.totalRecu / totaux.totalDemande) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#a3a3a3] mt-1">
          <span>{totaux.totalRecu.toLocaleString('fr-FR')} € reçus</span>
          <span>{totaux.totalDemande.toLocaleString('fr-FR')} € demandés</span>
        </div>
      </Card>

      {/* Liste des consignations */}
      <div className="space-y-4">
        {/* Provision initiale */}
        <ConsignationCard
          consignation={provision}
          numero={0}
          onEdit={handleEditConsignation}
          onDelete={() => {}}
        />

        {/* Consignations complémentaires */}
        {consignations.map((consignation, index) => (
          <ConsignationCard
            key={consignation.id}
            consignation={consignation}
            numero={index + 1}
            onEdit={handleEditConsignation}
            onDelete={handleDeleteConsignation}
          />
        ))}
      </div>

      {/* Conseil si pas de consignation supplémentaire */}
      {consignations.length === 0 && totaux.totalRecu > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Consignation complémentaire
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Si les opérations d'expertise s'avèrent plus complexes que prévu,
                vous pouvez demander une consignation complémentaire au juge.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Modal */}
      <ModalConsignation
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveConsignation}
        consignation={editingConsignation}
        isProvision={isProvision}
      />
    </div>
  );
};

export default GestionConsignations;
