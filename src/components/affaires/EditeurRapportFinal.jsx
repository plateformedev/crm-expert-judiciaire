// ============================================================================
// CRM EXPERT JUDICIAIRE - ÉDITEUR RAPPORT FINAL
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  FileText, Save, Download, Copy, Eye, Edit,
  ChevronDown, ChevronRight, AlertTriangle,
  CheckCircle, Wand2, Lightbulb, RefreshCw, BookOpen,
  Printer, Send, Lock, Unlock
} from 'lucide-react';
import { Card, Badge, Button, ModalBase } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// STRUCTURE DU RAPPORT FINAL
// ============================================================================

const SECTIONS_RAPPORT = [
  {
    id: 'preambule',
    titre: 'Préambule',
    description: 'Désignation, mission, provision',
    obligatoire: true
  },
  {
    id: 'parties',
    titre: 'Parties en cause',
    description: 'Demandeurs, défendeurs et intervenants',
    obligatoire: true
  },
  {
    id: 'pieces',
    titre: 'Pièces et documents',
    description: 'Liste des documents communiqués',
    obligatoire: true
  },
  {
    id: 'operations',
    titre: 'Déroulement des opérations',
    description: 'Chronologie des réunions et investigations',
    obligatoire: true
  },
  {
    id: 'faits',
    titre: 'Exposé des faits',
    description: 'Contexte et historique du litige',
    obligatoire: true
  },
  {
    id: 'constatations',
    titre: 'Constatations de l\'expert',
    description: 'Observations techniques et désordres',
    obligatoire: true
  },
  {
    id: 'dires',
    titre: 'Dires des parties et réponses',
    description: 'Observations reçues et réponses motivées',
    obligatoire: true
  },
  {
    id: 'analyse',
    titre: 'Analyse technique',
    description: 'Discussion et raisonnement',
    obligatoire: true
  },
  {
    id: 'imputabilite',
    titre: 'Imputabilité des responsabilités',
    description: 'Attribution des responsabilités',
    obligatoire: true
  },
  {
    id: 'prejudices',
    titre: 'Évaluation des préjudices',
    description: 'Chiffrage détaillé des dommages',
    obligatoire: true
  },
  {
    id: 'conclusions',
    titre: 'Conclusions',
    description: 'Réponses aux questions de la mission',
    obligatoire: true
  },
  {
    id: 'annexes',
    titre: 'Annexes',
    description: 'Liste des annexes jointes au rapport',
    obligatoire: false
  }
];

// ============================================================================
// COMPOSANT: Section éditable du rapport
// ============================================================================

