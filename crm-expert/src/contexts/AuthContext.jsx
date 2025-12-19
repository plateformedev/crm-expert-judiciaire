// ============================================================================
// CRM EXPERT JUDICIAIRE - CONTEXTE D'AUTHENTIFICATION
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, auth } from '../lib/supabase';
import { isSupabaseConfigured, demoUser, demoExpert } from '../lib/localStore';

// ============================================================================
// CRÉATION DU CONTEXTE
// ============================================================================

const AuthContext = createContext(null);

// ============================================================================
// PROVIDER
// ============================================================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger le profil expert
  const loadExpertProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Si le profil n'existe pas, on le crée
        if (error.code === 'PGRST116') {
          const { data: newExpert, error: createError } = await supabase
            .from('experts')
            .insert({
              id: userId,
              email: user?.email || '',
              nom: user?.user_metadata?.nom || 'Expert',
              prenom: user?.user_metadata?.prenom || ''
            })
            .select()
            .single();

          if (createError) throw createError;
          setExpert(newExpert);
          return;
        }
        throw error;
      }

      setExpert(data);
    } catch (err) {
      console.error('Erreur chargement profil expert:', err);
      setError(err.message);
    }
  }, [user?.email, user?.user_metadata]);

  // Initialisation - Vérifier la session au montage
  useEffect(() => {
    const initAuth = async () => {
      // MODE DEMO : Si Supabase n'est pas configuré
      if (!isSupabaseConfigured()) {
        console.log('🎮 Mode DEMO activé - Supabase non configuré');
        setUser(demoUser);
        setExpert(demoExpert);
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await loadExpertProfile(session.user.id);
        }
      } catch (err) {
        console.error('Erreur initialisation auth:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Ne pas écouter les changements si mode démo
    if (!isSupabaseConfigured()) {
      return;
    }

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);

        if (session?.user) {
          setUser(session.user);
          await loadExpertProfile(session.user.id);
        } else {
          setUser(null);
          setExpert(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [loadExpertProfile]);

  // ============================================================================
  // ACTIONS D'AUTHENTIFICATION
  // ============================================================================

  // Inscription
  const signUp = async (email, password, metadata = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      // Si l'inscription nécessite une confirmation email
      if (data?.user?.identities?.length === 0) {
        return { 
          success: true, 
          needsConfirmation: true,
          message: 'Un email de confirmation a été envoyé.' 
        };
      }

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Connexion
  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Connexion Magic Link
  const signInWithMagicLink = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return { 
        success: true, 
        message: 'Un lien de connexion a été envoyé à votre email.' 
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setExpert(null);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Réinitialisation mot de passe
  const resetPassword = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      return { 
        success: true, 
        message: 'Un email de réinitialisation a été envoyé.' 
      };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour mot de passe
  const updatePassword = async (newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour profil expert
  const updateExpertProfile = async (updates) => {
    if (!user) return { success: false, error: 'Non authentifié' };
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('experts')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setExpert(data);
      return { success: true, expert: data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // VALEUR DU CONTEXTE
  // ============================================================================

  const value = {
    // État
    user,
    expert,
    loading,
    error,
    isAuthenticated: !!user,
    
    // Actions
    signUp,
    signIn,
    signInWithMagicLink,
    signOut,
    resetPassword,
    updatePassword,
    updateExpertProfile,
    
    // Utilitaires
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// HOOK D'UTILISATION
// ============================================================================

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  
  return context;
};

// ============================================================================
// COMPOSANT PROTECTION DE ROUTE
// ============================================================================

export const ProtectedRoute = ({ children, fallback = null }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return fallback || (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion
    window.location.href = '/login';
    return null;
  }

  return children;
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default AuthContext;
