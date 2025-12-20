// ============================================================================
// CRM EXPERT JUDICIAIRE - CONFIGURATION SUPABASE
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// Variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Détection du mode démo
export const IS_DEMO_MODE = !supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co';

// Vérification configuration
if (IS_DEMO_MODE) {
  console.info('🎭 Mode démo activé - Supabase non configuré, utilisation des données locales');
} else {
  console.info('✓ Supabase configuré');
}

// Client Supabase - désactiver auto-refresh en mode démo pour éviter les erreurs réseau
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: !IS_DEMO_MODE,
      persistSession: !IS_DEMO_MODE,
      detectSessionInUrl: !IS_DEMO_MODE
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'crm-expert-judiciaire'
      }
    },
    // Désactiver le realtime en mode démo
    realtime: IS_DEMO_MODE ? { params: { eventsPerSecond: 0 } } : {}
  }
);

// ============================================================================
// HELPERS AUTHENTIFICATION
// ============================================================================

export const auth = {
  // Inscription
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    return data;
  },

  // Connexion
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Connexion Magic Link
  async signInWithMagicLink(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  },

  // Déconnexion
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Session courante
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Utilisateur courant
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Réinitialisation mot de passe
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
    return data;
  },

  // Mise à jour mot de passe
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  },

  // Mise à jour profil
  async updateProfile(updates) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    if (error) throw error;
    return data;
  },

  // Écouter les changements d'auth
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============================================================================
// HELPERS STORAGE
// ============================================================================

export const storage = {
  // Upload fichier
  async upload(bucket, path, file, options = {}) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        ...options
      });
    if (error) throw error;
    return data;
  },

  // Télécharger fichier
  async download(bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    if (error) throw error;
    return data;
  },

  // URL publique
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // URL signée (temporaire)
  async getSignedUrl(bucket, path, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },

  // Supprimer fichier
  async remove(bucket, paths) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(Array.isArray(paths) ? paths : [paths]);
    if (error) throw error;
    return data;
  },

  // Lister fichiers
  async list(bucket, path = '', options = {}) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, options);
    if (error) throw error;
    return data;
  }
};

// ============================================================================
// HELPERS REALTIME
// ============================================================================

export const realtime = {
  // S'abonner aux changements d'une table
  subscribeToTable(table, callback, filter = null) {
    let channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...(filter && { filter })
        },
        callback
      );
    
    channel.subscribe();
    return () => channel.unsubscribe();
  },

  // S'abonner aux changements d'un enregistrement
  subscribeToRecord(table, id, callback) {
    return this.subscribeToTable(table, callback, `id=eq.${id}`);
  },

  // Canal de présence (qui est en ligne)
  presenceChannel(channelName) {
    return supabase.channel(channelName, {
      config: {
        presence: {
          key: 'user_id'
        }
      }
    });
  }
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default supabase;
