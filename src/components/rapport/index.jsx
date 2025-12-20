// ============================================================================
// CRM EXPERT JUDICIAIRE - GÉNÉRATEUR DE RAPPORT D'EXPERTISE
// Assemblage automatique de toutes les sections
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  FileText, Download, Eye, Settings, Check, AlertTriangle,
  ChevronRight, ChevronDown, FileCheck, Printer, Send,
  Book, List, Image, Euro, Users, Calendar, Scale,
  RefreshCw, Save, Folder, CheckCircle, Clock
} from 'lucide-react';
import { Card, Badge, Button, ProgressBar, ModalBase, useToast } from '../ui';
import { formatDateFr, formatMontant } from '../../utils/helpers';
import { pdfService } from '../../services/pdf';
import { getStoredAffaires, saveAffaires } from '../../lib/demoData';

// ============================================================================
// STRUCTURE DU RAPPORT
// ============================================================================

const SECTIONS_RAPPORT = [
  {
    id: 'page-garde',
    numero: '',
    titre: 'Page de garde',
    description: 'Titre, références, parties',
    obligatoire: true,
    icon: Book
  },
  {
    id: 'sommaire',
    numero: '',
    titre: 'Sommaire',
    description: 'Table des matières automatique',
    obligatoire: true,
    icon: List
  },
  {
    id: 'designation',
    numero: '1',
    titre: 'Désignation et mission',
    description: 'Ordonnance, juge, mission confiée',
    obligatoire: true,
    icon: Scale
  },
  {
    id: 'parties',
    numero: '2',
    titre: 'Parties à l\'expertise',
    description: 'Demandeurs, défendeurs, intervenants',
    obligatoire: true,
    icon: Users
  },
  {
    id: 'operations',
    numero: '3',
    titre: 'Déroulement des opérations',
    description: 'Réunions, présences, documents reçus',
    obligatoire: true,
    icon: Calendar
  },
  {
    id: 'bien',
    numero: '4',
    titre: 'Présentation du bien',
    description: 'Localisation, description, historique',
    obligatoire: true,
    icon: Folder
  },
  {
    id: 'constatations',
    numero: '5',
    titre: 'Constatations',
    description: 'Désordres observés, relevés',
    obligatoire: true,
    icon: FileText
  },
  {
    id: 'analyse',
    numero: '6',
    titre: 'Analyse technique',
    description: 'Causes, DTU, normes applicables',
    obligatoire: true,
    icon: FileCheck
  },
  {
    id: 'dires',
    numero: '7',
    titre: 'Dires des parties et réponses',
    description: 'Observations reçues et réponses',
    obligatoire: false,
    icon: FileText
  },
  {
    id: 'chiffrage',
    numero: '8',
    titre: 'Chiffrage des travaux',
    description: 'Estimation des réparations',
    obligatoire: true,
    icon: Euro
  },
  {
    id: 'conclusions',
    numero: '9',
    titre: 'Conclusions',
    description: 'Réponses aux questions, avis',
    obligatoire: true,
    icon: CheckCircle
  },
  {
    id: 'annexes',
    numero: '',
    titre: 'Annexes',
    description: 'Photos, plans, pièces',
    obligatoire: false,
    icon: Image
  }
];

// ============================================================================
// COMPOSANT PRINCIPAL - GÉNÉRATEUR DE RAPPORT
// ============================================================================

