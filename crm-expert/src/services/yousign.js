// ============================================================================
// CRM EXPERT JUDICIAIRE - SERVICE SIGNATURE ÉLECTRONIQUE YOUSIGN
// Intégration API Yousign v3 pour signature des documents
// ============================================================================

import axios from 'axios';

// ============================================================================
// CONFIGURATION
// ============================================================================

const YOUSIGN_CONFIG = {
  baseUrl: import.meta.env.VITE_YOUSIGN_API_URL || 'https://api.yousign.app/v3',
  apiKey: import.meta.env.VITE_YOUSIGN_API_KEY,
  webhookUrl: import.meta.env.VITE_YOUSIGN_WEBHOOK_URL,
  sandbox: import.meta.env.VITE_YOUSIGN_SANDBOX === 'true'
};

// ============================================================================
// CLIENT API YOUSIGN
// ============================================================================

const yousignClient = axios.create({
  baseURL: YOUSIGN_CONFIG.baseUrl,
  headers: {
    'Authorization': `Bearer ${YOUSIGN_CONFIG.apiKey}`,
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour les erreurs
yousignClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Erreur Yousign:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================================================
// SERVICE YOUSIGN
// ============================================================================

export const yousignService = {
  // --------------------------------------------------------------------------
  // Créer une demande de signature
  // --------------------------------------------------------------------------
  async createSignatureRequest(params) {
    const {
      name,
      deliveryMode = 'email',
      timezone = 'Europe/Paris',
      expirationDate,
      documents,
      signers
    } = params;

    try {
      // 1. Créer la demande de signature
      const { data: signatureRequest } = await yousignClient.post('/signature_requests', {
        name,
        delivery_mode: deliveryMode,
        timezone,
        expiration_date: expirationDate,
        external_id: `crm-expert-${Date.now()}`,
        custom_experience_id: null,
        email_custom_note: `Vous êtes invité(e) à signer le document "${name}" dans le cadre d'une expertise judiciaire.`
      });

      const signatureRequestId = signatureRequest.id;

      // 2. Uploader les documents
      const uploadedDocs = [];
      for (const doc of documents) {
        const uploadedDoc = await this.uploadDocument(signatureRequestId, doc);
        uploadedDocs.push(uploadedDoc);
      }

      // 3. Ajouter les signataires
      const addedSigners = [];
      for (const signer of signers) {
        const addedSigner = await this.addSigner(signatureRequestId, signer, uploadedDocs);
        addedSigners.push(addedSigner);
      }

      // 4. Activer la demande de signature
      const activatedRequest = await this.activateSignatureRequest(signatureRequestId);

      return {
        success: true,
        signatureRequestId,
        documents: uploadedDocs,
        signers: addedSigners,
        status: activatedRequest.status
      };

    } catch (error) {
      console.error('Erreur création signature:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  // --------------------------------------------------------------------------
  // Uploader un document
  // --------------------------------------------------------------------------
  async uploadDocument(signatureRequestId, document) {
    const {
      name,
      content, // Base64 ou File
      contentType = 'application/pdf'
    } = document;

    // Si c'est un File, convertir en base64
    let base64Content = content;
    if (content instanceof File) {
      base64Content = await this.fileToBase64(content);
    }

    const { data } = await yousignClient.post(`/signature_requests/${signatureRequestId}/documents`, {
      name,
      file_content: base64Content,
      file_name: name,
      nature: 'signable_document'
    });

    return {
      id: data.id,
      name: data.name,
      pages: data.total_pages
    };
  },

  // --------------------------------------------------------------------------
  // Ajouter un signataire
  // --------------------------------------------------------------------------
  async addSigner(signatureRequestId, signer, documents) {
    const {
      firstName,
      lastName,
      email,
      phone,
      role = 'signer',
      signatureLevel = 'electronic_signature',
      fields = []
    } = signer;

    // Définir les champs de signature par défaut si non fournis
    const signatureFields = fields.length > 0 ? fields : documents.map(doc => ({
      document_id: doc.id,
      type: 'signature',
      page: doc.pages, // Dernière page
      x: 100,
      y: 50,
      width: 200,
      height: 50
    }));

    const { data } = await yousignClient.post(`/signature_requests/${signatureRequestId}/signers`, {
      info: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone,
        locale: 'fr'
      },
      signature_level: signatureLevel,
      signature_authentication_mode: phone ? 'otp_sms' : 'no_otp',
      fields: signatureFields
    });

    return {
      id: data.id,
      email,
      name: `${firstName} ${lastName}`,
      status: data.status
    };
  },

  // --------------------------------------------------------------------------
  // Activer une demande de signature
  // --------------------------------------------------------------------------
  async activateSignatureRequest(signatureRequestId) {
    const { data } = await yousignClient.post(`/signature_requests/${signatureRequestId}/activate`);
    return data;
  },

  // --------------------------------------------------------------------------
  // Obtenir le statut d'une demande
  // --------------------------------------------------------------------------
  async getSignatureRequestStatus(signatureRequestId) {
    try {
      const { data } = await yousignClient.get(`/signature_requests/${signatureRequestId}`);
      
      return {
        success: true,
        id: data.id,
        name: data.name,
        status: data.status,
        createdAt: data.created_at,
        expirationDate: data.expiration_date,
        signers: data.signers?.map(s => ({
          id: s.id,
          name: `${s.info.first_name} ${s.info.last_name}`,
          email: s.info.email,
          status: s.status,
          signedAt: s.signature?.created_at
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  // --------------------------------------------------------------------------
  // Télécharger le document signé
  // --------------------------------------------------------------------------
  async downloadSignedDocument(signatureRequestId, documentId) {
    try {
      const { data } = await yousignClient.get(
        `/signature_requests/${signatureRequestId}/documents/${documentId}/download`,
        { responseType: 'arraybuffer' }
      );

      return {
        success: true,
        content: data,
        contentType: 'application/pdf'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  // --------------------------------------------------------------------------
  // Annuler une demande de signature
  // --------------------------------------------------------------------------
  async cancelSignatureRequest(signatureRequestId, reason = 'Annulé par l\'expert') {
    try {
      await yousignClient.post(`/signature_requests/${signatureRequestId}/cancel`, {
        reason
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  // --------------------------------------------------------------------------
  // Relancer un signataire
  // --------------------------------------------------------------------------
  async remindSigner(signatureRequestId, signerId) {
    try {
      await yousignClient.post(`/signature_requests/${signatureRequestId}/signers/${signerId}/send_reminder`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  },

  // --------------------------------------------------------------------------
  // Utilitaire : Convertir File en Base64
  // --------------------------------------------------------------------------
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
};

// ============================================================================
// TYPES DE DOCUMENTS À SIGNER
// ============================================================================

export const DOCUMENT_TYPES = {
  FEUILLE_PRESENCE: 'feuille_presence',
  PROTOCOLE_ACCORD: 'protocole_accord',
  RAPPORT_EXPERTISE: 'rapport_expertise',
  PROCES_VERBAL: 'proces_verbal',
  DEVIS_ACCEPTE: 'devis_accepte'
};

// ============================================================================
// TEMPLATES DE SIGNATURE
// ============================================================================

export const signatureTemplates = {
  // Template pour feuille de présence réunion
  feuillePresence: (affaire, reunion, participants) => ({
    name: `Feuille de présence - ${affaire.reference} - Réunion ${reunion.numero}`,
    deliveryMode: 'email',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
    signers: participants.map((p, index) => ({
      firstName: p.prenom || 'Représentant',
      lastName: p.nom,
      email: p.email,
      phone: p.telephone,
      fields: [{
        type: 'signature',
        page: 1,
        x: 100,
        y: 200 + (index * 100), // Décalage vertical pour chaque signataire
        width: 200,
        height: 50
      }]
    }))
  }),

  // Template pour protocole d'accord amiable
  protocoleAccord: (affaire, parties) => ({
    name: `Protocole d'accord - ${affaire.reference}`,
    deliveryMode: 'email',
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
    signers: parties.map((p) => ({
      firstName: p.prenom || 'Représentant',
      lastName: p.nom || p.raison_sociale,
      email: p.email || p.avocat_email,
      signatureLevel: 'advanced_electronic_signature', // Signature avancée pour les accords
      fields: [{
        type: 'signature',
        page: -1, // Dernière page
        x: 100,
        y: 100,
        width: 200,
        height: 50
      }]
    }))
  }),

  // Template pour rapport d'expertise (signature expert seul)
  rapportExpertise: (affaire, expert) => ({
    name: `Rapport d'expertise - ${affaire.reference}`,
    deliveryMode: 'none', // L'expert signe directement
    signers: [{
      firstName: expert.prenom,
      lastName: expert.nom,
      email: expert.email,
      signatureLevel: 'qualified_electronic_signature', // Signature qualifiée
      fields: [{
        type: 'signature',
        page: -1,
        x: 350,
        y: 100,
        width: 200,
        height: 80
      }, {
        type: 'text',
        page: -1,
        x: 350,
        y: 190,
        width: 200,
        height: 20,
        text: `Fait à Paris, le ${new Date().toLocaleDateString('fr-FR')}`
      }]
    }]
  })
};

// ============================================================================
// COMPOSANT REACT - BOUTON SIGNATURE
// ============================================================================

import React, { useState } from 'react';
import { PenTool, Loader2, Check, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

export const SignatureButton = ({ 
  document,
  signers,
  onSignatureCreated,
  onSignatureCompleted,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [signatureRequest, setSignatureRequest] = useState(null);
  const [error, setError] = useState(null);

  const handleCreateSignature = async () => {
    setLoading(true);
    setError(null);

    const result = await yousignService.createSignatureRequest({
      name: document.name,
      documents: [document],
      signers
    });

    setLoading(false);

    if (result.success) {
      setSignatureRequest(result);
      onSignatureCreated && onSignatureCreated(result);
    } else {
      setError(result.error);
    }
  };

  const handleCheckStatus = async () => {
    if (!signatureRequest) return;

    setLoading(true);
    const status = await yousignService.getSignatureRequestStatus(signatureRequest.signatureRequestId);
    setLoading(false);

    if (status.success && status.status === 'done') {
      onSignatureCompleted && onSignatureCompleted(status);
    }

    setSignatureRequest(prev => ({ ...prev, ...status }));
  };

  if (signatureRequest?.status === 'done') {
    return (
      <button
        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl"
        disabled
      >
        <Check className="w-5 h-5" />
        Signé
      </button>
    );
  }

  if (signatureRequest) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-amber-600">En attente de signature</span>
        <button
          onClick={handleCheckStatus}
          disabled={loading}
          className="p-2 hover:bg-neutral-100 rounded-lg"
          title="Vérifier le statut"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5 text-neutral-600" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleCreateSignature}
        disabled={disabled || loading}
        className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <PenTool className="w-5 h-5" />
        )}
        Demander signature
      </button>
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// COMPOSANT REACT - SUIVI SIGNATURES
// ============================================================================

export const SignatureTracker = ({ signatureRequestId, onComplete }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    const result = await yousignService.getSignatureRequestStatus(signatureRequestId);
    setStatus(result);
    setLoading(false);

    if (result.success && result.status === 'done') {
      onComplete && onComplete(result);
    }
  };

  React.useEffect(() => {
    fetchStatus();
    // Polling toutes les 30 secondes
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [signatureRequestId]);

  if (loading && !status) {
    return (
      <div className="flex items-center gap-2 text-neutral-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        Chargement...
      </div>
    );
  }

  if (!status?.success) {
    return (
      <div className="text-red-600">
        Erreur: {status?.error || 'Impossible de charger le statut'}
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-neutral-100 text-neutral-700',
    ongoing: 'bg-amber-100 text-amber-700',
    done: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    canceled: 'bg-red-100 text-red-700'
  };

  const statusLabels = {
    draft: 'Brouillon',
    ongoing: 'En cours',
    done: 'Terminé',
    expired: 'Expiré',
    canceled: 'Annulé'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{status.name}</h4>
        <span className={`px-3 py-1 rounded-full text-sm ${statusColors[status.status]}`}>
          {statusLabels[status.status]}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-neutral-500 uppercase tracking-wider">Signataires</p>
        {status.signers?.map(signer => (
          <div key={signer.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
            <div>
              <p className="font-medium">{signer.name}</p>
              <p className="text-sm text-neutral-500">{signer.email}</p>
            </div>
            <div className="text-right">
              {signer.status === 'signed' ? (
                <span className="text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Signé {signer.signedAt && `le ${new Date(signer.signedAt).toLocaleDateString('fr-FR')}`}
                </span>
              ) : (
                <span className="text-amber-600">En attente</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {status.status === 'done' && (
        <button
          onClick={async () => {
            const doc = await yousignService.downloadSignedDocument(
              signatureRequestId,
              status.documents?.[0]?.id
            );
            if (doc.success) {
              // Télécharger le fichier
              const blob = new Blob([doc.content], { type: 'application/pdf' });
              const url = URL.createObjectURL(blob);
              window.open(url, '_blank');
            }
          }}
          className="flex items-center gap-2 text-gold-600 hover:text-gold-700"
        >
          <ExternalLink className="w-4 h-4" />
          Télécharger le document signé
        </button>
      )}
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  yousignService,
  signatureTemplates,
  SignatureButton,
  SignatureTracker,
  DOCUMENT_TYPES
};
