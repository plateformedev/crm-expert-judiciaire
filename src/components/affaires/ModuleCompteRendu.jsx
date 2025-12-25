// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE COMPTE-RENDU DE RÉUNION
// Génération manuelle ou assistée par IA du compte-rendu
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  FileText, Wand2, Save, Download, Copy, Eye, Edit,
  Check, CheckCircle, RefreshCw, Sparkles, AlertTriangle,
  Clock, Users, Camera, MapPin, Calendar, Send,
  ChevronDown, ChevronRight, Lightbulb, Zap, FileCheck, X
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// SECTIONS DU COMPTE-RENDU
// ============================================================================

const SECTIONS_COMPTE_RENDU = [
  {
    id: 'entete',
    titre: 'En-tête',
    description: 'Informations générales sur la réunion',
    auto: true
  },
  {
    id: 'participants',
    titre: 'Participants',
    description: 'Liste des présents et absents',
    auto: true
  },
  {
    id: 'objet',
    titre: 'Objet de la réunion',
    description: 'Rappel de la mission et contexte',
    auto: true
  },
  {
    id: 'expose_demandeur',
    titre: 'Exposé du demandeur',
    description: 'Position et doléances du demandeur',
    auto: false
  },
  {
    id: 'expose_defendeur',
    titre: 'Exposé du défendeur',
    description: 'Position et arguments du défendeur',
    auto: false
  },
  {
    id: 'constatations',
    titre: 'Constatations',
    description: 'Observations techniques sur site',
    auto: false
  },
  {
    id: 'photos',
    titre: 'Reportage photographique',
    description: 'Photos prises lors de la visite',
    auto: true
  },
  {
    id: 'observations',
    titre: 'Observations des parties',
    description: 'Remarques formulées en fin de réunion',
    auto: false
  },
  {
    id: 'suite',
    titre: 'Suite à donner',
    description: 'Prochaines étapes et délais',
    auto: false
  }
];

// ============================================================================
// GÉNÉRATEUR IA (SIMULATION)
// ============================================================================

