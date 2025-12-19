// ============================================================================
// CRM EXPERT JUDICIAIRE - SERVICE OPALEXE
// Dépôt automatisé des rapports d'expertise auprès des juridictions
// ============================================================================

// IMPORTANT: OPALEXE est le système de dépôt électronique des rapports d'expertise
// utilisé par les juridictions françaises. L'accès nécessite une authentification
// par certificat électronique (clé RGS** ou équivalent).

// ============================================================================
// CONFIGURATION
// ============================================================================

const OPALEXE_CONFIG = {
  // URLs selon environnement
  baseUrl: import.meta.env.VITE_OPALEXE_URL || 'https://opalexe.justice.fr',
  apiUrl: import.meta.env.VITE_OPALEXE_API_URL || 'https://api.opalexe.justice.fr',
  
  // Identifiants expert
  expertId: import.meta.env.VITE_OPALEXE_EXPERT_ID,
  
  // Certificat (en production, utiliser un gestionnaire de certificats sécurisé)
  certificatePath: import.meta.env.VITE_OPALEXE_CERT_PATH,
  
  // Options
  timeout: 60000, // 60 secondes
  maxFileSize: 50 * 1024 * 1024, // 50 Mo max
  allowedFormats: ['application/pdf']
};

// ============================================================================
// TYPES DE DOCUMENTS OPALEXE
// ============================================================================

export const OPALEXE_DOC_TYPES = {
  RAPPORT_EXPERTISE: {
    code: 'RPT_EXP',
    label: 'Rapport d\'expertise',
    description: 'Rapport final d\'expertise judiciaire'
  },
  NOTE_SYNTHESE: {
    code: 'NOTE_SYN',
    label: 'Note de synthèse',
    description: 'Note aux parties avant rapport'
  },
  DEMANDE_PROROGATION: {
    code: 'DEM_PROROG',
    label: 'Demande de prorogation',
    description: 'Demande de délai supplémentaire'
  },
  DEMANDE_CONSIGNATION: {
    code: 'DEM_CONSIG',
    label: 'Demande de consignation',
    description: 'Demande de provision complémentaire'
  },
  ETAT_FRAIS: {
    code: 'ETAT_FRAIS',
    label: 'État de frais et honoraires',
    description: 'Demande de taxation'
  },
  PIECE_JOINTE: {
    code: 'PJ',
    label: 'Pièce jointe',
    description: 'Document annexe'
  }
};

// ============================================================================
// STATUTS DE DÉPÔT
// ============================================================================

export const OPALEXE_STATUTS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  ERROR: 'error'
};

// ============================================================================
// SERVICE OPALEXE
// ============================================================================

