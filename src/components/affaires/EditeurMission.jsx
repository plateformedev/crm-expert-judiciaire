// ============================================================================
// CRM EXPERT JUDICIAIRE - ÉDITEUR DE MISSION
// Saisie structurée de la mission avec points numérotés
// ============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText, Plus, Trash2, GripVertical, ChevronUp, ChevronDown,
  Save, X, Edit, Copy, ClipboardPaste, Wand2, ListOrdered, Type,
  AlertCircle, Check, Eye, EyeOff, RotateCcw, Download, Upload
} from 'lucide-react';
import { Card, Badge, Button, ModalBase, useToast } from '../ui';

// ============================================================================
// CONSTANTES
// ============================================================================

const TEMPLATES_MISSION = [
  {
    id: 'construction_standard',
    label: 'Construction - Standard',
    description: 'Mission standard pour litiges construction',
    points: [
      'Se rendre sur les lieux et les décrire',
      'Entendre les parties et tous sachants',
      'Se faire remettre tout document utile',
      'Décrire les désordres allégués, leur étendue et leur localisation',
      'Rechercher les causes des désordres constatés',
      'Donner son avis sur les responsabilités encourues',
      'Déterminer les travaux de nature à y remédier',
      'Chiffrer le coût des travaux de reprise',
      'Donner son avis sur les préjudices connexes',
      'Concilier les parties si possible'
    ]
  },
  {
    id: 'malfacons',
    label: 'Malfaçons - Détaillé',
    description: 'Mission détaillée pour malfaçons et vices',
    points: [
      'Se transporter sur les lieux et les décrire avec précision',
      'Prendre connaissance de l\'ensemble des pièces communiquées',
      'Recueillir les explications des parties et de leurs conseils techniques',
      'Décrire l\'ensemble des désordres, malfaçons et non-conformités allégués',
      'Procéder à toutes investigations techniques utiles',
      'Rechercher l\'origine technique des désordres constatés',
      'Dire si les règles de l\'art et les normes en vigueur ont été respectées',
      'Indiquer les travaux de reprise nécessaires et en donner le coût',
      'Évaluer les préjudices de jouissance et autres préjudices connexes',
      'Faire toute observation utile à la solution du litige'
    ]
  },
  {
    id: 'infiltrations',
    label: 'Infiltrations d\'eau',
    description: 'Mission spécifique infiltrations',
    points: [
      'Se rendre sur les lieux et les décrire',
      'Constater et décrire les infiltrations d\'eau signalées',
      'Rechercher l\'origine des infiltrations (toiture, façade, menuiseries, etc.)',
      'Déterminer si les désordres sont imputables à un vice de construction ou un défaut d\'entretien',
      'Préciser si les règles de l\'art ont été respectées',
      'Décrire les travaux nécessaires pour y remédier et en chiffrer le coût',
      'Évaluer les préjudices connexes (dégâts mobiliers, préjudice de jouissance)',
      'Tenter de concilier les parties'
    ]
  },
  {
    id: 'refere_expertise',
    label: 'Référé expertise',
    description: 'Mission classique référé',
    points: [
      'Convoquer et entendre les parties',
      'Se faire remettre tous documents utiles',
      'Visiter les lieux, les décrire',
      'Décrire les désordres ou malfaçons allégués',
      'En rechercher l\'origine',
      'Proposer des solutions de nature à y remédier',
      'Chiffrer le coût des travaux',
      'Donner tous éléments permettant d\'évaluer les préjudices subis',
      'Tenter de concilier les parties'
    ]
  },
  {
    id: 'vide',
    label: 'Vide (saisie libre)',
    description: 'Commencer avec une mission vide',
    points: []
  }
];

// ============================================================================
// COMPOSANT: Point de mission éditable
// ============================================================================

