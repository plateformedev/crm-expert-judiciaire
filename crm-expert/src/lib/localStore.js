// ============================================================================
// CRM EXPERT JUDICIAIRE - STOCKAGE LOCAL (MODE DEMO)
// Utilisé quand Supabase n'est pas configuré
// ============================================================================

// Vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && !url.includes('placeholder');
};

// ============================================================================
// GESTION DU STOCKAGE LOCAL
// ============================================================================

const STORAGE_KEYS = {
  AFFAIRES: 'crm_affaires',
  PARTIES: 'crm_parties',
  REUNIONS: 'crm_reunions',
  PATHOLOGIES: 'crm_pathologies',
  DOCUMENTS: 'crm_documents',
  CONTACTS: 'crm_contacts',
  USER: 'crm_demo_user'
};

// Helper pour générer des IDs uniques
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper pour sauvegarder dans localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Erreur sauvegarde localStorage:', e);
    return false;
  }
};

// Helper pour lire depuis localStorage
const getFromStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('Erreur lecture localStorage:', e);
    return defaultValue;
  }
};

// ============================================================================
// UTILISATEUR DEMO
// ============================================================================

export const demoUser = {
  id: 'demo-user-001',
  email: 'expert@demo.fr',
  user_metadata: {
    nom: 'Expert',
    prenom: 'Demo'
  }
};

export const demoExpert = {
  id: 'demo-user-001',
  email: 'expert@demo.fr',
  nom: 'Expert',
  prenom: 'Demo',
  specialite: 'BTP',
  telephone: '01 23 45 67 89',
  adresse: '123 Rue de la Justice, 75001 Paris'
};

// ============================================================================
// SERVICE DE STOCKAGE LOCAL - AFFAIRES
// ============================================================================

export const localAffaires = {
  getAll() {
    return getFromStorage(STORAGE_KEYS.AFFAIRES, []);
  },

  getById(id) {
    const affaires = this.getAll();
    const affaire = affaires.find(a => a.id === id);
    if (affaire) {
      // Ajouter les relations
      affaire.parties = localParties.getByAffaire(id);
      affaire.reunions = localReunions.getByAffaire(id);
      affaire.pathologies = localPathologies.getByAffaire(id);
    }
    return affaire;
  },

  create(data) {
    const affaires = this.getAll();
    const annee = new Date().getFullYear();
    const numero = affaires.length + 1;

    const newAffaire = {
      id: generateId(),
      reference: `EXP-${annee}-${String(numero).padStart(4, '0')}`,
      expert_id: demoUser.id,
      statut: 'nouveau',
      etape_tunnel: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data
    };

    affaires.unshift(newAffaire);
    saveToStorage(STORAGE_KEYS.AFFAIRES, affaires);
    return newAffaire;
  },

  update(id, updates) {
    const affaires = this.getAll();
    const index = affaires.findIndex(a => a.id === id);
    if (index !== -1) {
      affaires[index] = {
        ...affaires[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.AFFAIRES, affaires);
      return affaires[index];
    }
    return null;
  },

  delete(id) {
    const affaires = this.getAll().filter(a => a.id !== id);
    saveToStorage(STORAGE_KEYS.AFFAIRES, affaires);
    // Supprimer aussi les relations
    localParties.deleteByAffaire(id);
    localReunions.deleteByAffaire(id);
    localPathologies.deleteByAffaire(id);
    return true;
  }
};

// ============================================================================
// SERVICE DE STOCKAGE LOCAL - PARTIES
// ============================================================================

export const localParties = {
  getAll() {
    return getFromStorage(STORAGE_KEYS.PARTIES, []);
  },

  getByAffaire(affaireId) {
    return this.getAll().filter(p => p.affaire_id === affaireId);
  },

  create(data) {
    const parties = this.getAll();
    const newPartie = {
      id: generateId(),
      created_at: new Date().toISOString(),
      ...data
    };
    parties.push(newPartie);
    saveToStorage(STORAGE_KEYS.PARTIES, parties);
    return newPartie;
  },

  update(id, updates) {
    const parties = this.getAll();
    const index = parties.findIndex(p => p.id === id);
    if (index !== -1) {
      parties[index] = { ...parties[index], ...updates };
      saveToStorage(STORAGE_KEYS.PARTIES, parties);
      return parties[index];
    }
    return null;
  },

  delete(id) {
    const parties = this.getAll().filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PARTIES, parties);
    return true;
  },

  deleteByAffaire(affaireId) {
    const parties = this.getAll().filter(p => p.affaire_id !== affaireId);
    saveToStorage(STORAGE_KEYS.PARTIES, parties);
  }
};

