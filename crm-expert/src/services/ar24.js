// ============================================================================
// CRM EXPERT JUDICIAIRE - SERVICE AR24 (LRAR DÉMATÉRIALISÉ)
// ============================================================================

// Configuration
const AR24_CONFIG = {
  sandboxUrl: 'https://sandbox.ar24.fr/api/v2',
  productionUrl: 'https://api.ar24.fr/v2',
  get baseUrl() {
    const env = import.meta.env.VITE_AR24_ENV || 'sandbox';
    return env === 'production' ? this.productionUrl : this.sandboxUrl;
  }
};

// Statuts possibles d'un envoi AR24
const AR24_STATUTS = {
  CREATED: { code: 'created', label: 'Créé', color: 'gray' },
  PENDING: { code: 'pending', label: 'En attente', color: 'blue' },
  SENT: { code: 'sent', label: 'Envoyé', color: 'blue' },
  DELIVERED: { code: 'delivered', label: 'Distribué', color: 'green' },
  AR_RECEIVED: { code: 'ar_received', label: 'AR reçu', color: 'green' },
  REFUSED: { code: 'refused', label: 'Refusé', color: 'red' },
  NOT_CLAIMED: { code: 'not_claimed', label: 'Non réclamé', color: 'orange' },
  RETURNED: { code: 'returned', label: 'Retourné', color: 'red' },
  FAILED: { code: 'failed', label: 'Échec', color: 'red' }
};

// Types d'envoi
const AR24_TYPES = {
  LRE: { code: 'lre', label: 'Lettre Recommandée Électronique', prix: 3.49 },
  LRAR: { code: 'lrar', label: 'LRAR Hybride', prix: 4.99 },
  LRAR_PAPIER: { code: 'lrar_papier', label: 'LRAR Papier', prix: 5.99 }
};

// ============================================================================
// CLASSE SERVICE AR24
// ============================================================================

class AR24Service {
  constructor() {
    this.apiKey = import.meta.env.VITE_AR24_API_KEY;
    this.apiSecret = import.meta.env.VITE_AR24_SECRET;
  }

  // Vérifier si le service est configuré
  isConfigured() {
    return !!this.apiKey && !!this.apiSecret;
  }