export const GenerateurRapport = ({
  affaire,
  expert,
  onSave,
  onExport
}) => {
  const toast = useToast();
  const [sections, setSections] = useState(
    SECTIONS_RAPPORT.map(s => ({
      ...s,
      inclus: s.obligatoire,
      complete: false,
      contenu: ''
    }))
  );
  const [activeSection, setActiveSection] = useState('designation');
  const [previewMode, setPreviewMode] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Calcul avancement
  const avancement = useMemo(() => {
    const incluses = sections.filter(s => s.inclus);
    const completes = incluses.filter(s => s.complete);
    return incluses.length > 0 ? Math.round((completes.length / incluses.length) * 100) : 0;
  }, [sections]);

  // Vérifier si une section est complète
  const verifierSection = (sectionId) => {
    // Logique de vérification selon la section
    switch (sectionId) {
      case 'designation':
        return !!(affaire.mission && affaire.date_ordonnance);
      case 'parties':
        return affaire.parties?.length > 0;
      case 'operations':
        return affaire.reunions?.length > 0;
      case 'constatations':
        return affaire.pathologies?.length > 0;
      case 'chiffrage':
        return affaire.chiffrages?.length > 0;
      default:
        return sections.find(s => s.id === sectionId)?.contenu?.length > 100;
    }
  };

  // Générer le contenu d'une section
  const genererContenuSection = (sectionId) => {
    switch (sectionId) {
      case 'designation':
        return genererDesignation(affaire, expert);
      case 'parties':
        return genererParties(affaire);
      case 'operations':
        return genererOperations(affaire);
      case 'bien':
        return genererBien(affaire);
      case 'constatations':
        return genererConstatations(affaire);
      case 'dires':
        return genererDires(affaire);
      case 'chiffrage':
        return genererChiffrage(affaire);
      case 'conclusions':
        return genererConclusions(affaire);
      default:
        return '';
    }
  };

  // Toggle section
  const toggleSection = (sectionId) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, inclus: !s.inclus } : s
    ));
  };

  // Mettre à jour contenu section
  const updateSectionContent = (sectionId, contenu) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, contenu, complete: contenu.length > 50 } : s
    ));
  };

  // Sauvegarder le document dans l'affaire
  const sauvegarderDocument = (type, titre) => {
    try {
      const affaires = getStoredAffaires();
      const affaireIndex = affaires.findIndex(a => a.id === affaire.id);

      if (affaireIndex !== -1) {
        if (!affaires[affaireIndex].documents) {
          affaires[affaireIndex].documents = [];
        }

        // Vérifier si un document du même type existe déjà
        const existingIndex = affaires[affaireIndex].documents.findIndex(d => d.type === type);

        const newDoc = {
          id: `doc-${Date.now()}`,
          type: type,
          titre: titre,
          created_at: new Date().toISOString(),
          version: existingIndex !== -1 ? (affaires[affaireIndex].documents[existingIndex].version || 1) + 1 : 1
        };

        if (existingIndex !== -1) {
          // Mettre à jour le document existant
          affaires[affaireIndex].documents[existingIndex] = newDoc;
        } else {
          // Ajouter un nouveau document
          affaires[affaireIndex].documents.push(newDoc);
        }

        // Mettre à jour le statut si c'est un rapport
        if (type === 'note-synthese' || type === 'pre-rapport') {
          affaires[affaireIndex].statut = 'pre-rapport';
        } else if (type === 'rapport-final') {
          affaires[affaireIndex].statut = 'termine';
        }

        saveAffaires(affaires);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur sauvegarde document:', error);
      return false;
    }
  };

  // Générer tout le rapport
  const genererRapportComplet = async (docType = 'note-synthese') => {
    setGenerating(true);

    try {
      // Générer chaque section
      const sectionsGenerees = sections
        .filter(s => s.inclus)
        .map(s => ({
          ...s,
          contenu: s.contenu || genererContenuSection(s.id)
        }));

      // Assembler le HTML complet
      const html = assemblerRapportHTML(sectionsGenerees, affaire, expert);

      // Déterminer le titre du document
      const titreDoc = docType === 'note-synthese' ? 'Note de synthèse' :
                       docType === 'pre-rapport' ? 'Pré-rapport d\'expertise' :
                       'Rapport d\'expertise définitif';

      // Sauvegarder le document dans l'affaire
      sauvegarderDocument(docType, titreDoc);

      // Ouvrir dans une nouvelle fenêtre pour impression/PDF
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();

        // Attendre le chargement avant impression
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 500);
        };
      } else {
        // Si popup bloquée, proposer téléchargement HTML
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${titreDoc.replace(/\s+/g, '_')}_${affaire?.reference || 'expertise'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      // Notifier l'utilisateur
      toast.success('Document généré', `${titreDoc} a été sauvegardé avec succès`);

    } catch (error) {
      console.error('Erreur génération rapport:', error);
      toast.error('Erreur', 'La génération du rapport a échoué. Veuillez réessayer.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a]">Rapport d'expertise</h2>
          <p className="text-[#737373]">{affaire.reference}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Eye}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Édition' : 'Prévisualiser'}
          </Button>
          <Button
            variant="secondary"
            icon={FileText}
            loading={generating}
            onClick={() => genererRapportComplet('note-synthese')}
          >
            Note de synthèse
          </Button>
          <Button
            variant="primary"
            icon={Download}
            loading={generating}
            onClick={() => genererRapportComplet('rapport-final')}
          >
            Rapport final
          </Button>
        </div>
      </div>

      {/* Progression */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-[#1a1a1a]">Progression du rapport</h3>
            <p className="text-sm text-[#737373]">
              {sections.filter(s => s.inclus && s.complete).length} / {sections.filter(s => s.inclus).length} sections complètes
            </p>
          </div>
          <div className="text-2xl font-light text-[#c9a227]">{avancement}%</div>
        </div>
        <ProgressBar value={avancement} size="lg" />
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Liste des sections */}
        <div className="space-y-2">
          <h3 className="font-medium text-[#1a1a1a] mb-4">Sections du rapport</h3>
          {sections.map(section => {
            const Icon = section.icon;
            const isComplete = verifierSection(section.id);
            
            return (
              <div
                key={section.id}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  activeSection === section.id
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-[#fafafa] hover:bg-[#f5f5f5]'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={section.inclus}
                    onChange={() => toggleSection(section.id)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={section.obligatoire}
                    className="rounded"
                  />
                  <Icon className={`w-5 h-5 ${activeSection === section.id ? 'text-[#c9a227]' : 'text-[#737373]'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {section.numero && `${section.numero}. `}{section.titre}
                    </p>
                  </div>
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : section.inclus ? (
                    <Clock className="w-4 h-4 text-amber-500" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Éditeur de section */}
        <div className="col-span-2">
          <Card className="p-6">
            {sections.filter(s => s.id === activeSection).map(section => (
              <div key={section.id}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg text-[#1a1a1a]">
                    {section.numero && `${section.numero}. `}{section.titre}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={RefreshCw}
                    onClick={() => updateSectionContent(section.id, genererContenuSection(section.id))}
                  >
                    Auto-générer
                  </Button>
                </div>
                <p className="text-sm text-[#737373] mb-4">{section.description}</p>
                
                {previewMode ? (
                  <div 
                    className="prose max-w-none p-4 bg-[#fafafa] rounded-xl min-h-[400px]"
                    dangerouslySetInnerHTML={{ 
                      __html: section.contenu || genererContenuSection(section.id) 
                    }}
                  />
                ) : (
                  <textarea
                    value={section.contenu || genererContenuSection(section.id)}
                    onChange={(e) => updateSectionContent(section.id, e.target.value)}
                    className="w-full h-[400px] px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] resize-none font-mono text-sm"
                    placeholder="Contenu de la section..."
                  />
                )}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// GÉNÉRATEURS DE CONTENU PAR SECTION
// ============================================================================

const genererDesignation = (affaire, expert) => {
  return `
<p>Par ordonnance de référé en date du <strong>${formatDateFr(affaire.date_ordonnance)}</strong>, 
Madame/Monsieur le Président du <strong>${affaire.tribunal}</strong> a désigné :</p>

<p style="margin-left: 40px;"><strong>${expert?.nom} ${expert?.prenom || ''}</strong><br>
Expert inscrit sur la liste de la Cour d'Appel de ${expert?.cour_appel || 'Paris'}</p>

<p>en qualité d'expert judiciaire avec la mission suivante :</p>

<blockquote style="background-color: #f5f5f5; padding: 15px; border-left: 3px solid #c9a227; margin: 20px 0;">
${affaire.mission || 'Mission non renseignée'}
</blockquote>

<p>L'expert a accepté cette mission et a prêté serment de l'accomplir 
avec conscience et objectivité.</p>

${affaire.provision_montant ? `
<p>Une provision de <strong>${formatMontant(affaire.provision_montant)}</strong> a été fixée 
et ${affaire.provision_recue ? 'a été consignée' : 'est en attente de consignation'}.</p>
` : ''}
  `;
};

const genererParties = (affaire) => {
  if (!affaire.parties || affaire.parties.length === 0) {
    return '<p>Aucune partie identifiée.</p>';
  }

  const demandeurs = affaire.parties.filter(p => p.type === 'demandeur');
  const defenseurs = affaire.parties.filter(p => p.type === 'defenseur');
  const autres = affaire.parties.filter(p => !['demandeur', 'defenseur'].includes(p.type));

  let html = '';

  if (demandeurs.length > 0) {
    html += '<h4>Partie(s) demanderesse(s)</h4><ul>';
    demandeurs.forEach(p => {
      html += `<li><strong>${p.raison_sociale || `${p.nom} ${p.prenom || ''}`}</strong>`;
      if (p.avocat_nom) html += `<br>Représenté(e) par Maître ${p.avocat_nom}`;
      html += '</li>';
    });
    html += '</ul>';
  }

  if (defenseurs.length > 0) {
    html += '<h4>Partie(s) défenderesse(s)</h4><ul>';
    defenseurs.forEach(p => {
      html += `<li><strong>${p.raison_sociale || `${p.nom} ${p.prenom || ''}`}</strong>`;
      if (p.role) html += ` (${p.role})`;
      if (p.avocat_nom) html += `<br>Représenté(e) par Maître ${p.avocat_nom}`;
      html += '</li>';
    });
    html += '</ul>';
  }

  if (autres.length > 0) {
    html += '<h4>Autre(s) intervenant(s)</h4><ul>';
    autres.forEach(p => {
      html += `<li><strong>${p.raison_sociale || `${p.nom} ${p.prenom || ''}`}</strong>`;
      if (p.type) html += ` (${p.type})`;
      html += '</li>';
    });
    html += '</ul>';
  }

  return html;
};

const genererOperations = (affaire) => {
  if (!affaire.reunions || affaire.reunions.length === 0) {
    return '<p>Aucune réunion d\'expertise n\'a encore eu lieu.</p>';
  }

  let html = '<p>Les opérations d\'expertise se sont déroulées comme suit :</p>';

  affaire.reunions.forEach(reunion => {
    html += `
<h4>Réunion n°${reunion.numero} - ${formatDateFr(reunion.date_reunion)}</h4>
<p><strong>Lieu :</strong> ${reunion.lieu || 'Non précisé'}</p>
${reunion.compte_rendu ? `<p>${reunion.compte_rendu}</p>` : ''}
    `;
  });

  return html;
};

const genererBien = (affaire) => {
  return `
<h4>Localisation</h4>
<p>Le bien objet de l'expertise est situé :</p>
<p style="margin-left: 40px;">
${affaire.bien_adresse || 'Adresse non renseignée'}<br>
${affaire.bien_code_postal || ''} ${affaire.bien_ville || ''}
</p>

<h4>Nature du bien</h4>
<p>${affaire.bien_type || 'Type non précisé'}</p>

${affaire.bien_description ? `
<h4>Description</h4>
<p>${affaire.bien_description}</p>
` : ''}

${affaire.date_reception_ouvrage ? `
<h4>Date de réception</h4>
<p>La réception de l'ouvrage a été prononcée le <strong>${formatDateFr(affaire.date_reception_ouvrage)}</strong>.</p>
` : ''}
  `;
};

const genererConstatations = (affaire) => {
  if (!affaire.pathologies || affaire.pathologies.length === 0) {
    return '<p>Aucun désordre n\'a été constaté.</p>';
  }

  let html = '<p>Les désordres suivants ont été constatés lors des opérations d\'expertise :</p>';

  affaire.pathologies.forEach(patho => {
    html += `
<h4>Désordre n°${patho.numero} : ${patho.intitule}</h4>
<p><strong>Localisation :</strong> ${patho.localisation}</p>
<p><strong>Description :</strong> ${patho.description}</p>
${patho.garantie ? `<p><strong>Qualification :</strong> ${patho.garantie}</p>` : ''}
    `;
  });

  return html;
};

const genererDires = (affaire) => {
  if (!affaire.dires || affaire.dires.length === 0) {
    return '<p>Aucun dire n\'a été reçu des parties.</p>';
  }

  let html = '<p>Les dires suivants ont été adressés à l\'expert :</p>';

  affaire.dires.forEach(dire => {
    html += `
<h4>Dire n°${dire.numero}</h4>
<p><strong>Date de réception :</strong> ${formatDateFr(dire.date_reception)}</p>
<p><strong>Objet :</strong> ${dire.objet || 'Non précisé'}</p>
<p>${dire.contenu}</p>
${dire.reponse_expert ? `
<p><strong>Réponse de l'expert :</strong></p>
<p>${dire.reponse_expert}</p>
` : ''}
    `;
  });

  return html;
};

const genererChiffrage = (affaire) => {
  if (!affaire.chiffrages || affaire.chiffrages.length === 0) {
    return '<p>Le chiffrage des travaux de réparation sera établi ultérieurement.</p>';
  }

  const chiffrage = affaire.chiffrages.find(c => c.retenu) || affaire.chiffrages[0];

  let html = `
<p>Le coût estimatif des travaux de réparation s'établit comme suit :</p>
<h4>${chiffrage.titre}</h4>
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <thead>
    <tr style="background-color: #f5f5f5;">
      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Désignation</th>
      <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Montant HT</th>
    </tr>
  </thead>
  <tbody>
  `;

  (chiffrage.postes || []).forEach(poste => {
    html += `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${poste.designation}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatMontant(poste.total_ht)}</td>
    </tr>
    `;
  });

  html += `
  </tbody>
  <tfoot>
    <tr style="font-weight: bold;">
      <td style="border: 1px solid #ddd; padding: 8px;">TOTAL HT</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatMontant(chiffrage.total_ht)}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">TVA ${chiffrage.tva_taux || 20}%</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatMontant(chiffrage.total_ht * (chiffrage.tva_taux || 20) / 100)}</td>
    </tr>
    <tr style="font-weight: bold; background-color: #f5e6c8;">
      <td style="border: 1px solid #ddd; padding: 8px;">TOTAL TTC</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatMontant(chiffrage.total_ttc)}</td>
    </tr>
  </tfoot>
</table>
<p><em>Ce chiffrage est donné à titre indicatif et devra être confirmé par consultation d'entreprises.</em></p>
  `;

  return html;
};

const genererConclusions = (affaire) => {
  return `
<p>Au terme de nos opérations d'expertise, nous pouvons conclure que :</p>

<h4>Sur les désordres constatés</h4>
<p>[À compléter selon les constatations]</p>

<h4>Sur les causes</h4>
<p>[À compléter selon l'analyse]</p>

<h4>Sur les responsabilités</h4>
<p>[À compléter selon l'imputabilité]</p>

<h4>Sur le chiffrage</h4>
<p>Le coût des travaux de réparation est estimé à [montant] TTC.</p>

<p style="margin-top: 30px;">Tel est notre avis que nous soumettons à l'appréciation du Tribunal.</p>
  `;
};

// ============================================================================
// ASSEMBLAGE HTML COMPLET
// ============================================================================

const assemblerRapportHTML = (sections, affaire, expert) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rapport d'expertise - ${affaire.reference}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #1a1a1a; }
    h1, h2, h3, h4 { font-family: 'Arial', sans-serif; }
    h1 { font-size: 24pt; text-align: center; margin-bottom: 30px; }
    h2 { font-size: 16pt; border-bottom: 2px solid #c9a227; padding-bottom: 5px; margin-top: 30px; }
    h3 { font-size: 14pt; margin-top: 20px; }
    h4 { font-size: 12pt; margin-top: 15px; }
    blockquote { background: #f5f5f5; padding: 15px; border-left: 3px solid #c9a227; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background: #f5f5f5; }
    .page-break { page-break-before: always; }
    .header { text-align: center; margin-bottom: 50px; }
    .footer { position: fixed; bottom: 1cm; text-align: center; font-size: 10pt; color: #737373; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RAPPORT D'EXPERTISE JUDICIAIRE</h1>
    <p style="font-size: 14pt;">Affaire ${affaire.reference}</p>
    <p>${affaire.tribunal}</p>
    ${affaire.rg ? `<p>RG n° ${affaire.rg}</p>` : ''}
  </div>

  ${sections.map(section => `
    <div class="section ${section.id === 'sommaire' ? '' : 'page-break'}">
      <h2>${section.numero ? section.numero + '. ' : ''}${section.titre}</h2>
      ${section.contenu}
    </div>
  `).join('')}

  <div class="footer">
    Rapport d'expertise - ${affaire.reference} - ${expert?.nom || 'Expert Judiciaire'}
  </div>
</body>
</html>
  `;
};

// ============================================================================
// EXPORT
// ============================================================================

export default GenerateurRapport;
export { SECTIONS_RAPPORT };
