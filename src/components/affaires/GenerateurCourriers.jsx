import React, { useState, useMemo, useCallback } from 'react';
import {
  FileText, Mail, Send, Eye, Download, Plus, Edit2, Trash2,
  Copy, Printer, Clock, CheckCircle, AlertCircle, Calendar,
  User, Building, Euro, FileCheck, ChevronDown, ChevronUp,
  RefreshCw, Save, X, Check, Info
} from 'lucide-react';
import { Card, Badge, Button, ModalBase, useToast } from '../ui';

// Types de courriers avec leurs templates
const TYPES_COURRIERS = [
  {
    id: 'demande_consignation',
    label: 'Demande de consignation',
    icon: Euro,
    color: 'green',
    description: 'Demander le versement de la consignation aux parties',
    destinataires: 'parties',
    template: `Madame, Monsieur,

Par ordonnance en date du {{affaire.date_ordonnance}}, le {{affaire.juridiction}} m'a désigné en qualité d'expert judiciaire dans le litige vous opposant à {{parties.adverses}}.

Conformément aux dispositions de l'article 269 du Code de procédure civile, je vous informe que la provision à valoir sur mes honoraires et frais d'expertise a été fixée à la somme de {{consignation.montant}} €.

Cette somme doit être consignée entre les mains du Régisseur du {{affaire.juridiction}} dans un délai de {{consignation.delai}} à compter de la présente.

Je vous précise que le défaut de consignation dans le délai imparti peut entraîner la caducité de ma désignation, conformément à l'article 271 du Code de procédure civile.

Je vous prie de bien vouloir m'adresser copie du justificatif de ce versement dès que celui-ci sera effectué.

Dans l'attente, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{expert.nom}}
Expert {{expert.specialite}}
{{expert.adresse}}`
  },
  {
    id: 'demande_prorogation',
    label: 'Demande de prorogation',
    icon: Calendar,
    color: 'orange',
    description: 'Demander une prolongation du délai au magistrat',
    destinataires: 'juridiction',
    template: `Madame, Monsieur le Juge,

Désigné en qualité d'expert dans l'affaire référencée {{affaire.reference}} (RG {{affaire.rg}}), je me permets de solliciter une prorogation du délai qui m'a été imparti pour le dépôt de mon rapport.

Le délai initial fixé au {{affaire.date_limite}} ne peut être respecté pour les raisons suivantes :
{{prorogation.motifs}}

En conséquence, j'ai l'honneur de solliciter une prorogation de {{prorogation.duree}} mois, soit jusqu'au {{prorogation.nouvelle_date}}.

Je reste bien entendu à votre disposition pour tout renseignement complémentaire.

Je vous prie d'agréer, Madame, Monsieur le Juge, l'expression de ma haute considération.

{{expert.nom}}
Expert {{expert.specialite}}`
  },
  {
    id: 'demande_pieces',
    label: 'Demande de pièces',
    icon: FileCheck,
    color: 'blue',
    description: 'Demander des documents aux parties',
    destinataires: 'parties',
    template: `Madame, Monsieur,

Dans le cadre de l'expertise judiciaire me concernant (Référence : {{affaire.reference}} - RG : {{affaire.rg}}), je vous prie de bien vouloir me communiquer les documents suivants :

{{pieces.liste}}

Ces pièces sont nécessaires à l'accomplissement de ma mission d'expertise et doivent me parvenir dans un délai de {{pieces.delai}} jours à compter de la présente.

Je vous rappelle que, conformément à l'article 275 du Code de procédure civile, les parties sont tenues de communiquer à l'expert tous documents utiles à l'accomplissement de sa mission.

À défaut de communication dans le délai imparti, j'en tirerai toutes conséquences utiles dans mon rapport.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{expert.nom}}
Expert {{expert.specialite}}`
  },
  {
    id: 'note_parties',
    label: 'Note aux parties',
    icon: FileText,
    color: 'purple',
    description: 'Communication générale aux parties',
    destinataires: 'parties',
    template: `NOTE AUX PARTIES N°{{note.numero}}

Affaire : {{affaire.reference}}
RG : {{affaire.rg}}

Madame, Monsieur,

{{note.contenu}}

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{expert.nom}}
Expert {{expert.specialite}}
Le {{date.jour}}`
  },
  {
    id: 'envoi_pre_rapport',
    label: 'Envoi du pré-rapport',
    icon: Send,
    color: 'indigo',
    description: 'Accompagner l\'envoi du pré-rapport aux parties',
    destinataires: 'parties',
    template: `Madame, Monsieur,

Vous trouverez ci-joint le pré-rapport établi dans le cadre de l'expertise judiciaire référencée {{affaire.reference}} (RG : {{affaire.rg}}).

Conformément à l'article 276 du Code de procédure civile, je vous invite à me faire part de vos observations éventuelles dans un délai de {{pre_rapport.delai_dires}} jours à compter de la réception du présent envoi.

Je vous rappelle que :
- Vos observations doivent être argumentées et documentées
- Tout nouveau dire devra être communiqué simultanément à l'ensemble des parties
- À l'expiration du délai, je procéderai à la rédaction du rapport définitif

En l'absence d'observations de votre part dans le délai imparti, je considérerai que vous n'avez pas de remarques à formuler.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{expert.nom}}
Expert {{expert.specialite}}`
  },
  {
    id: 'accuse_reception_dires',
    label: 'Accusé de réception des dires',
    icon: CheckCircle,
    color: 'teal',
    description: 'Accuser réception des dires des parties',
    destinataires: 'parties',
    template: `Madame, Monsieur,

J'accuse réception de votre dire en date du {{dire.date}}, enregistré sous le numéro {{dire.numero}}.

{{#if dire.pieces_jointes}}
Les pièces jointes suivantes ont bien été reçues :
{{dire.pieces_jointes}}
{{/if}}

Ce dire sera pris en compte dans mon rapport d'expertise et fera l'objet d'une réponse motivée.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{expert.nom}}
Expert {{expert.specialite}}`
  }
];

