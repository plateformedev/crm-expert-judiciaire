// ============================================================================
// CRM EXPERT JUDICIAIRE - ÉDITEUR NOTE DE SYNTHÈSE
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  FileSearch, FileText, Save, Download, Copy, Eye, Edit,
  ChevronDown, ChevronRight, Plus, Trash2, AlertTriangle,
  CheckCircle, Wand2, BookOpen, List, Lightbulb, RefreshCw
} from 'lucide-react';
import { Card, Badge, Button, ModalBase } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// STRUCTURE DE LA NOTE DE SYNTHÈSE
// ============================================================================

const SECTIONS_NOTE = [
  {
    id: 'intro',
    titre: 'Introduction',
    description: 'Rappel de la mission et du contexte',
    obligatoire: true
  },
  {
    id: 'parties',
    titre: 'Parties en présence',
    description: 'Liste des parties et leurs représentants',
    obligatoire: true
  },
  {
    id: 'faits',
    titre: 'Exposé des faits',
    description: 'Chronologie et contexte du litige',
    obligatoire: true
  },
  {
    id: 'operations',
    titre: 'Opérations d\'expertise',
    description: 'Réunions, visites, investigations',
    obligatoire: true
  },
  {
    id: 'constatations',
    titre: 'Constatations',
    description: 'Désordres observés et analyses techniques',
    obligatoire: true
  },
  {
    id: 'dires',
    titre: 'Dires des parties',
    description: 'Résumé des dires et réponses',
    obligatoire: false
  },
  {
    id: 'analyse',
    titre: 'Analyse technique',
    description: 'Discussion et raisonnement de l\'expert',
    obligatoire: true
  },
  {
    id: 'conclusions',
    titre: 'Conclusions provisoires',
    description: 'Avis préliminaire de l\'expert',
    obligatoire: true
  },
  {
    id: 'chiffrage',
    titre: 'Estimation des préjudices',
    description: 'Chiffrage provisoire des réparations',
    obligatoire: false
  }
];

// ============================================================================
// COMPOSANT: Section éditable
// ============================================================================