  // Headers d'authentification
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Api-Secret': this.apiSecret
    };
  }

  // ============================================================================
  // ENVOI DE LRAR
  // ============================================================================

  /**
   * Envoyer une LRAR
   * @param {Object} recipient - Destinataire
   * @param {Object} document - Document à envoyer
   * @param {Object} options - Options d'envoi
   */
  async sendLRAR(recipient, document, options = {}) {
    if (!this.isConfigured()) {
      console.warn('AR24 non configuré - Mode simulation');
      return this.simulateSend(recipient, document, options);
    }

    try {
      // Préparer le destinataire
      const recipientData = {
        type: recipient.type || 'individual', // individual, company
        firstname: recipient.prenom || '',
        lastname: recipient.nom,
        company: recipient.raison_sociale || '',
        email: recipient.email || '',
        address: {
          line1: recipient.adresse,
          line2: recipient.adresse2 || '',
          postal_code: recipient.code_postal,
          city: recipient.ville,
          country: recipient.pays || 'FR'
        }
      };

      // Préparer le document
      const documentData = {
        content: document.content, // Base64 ou URL
        filename: document.filename || 'document.pdf',
        content_type: document.contentType || 'application/pdf'
      };

      // Options d'envoi
      const sendOptions = {
        type: options.type || 'lrar', // lre, lrar, lrar_papier
        priority: options.priority || 'normal',
        reference: options.reference || `EXP-${Date.now()}`,
        notification_email: options.notificationEmail || '',
        ...options
      };

      const response = await fetch(`${AR24_CONFIG.baseUrl}/letters`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          recipient: recipientData,
          documents: [documentData],
          options: sendOptions
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur AR24');
      }

      const data = await response.json();
      
      return {
        success: true,
        trackingNumber: data.tracking_number,
        letterId: data.id,
        status: data.status,
        estimatedDelivery: data.estimated_delivery,
        price: data.price
      };
    } catch (error) {
      console.error('Erreur envoi AR24:', error);
      throw error;
    }
  }

  /**
   * Envoyer une convocation via LRAR
   */
  async sendConvocation(affaire, reunion, destinataire, pdfContent) {
    const reference = `CONV-${affaire.reference}-R${reunion.numero}`;
    
    return this.sendLRAR(
      destinataire,
      {
        content: pdfContent,
        filename: `Convocation_${reference}.pdf`
      },
      {
        type: 'lrar',
        reference,
        priority: 'high',
        metadata: {
          affaire_id: affaire.id,
          reunion_id: reunion.id,
          type: 'convocation'
        }
      }
    );
  }

  /**
   * Envoyer un rapport via LRAR
   */
  async sendRapport(affaire, destinataire, pdfContent) {
    const reference = `RAP-${affaire.reference}`;
    
    return this.sendLRAR(
      destinataire,
      {
        content: pdfContent,
        filename: `Rapport_${reference}.pdf`
      },
      {
        type: 'lrar',
        reference,
        priority: 'normal',
        metadata: {
          affaire_id: affaire.id,
          type: 'rapport'
        }
      }
    );
  }

  // ============================================================================
  // SUIVI DES ENVOIS
  // ============================================================================

  /**
   * Obtenir le statut d'un envoi
   */
  async getStatus(trackingNumber) {
    if (!this.isConfigured()) {
      return this.simulateStatus(trackingNumber);
    }

    try {
      const response = await fetch(
        `${AR24_CONFIG.baseUrl}/letters/${trackingNumber}/status`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erreur récupération statut');
      }

      const data = await response.json();
      
      return {
        trackingNumber: data.tracking_number,
        status: data.status,
        statusLabel: AR24_STATUTS[data.status.toUpperCase()]?.label || data.status,
        statusColor: AR24_STATUTS[data.status.toUpperCase()]?.color || 'gray',
        events: data.events || [],
        deliveredAt: data.delivered_at,
        arReceivedAt: data.ar_received_at
      };
    } catch (error) {
      console.error('Erreur statut AR24:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'historique des événements
   */
  async getEvents(trackingNumber) {
    if (!this.isConfigured()) {
      return this.simulateEvents(trackingNumber);
    }

    try {
      const response = await fetch(
        `${AR24_CONFIG.baseUrl}/letters/${trackingNumber}/events`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erreur récupération événements');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur événements AR24:', error);
      throw error;
    }
  }

  /**
   * Télécharger la preuve de dépôt/AR
   */
  async downloadProof(trackingNumber, type = 'ar') {
    if (!this.isConfigured()) {
      return this.simulateProof(trackingNumber, type);
    }

    try {
      const response = await fetch(
        `${AR24_CONFIG.baseUrl}/letters/${trackingNumber}/proof/${type}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Preuve non disponible');
      }

      const blob = await response.blob();
      return {
        blob,
        filename: `AR_${trackingNumber}_${type}.pdf`,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('Erreur téléchargement preuve:', error);
      throw error;
    }
  }

  // ============================================================================
  // GESTION DU COMPTE
  // ============================================================================

  /**
   * Obtenir le solde du compte
   */
  async getBalance() {
    if (!this.isConfigured()) {
      return { balance: 150.00, currency: 'EUR' };
    }

    try {
      const response = await fetch(`${AR24_CONFIG.baseUrl}/account/balance`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur récupération solde');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur solde AR24:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'historique des envois
   */
  async getHistory(options = {}) {
    if (!this.isConfigured()) {
      return this.simulateHistory();
    }

    const params = new URLSearchParams({
      page: options.page || 1,
      per_page: options.perPage || 20,
      ...(options.status && { status: options.status }),
      ...(options.from && { from: options.from }),
      ...(options.to && { to: options.to })
    });

    try {
      const response = await fetch(
        `${AR24_CONFIG.baseUrl}/letters?${params}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erreur récupération historique');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur historique AR24:', error);
      throw error;
    }
  }

  // ============================================================================
  // SIMULATIONS (MODE DÉMO)
  // ============================================================================

  simulateSend(recipient, document, options) {
    const trackingNumber = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    return {
      success: true,
      simulated: true,
      trackingNumber,
      letterId: `letter_${Date.now()}`,
      status: 'pending',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      price: AR24_TYPES[options.type?.toUpperCase()]?.prix || 4.99,
      message: 'Mode simulation - Aucun envoi réel effectué'
    };
  }

  simulateStatus(trackingNumber) {
    const statuses = ['pending', 'sent', 'delivered', 'ar_received'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      trackingNumber,
      status: randomStatus,
      statusLabel: AR24_STATUTS[randomStatus.toUpperCase()]?.label || randomStatus,
      statusColor: AR24_STATUTS[randomStatus.toUpperCase()]?.color || 'gray',
      events: [
        { date: new Date().toISOString(), type: 'created', description: 'Lettre créée' },
        { date: new Date().toISOString(), type: 'sent', description: 'Lettre envoyée' }
      ],
      simulated: true
    };
  }

  simulateEvents(trackingNumber) {
    return {
      trackingNumber,
      events: [
        { 
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
          type: 'created', 
          description: 'Lettre créée' 
        },
        { 
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
          type: 'sent', 
          description: 'Lettre prise en charge par La Poste' 
        },
        { 
          date: new Date().toISOString(), 
          type: 'in_transit', 
          description: 'En cours d\'acheminement' 
        }
      ],
      simulated: true
    };
  }

  simulateProof(trackingNumber, type) {
    return {
      blob: null,
      filename: `AR_${trackingNumber}_${type}_SIMULATION.pdf`,
      url: null,
      simulated: true,
      message: 'Mode simulation - Document non disponible'
    };
  }

  simulateHistory() {
    return {
      data: [
        {
          id: 'sim_1',
          tracking_number: 'SIM-001',
          reference: 'CONV-EXP-2024-0001-R1',
          status: 'delivered',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          recipient: { name: 'Martin DUPONT' }
        },
        {
          id: 'sim_2',
          tracking_number: 'SIM-002',
          reference: 'CONV-EXP-2024-0001-R2',
          status: 'sent',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          recipient: { name: 'SCI Les Jardins' }
        }
      ],
      pagination: {
        total: 2,
        page: 1,
        per_page: 20
      },
      simulated: true
    };
  }

  // ============================================================================
  // UTILITAIRES
  // ============================================================================

  /**
   * Valider une adresse pour envoi LRAR
   */
  validateAddress(address) {
    const errors = [];
    
    if (!address.adresse) errors.push('Adresse requise');
    if (!address.code_postal) errors.push('Code postal requis');
    if (!address.ville) errors.push('Ville requise');
    
    // Validation code postal français
    if (address.code_postal && !/^[0-9]{5}$/.test(address.code_postal)) {
      errors.push('Code postal invalide (5 chiffres)');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Estimer le coût d'un envoi
   */
  estimateCost(type = 'lrar', quantity = 1) {
    const typeInfo = AR24_TYPES[type.toUpperCase()] || AR24_TYPES.LRAR;
    return {
      type: typeInfo.label,
      unitPrice: typeInfo.prix,
      quantity,
      total: typeInfo.prix * quantity
    };
  }

  /**
   * Obtenir les types d'envoi disponibles
   */
  getTypes() {
    return Object.values(AR24_TYPES);
  }

  /**
   * Obtenir les statuts possibles
   */
  getStatuts() {
    return AR24_STATUTS;
  }
}

// ============================================================================
// INSTANCE SINGLETON
// ============================================================================

export const ar24Service = new AR24Service();

// ============================================================================
// EXPORT
// ============================================================================

export default ar24Service;
export { AR24_STATUTS, AR24_TYPES, AR24_CONFIG };