// Motifs de prorogation prédéfinis
const MOTIFS_PROROGATION = [
  'Retard dans la communication des pièces par les parties',
  'Nécessité de réunions d\'expertise supplémentaires',
  'Complexité technique du dossier nécessitant des investigations complémentaires',
  'Indisponibilité des parties pour les réunions d\'expertise',
  'Attente des résultats d\'analyses techniques',
  'Recours à un sapiteur dont l\'intervention nécessite un délai supplémentaire',
  'Volume important de dires à analyser',
  'Circonstances exceptionnelles (congés, maladie, etc.)'
];

// Pièces couramment demandées
const PIECES_COURANTES = [
  { id: 'contrat', label: 'Contrat de construction / devis signés' },
  { id: 'plans', label: 'Plans de construction (permis de construire)' },
  { id: 'factures', label: 'Factures des travaux' },
  { id: 'dommages_ouvrage', label: 'Dossier de déclaration de sinistre (DO)' },
  { id: 'photos', label: 'Photographies des désordres' },
  { id: 'pv_reception', label: 'Procès-verbal de réception des travaux' },
  { id: 'reserves', label: 'Liste des réserves à la réception' },
  { id: 'courriers', label: 'Correspondances entre les parties' },
  { id: 'expertise_prive', label: 'Rapport d\'expertise privée éventuel' },
  { id: 'devis_reparation', label: 'Devis de réparation' },
  { id: 'attestation_assurance', label: 'Attestations d\'assurance' },
  { id: 'cctp', label: 'CCTP / cahier des charges' },
  { id: 'compte_rendu_chantier', label: 'Comptes-rendus de chantier' },
  { id: 'dtu', label: 'DTU applicables' }
];

// Modes d'envoi
const MODES_ENVOI = [
  { id: 'email', label: 'Email', icon: Mail, description: 'Envoi par email simple' },
  { id: 'ar24', label: 'AR24', icon: CheckCircle, description: 'Lettre recommandée électronique' },
  { id: 'lrar', label: 'LRAR', icon: Send, description: 'Lettre recommandée papier' },
  { id: 'print', label: 'Imprimer', icon: Printer, description: 'Impression pour envoi postal' }
];