const SectionRapport = ({ section, content, onChange, affaire, onInsertTemplate, locked }) => {
  const [expanded, setExpanded] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <Card className={`overflow-hidden ${locked ? 'opacity-75' : ''}`}>
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
          {!locked && (
            <button
              className="p-2 hover:bg-white rounded-lg transition-colors"
              onClick={() => setShowTemplates(!showTemplates)}
              title="Insérer un modèle"
            >
              <Wand2 className="w-4 h-4 text-[#2563EB]" />
            </button>
          )}
        </div>
      </div>

      {/* Contenu éditable */}
      {expanded && (
        <div className="p-4 space-y-3">
          {/* Templates suggérés */}
          {showTemplates && !locked && (
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
                <button
                  className="px-3 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700 hover:bg-blue-100"
                  onClick={() => onInsertTemplate(section.id, 'from-synthese')}
                >
                  Importer note de synthèse
                </button>
              </div>
            </div>
          )}

          {/* Zone de texte */}
          <textarea
            value={content || ''}
            onChange={(e) => onChange(section.id, e.target.value)}
            rows={10}
            disabled={locked}
            className={`w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] text-sm ${
              locked ? 'bg-gray-50 cursor-not-allowed' : ''
            }`}
            placeholder={`Rédigez la section "${section.titre}"...`}
          />

          {/* Compteur de mots et alertes */}
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
// COMPOSANT: Éditeur de rapport final
// ============================================================================

export const EditeurRapportFinal = ({ affaire, onSave, onClose }) => {
  // État des sections
  const [sections, setSections] = useState(() => {
    const existingReport = affaire.rapport_final || {};
    const initial = {};
    SECTIONS_RAPPORT.forEach(s => {
      initial[s.id] = existingReport[s.id] || '';
    });
    return initial;
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(affaire.rapport_final_verrouille || false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  // Mise à jour d'une section
  const updateSection = (sectionId, content) => {
    if (locked) return;
    setSections(prev => ({ ...prev, [sectionId]: content }));
  };

  // Générer contenu depuis les données
  const generateFromData = (sectionId) => {
    let content = '';

    switch (sectionId) {
      case 'preambule':
        content = `Par ordonnance en date du ${affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : '___'}, rendue par ${affaire.tribunal || '___'}, nous avons été désigné en qualité d'expert judiciaire dans l'affaire enregistrée sous le numéro RG ${affaire.rg || '___'}.

Notre mission était définie comme suit :
${affaire.mission || '[Mission à préciser]'}

La provision initiale a été fixée à ${affaire.provision_montant ? `${parseFloat(affaire.provision_montant).toLocaleString('fr-FR')} €` : '___'}.
${affaire.consignations_supplementaires?.length > 0 ? `Des consignations complémentaires ont été ordonnées pour un montant total de ${affaire.consignations_supplementaires.reduce((sum, c) => sum + parseFloat(c.montant || 0), 0).toLocaleString('fr-FR')} €.` : ''}

Nous avons accepté cette mission le ${affaire.date_reponse_juge ? formatDateFr(affaire.date_reponse_juge) : '___'}.`;
        break;

      case 'parties':
        const partiesContent = (affaire.parties || []).map(p => {
          const nom = p.raison_sociale || `${p.prenom || ''} ${p.nom}`.trim();
          let texte = `${p.type?.toUpperCase() || 'PARTIE'} : ${nom}`;
          if (p.adresse) texte += `\nAdresse : ${p.adresse}`;
          if (p.avocat_nom) texte += `\nReprésenté par Me ${p.avocat_nom}${p.avocat_barreau ? `, avocat au Barreau de ${p.avocat_barreau}` : ''}`;
          return texte;
        }).join('\n\n');
        content = partiesContent || '[Parties à renseigner]';
        break;

      case 'pieces':
        const pieces = affaire.documents?.filter(d => d.type === 'piece' || d.type === 'communique') || [];
        if (pieces.length > 0) {
          content = `Les pièces suivantes ont été communiquées dans le cadre de l'expertise :\n\n`;
          pieces.forEach((p, i) => {
            content += `${i + 1}. ${p.nom || p.titre} (${p.partie || 'Non attribué'}) - ${p.date ? formatDateFr(p.date) : 'Date inconnue'}\n`;
          });
        } else {
          content = '[Liste des pièces à établir]';
        }
        break;

      case 'operations':
        const reunions = affaire.reunions || [];
        if (reunions.length > 0) {
          content = `Les opérations d'expertise se sont déroulées comme suit :\n\n`;
          reunions.forEach(r => {
            content += `RÉUNION N°${r.numero} - ${r.date_reunion ? formatDateFr(r.date_reunion) : '___'}\n`;
            content += `Lieu : ${r.lieu || 'Sur site'}\n`;
            content += `Type : ${r.type || 'Expertise'}\n`;
            if (r.presents?.length > 0) {
              content += `Présents : ${r.presents.join(', ')}\n`;
            }
            if (r.absents?.length > 0) {
              content += `Absents : ${r.absents.join(', ')}\n`;
            }
            if (r.compte_rendu) {
              content += `Objet : ${r.objet || 'Opérations d\'expertise'}\n`;
            }
            content += '\n';
          });
        } else {
          content = '[Opérations d\'expertise à décrire]';
        }
        break;

      case 'faits':
        content = `[Exposer ici les faits à l'origine du litige, en respectant la chronologie des événements.]

${affaire.description || ''}`;
        break;

      case 'constatations':
        const desordres = affaire.pathologies || [];
        if (desordres.length > 0) {
          content = `Lors de nos opérations d'expertise, nous avons procédé aux constatations suivantes :\n\n`;
          desordres.forEach((d, i) => {
            content += `DÉSORDRE N°${i + 1} : ${d.intitule || `Désordre ${d.numero}`}\n`;
            content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            content += `Localisation : ${d.localisation || 'À préciser'}\n`;
            if (d.description) content += `Description : ${d.description}\n`;
            if (d.cause) content += `Cause probable : ${d.cause}\n`;
            if (d.gravite) content += `Gravité : ${d.gravite}\n`;
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
            content += `DIRE N°${i + 1}\n`;
            content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            content += `Partie : ${d.partie_nom || d.partie_id || 'Non identifié'}\n`;
            content += `Date : ${d.date ? formatDateFr(d.date) : 'Non datée'}\n`;
            content += `Objet : ${d.objet || 'Observations'}\n\n`;
            content += `Contenu :\n"${d.contenu || '[Contenu du dire]'}"\n\n`;
            if (d.reponse) {
              content += `RÉPONSE DE L'EXPERT :\n${d.reponse}\n`;
            }
            content += '\n';
          });
        } else {
          content = 'Aucun dire n\'a été déposé par les parties dans le délai imparti.';
        }
        break;

      case 'analyse':
        content = `Au vu de l'ensemble des éléments recueillis au cours de notre expertise, nous pouvons analyser la situation comme suit :

1. SUR LA NATURE DES DÉSORDRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Analyse technique des désordres constatés]

2. SUR LES CAUSES DES DÉSORDRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Analyse des causes techniques]

3. SUR LES RÈGLES DE L'ART ET NORMES APPLICABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Références aux DTU, normes, règles professionnelles]`;
        break;

      case 'imputabilite':
        content = `Sur la base de notre analyse technique, nous attribuons les responsabilités comme suit :

[Pour chaque désordre, indiquer :]
- Le désordre concerné
- La ou les parties responsables
- Le fondement de l'imputabilité
- La part de responsabilité de chacun (en pourcentage si partage)`;
        break;

      case 'prejudices':
        const pathologies = affaire.pathologies || [];
        let totalHT = 0;
        content = `L'évaluation des préjudices est établie comme suit :\n\n`;

        if (pathologies.length > 0) {
          pathologies.forEach((p, i) => {
            const montant = parseFloat(p.cout_reparation) || 0;
            totalHT += montant;
            content += `${i + 1}. ${p.intitule || `Désordre ${p.numero}`}\n`;
            content += `   Travaux de reprise : ${montant.toLocaleString('fr-FR')} € HT\n\n`;
          });

          const tva = totalHT * 0.20;
          const totalTTC = totalHT + tva;

          content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÉCAPITULATIF

Total travaux HT : ${totalHT.toLocaleString('fr-FR')} €
TVA 20% : ${tva.toLocaleString('fr-FR')} €
TOTAL TTC : ${totalTTC.toLocaleString('fr-FR')} €

[Ajouter si nécessaire : préjudice de jouissance, frais annexes, etc.]`;
        } else {
          content += '[Détailler l\'évaluation des préjudices]';
        }
        break;

      case 'conclusions':
        content = `Au terme de nos opérations d'expertise, nous concluons définitivement comme suit :

EN RÉPONSE À NOTRE MISSION :

1. DÉCRIRE LES DÉSORDRES ALLÉGUÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Résumé des désordres constatés]

2. RECHERCHER LES CAUSES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Synthèse des causes identifiées]

3. DÉTERMINER LES RESPONSABILITÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Récapitulatif des imputabilités]

4. CHIFFRER LES PRÉJUDICES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Montant total des réparations]

${affaire.tribunal || 'Le Tribunal'} appréciera.

Fait à [Ville], le ${new Date().toLocaleDateString('fr-FR')}

L'Expert Judiciaire`;
        break;

      case 'annexes':
        content = `LISTE DES ANNEXES

Annexe 1 : Ordonnance de désignation
Annexe 2 : Convocations et accusés de réception
Annexe 3 : Comptes-rendus des réunions d'expertise
Annexe 4 : Dires des parties
Annexe 5 : Documents techniques et plans
Annexe 6 : Reportage photographique
Annexe 7 : Devis et évaluations
[Compléter selon les pièces jointes]`;
        break;

      default:
        content = `[Section "${sectionId}" à compléter]`;
    }

    updateSection(sectionId, content);
  };

  // Importer depuis la note de synthèse
  const importFromSynthese = (sectionId) => {
    const synthese = affaire.note_synthese || {};
    const mapping = {
      'parties': 'parties',
      'operations': 'operations',
      'faits': 'faits',
      'constatations': 'constatations',
      'dires': 'dires',
      'analyse': 'analyse'
    };

    if (mapping[sectionId] && synthese[mapping[sectionId]]) {
      updateSection(sectionId, synthese[mapping[sectionId]]);
    } else {
      generateFromData(sectionId);
    }
  };

  // Insérer un template
  const insertTemplate = (sectionId, templateType) => {
    if (templateType === 'from-data') {
      generateFromData(sectionId);
    } else if (templateType === 'from-synthese') {
      importFromSynthese(sectionId);
    } else {
      generateFromData(sectionId);
    }
  };

  // Calculer la progression
  const progression = useMemo(() => {
    const obligatoires = SECTIONS_RAPPORT.filter(s => s.obligatoire);
    const remplies = obligatoires.filter(s => sections[s.id]?.trim()).length;
    return Math.round((remplies / obligatoires.length) * 100);
  }, [sections]);

  // Vérifier si le rapport est complet
  const isComplete = useMemo(() => {
    return SECTIONS_RAPPORT.filter(s => s.obligatoire).every(s => sections[s.id]?.trim());
  }, [sections]);

  // Générer le document complet
  const generateFullDocument = () => {
    let doc = `╔══════════════════════════════════════════════════════════════════════════════╗
║                              RAPPORT D'EXPERTISE                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Affaire : ${affaire.reference}
Juridiction : ${affaire.tribunal}
Numéro RG : ${affaire.rg}
Date du rapport : ${new Date().toLocaleDateString('fr-FR')}

════════════════════════════════════════════════════════════════════════════════

`;

    SECTIONS_RAPPORT.forEach(section => {
      if (sections[section.id]?.trim()) {
        doc += `\n${'═'.repeat(80)}\n`;
        doc += `${section.titre.toUpperCase()}\n`;
        doc += `${'═'.repeat(80)}\n\n`;
        doc += sections[section.id] + '\n\n';
      }
    });

    doc += `\n${'═'.repeat(80)}
                              L'EXPERT JUDICIAIRE
${'═'.repeat(80)}

[Signature]`;

    return doc;
  };

  // Sauvegarder
  const handleSave = async () => {
    setSaving(true);
    await onSave({
      rapport_final: sections,
      rapport_final_date: new Date().toISOString(),
      rapport_final_progression: progression
    });
    setSaving(false);
  };

  // Finaliser et verrouiller le rapport
  const handleFinalize = async () => {
    setSaving(true);
    await onSave({
      rapport_final: sections,
      rapport_final_date: new Date().toISOString(),
      rapport_final_verrouille: true,
      rapport_final_date_depot: new Date().toISOString()
    });
    setLocked(true);
    setSaving(false);
    setShowFinalizeModal(false);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a]">Rapport d'expertise</h2>
          <p className="text-sm text-[#737373]">
            Document définitif à déposer au tribunal
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Statut verrouillé */}
          {locked && (
            <Badge variant="error" className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Rapport finalisé
            </Badge>
          )}

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

          {!locked && (
            <>
              <Button
                variant="primary"
                icon={Save}
                onClick={handleSave}
                loading={saving}
              >
                Enregistrer
              </Button>

              {isComplete && (
                <Button
                  variant="primary"
                  icon={Send}
                  onClick={() => setShowFinalizeModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Finaliser
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${locked ? 'bg-green-500' : 'bg-[#2563EB]'}`}
          style={{ width: `${progression}%` }}
        />
      </div>

      {/* Alerte si note de synthèse disponible */}
      {affaire.note_synthese && !locked && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Note de synthèse disponible
              </p>
              <p className="text-xs text-blue-600">
                Vous pouvez importer le contenu de la note de synthèse pour compléter certaines sections.
              </p>
            </div>
          </div>
        </Card>
      )}

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
          {!locked && (
            <Card className="p-4 bg-gradient-to-r from-[#EFF6FF] to-white">
              <div className="flex items-center gap-4">
                <Lightbulb className="w-5 h-5 text-[#2563EB]" />
                <p className="text-sm text-[#525252] flex-1">
                  Utilisez le bouton <Wand2 className="w-4 h-4 inline text-[#2563EB]" /> pour générer automatiquement le contenu depuis les données du dossier ou importer depuis la note de synthèse.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => {
                    SECTIONS_RAPPORT.forEach(s => {
                      if (!sections[s.id]?.trim()) {
                        if (affaire.note_synthese?.[s.id]) {
                          importFromSynthese(s.id);
                        } else {
                          generateFromData(s.id);
                        }
                      }
                    });
                  }}
                >
                  Tout générer
                </Button>
              </div>
            </Card>
          )}

          {/* Sections */}
          {SECTIONS_RAPPORT.map(section => (
            <SectionRapport
              key={section.id}
              section={section}
              content={sections[section.id]}
              onChange={updateSection}
              affaire={affaire}
              onInsertTemplate={insertTemplate}
              locked={locked}
            />
          ))}
        </div>
      )}

      {/* Modal de finalisation */}
      {showFinalizeModal && (
        <ModalBase
          isOpen={true}
          onClose={() => setShowFinalizeModal(false)}
          title="Finaliser le rapport d'expertise"
          size="md"
        >
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800">
                    Attention : cette action est irréversible
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Une fois le rapport finalisé, vous ne pourrez plus le modifier.
                    Assurez-vous que toutes les informations sont correctes avant de continuer.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-[#525252]">
                En finalisant ce rapport, vous confirmez que :
              </p>
              <ul className="text-sm text-[#737373] space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Toutes les sections obligatoires ont été complétées</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Les conclusions sont définitives</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Le rapport est prêt à être déposé au tribunal</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowFinalizeModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                icon={Lock}
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleFinalize}
                loading={saving}
              >
                Finaliser et verrouiller
              </Button>
            </div>
          </div>
        </ModalBase>
      )}
    </div>
  );
};

export default EditeurRapportFinal;