const SectionEditor = ({ section, content, onChange, affaire, onInsertTemplate }) => {
  const [expanded, setExpanded] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <Card className="overflow-hidden">
      {/* En-tête de section */}
      <div
        className="p-4 bg-[#EFF6FF] cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-[#737373]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[#737373]" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-[#1a1a1a]">{section.titre}</h3>
              {section.obligatoire && (
                <Badge variant="warning">Obligatoire</Badge>
              )}
              {content && content.trim() && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-xs text-[#737373]">{section.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="p-2 hover:bg-white rounded-lg transition-colors"
            onClick={() => setShowTemplates(!showTemplates)}
            title="Insérer un modèle"
          >
            <Wand2 className="w-4 h-4 text-[#2563EB]" />
          </button>
        </div>
      </div>

      {/* Contenu éditable */}
      {expanded && (
        <div className="p-4 space-y-3">
          {/* Templates suggérés */}
          {showTemplates && (
            <div className="p-3 bg-blue-50 rounded-lg space-y-2">
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">
                Modèles disponibles
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="px-3 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700 hover:bg-blue-100"
                  onClick={() => onInsertTemplate(section.id, 'standard')}
                >
                  Modèle standard
                </button>
                <button
                  className="px-3 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700 hover:bg-blue-100"
                  onClick={() => onInsertTemplate(section.id, 'from-data')}
                >
                  Générer depuis données
                </button>
              </div>
            </div>
          )}

          {/* Zone de texte */}
          <textarea
            value={content || ''}
            onChange={(e) => onChange(section.id, e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] text-sm"
            placeholder={`Rédigez la section "${section.titre}"...`}
          />

          {/* Compteur de mots */}
          <div className="flex justify-between items-center text-xs text-[#a3a3a3]">
            <span>
              {(content || '').split(/\s+/).filter(w => w).length} mots
            </span>
            {!content && section.obligatoire && (
              <span className="text-amber-600">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Section requise
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Éditeur de note de synthèse
// ============================================================================

export const EditeurNoteSynthese = ({ affaire, onSave, onClose }) => {
  // État des sections
  const [sections, setSections] = useState(() => {
    // Charger depuis l'affaire si existant
    const existingNote = affaire.note_synthese || {};
    const initial = {};
    SECTIONS_NOTE.forEach(s => {
      initial[s.id] = existingNote[s.id] || '';
    });
    return initial;
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mise à jour d'une section
  const updateSection = (sectionId, content) => {
    setSections(prev => ({ ...prev, [sectionId]: content }));
  };

  // Générer contenu automatique
  const generateFromData = (sectionId) => {
    let content = '';

    switch (sectionId) {
      case 'intro':
        content = `Par ordonnance en date du ${affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : '___'}, ${affaire.tribunal || '___'} nous a commis en qualité d'expert judiciaire dans le litige opposant les parties ci-après désignées.

Notre mission consiste à :
${affaire.mission || '[Mission à préciser]'}

La provision initiale a été fixée à ${affaire.provision_montant ? `${parseFloat(affaire.provision_montant).toLocaleString('fr-FR')} €` : '___'}.`;
        break;

      case 'parties':
        const partiesContent = (affaire.parties || []).map(p => {
          const nom = p.raison_sociale || `${p.prenom || ''} ${p.nom}`.trim();
          return `- ${p.type?.toUpperCase()} : ${nom}${p.avocat_nom ? `\n  Représenté par Me ${p.avocat_nom}` : ''}`;
        }).join('\n\n');
        content = partiesContent || '[Parties à renseigner]';
        break;

      case 'operations':
        const reunions = affaire.reunions || [];
        if (reunions.length > 0) {
          content = `Nous avons procédé aux opérations d'expertise suivantes :\n\n`;
          reunions.forEach(r => {
            content += `• Réunion n°${r.numero} du ${r.date_reunion ? formatDateFr(r.date_reunion) : '___'}\n`;
            content += `  Lieu : ${r.lieu || 'Sur site'}\n`;
            if (r.presents?.length > 0) {
              content += `  Présents : ${r.presents.join(', ')}\n`;
            }
            content += '\n';
          });
        } else {
          content = '[Opérations d\'expertise à décrire]';
        }
        break;

      case 'constatations':
        const desordres = affaire.pathologies || [];
        if (desordres.length > 0) {
          content = `Lors de nos opérations, nous avons constaté les désordres suivants :\n\n`;
          desordres.forEach((d, i) => {
            content += `${i + 1}. ${d.intitule || `Désordre n°${d.numero}`}\n`;
            content += `   Localisation : ${d.localisation || 'À préciser'}\n`;
            if (d.description) content += `   Description : ${d.description}\n`;
            content += '\n';
          });
        } else {
          content = '[Constatations à décrire]';
        }
        break;

      case 'dires':
        const dires = affaire.dires || [];
        if (dires.length > 0) {
          content = `Les parties ont fait valoir les observations suivantes :\n\n`;
          dires.forEach((d, i) => {
            content += `${i + 1}. Dire de ${d.partie_id || 'partie'}\n`;
            content += `   "${d.contenu || d.objet}"\n\n`;
            if (d.reponse) {
              content += `   Réponse de l'expert : ${d.reponse}\n\n`;
            }
          });
        } else {
          content = 'Aucun dire n\'a été déposé par les parties.';
        }
        break;

      default:
        content = `[Section "${sectionId}" à compléter]`;
    }

    updateSection(sectionId, content);
  };

  // Insérer un template
  const insertTemplate = (sectionId, templateType) => {
    if (templateType === 'from-data') {
      generateFromData(sectionId);
    } else {
      // Templates standards
      const templates = {
        intro: `Par ordonnance en date du ___, le Tribunal ___ nous a commis en qualité d'expert judiciaire.

Notre mission consiste à :
- Décrire les désordres allégués
- Rechercher les causes
- Déterminer les responsabilités
- Chiffrer les préjudices`,

        analyse: `Au vu de nos constatations et des pièces versées aux débats, il apparaît que :

1. Sur la nature des désordres :
[Analyse technique]

2. Sur les causes :
[Origine des désordres]

3. Sur les responsabilités :
[Imputabilité]`,

        conclusions: `Au terme de nos opérations d'expertise, nous pouvons conclure de manière provisoire que :

1. Les désordres constatés sont :
[Liste des désordres]

2. Leur origine est :
[Causes identifiées]

3. Les responsabilités incombent à :
[Parties responsables]

4. Le coût des réparations est estimé à :
[Montant provisoire]

Ces conclusions sont provisoires et susceptibles d'évoluer en fonction des observations des parties.`
      };

      if (templates[sectionId]) {
        updateSection(sectionId, templates[sectionId]);
      }
    }
  };

  // Calculer la progression
  const progression = useMemo(() => {
    const obligatoires = SECTIONS_NOTE.filter(s => s.obligatoire);
    const remplies = obligatoires.filter(s => sections[s.id]?.trim()).length;
    return Math.round((remplies / obligatoires.length) * 100);
  }, [sections]);

  // Générer le document complet
  const generateFullDocument = () => {
    let doc = `═══════════════════════════════════════════════════════════════════
NOTE DE SYNTHÈSE
═══════════════════════════════════════════════════════════════════

Affaire : ${affaire.reference}
Tribunal : ${affaire.tribunal}
RG : ${affaire.rg}
Date : ${new Date().toLocaleDateString('fr-FR')}

═══════════════════════════════════════════════════════════════════

`;

    SECTIONS_NOTE.forEach(section => {
      if (sections[section.id]?.trim()) {
        doc += `\n${section.titre.toUpperCase()}\n`;
        doc += '─'.repeat(50) + '\n\n';
        doc += sections[section.id] + '\n\n';
      }
    });

    doc += `\n═══════════════════════════════════════════════════════════════════
L'Expert Judiciaire
═══════════════════════════════════════════════════════════════════`;

    return doc;
  };

  // Sauvegarder
  const handleSave = async () => {
    setSaving(true);
    await onSave({
      note_synthese: sections,
      note_synthese_date: new Date().toISOString()
    });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a]">Note de synthèse</h2>
          <p className="text-sm text-[#737373]">
            Pré-rapport destiné aux parties pour observations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right mr-4">
            <p className="text-sm text-[#737373]">Progression</p>
            <p className="text-2xl font-light text-[#2563EB]">{progression}%</p>
          </div>

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
            onClick={() => navigator.clipboard.writeText(generateFullDocument())}
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

      {/* Barre de progression */}
      <div className="h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#2563EB] transition-all"
          style={{ width: `${progression}%` }}
        />
      </div>

      {/* Mode aperçu ou édition */}
      {previewMode ? (
        <Card className="p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm text-[#525252]">
            {generateFullDocument()}
          </pre>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Actions rapides */}
          <Card className="p-4 bg-gradient-to-r from-[#EFF6FF] to-white">
            <div className="flex items-center gap-4">
              <Lightbulb className="w-5 h-5 text-[#2563EB]" />
              <p className="text-sm text-[#525252] flex-1">
                Utilisez le bouton <Wand2 className="w-4 h-4 inline text-[#2563EB]" /> pour générer automatiquement le contenu depuis les données du dossier.
              </p>
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={() => {
                  SECTIONS_NOTE.forEach(s => {
                    if (!sections[s.id]?.trim()) {
                      generateFromData(s.id);
                    }
                  });
                }}
              >
                Tout générer
              </Button>
            </div>
          </Card>

          {/* Sections */}
          {SECTIONS_NOTE.map(section => (
            <SectionEditor
              key={section.id}
              section={section}
              content={sections[section.id]}
              onChange={updateSection}
              affaire={affaire}
              onInsertTemplate={insertTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EditeurNoteSynthese;