// Composant de prévisualisation
const PreviewCourrier = ({ content, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Prévisualisation
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-50 border rounded-lg p-8 font-serif whitespace-pre-wrap text-gray-800 leading-relaxed">
            {content}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(content);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copier
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant de sélection des destinataires
const SelecteurDestinataires = ({ parties, selectedIds, onToggle }) => {
  const partiesAvecEmail = parties.filter(p => p.email);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Destinataires
      </label>
      <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
        {partiesAvecEmail.length === 0 ? (
          <p className="p-3 text-sm text-gray-500 text-center">
            Aucune partie avec email configuré
          </p>
        ) : (
          partiesAvecEmail.map(partie => (
            <label
              key={partie.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(partie.id)}
                onChange={() => onToggle(partie.id)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {partie.nom}
                </p>
                <p className="text-xs text-gray-500 truncate">{partie.email}</p>
              </div>
              {partie.avocat_email && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                  + Avocat
                </span>
              )}
            </label>
          ))
        )}
      </div>
    </div>
  );
};

// Composant formulaire de courrier
const FormulaireCourrier = ({
  type,
  affaire,
  parties,
  onGenerate,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    destinataires: [],
    modeEnvoi: 'email',
    // Champs spécifiques selon le type
    consignation: {
      montant: affaire?.montant_consignation || '',
      delai: '30 jours'
    },
    prorogation: {
      motifs: [],
      motifAutre: '',
      duree: 3,
      nouvelleDate: ''
    },
    pieces: {
      selection: [],
      pieceAutre: '',
      delai: 15
    },
    note: {
      numero: '1',
      contenu: ''
    },
    preRapport: {
      delaiDires: 30
    },
    dire: {
      date: new Date().toISOString().split('T')[0],
      numero: '',
      piecesJointes: ''
    }
  });

  const [showMotifsMenu, setShowMotifsMenu] = useState(false);
  const [showPiecesMenu, setShowPiecesMenu] = useState(false);

  const handleToggleDestinataire = (id) => {
    setFormData(prev => ({
      ...prev,
      destinataires: prev.destinataires.includes(id)
        ? prev.destinataires.filter(d => d !== id)
        : [...prev.destinataires, id]
    }));
  };

  const handleToggleMotif = (motif) => {
    setFormData(prev => ({
      ...prev,
      prorogation: {
        ...prev.prorogation,
        motifs: prev.prorogation.motifs.includes(motif)
          ? prev.prorogation.motifs.filter(m => m !== motif)
          : [...prev.prorogation.motifs, motif]
      }
    }));
  };

  const handleTogglePiece = (pieceId) => {
    setFormData(prev => ({
      ...prev,
      pieces: {
        ...prev.pieces,
        selection: prev.pieces.selection.includes(pieceId)
          ? prev.pieces.selection.filter(p => p !== pieceId)
          : [...prev.pieces.selection, pieceId]
      }
    }));
  };

  const renderChampsDynamiques = () => {
    switch (type.id) {
      case 'demande_consignation':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant de la consignation (€)
              </label>
              <input
                type="number"
                value={formData.consignation.montant}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  consignation: { ...prev.consignation, montant: e.target.value }
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 3000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Délai de versement
              </label>
              <select
                value={formData.consignation.delai}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  consignation: { ...prev.consignation, delai: e.target.value }
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="15 jours">15 jours</option>
                <option value="30 jours">30 jours</option>
                <option value="45 jours">45 jours</option>
                <option value="2 mois">2 mois</option>
              </select>
            </div>
          </div>
        );

      case 'demande_prorogation':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motifs de la demande
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMotifsMenu(!showMotifsMenu)}
                  className="w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="text-gray-700">
                    {formData.prorogation.motifs.length} motif(s) sélectionné(s)
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showMotifsMenu && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {MOTIFS_PROROGATION.map((motif, idx) => (
                      <label
                        key={idx}
                        className="flex items-start gap-2 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={formData.prorogation.motifs.includes(motif)}
                          onChange={() => handleToggleMotif(motif)}
                          className="mt-0.5 w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{motif}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {formData.prorogation.motifs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.prorogation.motifs.map((motif, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs"
                    >
                      {motif.substring(0, 40)}...
                      <button onClick={() => handleToggleMotif(motif)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif supplémentaire (optionnel)
              </label>
              <textarea
                value={formData.prorogation.motifAutre}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  prorogation: { ...prev.prorogation, motifAutre: e.target.value }
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Autre motif..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée demandée (mois)
                </label>
                <input
                  type="number"
                  value={formData.prorogation.duree}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    prorogation: { ...prev.prorogation, duree: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min={1}
                  max={12}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouvelle date limite
                </label>
                <input
                  type="date"
                  value={formData.prorogation.nouvelleDate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    prorogation: { ...prev.prorogation, nouvelleDate: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'demande_pieces':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pièces demandées
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPiecesMenu(!showPiecesMenu)}
                  className="w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <span className="text-gray-700">
                    {formData.pieces.selection.length} pièce(s) sélectionnée(s)
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showPiecesMenu && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {PIECES_COURANTES.map((piece) => (
                      <label
                        key={piece.id}
                        className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={formData.pieces.selection.includes(piece.id)}
                          onChange={() => handleTogglePiece(piece.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{piece.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {formData.pieces.selection.length > 0 && (
                <div className="mt-2 space-y-1">
                  {formData.pieces.selection.map((pieceId) => {
                    const piece = PIECES_COURANTES.find(p => p.id === pieceId);
                    return (
                      <div
                        key={pieceId}
                        className="flex items-center justify-between px-2 py-1 bg-blue-50 rounded text-sm"
                      >
                        <span className="text-blue-700">{piece?.label}</span>
                        <button
                          onClick={() => handleTogglePiece(pieceId)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Autre pièce à demander
              </label>
              <input
                type="text"
                value={formData.pieces.pieceAutre}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pieces: { ...prev.pieces, pieceAutre: e.target.value }
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Préciser une autre pièce..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Délai de réponse (jours)
              </label>
              <input
                type="number"
                value={formData.pieces.delai}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pieces: { ...prev.pieces, delai: e.target.value }
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min={7}
                max={60}
              />
            </div>
          </div>
        );

      case 'note_parties':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de la note
              </label>
              <input
                type="text"
                value={formData.note.numero}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  note: { ...prev.note, numero: e.target.value }
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 1, 2, 3..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenu de la note
              </label>
              <textarea
                value={formData.note.contenu}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  note: { ...prev.note, contenu: e.target.value }
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Rédigez le contenu de votre note aux parties..."
              />
            </div>
          </div>
        );

      case 'envoi_pre_rapport':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Délai pour les dires (jours)
              </label>
              <select
                value={formData.preRapport.delaiDires}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  preRapport: { ...prev.preRapport, delaiDires: e.target.value }
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 jours</option>
                <option value={21}>21 jours (3 semaines)</option>
                <option value={30}>30 jours (1 mois)</option>
                <option value={45}>45 jours</option>
              </select>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Rappel</p>
                  <p>Le pré-rapport doit être accompagné de toutes les pièces sur lesquelles vous vous êtes fondé.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'accuse_reception_dires':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date du dire
                </label>
                <input
                  type="date"
                  value={formData.dire.date}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dire: { ...prev.dire, date: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro du dire
                </label>
                <input
                  type="text"
                  value={formData.dire.numero}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dire: { ...prev.dire, numero: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: D-001"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pièces jointes reçues (optionnel)
              </label>
              <textarea
                value={formData.dire.piecesJointes}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dire: { ...prev.dire, piecesJointes: e.target.value }
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Liste des pièces jointes au dire..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sélection des destinataires (sauf pour prorogation qui va au juge) */}
      {type.destinataires === 'parties' && (
        <SelecteurDestinataires
          parties={parties}
          selectedIds={formData.destinataires}
          onToggle={handleToggleDestinataire}
        />
      )}

      {type.destinataires === 'juridiction' && (
        <div className="p-3 bg-gray-50 border rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Destinataire :</span> {affaire?.juridiction || 'Magistrat désignataire'}
          </p>
        </div>
      )}

      {/* Champs dynamiques selon le type */}
      {renderChampsDynamiques()}

      {/* Mode d'envoi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mode d'envoi
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {MODES_ENVOI.map(mode => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, modeEnvoi: mode.id }))}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                formData.modeEnvoi === mode.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <mode.icon className={`w-5 h-5 mx-auto mb-1 ${
                formData.modeEnvoi === mode.id ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <p className={`text-sm font-medium ${
                formData.modeEnvoi === mode.id ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {mode.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={() => onGenerate(formData)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Prévisualiser
        </button>
      </div>
    </div>
  );
};

// Composant carte de type de courrier
const TypeCourrierCard = ({ type, isSelected, onClick }) => {
  const Icon = type.icon;
  const colorClasses = {
    green: 'bg-green-50 border-green-200 hover:border-green-400',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    teal: 'bg-teal-50 border-teal-200 hover:border-teal-400'
  };

  const iconColorClasses = {
    green: 'text-green-600',
    orange: 'text-orange-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600',
    teal: 'text-teal-600'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
        isSelected
          ? `${colorClasses[type.color]} ring-2 ring-offset-2 ring-${type.color}-400`
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isSelected ? `bg-${type.color}-100` : 'bg-gray-100'}`}>
          <Icon className={`w-5 h-5 ${isSelected ? iconColorClasses[type.color] : 'text-gray-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${isSelected ? `text-${type.color}-900` : 'text-gray-900'}`}>
            {type.label}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
        </div>
        {isSelected && (
          <Check className={`w-5 h-5 ${iconColorClasses[type.color]}`} />
        )}
      </div>
    </button>
  );
};

// Historique des courriers
const HistoriqueCourriers = ({ courriers }) => {
  if (!courriers || courriers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Aucun courrier généré pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {courriers.map((courrier) => (
        <div
          key={courrier.id}
          className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-${courrier.type?.color || 'gray'}-100`}>
                {courrier.type?.icon && <courrier.type.icon className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{courrier.type?.label}</h4>
                <p className="text-xs text-gray-500">
                  {new Date(courrier.date).toLocaleDateString('fr-FR')} - {courrier.destinataires?.length || 0} destinataire(s)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs ${
                courrier.statut === 'envoye' ? 'bg-green-100 text-green-700' :
                courrier.statut === 'brouillon' ? 'bg-gray-100 text-gray-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {courrier.statut === 'envoye' ? 'Envoyé' :
                 courrier.statut === 'brouillon' ? 'Brouillon' : 'En attente'}
              </span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Eye className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Composant principal
export const GenerateurCourriers = ({ affaire, onUpdate }) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [courriersHistorique, setCourriersHistorique] = useState(
    affaire?.courriers || []
  );

  const parties = affaire?.parties || [];

  // Génère le contenu du courrier avec les variables remplacées
  const genererContenu = useCallback((type, formData) => {
    let contenu = type.template;

    // Remplacements des variables de l'affaire
    contenu = contenu.replace(/\{\{affaire\.reference\}\}/g, affaire?.reference || 'REF-2024-XXX');
    contenu = contenu.replace(/\{\{affaire\.rg\}\}/g, affaire?.numero_rg || 'RG XX/XXXXX');
    contenu = contenu.replace(/\{\{affaire\.juridiction\}\}/g, affaire?.juridiction || 'Tribunal Judiciaire');
    contenu = contenu.replace(/\{\{affaire\.date_ordonnance\}\}/g,
      affaire?.date_ordonnance ? new Date(affaire.date_ordonnance).toLocaleDateString('fr-FR') : 'XX/XX/XXXX');
    contenu = contenu.replace(/\{\{affaire\.date_limite\}\}/g,
      affaire?.date_limite ? new Date(affaire.date_limite).toLocaleDateString('fr-FR') : 'XX/XX/XXXX');

    // Variables de l'expert (depuis le profil stocké)
    const expert = JSON.parse(localStorage.getItem('profil_expert') || '{}');
    contenu = contenu.replace(/\{\{expert\.nom\}\}/g, expert.nom || '[Nom de l\'expert]');
    contenu = contenu.replace(/\{\{expert\.specialite\}\}/g, expert.specialite || '[Spécialité]');
    contenu = contenu.replace(/\{\{expert\.adresse\}\}/g, expert.adresse || '[Adresse]');

    // Variables des parties
    const demandeur = parties.find(p => p.qualite === 'demandeur');
    const defendeurs = parties.filter(p => p.qualite === 'defendeur');
    contenu = contenu.replace(/\{\{parties\.adverses\}\}/g,
      defendeurs.map(d => d.nom).join(', ') || '[Parties adverses]');

    // Variables spécifiques au type
    if (type.id === 'demande_consignation') {
      contenu = contenu.replace(/\{\{consignation\.montant\}\}/g, formData.consignation.montant || 'XXXX');
      contenu = contenu.replace(/\{\{consignation\.delai\}\}/g, formData.consignation.delai || '30 jours');
    }

    if (type.id === 'demande_prorogation') {
      const motifs = [...formData.prorogation.motifs];
      if (formData.prorogation.motifAutre) {
        motifs.push(formData.prorogation.motifAutre);
      }
      contenu = contenu.replace(/\{\{prorogation\.motifs\}\}/g,
        motifs.map((m, i) => `- ${m}`).join('\n') || '- [Motifs]');
      contenu = contenu.replace(/\{\{prorogation\.duree\}\}/g, formData.prorogation.duree || 'X');
      contenu = contenu.replace(/\{\{prorogation\.nouvelle_date\}\}/g,
        formData.prorogation.nouvelleDate
          ? new Date(formData.prorogation.nouvelleDate).toLocaleDateString('fr-FR')
          : 'XX/XX/XXXX');
    }

    if (type.id === 'demande_pieces') {
      const pieces = formData.pieces.selection.map(id => {
        const piece = PIECES_COURANTES.find(p => p.id === id);
        return piece?.label;
      }).filter(Boolean);
      if (formData.pieces.pieceAutre) {
        pieces.push(formData.pieces.pieceAutre);
      }
      contenu = contenu.replace(/\{\{pieces\.liste\}\}/g,
        pieces.map((p, i) => `${i + 1}. ${p}`).join('\n') || '[Liste des pièces]');
      contenu = contenu.replace(/\{\{pieces\.delai\}\}/g, formData.pieces.delai || '15');
    }

    if (type.id === 'note_parties') {
      contenu = contenu.replace(/\{\{note\.numero\}\}/g, formData.note.numero || '1');
      contenu = contenu.replace(/\{\{note\.contenu\}\}/g, formData.note.contenu || '[Contenu de la note]');
    }

    if (type.id === 'envoi_pre_rapport') {
      contenu = contenu.replace(/\{\{pre_rapport\.delai_dires\}\}/g, formData.preRapport.delaiDires || '30');
    }

    if (type.id === 'accuse_reception_dires') {
      contenu = contenu.replace(/\{\{dire\.date\}\}/g,
        formData.dire.date ? new Date(formData.dire.date).toLocaleDateString('fr-FR') : 'XX/XX/XXXX');
      contenu = contenu.replace(/\{\{dire\.numero\}\}/g, formData.dire.numero || 'D-XXX');
      if (formData.dire.piecesJointes) {
        contenu = contenu.replace(/\{\{#if dire\.pieces_jointes\}\}[\s\S]*?\{\{\/if\}\}/g,
          `Les pièces jointes suivantes ont bien été reçues :\n${formData.dire.piecesJointes}`);
      } else {
        contenu = contenu.replace(/\{\{#if dire\.pieces_jointes\}\}[\s\S]*?\{\{\/if\}\}/g, '');
      }
    }

    // Date du jour
    contenu = contenu.replace(/\{\{date\.jour\}\}/g, new Date().toLocaleDateString('fr-FR'));

    return contenu;
  }, [affaire, parties]);

  const handleGenerate = (formData) => {
    const contenu = genererContenu(selectedType, formData);
    setPreviewContent(contenu);
    setShowPreview(true);
  };

  const handleSaveCourrier = () => {
    const nouveauCourrier = {
      id: Date.now(),
      type: selectedType,
      date: new Date().toISOString(),
      contenu: previewContent,
      statut: 'brouillon'
    };

    const nouveauxCourriers = [...courriersHistorique, nouveauCourrier];
    setCourriersHistorique(nouveauxCourriers);

    if (onUpdate) {
      onUpdate({
        ...affaire,
        courriers: nouveauxCourriers
      });
    }

    toast({
      title: "Courrier enregistré",
      description: "Le courrier a été ajouté à l'historique."
    });

    setShowPreview(false);
    setSelectedType(null);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-600" />
            Générateur de courriers
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Créez vos courriers types avec remplissage automatique
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche : Sélection du type */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-medium text-gray-900">Type de courrier</h3>
          <div className="space-y-2">
            {TYPES_COURRIERS.map(type => (
              <TypeCourrierCard
                key={type.id}
                type={type}
                isSelected={selectedType?.id === type.id}
                onClick={() => setSelectedType(type)}
              />
            ))}
          </div>
        </div>

        {/* Colonne de droite : Formulaire ou historique */}
        <div className="lg:col-span-2">
          {selectedType ? (
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className={`p-2 rounded-lg bg-${selectedType.color}-100`}>
                  <selectedType.icon className={`w-5 h-5 text-${selectedType.color}-600`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedType.label}</h3>
                  <p className="text-sm text-gray-500">{selectedType.description}</p>
                </div>
              </div>

              <FormulaireCourrier
                type={selectedType}
                affaire={affaire}
                parties={parties}
                onGenerate={handleGenerate}
                onCancel={() => setSelectedType(null)}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-medium text-gray-900 mb-4">Historique des courriers</h3>
              <HistoriqueCourriers courriers={courriersHistorique} />
            </div>
          )}
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {showPreview && (
        <PreviewCourrier
          content={previewContent}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Bouton d'enregistrement après prévisualisation */}
      {showPreview && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(previewContent);
              toast({
                title: "Copié !",
                description: "Le courrier a été copié dans le presse-papiers."
              });
            }}
            className="px-4 py-3 bg-white border shadow-lg rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Copy className="w-5 h-5 text-gray-600" />
            Copier
          </button>
          <button
            onClick={handleSaveCourrier}
            className="px-4 py-3 bg-blue-600 text-white shadow-lg rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Enregistrer
          </button>
        </div>
      )}
    </div>
  );
};

export default GenerateurCourriers;