const PointMission = ({
  index,
  point,
  total,
  isEditing,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onStartEdit,
  onEndEdit
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.selectionStart = inputRef.current.value.length;
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEndEdit();
    } else if (e.key === 'Escape') {
      onEndEdit();
    }
  };

  return (
    <div className="group flex items-start gap-2 p-3 bg-white border border-[#e5e5e5] rounded-xl hover:border-[#2563EB] transition-all">
      {/* Numéro */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-semibold text-sm">
        {index + 1}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={point}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onEndEdit}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-[#2563EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 resize-none text-sm"
            rows={2}
          />
        ) : (
          <p
            className="text-sm text-[#1a1a1a] cursor-pointer hover:text-[#2563EB] py-2"
            onClick={onStartEdit}
          >
            {point || <span className="italic text-[#a3a3a3]">Cliquez pour éditer...</span>}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1.5 text-[#a3a3a3] hover:text-[#2563EB] hover:bg-[#f5f5f5] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
          title="Monter"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1.5 text-[#a3a3a3] hover:text-[#2563EB] hover:bg-[#f5f5f5] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
          title="Descendre"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-[#a3a3a3] hover:text-red-500 hover:bg-red-50 rounded-lg"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT: Modal import depuis texte
// ============================================================================

const ModalImportTexte = ({ isOpen, onClose, onImport }) => {
  const [texte, setTexte] = useState('');
  const [preview, setPreview] = useState([]);

  // Analyse automatique du texte pour extraire les points
  const analyserTexte = useCallback((text) => {
    if (!text.trim()) {
      setPreview([]);
      return;
    }

    // Patterns pour détecter les points numérotés
    const patterns = [
      /^\s*(\d+)[°.)]\s*(.+)$/gm,           // 1° ou 1) ou 1.
      /^\s*[-•]\s*(.+)$/gm,                  // - ou •
      /^\s*([a-zA-Z])[.)]\s*(.+)$/gm,        // a) ou a.
      /^\s*(?:de\s+)?(.+?)(?:\s*[,;]|$)/gm   // Texte libre avec virgules/points-virgules
    ];

    let points = [];
    let matched = false;

    // Essayer de détecter les points numérotés
    const numeroPattern = /^\s*(\d+)[°.)]\s*(.+)$/gm;
    let match;
    while ((match = numeroPattern.exec(text)) !== null) {
      points.push(match[2].trim());
      matched = true;
    }

    // Si pas de numéros, essayer les tirets/puces
    if (!matched) {
      const bulletPattern = /^\s*[-•]\s*(.+)$/gm;
      while ((match = bulletPattern.exec(text)) !== null) {
        points.push(match[1].trim());
        matched = true;
      }
    }

    // Si toujours rien, découper par ligne non vide
    if (!matched) {
      points = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 10); // Filtrer les lignes trop courtes
    }

    // Nettoyer les points
    points = points
      .map(p => p.replace(/^\s*[\d°).\-•]+\s*/, '').trim())
      .filter(p => p.length > 0);

    setPreview(points);
  }, []);

  useEffect(() => {
    analyserTexte(texte);
  }, [texte, analyserTexte]);

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Importer depuis un texte"
      size="lg"
    >
      <div className="space-y-6">
        {/* Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-700">
            <strong>Astuce :</strong> Copiez le texte de la mission depuis votre ordonnance PDF.
            Les points numérotés (1°, 2°...) ou à puces seront détectés automatiquement.
          </p>
        </div>

        {/* Zone de saisie */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
            Texte de la mission
          </label>
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            className="w-full h-48 px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] text-sm font-mono"
            placeholder="Collez ici le texte de la mission...

Exemple :
1° Se rendre sur les lieux et les décrire
2° Entendre les parties et tous sachants
3° Décrire les désordres allégués..."
          />
        </div>

        {/* Aperçu */}
        {preview.length > 0 && (
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
              Aperçu ({preview.length} points détectés)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2 p-4 bg-[#f5f5f5] rounded-xl">
              {preview.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded bg-[#2563EB] text-white flex items-center justify-center text-xs font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-[#1a1a1a]">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button
            variant="primary"
            icon={ClipboardPaste}
            onClick={handleImport}
            disabled={preview.length === 0}
            className="flex-1"
          >
            Importer {preview.length} points
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// COMPOSANT: Modal choix template
// ============================================================================

const ModalChoixTemplate = ({ isOpen, onClose, onSelect }) => {
  const [selected, setSelected] = useState(null);

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Choisir un modèle de mission"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-[#737373]">
          Sélectionnez un modèle pour pré-remplir les points de la mission.
          Vous pourrez ensuite les modifier selon vos besoins.
        </p>

        <div className="grid gap-3">
          {TEMPLATES_MISSION.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelected(template)}
              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                selected?.id === template.id
                  ? 'border-[#2563EB] bg-blue-50'
                  : 'border-[#e5e5e5] hover:border-[#2563EB]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-[#1a1a1a]">{template.label}</p>
                  <p className="text-sm text-[#737373]">{template.description}</p>
                  {template.points.length > 0 && (
                    <p className="text-xs text-[#a3a3a3] mt-1">
                      {template.points.length} points
                    </p>
                  )}
                </div>
                {selected?.id === template.id && (
                  <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (selected) {
                onSelect(selected.points);
                onClose();
              }
            }}
            disabled={!selected}
            className="flex-1"
          >
            Utiliser ce modèle
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL: Éditeur de mission
// ============================================================================

export const EditeurMission = ({ affaire, onUpdate, compact = false }) => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [points, setPoints] = useState([]);
  const [introduction, setIntroduction] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [viewMode, setViewMode] = useState('structure'); // 'structure' ou 'texte'
  const [hasChanges, setHasChanges] = useState(false);

  // Parser la mission existante en points
  useEffect(() => {
    if (affaire?.mission) {
      parseMission(affaire.mission);
    } else {
      setPoints([]);
      setIntroduction('');
    }
  }, [affaire?.mission]);

  // Parse une mission texte en points structurés
  const parseMission = (missionText) => {
    if (!missionText) {
      setPoints([]);
      setIntroduction('');
      return;
    }

    const lines = missionText.split('\n');
    const extractedPoints = [];
    let intro = '';
    let foundFirstPoint = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Détecter un point numéroté
      const pointMatch = trimmed.match(/^(\d+)[°.)]\s*(.+)$/);
      if (pointMatch) {
        foundFirstPoint = true;
        extractedPoints.push(pointMatch[2]);
      } else if (!foundFirstPoint && trimmed.length > 0) {
        // Avant le premier point = introduction
        intro += (intro ? '\n' : '') + trimmed;
      } else if (foundFirstPoint) {
        // Après le premier point mais pas numéroté = continuation du dernier point
        if (extractedPoints.length > 0) {
          extractedPoints[extractedPoints.length - 1] += ' ' + trimmed;
        }
      }
    }

    setIntroduction(intro);
    setPoints(extractedPoints.length > 0 ? extractedPoints : [missionText]);
  };

  // Génère le texte de mission à partir des points
  const generateMissionText = () => {
    let text = introduction ? introduction + '\n\n' : '';
    points.forEach((point, idx) => {
      text += `${idx + 1}° ${point}\n`;
    });
    return text.trim();
  };

  // Sauvegarde
  const handleSave = async () => {
    try {
      const missionText = generateMissionText();
      await onUpdate({ mission: missionText });
      setIsEditing(false);
      setHasChanges(false);
      toast.success('Mission enregistrée');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  // Annuler
  const handleCancel = () => {
    if (affaire?.mission) {
      parseMission(affaire.mission);
    } else {
      setPoints([]);
      setIntroduction('');
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  // Modification d'un point
  const updatePoint = (index, value) => {
    const newPoints = [...points];
    newPoints[index] = value;
    setPoints(newPoints);
    setHasChanges(true);
  };

  // Ajout d'un point
  const addPoint = () => {
    setPoints([...points, '']);
    setHasChanges(true);
    setEditingIndex(points.length);
  };

  // Suppression d'un point
  const deletePoint = (index) => {
    setPoints(points.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  // Déplacer un point vers le haut
  const movePointUp = (index) => {
    if (index === 0) return;
    const newPoints = [...points];
    [newPoints[index - 1], newPoints[index]] = [newPoints[index], newPoints[index - 1]];
    setPoints(newPoints);
    setHasChanges(true);
  };

  // Déplacer un point vers le bas
  const movePointDown = (index) => {
    if (index === points.length - 1) return;
    const newPoints = [...points];
    [newPoints[index], newPoints[index + 1]] = [newPoints[index + 1], newPoints[index]];
    setPoints(newPoints);
    setHasChanges(true);
  };

  // Import depuis texte
  const handleImport = (importedPoints) => {
    setPoints(importedPoints);
    setHasChanges(true);
    setIsEditing(true);
    toast.success(`${importedPoints.length} points importés`);
  };

  // Sélection template
  const handleTemplateSelect = (templatePoints) => {
    setPoints(templatePoints);
    setHasChanges(true);
    setIsEditing(true);
    toast.success('Modèle appliqué');
  };

  // ============================================================================
  // MODE COMPACT (affichage dans TabGeneral)
  // ============================================================================

  if (compact) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-[#1a1a1a] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2563EB]" />
            Mission
            {points.length > 0 && (
              <Badge className="bg-[#2563EB]/10 text-[#2563EB]">
                {points.length} points
              </Badge>
            )}
          </h4>
          <Button
            variant="secondary"
            size="sm"
            icon={Edit}
            onClick={() => setIsEditing(true)}
          >
            Modifier
          </Button>
        </div>

        {points.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-[#e5e5e5] mx-auto mb-3" />
            <p className="text-[#737373] mb-4">Mission non renseignée</p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="secondary"
                size="sm"
                icon={Wand2}
                onClick={() => setShowTemplateModal(true)}
              >
                Modèle
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={ClipboardPaste}
                onClick={() => setShowImportModal(true)}
              >
                Importer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {introduction && (
              <p className="text-sm text-[#525252] mb-4">{introduction}</p>
            )}
            {points.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded bg-[#2563EB] text-white flex items-center justify-center text-xs font-medium">
                  {idx + 1}
                </span>
                <span className="text-[#1a1a1a]">{point}</span>
              </div>
            ))}
          </div>
        )}

        {/* Modal d'édition complète */}
        {isEditing && (
          <ModalEditeurMission
            points={points}
            introduction={introduction}
            editingIndex={editingIndex}
            hasChanges={hasChanges}
            viewMode={viewMode}
            onClose={handleCancel}
            onSave={handleSave}
            onUpdatePoint={updatePoint}
            onDeletePoint={deletePoint}
            onMoveUp={movePointUp}
            onMoveDown={movePointDown}
            onAddPoint={addPoint}
            onSetEditingIndex={setEditingIndex}
            onSetIntroduction={(v) => { setIntroduction(v); setHasChanges(true); }}
            onSetViewMode={setViewMode}
            onOpenImport={() => setShowImportModal(true)}
            onOpenTemplate={() => setShowTemplateModal(true)}
          />
        )}

        {/* Modals */}
        <ModalImportTexte
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
        <ModalChoixTemplate
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelect={handleTemplateSelect}
        />
      </Card>
    );
  }

  // ============================================================================
  // MODE PLEIN (composant standalone)
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Mission d'expertise</h3>
          <p className="text-sm text-[#737373]">
            {points.length} point{points.length !== 1 ? 's' : ''} de mission
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="secondary"
                icon={Wand2}
                onClick={() => setShowTemplateModal(true)}
              >
                Modèle
              </Button>
              <Button
                variant="secondary"
                icon={ClipboardPaste}
                onClick={() => setShowImportModal(true)}
              >
                Importer
              </Button>
              <Button
                variant="primary"
                icon={Edit}
                onClick={() => setIsEditing(true)}
              >
                Modifier
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={handleCancel}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                icon={Save}
                onClick={handleSave}
                disabled={!hasChanges}
              >
                Enregistrer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Toggle vue */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('structure')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            viewMode === 'structure'
              ? 'bg-[#2563EB] text-white'
              : 'bg-[#f5f5f5] text-[#737373] hover:bg-[#e5e5e5]'
          }`}
        >
          <ListOrdered className="w-4 h-4 inline mr-2" />
          Vue structurée
        </button>
        <button
          onClick={() => setViewMode('texte')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            viewMode === 'texte'
              ? 'bg-[#2563EB] text-white'
              : 'bg-[#f5f5f5] text-[#737373] hover:bg-[#e5e5e5]'
          }`}
        >
          <Type className="w-4 h-4 inline mr-2" />
          Vue texte
        </button>
      </div>

      {/* Contenu */}
      {viewMode === 'structure' ? (
        <Card className="p-6">
          {/* Introduction optionnelle */}
          {isEditing && (
            <div className="mb-6">
              <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
                Introduction (optionnel)
              </label>
              <textarea
                value={introduction}
                onChange={(e) => { setIntroduction(e.target.value); setHasChanges(true); }}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] text-sm resize-none"
                rows={2}
                placeholder="Texte d'introduction avant les points numérotés..."
              />
            </div>
          )}

          {introduction && !isEditing && (
            <p className="text-sm text-[#525252] mb-6">{introduction}</p>
          )}

          {/* Points de mission */}
          {points.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-[#e5e5e5] mx-auto mb-4" />
              <p className="text-[#737373] mb-4">Aucun point de mission défini</p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="secondary"
                  icon={Wand2}
                  onClick={() => setShowTemplateModal(true)}
                >
                  Utiliser un modèle
                </Button>
                <Button
                  variant="secondary"
                  icon={ClipboardPaste}
                  onClick={() => setShowImportModal(true)}
                >
                  Importer depuis texte
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {points.map((point, idx) => (
                isEditing ? (
                  <PointMission
                    key={idx}
                    index={idx}
                    point={point}
                    total={points.length}
                    isEditing={editingIndex === idx}
                    onChange={(value) => updatePoint(idx, value)}
                    onDelete={() => deletePoint(idx)}
                    onMoveUp={() => movePointUp(idx)}
                    onMoveDown={() => movePointDown(idx)}
                    onStartEdit={() => setEditingIndex(idx)}
                    onEndEdit={() => setEditingIndex(null)}
                  />
                ) : (
                  <div key={idx} className="flex items-start gap-3 p-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-[#1a1a1a] pt-1">{point}</span>
                  </div>
                )
              ))}

              {isEditing && (
                <button
                  onClick={addPoint}
                  className="w-full p-3 border-2 border-dashed border-[#e5e5e5] rounded-xl text-[#737373] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un point
                </button>
              )}
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-6">
          <pre className="text-sm text-[#1a1a1a] whitespace-pre-wrap font-sans">
            {generateMissionText() || 'Aucune mission définie'}
          </pre>
        </Card>
      )}

      {/* Modals */}
      <ModalImportTexte
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
      <ModalChoixTemplate
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
};

// ============================================================================
// MODAL ÉDITEUR (pour mode compact)
// ============================================================================

const ModalEditeurMission = ({
  points,
  introduction,
  editingIndex,
  hasChanges,
  viewMode,
  onClose,
  onSave,
  onUpdatePoint,
  onDeletePoint,
  onMoveUp,
  onMoveDown,
  onAddPoint,
  onSetEditingIndex,
  onSetIntroduction,
  onSetViewMode,
  onOpenImport,
  onOpenTemplate
}) => {
  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title="Éditer la mission"
      size="xl"
    >
      <div className="space-y-6">
        {/* Actions rapides */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Wand2}
            onClick={onOpenTemplate}
          >
            Modèle
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={ClipboardPaste}
            onClick={onOpenImport}
          >
            Importer
          </Button>
          <div className="flex-1" />
          <div className="flex gap-1">
            <button
              onClick={() => onSetViewMode('structure')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                viewMode === 'structure'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#f5f5f5] text-[#737373]'
              }`}
            >
              Structuré
            </button>
            <button
              onClick={() => onSetViewMode('texte')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                viewMode === 'texte'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#f5f5f5] text-[#737373]'
              }`}
            >
              Texte
            </button>
          </div>
        </div>

        {/* Introduction */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
            Introduction (optionnel)
          </label>
          <textarea
            value={introduction}
            onChange={(e) => onSetIntroduction(e.target.value)}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] text-sm resize-none"
            rows={2}
            placeholder="Texte d'introduction avant les points numérotés..."
          />
        </div>

        {/* Points */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
            Points de mission ({points.length})
          </label>
          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {points.map((point, idx) => (
              <PointMission
                key={idx}
                index={idx}
                point={point}
                total={points.length}
                isEditing={editingIndex === idx}
                onChange={(value) => onUpdatePoint(idx, value)}
                onDelete={() => onDeletePoint(idx)}
                onMoveUp={() => onMoveUp(idx)}
                onMoveDown={() => onMoveDown(idx)}
                onStartEdit={() => onSetEditingIndex(idx)}
                onEndEdit={() => onSetEditingIndex(null)}
              />
            ))}

            <button
              onClick={onAddPoint}
              className="w-full p-3 border-2 border-dashed border-[#e5e5e5] rounded-xl text-[#737373] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un point
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button
            variant="primary"
            icon={Save}
            onClick={onSave}
            disabled={!hasChanges}
            className="flex-1"
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

export default EditeurMission;
