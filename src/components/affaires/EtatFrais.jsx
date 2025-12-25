// ============================================================================
// CRM EXPERT JUDICIAIRE - ÉTAT DE FRAIS
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  Calculator, Plus, Trash2, Save, Download, Copy, Eye, Edit,
  Clock, Car, FileText, Euro, Receipt, AlertTriangle, CheckCircle,
  Printer, Send, PiggyBank, TrendingUp
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// CONSTANTES
// ============================================================================

const TAUX_TVA = 0.20;

const TYPES_HONORAIRES = [
  { id: 'etude', label: 'Étude du dossier', tauxHoraire: 90 },
  { id: 'reunion', label: 'Réunion d\'expertise', tauxHoraire: 120 },
  { id: 'redaction', label: 'Rédaction de rapport', tauxHoraire: 90 },
  { id: 'deplacement', label: 'Temps de déplacement', tauxHoraire: 60 },
  { id: 'recherche', label: 'Recherches documentaires', tauxHoraire: 75 },
  { id: 'correspondance', label: 'Correspondances', tauxHoraire: 60 }
];

const TYPES_FRAIS = [
  { id: 'km', label: 'Frais kilométriques', unite: 'km', tauxUnitaire: 0.50 },
  { id: 'peage', label: 'Péages', unite: '€', tauxUnitaire: 1 },
  { id: 'parking', label: 'Parking', unite: '€', tauxUnitaire: 1 },
  { id: 'train', label: 'Train/Transport', unite: '€', tauxUnitaire: 1 },
  { id: 'repas', label: 'Frais de repas', unite: '€', tauxUnitaire: 1 },
  { id: 'hotel', label: 'Hébergement', unite: '€', tauxUnitaire: 1 },
  { id: 'copies', label: 'Copies/Impressions', unite: '€', tauxUnitaire: 1 },
  { id: 'courrier', label: 'Frais postaux', unite: '€', tauxUnitaire: 1 },
  { id: 'autre', label: 'Autres frais', unite: '€', tauxUnitaire: 1 }
];

// ============================================================================
// COMPOSANT: Ligne d'honoraires
// ============================================================================