// ============================================================================
// SERVICE DE STOCKAGE LOCAL - REUNIONS
// ============================================================================

export const localReunions = {
  getAll() {
    return getFromStorage(STORAGE_KEYS.REUNIONS, []);
  },

  getByAffaire(affaireId) {
    return this.getAll().filter(r => r.affaire_id === affaireId);
  },

  create(data) {
    const reunions = this.getAll();
    const affaireReunions = reunions.filter(r => r.affaire_id === data.affaire_id);
    const newReunion = {
      id: generateId(),
      numero: affaireReunions.length + 1,
      statut: 'planifiee',
      created_at: new Date().toISOString(),
      ...data
    };
    reunions.push(newReunion);
    saveToStorage(STORAGE_KEYS.REUNIONS, reunions);
    return newReunion;
  },

  update(id, updates) {
    const reunions = this.getAll();
    const index = reunions.findIndex(r => r.id === id);
    if (index !== -1) {
      reunions[index] = { ...reunions[index], ...updates };
      saveToStorage(STORAGE_KEYS.REUNIONS, reunions);
      return reunions[index];
    }
    return null;
  },

  delete(id) {
    const reunions = this.getAll().filter(r => r.id !== id);
    saveToStorage(STORAGE_KEYS.REUNIONS, reunions);
    return true;
  },

  deleteByAffaire(affaireId) {
    const reunions = this.getAll().filter(r => r.affaire_id !== affaireId);
    saveToStorage(STORAGE_KEYS.REUNIONS, reunions);
  }
};

// ============================================================================
// SERVICE DE STOCKAGE LOCAL - PATHOLOGIES/DESORDRES
// ============================================================================

export const localPathologies = {
  getAll() {
    return getFromStorage(STORAGE_KEYS.PATHOLOGIES, []);
  },

  getByAffaire(affaireId) {
    return this.getAll().filter(p => p.affaire_id === affaireId);
  },

  create(data) {
    const pathologies = this.getAll();
    const affairePathologies = pathologies.filter(p => p.affaire_id === data.affaire_id);
    const newPathologie = {
      id: generateId(),
      numero: affairePathologies.length + 1,
      created_at: new Date().toISOString(),
      ...data
    };
    pathologies.push(newPathologie);
    saveToStorage(STORAGE_KEYS.PATHOLOGIES, pathologies);
    return newPathologie;
  },

  update(id, updates) {
    const pathologies = this.getAll();
    const index = pathologies.findIndex(p => p.id === id);
    if (index !== -1) {
      pathologies[index] = { ...pathologies[index], ...updates };
      saveToStorage(STORAGE_KEYS.PATHOLOGIES, pathologies);
      return pathologies[index];
    }
    return null;
  },

  delete(id) {
    const pathologies = this.getAll().filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PATHOLOGIES, pathologies);
    return true;
  },

  deleteByAffaire(affaireId) {
    const pathologies = this.getAll().filter(p => p.affaire_id !== affaireId);
    saveToStorage(STORAGE_KEYS.PATHOLOGIES, pathologies);
  }
};

// ============================================================================
// SERVICE DE STOCKAGE LOCAL - CONTACTS
// ============================================================================

export const localContacts = {
  getAll() {
    return getFromStorage(STORAGE_KEYS.CONTACTS, []);
  },

  create(data) {
    const contacts = this.getAll();
    const newContact = {
      id: generateId(),
      expert_id: demoUser.id,
      created_at: new Date().toISOString(),
      ...data
    };
    contacts.push(newContact);
    saveToStorage(STORAGE_KEYS.CONTACTS, contacts);
    return newContact;
  },

  update(id, updates) {
    const contacts = this.getAll();
    const index = contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...updates };
      saveToStorage(STORAGE_KEYS.CONTACTS, contacts);
      return contacts[index];
    }
    return null;
  },

  delete(id) {
    const contacts = this.getAll().filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CONTACTS, contacts);
    return true;
  }
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  isSupabaseConfigured,
  demoUser,
  demoExpert,
  localAffaires,
  localParties,
  localReunions,
  localPathologies,
  localContacts
};
