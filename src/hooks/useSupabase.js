// ============================================================================
// CRM EXPERT JUDICIAIRE - HOOKS SUPABASE (DONNÉES)
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, realtime } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DEMO_MODE, getStoredAffaires, saveAffaires, DEMO_USER } from '../lib/demoData';

// ============================================================================
// HOOK GÉNÉRIQUE: useSupabaseQuery
// ============================================================================

export const useSupabaseQuery = (table, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const {
    select = '*',
    filter = null,
    orderBy = { column: 'created_at', ascending: false },
    limit = null,
    single = false,
    realTime = false
  } = options;

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(table).select(select);

      // Appliquer les filtres
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }

      // Tri
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending });
      }

      // Limite
      if (limit) {
        query = query.limit(limit);
      }

      // Single ou multiple
      if (single) {
        const { data, error } = await query.single();
        if (error) throw error;
        setData(data);
      } else {
        const { data, error } = await query;
        if (error) throw error;
        setData(data || []);
      }
    } catch (err) {
      console.error(`Erreur fetch ${table}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, table, select, filter, orderBy, limit, single]);

  // Chargement initial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Temps réel
  useEffect(() => {
    if (!realTime || !user) return;

    const unsubscribe = realtime.subscribeToTable(table, (payload) => {
      if (payload.eventType === 'INSERT') {
        setData(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setData(prev => prev.map(item => 
          item.id === payload.new.id ? payload.new : item
        ));
      } else if (payload.eventType === 'DELETE') {
        setData(prev => prev.filter(item => item.id !== payload.old.id));
      }
    });

    return unsubscribe;
  }, [realTime, user, table]);

  return { data, loading, error, refetch: fetchData };
};

// ============================================================================
// HOOK: useAffaires
// ============================================================================

export const useAffaires = (options = {}) => {
  const { user } = useAuth();
  const [affaires, setAffaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { statut = null, limit = null } = options;

  // Charger les affaires
  const fetchAffaires = useCallback(async () => {
    // Mode démo : charger depuis localStorage
    if (DEMO_MODE) {
      setLoading(true);
      try {
        let data = getStoredAffaires();
        if (statut) {
          data = data.filter(a => a.statut === statut);
        }
        if (limit) {
          data = data.slice(0, limit);
        }
        setAffaires(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Mode Supabase
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('affaires')
        .select(`
          *,
          parties:parties(id, type, nom, raison_sociale),
          reunions:reunions(id, numero, date_reunion, statut),
          pathologies:pathologies(id, numero, intitule, garantie),
          _count:pathologies(count)
        `)
        .eq('expert_id', user.id)
        .order('created_at', { ascending: false });

      if (statut) {
        query = query.eq('statut', statut);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      setAffaires(data || []);
    } catch (err) {
      console.error('Erreur fetch affaires:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, statut, limit]);

  useEffect(() => {
    fetchAffaires();
  }, [fetchAffaires]);

  // Créer une affaire
  const createAffaire = useCallback(async (affaireData) => {
    // Mode démo
    if (DEMO_MODE) {
      const currentAffaires = getStoredAffaires();
      const annee = new Date().getFullYear();
      const reference = `EXP-${annee}-${String(currentAffaires.length + 1).padStart(4, '0')}`;

      const newAffaire = {
        id: `demo-${Date.now()}`,
        reference,
        ...affaireData,
        statut: affaireData.statut || 'en-cours',
        created_at: new Date().toISOString(),
        parties: [],
        reunions: [],
        pathologies: [],
        documents: [],
        dires: [],
        chiffrages: [],
        vacations: [],
        frais: []
      };

      const updated = [newAffaire, ...currentAffaires];
      saveAffaires(updated);
      setAffaires(updated);
      return { success: true, affaire: newAffaire };
    }

    // Mode Supabase
    if (!user) return { success: false, error: 'Non authentifié' };

    try {
      // Générer la référence
      const annee = new Date().getFullYear();
      const { count } = await supabase
        .from('affaires')
        .select('*', { count: 'exact', head: true })
        .eq('expert_id', user.id);

      const reference = `EXP-${annee}-${String((count || 0) + 1).padStart(4, '0')}`;

      const { data, error } = await supabase
        .from('affaires')
        .insert({
          expert_id: user.id,
          reference,
          ...affaireData
        })
        .select()
        .single();

      if (error) throw error;

      setAffaires(prev => [data, ...prev]);
      return { success: true, affaire: data };
    } catch (err) {
      console.error('Erreur création affaire:', err);
      return { success: false, error: err.message };
    }
  }, [user]);

  // Mettre à jour une affaire
  const updateAffaire = useCallback(async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('affaires')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAffaires(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
      return { success: true, affaire: data };
    } catch (err) {
      console.error('Erreur mise à jour affaire:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Supprimer une affaire
  const deleteAffaire = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('affaires')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAffaires(prev => prev.filter(a => a.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Erreur suppression affaire:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Obtenir une affaire par ID
  const getAffaire = useCallback(async (id) => {
    try {
      const { data, error } = await supabase
        .from('affaires')
        .select(`
          *,
          parties:parties(*),
          reunions:reunions(*),
          pathologies:pathologies(*),
          dires:dires(*),
          chiffrages:chiffrages(*),
          vacations:vacations(*),
          frais:frais(*),
          documents:documents(*),
          photos:photos(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, affaire: data };
    } catch (err) {
      console.error('Erreur récupération affaire:', err);
      return { success: false, error: err.message };
    }
  }, []);

  return {
    affaires,
    loading,
    error,
    refetch: fetchAffaires,
    createAffaire,
    updateAffaire,
    deleteAffaire,
    getAffaire
  };
};

