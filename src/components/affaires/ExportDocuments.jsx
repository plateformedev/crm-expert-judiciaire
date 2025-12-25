import React, { useState, useMemo, useCallback } from 'react';
import {
  FileText, Download, Eye, FileType, File, Printer,
  Check, X, ChevronDown, ChevronRight, Loader2,
  FileSpreadsheet, Mail, Send, Clock, AlertCircle,
  CheckCircle, Folder, FileCheck, Copy, Settings,
  Layout, Image, Table, List
} from 'lucide-react';
import { Card, Badge, Button, ModalBase, useToast } from '../ui';

// Types de documents exportables
const TYPES_DOCUMENTS = [
  {
    id: 'convocation',
    label: 'Convocation',
    category: 'operations',
    icon: Mail,
    description: 'Convocation pour réunion d\'expertise',
    formats: ['pdf', 'docx']
  },
  {
    id: 'compte_rendu',
    label: 'Compte-rendu',
    category: 'operations',
    icon: FileText,
    description: 'Compte-rendu de réunion d\'expertise',
    formats: ['pdf', 'docx']
  },
  {
    id: 'pre_rapport',
    label: 'Pré-rapport',
    category: 'rapports',
    icon: File,
    description: 'Pré-rapport d\'expertise',
    formats: ['pdf', 'docx']
  },
  {
    id: 'rapport_final',
    label: 'Rapport final',
    category: 'rapports',
    icon: FileCheck,
    description: 'Rapport d\'expertise définitif',
    formats: ['pdf', 'docx']
  },
  {
    id: 'note_synthese',
    label: 'Note de synthèse',
    category: 'rapports',
    icon: FileText,
    description: 'Note de synthèse technique',
    formats: ['pdf', 'docx']
  },
  {
    id: 'etat_frais',
    label: 'État de frais',
    category: 'finances',
    icon: FileSpreadsheet,
    description: 'État de frais et honoraires',
    formats: ['pdf', 'xlsx']
  },
  {
    id: 'tableau_parties',
    label: 'Tableau des parties',
    category: 'dossier',
    icon: Table,
    description: 'Liste des parties et coordonnées',
    formats: ['pdf', 'xlsx']
  },
  {
    id: 'liste_desordres',
    label: 'Liste des désordres',
    category: 'dossier',
    icon: List,
    description: 'Récapitulatif des désordres constatés',
    formats: ['pdf', 'xlsx']
  },
  {
    id: 'courrier_personnalise',
    label: 'Courrier personnalisé',
    category: 'courriers',
    icon: Mail,
    description: 'Courrier type généré',
    formats: ['pdf', 'docx']
  },
  {
    id: 'dossier_complet',
    label: 'Dossier complet',
    category: 'dossier',
    icon: Folder,
    description: 'Archive complète du dossier',
    formats: ['pdf', 'zip']
  }
];

const CATEGORIES = [
  { id: 'dossier', label: 'Dossier', icon: Folder },
  { id: 'operations', label: 'Opérations', icon: Clock },
  { id: 'rapports', label: 'Rapports', icon: FileText },
  { id: 'finances', label: 'Finances', icon: FileSpreadsheet },
  { id: 'courriers', label: 'Courriers', icon: Mail }
];

const FORMAT_ICONS = {
  pdf: { icon: FileType, label: 'PDF', color: 'red' },
  docx: { icon: FileText, label: 'Word', color: 'blue' },
  xlsx: { icon: FileSpreadsheet, label: 'Excel', color: 'green' },
  zip: { icon: Folder, label: 'Archive', color: 'yellow' }
};

// Options de mise en page
const LAYOUT_OPTIONS = {
  pageSize: [
    { id: 'a4', label: 'A4' },
    { id: 'letter', label: 'Letter' }
  ],
  orientation: [
    { id: 'portrait', label: 'Portrait' },
    { id: 'landscape', label: 'Paysage' }
  ],
  margins: [
    { id: 'normal', label: 'Normales (2.5cm)' },
    { id: 'narrow', label: 'Étroites (1.27cm)' },
    { id: 'wide', label: 'Larges (3.17cm)' }
  ],
  fontSize: [
    { id: 'small', label: 'Petite (10pt)' },
    { id: 'normal', label: 'Normale (11pt)' },
    { id: 'large', label: 'Grande (12pt)' }
  ]
};

