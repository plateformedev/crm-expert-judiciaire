// ============================================================================
// CRM EXPERT JUDICIAIRE - HOOKS SUPABASE (DONNÉES)
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, realtime } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  isSupabaseConfigured,
  localAffaires,
  localParties,
  localReunions,
  localPathologies,
  localContacts
} from '../lib/localStore';

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
  const isDemoMode = !isSupabaseConfigured();

  const { statut = null, limit: queryLimit = null } = options;

  // Charger les affaires
  const fetchAffaires = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // MODE DEMO : Utiliser le stockage local
      if (isDemoMode) {
        let data = localAffaires.getAll();

        // Ajouter les relations
        data = data.map(affaire => ({
          ...affaire,
          parties: localParties.getByAffaire(affaire.id),
          reunions: localReunions.getByAffaire(affaire.id),
          pathologies: localPathologies.getByAffaire(affaire.id)
        }));

        // Filtrer par statut si nécessaire
        if (statut) {
          data = data.filter(a => a.statut === statut);
        }

        // Limiter si nécessaire
        if (queryLimit) {
          data = data.slice(0, queryLimit);
        }

        setAffaires(data);
        setLoading(false);
        return;
      }

      // MODE SUPABASE
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

      if (queryLimit) {
        query = query.limit(queryLimit);
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
  }, [user, statut, queryLimit, isDemoMode]);

  useEffect(() => {
    fetchAffaires();
  }, [fetchAffaires]);

  // Créer une affaire
  const createAffaire = useCallback(async (affaireData) => {
    if (!user) return { success: false, error: 'Non authentifié' };

    try {
      // MODE DEMO : Utiliser le stockage local
      if (isDemoMode) {
        const newAffaire = localAffaires.create(affaireData);
        setAffaires(prev => [newAffaire, ...prev]);
        return { success: true, affaire: newAffaire };
      }

      // MODE SUPABASE
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
  }, [user, isDemoMode]);

  // Mettre à jour une affaire
  const updateAffaire = useCallback(async (id, updates) => {
    try {
      // MODE DEMO
      if (isDemoMode) {
        const updated = localAffaires.update(id, updates);
        if (updated) {
          setAffaires(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
          return { success: true, affaire: updated };
        }
        return { success: false, error: 'Affaire non trouvée' };
      }

      // MODE SUPABASE
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
  }, [isDemoMode]);

  // Supprimer une affaire
  const deleteAffaire = useCallback(async (id) => {
    try {
      // MODE DEMO
      if (isDemoMode) {
        localAffaires.delete(id);
        setAffaires(prev => prev.filter(a => a.id !== id));
        return { success: true };
      }

      // MODE SUPABASE
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
  }, [isDemoMode]);

  // Obtenir une affaire par ID
  const getAffaire = useCallback(async (id) => {
    try {
      // MODE DEMO
      if (isDemoMode) {
        const affaire = localAffaires.getById(id);
        if (affaire) {
          return { success: true, affaire };
        }
        return { success: false, error: 'Affaire non trouvée' };
      }

      // MODE SUPABASE
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
  }, [isDemoMode]);

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
  const isDemoMode = !isSupabaseConfigured();

  const fetchAffaire = useCallback(async () => {
    if (!affaireId) {
      setAffaire(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // MODE DEMO
      if (isDemoMode) {
        const data = localAffaires.getById(affaireId);
        if (data) {
          setAffaire({
            ...data,
            parties: localParties.getByAffaire(affaireId),
            reunions: localReunions.getByAffaire(affaireId),
            pathologies: localPathologies.getByAffaire(affaireId),
            dires: [],
            chiffrages: [],
            vacations: [],
            frais: [],
            documents: [],
            photos: [],
            evenements: []
          });
        } else {
          setError('Affaire non trouvée');
        }
        setLoading(false);
        return;
      }

      // MODE SUPABASE
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
  }, [affaireId, isDemoMode]);

  useEffect(() => {
    fetchAffaire();
  }, [fetchAffaire]);

  // Mise à jour
  const update = useCallback(async (updates) => {
    if (!affaireId) return { success: false };

    try {
      // MODE DEMO
      if (isDemoMode) {
        const updated = localAffaires.update(affaireId, updates);
        if (updated) {
          setAffaire(prev => ({ ...prev, ...updated }));
          return { success: true };
        }
        return { success: false, error: 'Affaire non trouvée' };
      }

      // MODE SUPABASE
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
  }, [affaireId, isDemoMode]);

  return { affaire, loading, error, refetch: fetchAffaire, update };
};

// ============================================================================
// HOOK: useParties
// ============================================================================

export const useParties = (affaireId) => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isDemoMode = !isSupabaseConfigured();

  const fetchParties = useCallback(async () => {
    if (!affaireId) {
      setParties([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isDemoMode) {
        const data = localParties.getByAffaire(affaireId);
        setParties(data);
      } else {
        const { data, error } = await supabase
          .from('parties')
          .select('*')
          .eq('affaire_id', affaireId)
          .order('type', { ascending: true });

        if (error) throw error;
        setParties(data || []);
      }
    } catch (err) {
      console.error('Erreur fetch parties:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [affaireId, isDemoMode]);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  const addPartie = useCallback(async (partieData) => {
    try {
      if (isDemoMode) {
        const newPartie = localParties.create({ affaire_id: affaireId, ...partieData });
        setParties(prev => [...prev, newPartie]);
        return { success: true, partie: newPartie };
      }

      const { data: newPartie, error } = await supabase
        .from('parties')
        .insert({ affaire_id: affaireId, ...partieData })
        .select()
        .single();

      if (error) throw error;
      await fetchParties();
      return { success: true, partie: newPartie };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [affaireId, isDemoMode, fetchParties]);

  const updatePartie = useCallback(async (id, updates) => {
    try {
      if (isDemoMode) {
        const updated = localParties.update(id, updates);
        if (updated) {
          setParties(prev => prev.map(p => p.id === id ? updated : p));
          return { success: true };
        }
        return { success: false, error: 'Partie non trouvée' };
      }

      const { error } = await supabase
        .from('parties')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchParties();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [isDemoMode, fetchParties]);

  const deletePartie = useCallback(async (id) => {
    try {
      if (isDemoMode) {
        localParties.delete(id);
        setParties(prev => prev.filter(p => p.id !== id));
        return { success: true };
      }

      const { error } = await supabase
        .from('parties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchParties();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [isDemoMode, fetchParties]);

  return {
    parties,
    loading,
    error,
    refetch: fetchParties,
    addPartie,
    updatePartie,
    deletePartie
  };
};

// ============================================================================
// HOOK: useReunions
// ============================================================================

export const useReunions = (affaireId) => {
  const [reunions, setReunions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isDemoMode = !isSupabaseConfigured();

  const fetchReunions = useCallback(async () => {
    if (!affaireId) {
      setReunions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isDemoMode) {
        const data = localReunions.getByAffaire(affaireId);
        setReunions(data);
      } else {
        const { data, error } = await supabase
          .from('reunions')
          .select('*')
          .eq('affaire_id', affaireId)
          .order('date_reunion', { ascending: true });

        if (error) throw error;
        setReunions(data || []);
      }
    } catch (err) {
      console.error('Erreur fetch reunions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [affaireId, isDemoMode]);

  useEffect(() => {
    fetchReunions();
  }, [fetchReunions]);

  const addReunion = useCallback(async (reunionData) => {
    try {
      const numero = reunions.length + 1;

      if (isDemoMode) {
        const newReunion = localReunions.create({ affaire_id: affaireId, numero, ...reunionData });
        setReunions(prev => [...prev, newReunion]);
        return { success: true, reunion: newReunion };
      }

      const { data: newReunion, error } = await supabase
        .from('reunions')
        .insert({ affaire_id: affaireId, numero, ...reunionData })
        .select()
        .single();

      if (error) throw error;
      await fetchReunions();
      return { success: true, reunion: newReunion };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [affaireId, reunions.length, isDemoMode, fetchReunions]);

  const updateReunion = useCallback(async (id, updates) => {
    try {
      if (isDemoMode) {
        const updated = localReunions.update(id, updates);
        if (updated) {
          setReunions(prev => prev.map(r => r.id === id ? updated : r));
          return { success: true };
        }
        return { success: false, error: 'Réunion non trouvée' };
      }

      const { error } = await supabase
        .from('reunions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchReunions();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [isDemoMode, fetchReunions]);

  return {
    reunions,
    loading,
    error,
    refetch: fetchReunions,
    addReunion,
    updateReunion
  };
};

// ============================================================================
// HOOK: usePathologies
// ============================================================================

export const usePathologies = (affaireId) => {
  const [pathologies, setPathologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isDemoMode = !isSupabaseConfigured();

  const fetchPathologies = useCallback(async () => {
    if (!affaireId) {
      setPathologies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isDemoMode) {
        const data = localPathologies.getByAffaire(affaireId);
        setPathologies(data);
      } else {
        const { data, error } = await supabase
          .from('pathologies')
          .select('*')
          .eq('affaire_id', affaireId)
          .order('numero', { ascending: true });

        if (error) throw error;
        setPathologies(data || []);
      }
    } catch (err) {
      console.error('Erreur fetch pathologies:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [affaireId, isDemoMode]);

  useEffect(() => {
    fetchPathologies();
  }, [fetchPathologies]);

  const addPathologie = useCallback(async (pathologieData) => {
    try {
      const numero = pathologies.length + 1;

      if (isDemoMode) {
        const newPathologie = localPathologies.create({ affaire_id: affaireId, numero, ...pathologieData });
        setPathologies(prev => [...prev, newPathologie]);
        return { success: true, pathologie: newPathologie };
      }

      const { data: newPathologie, error } = await supabase
        .from('pathologies')
        .insert({ affaire_id: affaireId, numero, ...pathologieData })
        .select()
        .single();

      if (error) throw error;
      await fetchPathologies();
      return { success: true, pathologie: newPathologie };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [affaireId, pathologies.length, isDemoMode, fetchPathologies]);

  const updatePathologie = useCallback(async (id, updates) => {
    try {
      if (isDemoMode) {
        const updated = localPathologies.update(id, updates);
        if (updated) {
          setPathologies(prev => prev.map(p => p.id === id ? updated : p));
          return { success: true };
        }
        return { success: false, error: 'Pathologie non trouvée' };
      }

      const { error } = await supabase
        .from('pathologies')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchPathologies();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [isDemoMode, fetchPathologies]);

  const deletePathologie = useCallback(async (id) => {
    try {
      if (isDemoMode) {
        localPathologies.delete(id);
        setPathologies(prev => prev.filter(p => p.id !== id));
        return { success: true };
      }

      const { error } = await supabase
        .from('pathologies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPathologies();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [isDemoMode, fetchPathologies]);

  return {
    pathologies,
    loading,
    error,
    refetch: fetchPathologies,
    addPathologie,
    updatePathologie,
    deletePathologie
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