// ============================================================================
// HOOK: useAffaireDetail (une seule affaire avec toutes ses relations)
// ============================================================================

export const useAffaireDetail = (affaireId) => {
  const [affaire, setAffaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAffaire = useCallback(async () => {
    if (!affaireId) {
      setAffaire(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Mode démo : charger depuis localStorage
    if (DEMO_MODE) {
      try {
        const affaires = getStoredAffaires();
        const found = affaires.find(a => a.id === affaireId);
        if (found) {
          setAffaire(found);
        } else {
          setError('Affaire non trouvée');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Mode Supabase
    try {
      const { data, error } = await supabase
        .from('affaires')
        .select(`
          *,
          parties:parties(*),
          reunions:reunions(*),
          pathologies:pathologies(*),
          dires:dires(*),
          chiffrages:chiffrages(*),
          vacations:vacations(*),
          frais:frais(*),
          documents:documents(*),
          photos:photos(*),
          evenements:evenements(*)
        `)
        .eq('id', affaireId)
        .single();

      if (error) throw error;
      setAffaire(data);
    } catch (err) {
      console.error('Erreur fetch affaire:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [affaireId]);

  useEffect(() => {
    fetchAffaire();
  }, [fetchAffaire]);

  // Mise à jour
  const update = useCallback(async (updates) => {
    if (!affaireId) return { success: false };

    // Mode démo
    if (DEMO_MODE) {
      try {
        const affaires = getStoredAffaires();
        const updatedAffaires = affaires.map(a =>
          a.id === affaireId ? { ...a, ...updates } : a
        );
        saveAffaires(updatedAffaires);
        setAffaire(prev => ({ ...prev, ...updates }));
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Mode Supabase
    try {
      const { data, error } = await supabase
        .from('affaires')
        .update(updates)
        .eq('id', affaireId)
        .select()
        .single();

      if (error) throw error;
      setAffaire(prev => ({ ...prev, ...data }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [affaireId]);

  return { affaire, loading, error, refetch: fetchAffaire, update };
};

// ============================================================================
// HOOK: useParties
// ============================================================================

export const useParties = (affaireId) => {
  const { data, loading, error, refetch } = useSupabaseQuery('parties', {
    filter: { affaire_id: affaireId },
    orderBy: { column: 'type', ascending: true }
  });

  const addPartie = useCallback(async (partieData) => {
    try {
      const { data: newPartie, error } = await supabase
        .from('parties')
        .insert({ affaire_id: affaireId, ...partieData })
        .select()
        .single();

      if (error) throw error;
      await refetch();
      return { success: true, partie: newPartie };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [affaireId, refetch]);

  const updatePartie = useCallback(async (id, updates) => {
    try {
      const { error } = await supabase
        .from('parties')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await refetch();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [refetch]);

  const deletePartie = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('parties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await refetch();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [refetch]);

  return {
    parties: data,
    loading,
    error,
    refetch,
    addPartie,
    updatePartie,
    deletePartie
  };
};

// ============================================================================
// HOOK: useReunions
// ============================================================================

export const useReunions = (affaireId) => {
  const { data, loading, error, refetch } = useSupabaseQuery('reunions', {
    filter: { affaire_id: affaireId },
    orderBy: { column: 'date_reunion', ascending: true }
  });

  const addReunion = useCallback(async (reunionData) => {
    try {
      // Calculer le numéro de réunion
      const numero = (data?.length || 0) + 1;

      const { data: newReunion, error } = await supabase
        .from('reunions')
        .insert({ affaire_id: affaireId, numero, ...reunionData })
        .select()
        .single();

      if (error) throw error;
      await refetch();
      return { success: true, reunion: newReunion };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [affaireId, data, refetch]);

  const updateReunion = useCallback(async (id, updates) => {
    try {
      const { error } = await supabase
        .from('reunions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await refetch();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [refetch]);

  return {
    reunions: data,
    loading,
    error,
    refetch,
    addReunion,
    updateReunion
  };
};

// ============================================================================
// HOOK: usePathologies
// ============================================================================

export const usePathologies = (affaireId) => {
  const { data, loading, error, refetch } = useSupabaseQuery('pathologies', {
    filter: { affaire_id: affaireId },
    orderBy: { column: 'numero', ascending: true }
  });

  const addPathologie = useCallback(async (pathologieData) => {
    try {
      const numero = (data?.length || 0) + 1;

      const { data: newPathologie, error } = await supabase
        .from('pathologies')
        .insert({ affaire_id: affaireId, numero, ...pathologieData })
        .select()
        .single();

      if (error) throw error;
      await refetch();
      return { success: true, pathologie: newPathologie };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [affaireId, data, refetch]);

  const updatePathologie = useCallback(async (id, updates) => {
    try {
      const { error } = await supabase
        .from('pathologies')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await refetch();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [refetch]);

  return {
    pathologies: data,
    loading,
    error,
    refetch,
    addPathologie,
    updatePathologie
  };
};

// ============================================================================
// HOOK: useVacations
// ============================================================================

export const useVacations = (affaireId) => {
  const { data, loading, error, refetch } = useSupabaseQuery('vacations', {
    filter: { affaire_id: affaireId },
    orderBy: { column: 'date_vacation', ascending: false }
  });

  const addVacation = useCallback(async (vacationData) => {
    try {
      const { data: newVacation, error } = await supabase
        .from('vacations')
        .insert({ affaire_id: affaireId, ...vacationData })
        .select()
        .single();

      if (error) throw error;
      await refetch();
      return { success: true, vacation: newVacation };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [affaireId, refetch]);

  // Calculs
  const totaux = useMemo(() => {
    const totalHeures = data?.reduce((acc, v) => acc + parseFloat(v.duree_heures || 0), 0) || 0;
    const totalMontant = data?.reduce((acc, v) => acc + parseFloat(v.montant || 0), 0) || 0;
    return { totalHeures, totalMontant };
  }, [data]);

  return {
    vacations: data,
    loading,
    error,
    refetch,
    addVacation,
    ...totaux
  };
};

// ============================================================================
// HOOK: useContacts
// ============================================================================

export const useContacts = (options = {}) => {
  const { user } = useAuth();
  const { type = null } = options;

  const { data, loading, error, refetch } = useSupabaseQuery('contacts', {
    filter: user ? { expert_id: user.id, ...(type && { type }) } : null,
    orderBy: { column: 'nom', ascending: true }
  });

  const addContact = useCallback(async (contactData) => {
    if (!user) return { success: false };

    try {
      const { data: newContact, error } = await supabase
        .from('contacts')
        .insert({ expert_id: user.id, ...contactData })
        .select()
        .single();

      if (error) throw error;
      await refetch();
      return { success: true, contact: newContact };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user, refetch]);

  const updateContact = useCallback(async (id, updates) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await refetch();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [refetch]);

  const deleteContact = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await refetch();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [refetch]);

  return {
    contacts: data,
    loading,
    error,
    refetch,
    addContact,
    updateContact,
    deleteContact
  };
};

// ============================================================================
// HOOK: useAlertes
// ============================================================================

export const useAlertes = () => {
  const { user } = useAuth();

  const { data, loading, error, refetch } = useSupabaseQuery('alertes', {
    filter: user ? { expert_id: user.id } : null,
    orderBy: { column: 'date_alerte', ascending: true },
    realTime: true
  });

  const nonLues = useMemo(() => data?.filter(a => !a.lue) || [], [data]);

  const marquerLue = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('alertes')
        .update({ lue: true })
        .eq('id', id);

      if (error) throw error;
      await refetch();
    } catch (err) {
      console.error('Erreur marquer alerte lue:', err);
    }
  }, [refetch]);

  const marquerToutesLues = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('alertes')
        .update({ lue: true })
        .eq('expert_id', user.id)
        .eq('lue', false);

      if (error) throw error;
      await refetch();
    } catch (err) {
      console.error('Erreur marquer toutes alertes lues:', err);
    }
  }, [user, refetch]);

  return {
    alertes: data,
    nonLues,
    countNonLues: nonLues.length,
    loading,
    error,
    refetch,
    marquerLue,
    marquerToutesLues
  };
};

// ============================================================================
// HOOK: useStats (statistiques dashboard)
// ============================================================================

export const useStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Compter les affaires par statut
        const { data: affaires } = await supabase
          .from('affaires')
          .select('statut')
          .eq('expert_id', user.id);

        // Somme des provisions
        const { data: provisions } = await supabase
          .from('affaires')
          .select('provision_montant')
          .eq('expert_id', user.id)
          .eq('provision_recue', true);

        // Affaires urgentes
        const { count: urgentes } = await supabase
          .from('affaires')
          .select('*', { count: 'exact', head: true })
          .eq('expert_id', user.id)
          .eq('urgent', true);

        // Alertes non lues
        const { count: alertes } = await supabase
          .from('alertes')
          .select('*', { count: 'exact', head: true })
          .eq('expert_id', user.id)
          .eq('lue', false);

        const total = affaires?.length || 0;
        const enCours = affaires?.filter(a => a.statut === 'en-cours').length || 0;
        const terminees = affaires?.filter(a => a.statut === 'termine').length || 0;
        const totalProvisions = provisions?.reduce((acc, p) => acc + (parseFloat(p.provision_montant) || 0), 0) || 0;

        setStats({
          total,
          enCours,
          terminees,
          urgentes: urgentes || 0,
          alertes: alertes || 0,
          totalProvisions
        });
      } catch (err) {
        console.error('Erreur fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  useSupabaseQuery,
  useAffaires,
  useAffaireDetail,
  useParties,
  useReunions,
  usePathologies,
  useVacations,
  useContacts,
  useAlertes,
  useStats
};