// Composant de prévisualisation
const PreviewDocument = ({ document, affaire, format, onClose, onExport }) => {
  const [loading, setLoading] = useState(false);

  // Génère un aperçu HTML du document
  const previewContent = useMemo(() => {
    switch (document.id) {
      case 'tableau_parties':
        return generatePartiesPreview(affaire);
      case 'liste_desordres':
        return generateDesordresPreview(affaire);
      case 'etat_frais':
        return generateEtatFraisPreview(affaire);
      case 'convocation':
        return generateConvocationPreview(affaire);
      case 'compte_rendu':
        return generateCompteRenduPreview(affaire);
      default:
        return generateGenericPreview(document, affaire);
    }
  }, [document, affaire]);

  const handleExport = async () => {
    setLoading(true);
    // Simulation de l'export
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    onExport(document, format);
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title={`Prévisualisation - ${document.label}`}
      size="xl"
    >
      <div className="flex flex-col h-[70vh]">
        {/* Barre d'outils */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Format :</span>
              <Badge variant={format === 'pdf' ? 'error' : format === 'docx' ? 'info' : 'success'}>
                {FORMAT_ICONS[format]?.label || format.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={Printer}
              onClick={() => window.print()}
            >
              Imprimer
            </Button>
            <Button
              variant="primary"
              icon={loading ? Loader2 : Download}
              onClick={handleExport}
              disabled={loading}
            >
              {loading ? 'Export en cours...' : `Télécharger en ${format.toUpperCase()}`}
            </Button>
          </div>
        </div>

        {/* Zone de prévisualisation */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          <div className="max-w-[210mm] mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Simulation d'une page A4 */}
            <div
              className="p-8 min-h-[297mm] font-serif text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

// Générateurs de prévisualisation
function generatePartiesPreview(affaire) {
  const parties = affaire?.parties || [];
  return `
    <div class="space-y-6">
      <div class="text-center border-b pb-4 mb-6">
        <h1 class="text-xl font-bold text-gray-900">TABLEAU DES PARTIES</h1>
        <p class="text-gray-600 mt-2">Affaire ${affaire?.reference || 'N/A'} - RG ${affaire?.numero_rg || 'N/A'}</p>
      </div>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2 text-left">Partie</th>
            <th class="border p-2 text-left">Qualité</th>
            <th class="border p-2 text-left">Adresse</th>
            <th class="border p-2 text-left">Contact</th>
            <th class="border p-2 text-left">Avocat</th>
          </tr>
        </thead>
        <tbody>
          ${parties.length > 0 ? parties.map(p => `
            <tr>
              <td class="border p-2 font-medium">${p.nom || 'N/A'}</td>
              <td class="border p-2">${formatQualite(p.qualite)}</td>
              <td class="border p-2 text-xs">${p.adresse || ''}<br/>${p.code_postal || ''} ${p.ville || ''}</td>
              <td class="border p-2 text-xs">${p.email || ''}<br/>${p.telephone || ''}</td>
              <td class="border p-2 text-xs">${p.avocat_nom || '-'}<br/>${p.avocat_email || ''}</td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="5" class="border p-4 text-center text-gray-500">Aucune partie enregistrée</td>
            </tr>
          `}
        </tbody>
      </table>
      <div class="mt-8 text-xs text-gray-500 text-right">
        Document généré le ${new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  `;
}

function generateDesordresPreview(affaire) {
  const desordres = affaire?.desordres || [];
  return `
    <div class="space-y-6">
      <div class="text-center border-b pb-4 mb-6">
        <h1 class="text-xl font-bold text-gray-900">LISTE DES DÉSORDRES</h1>
        <p class="text-gray-600 mt-2">Affaire ${affaire?.reference || 'N/A'}</p>
        <p class="text-gray-500">${affaire?.bien_adresse || ''}, ${affaire?.bien_code_postal || ''} ${affaire?.bien_ville || ''}</p>
      </div>
      ${desordres.length > 0 ? desordres.map((d, i) => `
        <div class="border rounded-lg p-4 mb-4">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-bold text-gray-900">Désordre n°${i + 1} : ${d.titre || 'Sans titre'}</h3>
              <p class="text-sm text-gray-600 mt-1">Localisation : ${d.localisation || 'Non précisée'}</p>
            </div>
            <span class="px-2 py-1 rounded text-xs font-medium ${
              d.gravite === 'critique' ? 'bg-red-100 text-red-700' :
              d.gravite === 'majeur' ? 'bg-orange-100 text-orange-700' :
              'bg-yellow-100 text-yellow-700'
            }">
              ${d.gravite || 'Non évalué'}
            </span>
          </div>
          <p class="mt-3 text-sm text-gray-700">${d.description || 'Aucune description'}</p>
          ${d.garantie ? `<p class="mt-2 text-xs text-gray-500">Garantie applicable : ${d.garantie}</p>` : ''}
        </div>
      `).join('') : `
        <p class="text-center text-gray-500 py-8">Aucun désordre enregistré</p>
      `}
      <div class="mt-8 text-xs text-gray-500 text-right">
        Document généré le ${new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  `;
}

function generateEtatFraisPreview(affaire) {
  const vacations = affaire?.vacations || [];
  const frais = affaire?.frais || [];
  const tauxHoraire = affaire?.taux_horaire || 200;
  const totalVacations = vacations.reduce((sum, v) => sum + (v.heures || 0), 0);
  const totalFrais = frais.reduce((sum, f) => sum + (f.montant || 0), 0);

  return `
    <div class="space-y-6">
      <div class="text-center border-b pb-4 mb-6">
        <h1 class="text-xl font-bold text-gray-900">ÉTAT DE FRAIS</h1>
        <p class="text-gray-600 mt-2">Affaire ${affaire?.reference || 'N/A'} - RG ${affaire?.numero_rg || 'N/A'}</p>
      </div>

      <div class="mb-6">
        <h2 class="font-bold text-gray-900 mb-3 border-b pb-2">I. VACATIONS</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-2 text-left">Date</th>
              <th class="border p-2 text-left">Description</th>
              <th class="border p-2 text-right">Durée (h)</th>
              <th class="border p-2 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${vacations.length > 0 ? vacations.map(v => `
              <tr>
                <td class="border p-2">${v.date ? new Date(v.date).toLocaleDateString('fr-FR') : 'N/A'}</td>
                <td class="border p-2">${v.description || ''}</td>
                <td class="border p-2 text-right">${v.heures?.toFixed(2) || '0.00'}</td>
                <td class="border p-2 text-right">${((v.heures || 0) * tauxHoraire).toFixed(2)} €</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="4" class="border p-2 text-center text-gray-500">Aucune vacation</td>
              </tr>
            `}
            <tr class="font-bold bg-gray-50">
              <td colspan="2" class="border p-2">Total vacations</td>
              <td class="border p-2 text-right">${totalVacations.toFixed(2)} h</td>
              <td class="border p-2 text-right">${(totalVacations * tauxHoraire).toFixed(2)} €</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mb-6">
        <h2 class="font-bold text-gray-900 mb-3 border-b pb-2">II. FRAIS ET DÉBOURS</h2>
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-2 text-left">Date</th>
              <th class="border p-2 text-left">Nature</th>
              <th class="border p-2 text-right">Montant HT</th>
            </tr>
          </thead>
          <tbody>
            ${frais.length > 0 ? frais.map(f => `
              <tr>
                <td class="border p-2">${f.date ? new Date(f.date).toLocaleDateString('fr-FR') : 'N/A'}</td>
                <td class="border p-2">${f.nature || ''}</td>
                <td class="border p-2 text-right">${(f.montant || 0).toFixed(2)} €</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="3" class="border p-2 text-center text-gray-500">Aucun frais</td>
              </tr>
            `}
            <tr class="font-bold bg-gray-50">
              <td colspan="2" class="border p-2">Total frais</td>
              <td class="border p-2 text-right">${totalFrais.toFixed(2)} €</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="border-t-2 pt-4">
        <table class="w-full">
          <tr class="text-lg font-bold">
            <td>TOTAL GÉNÉRAL HT</td>
            <td class="text-right">${((totalVacations * tauxHoraire) + totalFrais).toFixed(2)} €</td>
          </tr>
          <tr>
            <td>TVA (20%)</td>
            <td class="text-right">${(((totalVacations * tauxHoraire) + totalFrais) * 0.2).toFixed(2)} €</td>
          </tr>
          <tr class="text-xl font-bold text-blue-600">
            <td>TOTAL TTC</td>
            <td class="text-right">${(((totalVacations * tauxHoraire) + totalFrais) * 1.2).toFixed(2)} €</td>
          </tr>
        </table>
      </div>

      <div class="mt-8 text-xs text-gray-500 text-right">
        Document généré le ${new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  `;
}

function generateConvocationPreview(affaire) {
  const reunion = affaire?.reunions?.[0] || {};
  return `
    <div class="space-y-6">
      <div class="text-right mb-8">
        <p>${affaire?.bien_ville || '[Ville]'}, le ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      <div class="text-center mb-8">
        <h1 class="text-xl font-bold text-gray-900 uppercase">CONVOCATION</h1>
        <h2 class="text-lg text-gray-700">Réunion d'expertise n°${reunion.numero || 1}</h2>
      </div>

      <div class="mb-6">
        <p><strong>Affaire :</strong> ${affaire?.reference || 'N/A'}</p>
        <p><strong>RG :</strong> ${affaire?.numero_rg || 'N/A'}</p>
        <p><strong>Juridiction :</strong> ${affaire?.juridiction || 'N/A'}</p>
      </div>

      <div class="mb-6">
        <p>Madame, Monsieur,</p>
        <p class="mt-3">
          J'ai l'honneur de vous informer que la réunion d'expertise se tiendra :
        </p>
      </div>

      <div class="bg-gray-100 p-4 rounded mb-6">
        <p><strong>Date :</strong> ${reunion.date ? new Date(reunion.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '[Date à définir]'}</p>
        <p><strong>Heure :</strong> ${reunion.heure || '[Heure à définir]'}</p>
        <p><strong>Lieu :</strong> ${affaire?.bien_adresse || ''}, ${affaire?.bien_code_postal || ''} ${affaire?.bien_ville || ''}</p>
      </div>

      <div class="mb-6">
        <p>
          Je vous prie de bien vouloir vous présenter muni(e) de toutes pièces utiles,
          ou de vous faire représenter par mandataire dûment habilité.
        </p>
        <p class="mt-3">
          En cas d'empêchement, je vous remercie de me prévenir dans les meilleurs délais.
        </p>
      </div>

      <div class="mt-8">
        <p>Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.</p>
      </div>

      <div class="mt-8 text-right">
        <p class="font-semibold">[Nom de l'expert]</p>
        <p>Expert judiciaire</p>
      </div>
    </div>
  `;
}

function generateCompteRenduPreview(affaire) {
  const reunion = affaire?.reunions?.[0] || {};
  const presents = reunion.presents || [];
  return `
    <div class="space-y-6">
      <div class="text-center border-b pb-4 mb-6">
        <h1 class="text-xl font-bold text-gray-900">COMPTE-RENDU DE RÉUNION</h1>
        <h2 class="text-lg text-gray-700">Réunion n°${reunion.numero || 1}</h2>
        <p class="text-gray-600 mt-2">Affaire ${affaire?.reference || 'N/A'}</p>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p><strong>Date :</strong> ${reunion.date ? new Date(reunion.date).toLocaleDateString('fr-FR') : 'N/A'}</p>
          <p><strong>Heure :</strong> ${reunion.heure || 'N/A'}</p>
        </div>
        <div>
          <p><strong>Lieu :</strong> ${affaire?.bien_adresse || 'N/A'}</p>
          <p><strong>Durée :</strong> ${reunion.duree ? `${reunion.duree} heures` : 'N/A'}</p>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="font-bold text-gray-900 mb-2">Personnes présentes :</h3>
        <ul class="list-disc pl-5">
          ${presents.length > 0 ? presents.map(p => `<li>${p}</li>`).join('') : '<li>Aucun participant enregistré</li>'}
        </ul>
      </div>

      <div class="mb-6">
        <h3 class="font-bold text-gray-900 mb-2">Observations :</h3>
        <p>${reunion.observations || 'Aucune observation enregistrée.'}</p>
      </div>

      <div class="mb-6">
        <h3 class="font-bold text-gray-900 mb-2">Conclusions :</h3>
        <p>${reunion.conclusions || 'À compléter.'}</p>
      </div>

      <div class="mt-8 text-xs text-gray-500 text-right">
        Document généré le ${new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  `;
}

function generateGenericPreview(document, affaire) {
  return `
    <div class="space-y-6">
      <div class="text-center border-b pb-4 mb-6">
        <h1 class="text-xl font-bold text-gray-900">${document.label.toUpperCase()}</h1>
        <p class="text-gray-600 mt-2">Affaire ${affaire?.reference || 'N/A'}</p>
      </div>

      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="flex items-center gap-2 text-amber-800">
          <AlertCircle class="w-5 h-5" />
          <p class="font-medium">Prévisualisation non disponible</p>
        </div>
        <p class="text-sm text-amber-700 mt-2">
          Ce document sera généré avec les données actuelles de l'affaire.
          Cliquez sur "Télécharger" pour obtenir le fichier.
        </p>
      </div>

      <div class="mt-8 text-xs text-gray-500 text-right">
        Document généré le ${new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  `;
}

function formatQualite(qualite) {
  const map = {
    demandeur: 'Demandeur',
    defendeur: 'Défendeur',
    intervenant: 'Intervenant',
    appele_cause: 'Appelé en cause',
    assureur: 'Assureur'
  };
  return map[qualite] || qualite || 'N/A';
}

// Composant carte de document
const DocumentCard = ({ document, affaire, onPreview, onExport }) => {
  const [showFormats, setShowFormats] = useState(false);
  const Icon = document.icon;

  return (
    <div className="bg-white border rounded-xl p-4 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-50">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900">{document.label}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{document.description}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {document.formats.map(format => (
          <button
            key={format}
            onClick={() => onPreview(document, format)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              format === 'pdf' ? 'bg-red-50 text-red-700 hover:bg-red-100' :
              format === 'docx' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' :
              format === 'xlsx' ? 'bg-green-50 text-green-700 hover:bg-green-100' :
              'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {format.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

// Composant principal
export const ExportDocuments = ({ affaire, onClose }) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewFormat, setPreviewFormat] = useState(null);
  const [exportHistory, setExportHistory] = useState([]);

  // Filtrer les documents par catégorie
  const filteredDocuments = useMemo(() => {
    if (selectedCategory === 'all') return TYPES_DOCUMENTS;
    return TYPES_DOCUMENTS.filter(d => d.category === selectedCategory);
  }, [selectedCategory]);

  const handlePreview = (document, format) => {
    setPreviewDoc(document);
    setPreviewFormat(format);
  };

  const handleExport = useCallback((document, format) => {
    // Ajouter à l'historique
    const exportEntry = {
      id: Date.now(),
      document: document.label,
      format,
      date: new Date().toISOString()
    };
    setExportHistory(prev => [exportEntry, ...prev.slice(0, 9)]);

    toast({
      title: "Document exporté",
      description: `${document.label} téléchargé au format ${format.toUpperCase()}`
    });

    setPreviewDoc(null);
    setPreviewFormat(null);
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Download className="w-6 h-6 text-blue-600" />
            Export de documents
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Prévisualisez et exportez vos documents en PDF, Word ou Excel
          </p>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tous
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grille de documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map(doc => (
          <DocumentCard
            key={doc.id}
            document={doc}
            affaire={affaire}
            onPreview={handlePreview}
            onExport={handleExport}
          />
        ))}
      </div>

      {/* Historique des exports */}
      {exportHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Exports récents
          </h3>
          <div className="space-y-2">
            {exportHistory.map(entry => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">{entry.document}</span>
                  <Badge variant={
                    entry.format === 'pdf' ? 'error' :
                    entry.format === 'docx' ? 'info' : 'success'
                  }>
                    {entry.format.toUpperCase()}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(entry.date).toLocaleTimeString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {previewDoc && (
        <PreviewDocument
          document={previewDoc}
          affaire={affaire}
          format={previewFormat}
          onClose={() => {
            setPreviewDoc(null);
            setPreviewFormat(null);
          }}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

export default ExportDocuments;