const LigneHonoraire = ({ ligne, index, onUpdate, onDelete }) => {
  const montant = (ligne.heures || 0) * (ligne.tauxHoraire || 0);

  return (
    <tr className="border-b border-[#e5e5e5] hover:bg-[#EFF6FF]">
      <td className="py-3 px-2">
        <input
          type="date"
          value={ligne.date || ''}
          onChange={(e) => onUpdate(index, 'date', e.target.value)}
          className="w-full px-2 py-1 border border-[#e5e5e5] rounded text-sm"
        />
      </td>
      <td className="py-3 px-2">
        <select
          value={ligne.type || ''}
          onChange={(e) => {
            const type = TYPES_HONORAIRES.find(t => t.id === e.target.value);
            onUpdate(index, 'type', e.target.value);
            if (type) onUpdate(index, 'tauxHoraire', type.tauxHoraire);
          }}
          className="w-full px-2 py-1 border border-[#e5e5e5] rounded text-sm"
        >
          <option value="">Sélectionner...</option>
          {TYPES_HONORAIRES.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </td>
      <td className="py-3 px-2">
        <input
          type="text"
          value={ligne.description || ''}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          placeholder="Description..."
          className="w-full px-2 py-1 border border-[#e5e5e5] rounded text-sm"
        />
      </td>
      <td className="py-3 px-2 text-center">
        <input
          type="number"
          value={ligne.heures || ''}
          onChange={(e) => onUpdate(index, 'heures', parseFloat(e.target.value) || 0)}
          step="0.5"
          min="0"
          className="w-20 px-2 py-1 border border-[#e5e5e5] rounded text-sm text-center"
        />
      </td>
      <td className="py-3 px-2 text-center">
        <input
          type="number"
          value={ligne.tauxHoraire || ''}
          onChange={(e) => onUpdate(index, 'tauxHoraire', parseFloat(e.target.value) || 0)}
          step="5"
          min="0"
          className="w-20 px-2 py-1 border border-[#e5e5e5] rounded text-sm text-center"
        />
      </td>
      <td className="py-3 px-2 text-right font-medium">
        {montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
      </td>
      <td className="py-3 px-2 text-center">
        <button
          onClick={() => onDelete(index)}
          className="p-1 text-red-500 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

// ============================================================================
// COMPOSANT: Ligne de frais
// ============================================================================

const LigneFrais = ({ ligne, index, onUpdate, onDelete }) => {
  const typeFrais = TYPES_FRAIS.find(t => t.id === ligne.type);
  const montant = (ligne.quantite || 0) * (ligne.tauxUnitaire || 0);

  return (
    <tr className="border-b border-[#e5e5e5] hover:bg-[#EFF6FF]">
      <td className="py-3 px-2">
        <input
          type="date"
          value={ligne.date || ''}
          onChange={(e) => onUpdate(index, 'date', e.target.value)}
          className="w-full px-2 py-1 border border-[#e5e5e5] rounded text-sm"
        />
      </td>
      <td className="py-3 px-2">
        <select
          value={ligne.type || ''}
          onChange={(e) => {
            const type = TYPES_FRAIS.find(t => t.id === e.target.value);
            onUpdate(index, 'type', e.target.value);
            if (type) onUpdate(index, 'tauxUnitaire', type.tauxUnitaire);
          }}
          className="w-full px-2 py-1 border border-[#e5e5e5] rounded text-sm"
        >
          <option value="">Sélectionner...</option>
          {TYPES_FRAIS.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </td>
      <td className="py-3 px-2">
        <input
          type="text"
          value={ligne.description || ''}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          placeholder="Détail..."
          className="w-full px-2 py-1 border border-[#e5e5e5] rounded text-sm"
        />
      </td>
      <td className="py-3 px-2 text-center">
        <div className="flex items-center justify-center gap-1">
          <input
            type="number"
            value={ligne.quantite || ''}
            onChange={(e) => onUpdate(index, 'quantite', parseFloat(e.target.value) || 0)}
            step="1"
            min="0"
            className="w-16 px-2 py-1 border border-[#e5e5e5] rounded text-sm text-center"
          />
          <span className="text-xs text-[#737373]">{typeFrais?.unite || ''}</span>
        </div>
      </td>
      <td className="py-3 px-2 text-center">
        <input
          type="number"
          value={ligne.tauxUnitaire || ''}
          onChange={(e) => onUpdate(index, 'tauxUnitaire', parseFloat(e.target.value) || 0)}
          step="0.01"
          min="0"
          className="w-20 px-2 py-1 border border-[#e5e5e5] rounded text-sm text-center"
        />
      </td>
      <td className="py-3 px-2 text-right font-medium">
        {montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
      </td>
      <td className="py-3 px-2 text-center">
        <button
          onClick={() => onDelete(index)}
          className="p-1 text-red-500 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

// ============================================================================
// COMPOSANT: État de frais complet
// ============================================================================

export const EtatFrais = ({ affaire, onSave, onClose }) => {
  // États
  const [honoraires, setHonoraires] = useState(affaire.etat_frais?.honoraires || []);
  const [frais, setFrais] = useState(affaire.etat_frais?.frais || []);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTaxationModal, setShowTaxationModal] = useState(false);

  // Ajouter une ligne d'honoraires
  const addHonoraire = useCallback(() => {
    setHonoraires(prev => [...prev, {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: '',
      description: '',
      heures: 0,
      tauxHoraire: 90
    }]);
  }, []);

  // Ajouter une ligne de frais
  const addFrais = useCallback(() => {
    setFrais(prev => [...prev, {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: '',
      description: '',
      quantite: 0,
      tauxUnitaire: 1
    }]);
  }, []);

  // Mettre à jour une ligne d'honoraires
  const updateHonoraire = useCallback((index, field, value) => {
    setHonoraires(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  // Mettre à jour une ligne de frais
  const updateFrais = useCallback((index, field, value) => {
    setFrais(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  // Supprimer une ligne
  const deleteHonoraire = useCallback((index) => {
    setHonoraires(prev => prev.filter((_, i) => i !== index));
  }, []);

  const deleteFrais = useCallback((index) => {
    setFrais(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Calculs
  const totaux = useMemo(() => {
    const totalHonorairesHT = honoraires.reduce((sum, h) =>
      sum + (h.heures || 0) * (h.tauxHoraire || 0), 0
    );
    const totalFraisHT = frais.reduce((sum, f) =>
      sum + (f.quantite || 0) * (f.tauxUnitaire || 0), 0
    );
    const totalHT = totalHonorairesHT + totalFraisHT;
    const tva = totalHT * TAUX_TVA;
    const totalTTC = totalHT + tva;

    // Provisions reçues
    const provisionsRecues = parseFloat(affaire.provision_montant || 0) +
      (affaire.consignations_supplementaires?.reduce((sum, c) => sum + parseFloat(c.montant || 0), 0) || 0);

    const solde = totalTTC - provisionsRecues;

    const totalHeures = honoraires.reduce((sum, h) => sum + (h.heures || 0), 0);

    return {
      totalHonorairesHT,
      totalFraisHT,
      totalHT,
      tva,
      totalTTC,
      provisionsRecues,
      solde,
      totalHeures
    };
  }, [honoraires, frais, affaire]);

  // Importer les temps depuis les réunions
  const importerReunions = useCallback(() => {
    const reunions = affaire.reunions || [];
    const nouveauxHonoraires = reunions.map(r => ({
      id: Date.now() + Math.random(),
      date: r.date_reunion,
      type: 'reunion',
      description: `Réunion n°${r.numero} - ${r.lieu || 'Sur site'}`,
      heures: r.duree_heures || 2,
      tauxHoraire: 120
    }));
    setHonoraires(prev => [...prev, ...nouveauxHonoraires]);
  }, [affaire.reunions]);

  // Importer les temps depuis le chronomètre
  const importerChronometre = useCallback(() => {
    const tempsTotal = affaire.temps_total_minutes || 0;
    const heures = Math.round(tempsTotal / 60 * 10) / 10;
    if (heures > 0) {
      setHonoraires(prev => [...prev, {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        type: 'etude',
        description: 'Temps enregistré (chronomètre)',
        heures: heures,
        tauxHoraire: 90
      }]);
    }
  }, [affaire.temps_total_minutes]);

  // Générer le document
  const generateDocument = () => {
    let doc = `╔══════════════════════════════════════════════════════════════════════════════╗
║                              ÉTAT DE FRAIS                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

AFFAIRE : ${affaire.reference}
TRIBUNAL : ${affaire.tribunal}
RG : ${affaire.rg}
DATE : ${new Date().toLocaleDateString('fr-FR')}

════════════════════════════════════════════════════════════════════════════════
                                 HONORAIRES
════════════════════════════════════════════════════════════════════════════════

`;

    honoraires.forEach(h => {
      const montant = (h.heures || 0) * (h.tauxHoraire || 0);
      const typeLabel = TYPES_HONORAIRES.find(t => t.id === h.type)?.label || h.type;
      doc += `${h.date ? formatDateFr(h.date) : '---'} | ${typeLabel}\n`;
      doc += `           ${h.description || ''}\n`;
      doc += `           ${h.heures}h × ${h.tauxHoraire} €/h = ${montant.toLocaleString('fr-FR')} €\n\n`;
    });

    doc += `────────────────────────────────────────────────────────────────────────────────
TOTAL HONORAIRES HT : ${totaux.totalHonorairesHT.toLocaleString('fr-FR')} €
Total heures : ${totaux.totalHeures}h

════════════════════════════════════════════════════════════════════════════════
                                   FRAIS
════════════════════════════════════════════════════════════════════════════════

`;

    frais.forEach(f => {
      const montant = (f.quantite || 0) * (f.tauxUnitaire || 0);
      const typeLabel = TYPES_FRAIS.find(t => t.id === f.type)?.label || f.type;
      doc += `${f.date ? formatDateFr(f.date) : '---'} | ${typeLabel}\n`;
      doc += `           ${f.description || ''}\n`;
      doc += `           ${f.quantite} × ${f.tauxUnitaire} € = ${montant.toLocaleString('fr-FR')} €\n\n`;
    });

    doc += `────────────────────────────────────────────────────────────────────────────────
TOTAL FRAIS HT : ${totaux.totalFraisHT.toLocaleString('fr-FR')} €

════════════════════════════════════════════════════════════════════════════════
                               RÉCAPITULATIF
════════════════════════════════════════════════════════════════════════════════

Total Honoraires HT ............... ${totaux.totalHonorairesHT.toLocaleString('fr-FR')} €
Total Frais HT .................... ${totaux.totalFraisHT.toLocaleString('fr-FR')} €
────────────────────────────────────────────────────────────────────────────────
TOTAL HT .......................... ${totaux.totalHT.toLocaleString('fr-FR')} €
TVA 20% ........................... ${totaux.tva.toLocaleString('fr-FR')} €
────────────────────────────────────────────────────────────────────────────────
TOTAL TTC ......................... ${totaux.totalTTC.toLocaleString('fr-FR')} €

Provisions reçues ................. ${totaux.provisionsRecues.toLocaleString('fr-FR')} €
────────────────────────────────────────────────────────────────────────────────
SOLDE ${totaux.solde >= 0 ? 'À PERCEVOIR' : 'À REMBOURSER'} ............... ${Math.abs(totaux.solde).toLocaleString('fr-FR')} €

════════════════════════════════════════════════════════════════════════════════

L'Expert Judiciaire
`;

    return doc;
  };

  // Sauvegarder
  const handleSave = async () => {
    setSaving(true);
    await onSave({
      etat_frais: {
        honoraires,
        frais,
        totaux,
        date_maj: new Date().toISOString()
      }
    });
    setSaving(false);
  };

  // Demander la taxation
  const handleTaxation = async () => {
    await onSave({
      etat_frais: {
        honoraires,
        frais,
        totaux,
        date_maj: new Date().toISOString()
      },
      taxation_demandee: true,
      taxation_date_demande: new Date().toISOString(),
      taxation_montant_demande: totaux.totalTTC
    });
    setShowTaxationModal(false);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a]">État de frais</h2>
          <p className="text-sm text-[#737373]">
            Calcul des honoraires et frais d'expertise
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={previewMode ? Edit : Eye}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Éditer' : 'Aperçu'}
          </Button>

          <Button
            variant="secondary"
            icon={Copy}
            onClick={() => navigator.clipboard.writeText(generateDocument())}
          >
            Copier
          </Button>

          <Button
            variant="secondary"
            icon={Download}
          >
            Exporter
          </Button>

          <Button
            variant="primary"
            icon={Save}
            onClick={handleSave}
            loading={saving}
          >
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#737373] uppercase">Heures</p>
              <p className="text-xl font-light text-[#1a1a1a]">{totaux.totalHeures}h</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Euro className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#737373] uppercase">Total TTC</p>
              <p className="text-xl font-light text-[#1a1a1a]">
                {totaux.totalTTC.toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#737373] uppercase">Provisions</p>
              <p className="text-xl font-light text-[#1a1a1a]">
                {totaux.provisionsRecues.toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 bg-gradient-to-br ${totaux.solde >= 0 ? 'from-purple-50' : 'from-red-50'} to-white`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${totaux.solde >= 0 ? 'bg-purple-500' : 'bg-red-500'} rounded-xl flex items-center justify-center`}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[#737373] uppercase">
                {totaux.solde >= 0 ? 'À percevoir' : 'À rembourser'}
              </p>
              <p className="text-xl font-light text-[#1a1a1a]">
                {Math.abs(totaux.solde).toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </Card>
      </div>

      {previewMode ? (
        <Card className="p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm text-[#525252]">
            {generateDocument()}
          </pre>
        </Card>
      ) : (
        <>
          {/* Section Honoraires */}
          <Card className="overflow-hidden">
            <div className="p-4 bg-[#EFF6FF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#2563EB]" />
                <div>
                  <h3 className="font-medium text-[#1a1a1a]">Honoraires</h3>
                  <p className="text-xs text-[#737373]">
                    Total : {totaux.totalHonorairesHT.toLocaleString('fr-FR')} € HT
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {affaire.reunions?.length > 0 && (
                  <Button variant="secondary" size="sm" onClick={importerReunions}>
                    Importer réunions
                  </Button>
                )}
                {affaire.temps_total_minutes > 0 && (
                  <Button variant="secondary" size="sm" onClick={importerChronometre}>
                    Importer chrono
                  </Button>
                )}
                <Button variant="primary" size="sm" icon={Plus} onClick={addHonoraire}>
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f5f5f5] text-xs text-[#737373] uppercase">
                  <tr>
                    <th className="py-2 px-2 text-left w-32">Date</th>
                    <th className="py-2 px-2 text-left w-40">Type</th>
                    <th className="py-2 px-2 text-left">Description</th>
                    <th className="py-2 px-2 text-center w-24">Heures</th>
                    <th className="py-2 px-2 text-center w-24">Taux €/h</th>
                    <th className="py-2 px-2 text-right w-28">Montant</th>
                    <th className="py-2 px-2 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {honoraires.map((ligne, index) => (
                    <LigneHonoraire
                      key={ligne.id || index}
                      ligne={ligne}
                      index={index}
                      onUpdate={updateHonoraire}
                      onDelete={deleteHonoraire}
                    />
                  ))}
                  {honoraires.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#a3a3a3]">
                        Aucun honoraire enregistré
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Section Frais */}
          <Card className="overflow-hidden">
            <div className="p-4 bg-[#EFF6FF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-[#2563EB]" />
                <div>
                  <h3 className="font-medium text-[#1a1a1a]">Frais</h3>
                  <p className="text-xs text-[#737373]">
                    Total : {totaux.totalFraisHT.toLocaleString('fr-FR')} € HT
                  </p>
                </div>
              </div>
              <Button variant="primary" size="sm" icon={Plus} onClick={addFrais}>
                Ajouter
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f5f5f5] text-xs text-[#737373] uppercase">
                  <tr>
                    <th className="py-2 px-2 text-left w-32">Date</th>
                    <th className="py-2 px-2 text-left w-40">Type</th>
                    <th className="py-2 px-2 text-left">Description</th>
                    <th className="py-2 px-2 text-center w-24">Quantité</th>
                    <th className="py-2 px-2 text-center w-24">Prix unit.</th>
                    <th className="py-2 px-2 text-right w-28">Montant</th>
                    <th className="py-2 px-2 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {frais.map((ligne, index) => (
                    <LigneFrais
                      key={ligne.id || index}
                      ligne={ligne}
                      index={index}
                      onUpdate={updateFrais}
                      onDelete={deleteFrais}
                    />
                  ))}
                  {frais.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#a3a3a3]">
                        Aucun frais enregistré
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Récapitulatif */}
          <Card className="p-6">
            <h3 className="font-medium text-[#1a1a1a] mb-4">Récapitulatif</h3>

            <div className="space-y-2 max-w-md">
              <div className="flex justify-between">
                <span className="text-[#737373]">Total Honoraires HT</span>
                <span className="font-medium">{totaux.totalHonorairesHT.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Total Frais HT</span>
                <span className="font-medium">{totaux.totalFraisHT.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="border-t border-[#e5e5e5] pt-2 flex justify-between">
                <span className="text-[#737373]">Total HT</span>
                <span className="font-medium">{totaux.totalHT.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">TVA (20%)</span>
                <span className="font-medium">{totaux.tva.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="border-t border-[#e5e5e5] pt-2 flex justify-between text-lg">
                <span className="font-medium text-[#1a1a1a]">Total TTC</span>
                <span className="font-bold text-[#2563EB]">{totaux.totalTTC.toLocaleString('fr-FR')} €</span>
              </div>

              <div className="border-t border-[#e5e5e5] pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="text-[#737373]">Provisions reçues</span>
                  <span className="font-medium text-green-600">- {totaux.provisionsRecues.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between mt-2 text-lg">
                  <span className="font-medium text-[#1a1a1a]">
                    {totaux.solde >= 0 ? 'Solde à percevoir' : 'Solde à rembourser'}
                  </span>
                  <span className={`font-bold ${totaux.solde >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    {Math.abs(totaux.solde).toLocaleString('fr-FR')} €
                  </span>
                </div>
              </div>
            </div>

            {/* Action taxation */}
            {affaire.statut === 'termine' && !affaire.taxation_demandee && (
              <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
                <Button
                  variant="primary"
                  icon={Send}
                  onClick={() => setShowTaxationModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Demander la taxation
                </Button>
                <p className="text-xs text-[#737373] mt-2">
                  Soumettre l'état de frais au tribunal pour validation
                </p>
              </div>
            )}

            {affaire.taxation_demandee && (
              <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
                <Badge variant="success" className="flex items-center gap-1 w-fit">
                  <CheckCircle className="w-3 h-3" />
                  Taxation demandée le {affaire.taxation_date_demande ? formatDateFr(affaire.taxation_date_demande) : '---'}
                </Badge>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Modal de taxation */}
      {showTaxationModal && (
        <ModalBase
          isOpen={true}
          onClose={() => setShowTaxationModal(false)}
          title="Demande de taxation"
          size="md"
        >
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800">
                Vous êtes sur le point de soumettre votre état de frais au tribunal pour taxation.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#737373]">Montant demandé TTC</span>
                <span className="font-bold text-[#2563EB]">{totaux.totalTTC.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Provisions reçues</span>
                <span className="font-medium">{totaux.provisionsRecues.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between border-t border-[#e5e5e5] pt-2">
                <span className="text-[#737373]">Solde à percevoir</span>
                <span className="font-bold text-purple-600">{Math.abs(totaux.solde).toLocaleString('fr-FR')} €</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowTaxationModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                icon={Send}
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleTaxation}
              >
                Confirmer la demande
              </Button>
            </div>
          </div>
        </ModalBase>
      )}
    </div>
  );
};

export default EtatFrais;