const generateSectionIA = (sectionId, affaire, reunion, expert) => {
  const parties = affaire?.parties || [];
  const presents = reunion?.presents || [];
  const absents = reunion?.absents || [];
  const photos = reunion?.photos || [];
  const notes = reunion?.notes || '';
  const notesEtapes = reunion?.notes_etapes || {};

  switch (sectionId) {
    case 'entete':
      return `COMPTE-RENDU DE RÉUNION D'EXPERTISE

Affaire : ${affaire?.reference || '[Référence]'}
RG : ${affaire?.rg || '[N° RG]'}
Juridiction : ${affaire?.tribunal || '[Tribunal]'}

Date de la réunion : ${reunion?.date_reunion ? formatDateFr(reunion.date_reunion) : '[Date]'}
Heure : ${reunion?.heure || '[Heure]'}
Lieu : ${reunion?.lieu || affaire?.bien_adresse || '[Adresse]'}
       ${affaire?.bien_code_postal || ''} ${affaire?.bien_ville || ''}

Expert : ${expert?.prenom || ''} ${expert?.nom || '[Expert]'}
Réunion n° : ${reunion?.numero || '1'}
Durée : ${reunion?.duree_heures ? `${reunion.duree_heures} heure(s)` : '[Durée]'}`;

    case 'participants':
      const presentsListe = presents.map(id => {
        const p = parties.find(partie => partie.id === id);
        if (!p) return null;
        const nom = p.raison_sociale || `${p.prenom || ''} ${p.nom}`.trim();
        return `• ${nom} (${p.type})${p.avocat_nom ? ` - assisté de Me ${p.avocat_nom}` : ''}`;
      }).filter(Boolean).join('\n');

      const absentsListe = absents.map(id => {
        const p = parties.find(partie => partie.id === id);
        if (!p) return null;
        const nom = p.raison_sociale || `${p.prenom || ''} ${p.nom}`.trim();
        return `• ${nom} (${p.type})`;
      }).filter(Boolean).join('\n');

      return `PRÉSENTS :
${presentsListe || '• [Aucun présent enregistré]'}

ABSENTS :
${absentsListe || '• Néant'}`;

    case 'objet':
      return `La présente réunion a pour objet ${reunion?.numero === 1 ? 'la première' : `la ${reunion?.numero}ème`} réunion d'expertise ordonnée par ${affaire?.tribunal || '[Tribunal]'} dans le cadre du litige opposant les parties ci-dessus mentionnées.

MISSION DE L'EXPERT :
${affaire?.mission || '[Rappeler ici la mission confiée par le juge]'}

CONTEXTE :
${notesEtapes.accueil || affaire?.description || '[Décrire brièvement le contexte du litige]'}`;

    case 'expose_demandeur':
      return `${notesEtapes.expose_demandeur || `Le demandeur expose les faits suivants :

[À compléter avec les déclarations du demandeur]

Points principaux soulevés :
• [Point 1]
• [Point 2]
• [Point 3]`}`;

    case 'expose_defendeur':
      return `${notesEtapes.expose_defendeur || `Le défendeur fait valoir les arguments suivants :

[À compléter avec les déclarations du défendeur]

En réponse aux allégations du demandeur :
• [Réponse 1]
• [Réponse 2]
• [Réponse 3]`}`;

    case 'constatations':
      return `${notesEtapes.constatations || notesEtapes.visite_lieux || `CONSTATATIONS DE L'EXPERT

Lors de la visite des lieux, nous avons procédé aux constatations suivantes :

1. ÉTAT GÉNÉRAL
[Description de l'état général des lieux]

2. DÉSORDRES CONSTATÉS
${(affaire?.pathologies || []).map((d, i) =>
  `${i + 1}. ${d.intitule || `Désordre ${d.numero}`}
   Localisation : ${d.localisation || 'À préciser'}
   Description : ${d.description || 'À compléter'}`
).join('\n\n') || '[Décrire les désordres constatés]'}

3. OBSERVATIONS TECHNIQUES
[Observations techniques complémentaires]`}`;

    case 'photos':
      if (photos.length === 0) {
        return `REPORTAGE PHOTOGRAPHIQUE

Aucune photographie n'a été prise lors de cette réunion.

[Ou ajouter les photos dans le module Réunion]`;
      }

      return `REPORTAGE PHOTOGRAPHIQUE

${photos.length} photographie(s) ont été prises lors de cette réunion :

${photos.map((photo, i) =>
  `Photo ${i + 1} : ${photo.commentaire || '[Sans commentaire]'}
  Localisation : ${photo.localisation || 'Non précisée'}
  Date : ${photo.date ? formatDateFr(photo.date) : 'Non datée'}`
).join('\n\n')}

[Les photographies sont annexées au présent compte-rendu]`;

    case 'observations':
      return `${notesEtapes.observations || `OBSERVATIONS DES PARTIES EN FIN DE RÉUNION

Observation du demandeur :
[Observations formulées]

Observation du défendeur :
[Observations formulées]

Observation des autres parties :
[Observations formulées]`}`;

    case 'suite':
      return `${notesEtapes.cloture || `SUITE À DONNER

1. DIRES DES PARTIES
Les parties disposent d'un délai de 30 jours à compter de la réception du présent compte-rendu pour adresser leurs dires écrits.

2. PROCHAINE RÉUNION
${reunion?.prochaine_reunion_prevue ?
  `Une prochaine réunion est prévue le ${formatDateFr(reunion.prochaine_reunion_prevue)}` :
  '[À déterminer si nécessaire]'}

3. CALENDRIER PRÉVISIONNEL
• Réception des dires : [Date]
• Note de synthèse : [Date]
• Rapport définitif : ${affaire?.date_echeance ? formatDateFr(affaire.date_echeance) : '[Date]'}`}

Fait à [Ville], le ${formatDateFr(new Date())}

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire`;

    default:
      return '[Contenu à générer]';
  }
};

// ============================================================================
// COMPOSANT: Section éditable
// ============================================================================

const SectionEditable = ({ section, contenu, onChange, onGenerate, isGenerating }) => {
  const [expanded, setExpanded] = useState(true);
  const hasContent = contenu && contenu.trim().length > 0;

  return (
    <Card className={`overflow-hidden ${hasContent ? 'border-green-200' : ''}`}>
      {/* En-tête */}
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
              {hasContent && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {section.auto && (
                <Badge variant="info" className="text-xs">Auto</Badge>
              )}
            </div>
            <p className="text-xs text-[#737373]">{section.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="secondary"
            size="sm"
            icon={isGenerating ? RefreshCw : Wand2}
            onClick={() => onGenerate(section.id)}
            loading={isGenerating}
          >
            {section.auto ? 'Actualiser' : 'Générer IA'}
          </Button>
        </div>
      </div>

      {/* Contenu */}
      {expanded && (
        <div className="p-4">
          <textarea
            value={contenu || ''}
            onChange={(e) => onChange(section.id, e.target.value)}
            rows={10}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] font-mono text-sm"
            placeholder={`Rédigez la section "${section.titre}"...`}
          />

          <div className="flex justify-between items-center mt-2 text-xs text-[#a3a3a3]">
            <span>{(contenu || '').split(/\s+/).filter(w => w).length} mots</span>
          </div>
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL: Module Compte-Rendu
// ============================================================================

export const ModuleCompteRendu = ({ affaire, reunion, expert, onUpdate, onClose }) => {
  // États
  const [sections, setSections] = useState(() => {
    const existing = reunion?.compte_rendu_sections || {};
    const initial = {};
    SECTIONS_COMPTE_RENDU.forEach(s => {
      initial[s.id] = existing[s.id] || '';
    });
    return initial;
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [generatingSection, setGeneratingSection] = useState(null);
  const [saving, setSaving] = useState(false);

  // Mettre à jour une section
  const updateSection = (sectionId, contenu) => {
    setSections(prev => ({ ...prev, [sectionId]: contenu }));
  };

  // Générer une section avec IA
  const generateSection = async (sectionId) => {
    setGeneratingSection(sectionId);

    // Simuler un délai de génération
    await new Promise(resolve => setTimeout(resolve, 500));

    const generatedContent = generateSectionIA(sectionId, affaire, reunion, expert);
    updateSection(sectionId, generatedContent);

    setGeneratingSection(null);
  };

  // Générer tout le compte-rendu
  const generateAll = async () => {
    for (const section of SECTIONS_COMPTE_RENDU) {
      setGeneratingSection(section.id);
      await new Promise(resolve => setTimeout(resolve, 300));
      const content = generateSectionIA(section.id, affaire, reunion, expert);
      updateSection(section.id, content);
    }
    setGeneratingSection(null);
  };

  // Calculer la progression
  const progression = useMemo(() => {
    const filled = SECTIONS_COMPTE_RENDU.filter(s => sections[s.id]?.trim()).length;
    return Math.round((filled / SECTIONS_COMPTE_RENDU.length) * 100);
  }, [sections]);

  // Générer le document complet
  const generateFullDocument = () => {
    return SECTIONS_COMPTE_RENDU
      .map(section => {
        if (!sections[section.id]?.trim()) return '';
        return `${'═'.repeat(60)}\n${section.titre.toUpperCase()}\n${'═'.repeat(60)}\n\n${sections[section.id]}\n\n`;
      })
      .filter(Boolean)
      .join('\n');
  };

  // Sauvegarder
  const handleSave = async () => {
    setSaving(true);

    const compteRenduComplet = generateFullDocument();

    await onUpdate({
      reunions: affaire.reunions.map(r =>
        r.id === reunion.id
          ? {
              ...r,
              compte_rendu: compteRenduComplet,
              compte_rendu_sections: sections,
              date_compte_rendu: new Date().toISOString()
            }
          : r
      )
    });

    setSaving(false);
  };

  // Copier
  const handleCopy = () => {
    navigator.clipboard.writeText(generateFullDocument());
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f0] overflow-hidden flex flex-col">
      {/* En-tête fixe */}
      <div className="bg-[#1a1a1a] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="text-sm">Retour à l'affaire</span>
          </button>
          <div className="h-6 w-px bg-white/20" />
          <div>
            <h1 className="text-lg font-medium">
              Compte-rendu {reunion?.numero === 1 ? 'R1 - Accédit contradictoire' : `R${reunion?.numero || ''}`}
            </h1>
            <p className="text-sm text-white/60">
              {affaire?.reference} • {formatDateFr(reunion?.date_reunion)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progression */}
          <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2">
            <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563EB] transition-all"
                style={{ width: `${progression}%` }}
              />
            </div>
            <span className="text-lg font-mono text-[#2563EB]">{progression}%</span>
          </div>

          <Button
            variant="secondary"
            icon={previewMode ? Edit : Eye}
            onClick={() => setPreviewMode(!previewMode)}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {previewMode ? 'Éditer' : 'Aperçu'}
          </Button>

          <Button variant="secondary" icon={Copy} onClick={handleCopy} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Copier
          </Button>

          <Button variant="secondary" icon={Download} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            PDF
          </Button>

          <Button
            variant="primary"
            icon={Save}
            onClick={handleSave}
            loading={saving}
            className="bg-[#2563EB] hover:bg-[#b8922a]"
          >
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Actions rapides - Génération IA */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-white border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Génération assistée par IA</p>
                  <p className="text-xs text-blue-600">
                    Générez automatiquement le compte-rendu à partir des notes de la réunion R1
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                icon={Zap}
                onClick={generateAll}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!!generatingSection}
              >
                Générer tout le compte-rendu
              </Button>
            </div>
          </Card>

          {/* Info sur les données disponibles */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2563EB]" />
                <div>
                  <p className="text-xs text-[#737373]">Présents</p>
                  <p className="font-medium text-[#1a1a1a]">{reunion?.presents?.length || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#2563EB]" />
                <div>
                  <p className="text-xs text-[#737373]">Photos</p>
                  <p className="font-medium text-[#1a1a1a]">{reunion?.photos?.length || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2563EB]" />
                <div>
                  <p className="text-xs text-[#737373]">Notes</p>
                  <p className="font-medium text-[#1a1a1a]">
                    {Object.keys(reunion?.notes_etapes || {}).length} étapes
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2563EB]" />
                <div>
                  <p className="text-xs text-[#737373]">Durée</p>
                  <p className="font-medium text-[#1a1a1a]">
                    {reunion?.duree_heures ? `${reunion.duree_heures}h` : '—'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Mode aperçu ou édition */}
          {previewMode ? (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-[#1a1a1a] mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#2563EB]" />
                Aperçu du compte-rendu
              </h3>
              <pre className="whitespace-pre-wrap font-mono text-sm text-[#525252] bg-[#EFF6FF] p-6 rounded-xl">
                {generateFullDocument() || '[Aucun contenu - Commencez par générer ou rédiger les sections]'}
              </pre>
            </Card>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#1a1a1a] flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#2563EB]" />
                Sections du compte-rendu ({SECTIONS_COMPTE_RENDU.length})
              </h3>

              {SECTIONS_COMPTE_RENDU.map(section => (
                <SectionEditable
                  key={section.id}
                  section={section}
                  contenu={sections[section.id]}
                  onChange={updateSection}
                  onGenerate={generateSection}
                  isGenerating={generatingSection === section.id}
                />
              ))}
            </div>
          )}

          {/* Conseils */}
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Conseils pour un bon compte-rendu</p>
                <ul className="text-xs text-amber-700 mt-2 space-y-1">
                  <li>• Restez factuel et objectif dans vos descriptions</li>
                  <li>• Distinguez clairement les déclarations des parties de vos constatations</li>
                  <li>• Mentionnez les documents et pièces communiqués</li>
                  <li>• Précisez les délais accordés aux parties pour leurs dires</li>
                  <li>• Relisez attentivement avant d'envoyer aux parties</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModuleCompteRendu;