export const opalexeService = {
  // --------------------------------------------------------------------------
  // Vérifier la connexion à OPALEXE
  // --------------------------------------------------------------------------
  async checkConnection() {
    try {
      // En production, vérifier le certificat et la connexion
      const response = await fetch(`${OPALEXE_CONFIG.apiUrl}/status`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        return { success: true, status: 'connected' };
      }

      return { success: false, error: 'Connexion impossible' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Récupérer les informations de l'expert
  // --------------------------------------------------------------------------
  async getExpertInfo() {
    try {
      const response = await fetch(`${OPALEXE_CONFIG.apiUrl}/experts/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erreur récupération info expert');

      const data = await response.json();
      return {
        success: true,
        expert: {
          id: data.id,
          nom: data.nom,
          prenom: data.prenom,
          specialites: data.specialites,
          juridictions: data.juridictions,
          email: data.email
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Rechercher une affaire par numéro RG
  // --------------------------------------------------------------------------
  async searchAffaire(numeroRG, juridiction) {
    try {
      const response = await fetch(
        `${OPALEXE_CONFIG.apiUrl}/affaires/search?rg=${encodeURIComponent(numeroRG)}&juridiction=${encodeURIComponent(juridiction)}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Affaire non trouvée');

      const data = await response.json();
      return {
        success: true,
        affaire: {
          id: data.id,
          numeroRG: data.numero_rg,
          juridiction: data.juridiction,
          chambre: data.chambre,
          magistrat: data.magistrat_referent,
          demandeurs: data.demandeurs,
          defenseurs: data.defenseurs,
          dateOrdonnance: data.date_ordonnance,
          dateEcheance: data.date_echeance
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Préparer un document pour le dépôt
  // --------------------------------------------------------------------------
  async prepareDocument(file, metadata) {
    // Vérifications préalables
    if (file.size > OPALEXE_CONFIG.maxFileSize) {
      return {
        success: false,
        error: `Fichier trop volumineux (max ${OPALEXE_CONFIG.maxFileSize / 1024 / 1024} Mo)`
      };
    }

    if (!OPALEXE_CONFIG.allowedFormats.includes(file.type)) {
      return {
        success: false,
        error: 'Format non supporté. Seuls les PDF sont acceptés.'
      };
    }

    // Vérifier que le PDF est valide et conforme PDF/A
    const pdfCheck = await this.validatePDF(file);
    if (!pdfCheck.valid) {
      return {
        success: false,
        error: pdfCheck.error,
        needsConversion: pdfCheck.needsConversion
      };
    }

    return {
      success: true,
      document: {
        file,
        name: file.name,
        size: file.size,
        type: metadata.type || OPALEXE_DOC_TYPES.RAPPORT_EXPERTISE.code,
        metadata
      }
    };
  },

  // --------------------------------------------------------------------------
  // Valider un PDF (format PDF/A requis)
  // --------------------------------------------------------------------------
  async validatePDF(file) {
    // En production, utiliser une bibliothèque comme pdf-lib ou pdfjs
    // pour vérifier la conformité PDF/A
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        
        // Vérification basique de la signature PDF
        const header = new Uint8Array(content.slice(0, 5));
        const pdfSignature = String.fromCharCode(...header);
        
        if (pdfSignature !== '%PDF-') {
          resolve({ valid: false, error: 'Le fichier n\'est pas un PDF valide' });
          return;
        }

        // En production, vérifier PDF/A compliance
        // Pour l'instant, on accepte tous les PDF
        resolve({ valid: true });
      };
      reader.onerror = () => {
        resolve({ valid: false, error: 'Erreur lecture du fichier' });
      };
      reader.readAsArrayBuffer(file);
    });
  },

  // --------------------------------------------------------------------------
  // Déposer un rapport d'expertise
  // --------------------------------------------------------------------------
  async depositRapport(affaireOpalexeId, document, options = {}) {
    const {
      notifyParties = true,
      urgent = false,
      commentaire = ''
    } = options;

    try {
      // 1. Créer le dépôt
      const formData = new FormData();
      formData.append('file', document.file);
      formData.append('affaire_id', affaireOpalexeId);
      formData.append('type_document', document.type);
      formData.append('commentaire', commentaire);
      formData.append('notify_parties', notifyParties.toString());
      formData.append('urgent', urgent.toString());

      // Ajouter les métadonnées
      if (document.metadata) {
        formData.append('metadata', JSON.stringify(document.metadata));
      }

      const response = await fetch(`${OPALEXE_CONFIG.apiUrl}/deposits`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors du dépôt');
      }

      const data = await response.json();

      return {
        success: true,
        deposit: {
          id: data.id,
          reference: data.reference,
          status: data.status,
          dateDepot: data.date_depot,
          accuseReception: data.accuse_reception_url
        }
      };

    } catch (error) {
      console.error('Erreur dépôt OPALEXE:', error);
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Vérifier le statut d'un dépôt
  // --------------------------------------------------------------------------
  async getDepositStatus(depositId) {
    try {
      const response = await fetch(`${OPALEXE_CONFIG.apiUrl}/deposits/${depositId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Dépôt non trouvé');

      const data = await response.json();
      return {
        success: true,
        deposit: {
          id: data.id,
          reference: data.reference,
          status: data.status,
          dateDepot: data.date_depot,
          dateAcceptation: data.date_acceptation,
          dateRejet: data.date_rejet,
          motifRejet: data.motif_rejet,
          accuseReception: data.accuse_reception_url
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Télécharger l'accusé de réception
  // --------------------------------------------------------------------------
  async downloadAccuseReception(depositId) {
    try {
      const response = await fetch(`${OPALEXE_CONFIG.apiUrl}/deposits/${depositId}/accuse`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Accusé non disponible');

      const blob = await response.blob();
      return {
        success: true,
        blob,
        filename: `accuse_reception_${depositId}.pdf`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Lister les dépôts de l'expert
  // --------------------------------------------------------------------------
  async listDeposits(filters = {}) {
    const { status, dateFrom, dateTo, affaireId } = filters;
    
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    if (affaireId) params.append('affaire_id', affaireId);

    try {
      const response = await fetch(`${OPALEXE_CONFIG.apiUrl}/deposits?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erreur récupération dépôts');

      const data = await response.json();
      return {
        success: true,
        deposits: data.items.map(d => ({
          id: d.id,
          reference: d.reference,
          affaireRG: d.affaire_rg,
          typeDocument: d.type_document,
          status: d.status,
          dateDepot: d.date_depot
        })),
        total: data.total
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ============================================================================
// COMPOSANTS REACT
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Upload, FileCheck, AlertCircle, Check, Clock, X,
  Download, RefreshCw, Loader2, ExternalLink, Shield
} from 'lucide-react';

// --------------------------------------------------------------------------
// Composant de dépôt de rapport
// --------------------------------------------------------------------------
export const OpalexeDepositForm = ({ affaire, rapport, onSuccess, onError }) => {
  const [step, setStep] = useState(1); // 1: Préparation, 2: Vérification, 3: Dépôt, 4: Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [opalexeAffaire, setOpalexeAffaire] = useState(null);
  const [deposit, setDeposit] = useState(null);
  const [options, setOptions] = useState({
    notifyParties: true,
    urgent: false,
    commentaire: ''
  });

  // Étape 1: Rechercher l'affaire dans OPALEXE
  const handleSearchAffaire = async () => {
    if (!affaire.rg) {
      setError('Numéro RG requis pour le dépôt OPALEXE');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await opalexeService.searchAffaire(affaire.rg, affaire.tribunal);
    
    setLoading(false);

    if (result.success) {
      setOpalexeAffaire(result.affaire);
      setStep(2);
    } else {
      setError(result.error);
    }
  };

  // Étape 2: Valider le document
  const handleValidateDocument = async () => {
    setLoading(true);
    setError(null);

    const result = await opalexeService.prepareDocument(rapport.file, {
      type: OPALEXE_DOC_TYPES.RAPPORT_EXPERTISE.code,
      affaireRef: affaire.reference,
      dateRapport: new Date().toISOString()
    });

    setLoading(false);

    if (result.success) {
      setStep(3);
    } else {
      setError(result.error);
    }
  };

  // Étape 3: Effectuer le dépôt
  const handleDeposit = async () => {
    setLoading(true);
    setError(null);

    const result = await opalexeService.depositRapport(
      opalexeAffaire.id,
      {
        file: rapport.file,
        type: OPALEXE_DOC_TYPES.RAPPORT_EXPERTISE.code,
        metadata: {
          affaireRef: affaire.reference,
          expert: affaire.expert_nom
        }
      },
      options
    );

    setLoading(false);

    if (result.success) {
      setDeposit(result.deposit);
      setStep(4);
      onSuccess && onSuccess(result.deposit);
    } else {
      setError(result.error);
      onError && onError(result.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicateur d'étapes */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= s ? 'bg-gold-500 text-white' : 'bg-neutral-200 text-neutral-500'
            }`}>
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 4 && (
              <div className={`w-16 h-1 mx-2 ${
                step > s ? 'bg-gold-500' : 'bg-neutral-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Contenu selon l'étape */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Recherche de l'affaire</h3>
          <p className="text-neutral-600">
            Recherche de l'affaire <strong>{affaire.rg || affaire.reference}</strong> dans OPALEXE
          </p>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Connexion sécurisée requise</p>
                <p>Assurez-vous que votre certificat électronique est bien inséré et actif.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            </div>
          )}

          <button
            onClick={handleSearchAffaire}
            disabled={loading}
            className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
            Rechercher dans OPALEXE
          </button>
        </div>
      )}

      {step === 2 && opalexeAffaire && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Vérification de l'affaire</h3>
          
          <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">N° RG</span>
              <span className="font-medium">{opalexeAffaire.numeroRG}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Juridiction</span>
              <span className="font-medium">{opalexeAffaire.juridiction}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Magistrat référent</span>
              <span className="font-medium">{opalexeAffaire.magistrat || 'Non précisé'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Échéance</span>
              <span className="font-medium">
                {opalexeAffaire.dateEcheance 
                  ? new Date(opalexeAffaire.dateEcheance).toLocaleDateString('fr-FR')
                  : 'Non précisée'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="w-5 h-5" />
              Affaire trouvée dans OPALEXE
            </div>
          </div>

          <button
            onClick={handleValidateDocument}
            disabled={loading}
            className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCheck className="w-5 h-5" />}
            Vérifier le document
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Options de dépôt</h3>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={options.notifyParties}
                onChange={(e) => setOptions({ ...options, notifyParties: e.target.checked })}
                className="rounded"
              />
              <span>Notifier les parties du dépôt</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={options.urgent}
                onChange={(e) => setOptions({ ...options, urgent: e.target.checked })}
                className="rounded"
              />
              <span>Marquer comme urgent</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                value={options.commentaire}
                onChange={(e) => setOptions({ ...options, commentaire: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-gold-500"
                placeholder="Commentaire à joindre au dépôt..."
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            </div>
          )}

          <button
            onClick={handleDeposit}
            disabled={loading}
            className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            Déposer le rapport
          </button>
        </div>
      )}

      {step === 4 && deposit && (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          
          <h3 className="font-medium text-lg">Dépôt effectué</h3>
          
          <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">Référence</span>
              <span className="font-medium font-mono">{deposit.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Date</span>
              <span className="font-medium">
                {new Date(deposit.dateDepot).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Statut</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {deposit.status === 'submitted' ? 'Soumis' : deposit.status}
              </span>
            </div>
          </div>

          <button
            onClick={async () => {
              const result = await opalexeService.downloadAccuseReception(deposit.id);
              if (result.success) {
                const url = URL.createObjectURL(result.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = result.filename;
                a.click();
              }
            }}
            className="flex items-center gap-2 mx-auto text-gold-600 hover:text-gold-700"
          >
            <Download className="w-5 h-5" />
            Télécharger l'accusé de réception
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  opalexeService,
  OpalexeDepositForm,
  OPALEXE_DOC_TYPES,
  OPALEXE_STATUTS
};
