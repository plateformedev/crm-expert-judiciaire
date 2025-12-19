// ============================================================================
// CRM EXPERT JUDICIAIRE - CONTEXTE GESTION DES ONGLETS
// ============================================================================

import React, { createContext, useContext, useState, useCallback } from 'react';

const TabsContext = createContext(null);

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
};

export const TabsProvider = ({ children }) => {
  // Onglets ouverts : { id, type, label, path, data }
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [history, setHistory] = useState([]);

  // Ouvrir un nouvel onglet ou activer s'il existe déjà
  const openTab = useCallback((tab) => {
    const { id, type, label, path, data } = tab;

    setTabs(prev => {
      // Vérifier si l'onglet existe déjà
      const existingIndex = prev.findIndex(t => t.id === id);

      if (existingIndex >= 0) {
        // L'onglet existe, juste l'activer
        return prev;
      }

      // Ajouter le nouvel onglet
      return [...prev, { id, type, label, path, data, openedAt: Date.now() }];
    });

    // Activer l'onglet
    setActiveTabId(id);

    // Ajouter à l'historique
    setHistory(prev => {
      const filtered = prev.filter(h => h !== id);
      return [...filtered, id];
    });
  }, []);

  // Fermer un onglet
  const closeTab = useCallback((tabId) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);

      // Si on ferme l'onglet actif, activer le précédent dans l'historique
      if (activeTabId === tabId && newTabs.length > 0) {
        // Trouver le dernier onglet visité qui est encore ouvert
        const remainingIds = newTabs.map(t => t.id);
        const lastVisited = [...history].reverse().find(h => remainingIds.includes(h));

        if (lastVisited) {
          setActiveTabId(lastVisited);
        } else {
          // Sinon prendre le dernier onglet ouvert
          setActiveTabId(newTabs[newTabs.length - 1].id);
        }
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
      }

      return newTabs;
    });

    // Retirer de l'historique
    setHistory(prev => prev.filter(h => h !== tabId));
  }, [activeTabId, history]);

  // Fermer tous les onglets
  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
    setHistory([]);
  }, []);

  // Fermer tous sauf l'onglet actif
  const closeOtherTabs = useCallback((keepTabId) => {
    setTabs(prev => prev.filter(t => t.id === keepTabId));
    setActiveTabId(keepTabId);
    setHistory([keepTabId]);
  }, []);

  // Activer un onglet
  const activateTab = useCallback((tabId) => {
    setActiveTabId(tabId);
    setHistory(prev => {
      const filtered = prev.filter(h => h !== tabId);
      return [...filtered, tabId];
    });
  }, []);

  // Aller à l'onglet précédent (retour)
  const goBack = useCallback(() => {
    if (history.length < 2) return false;

    // Retirer l'onglet actuel de l'historique
    const newHistory = history.slice(0, -1);
    const previousTabId = newHistory[newHistory.length - 1];

    // Vérifier que l'onglet précédent existe toujours
    const tabExists = tabs.some(t => t.id === previousTabId);

    if (tabExists) {
      setActiveTabId(previousTabId);
      setHistory(newHistory);
      return true;
    }

    return false;
  }, [history, tabs]);

  // Obtenir l'onglet actif
  const activeTab = tabs.find(t => t.id === activeTabId) || null;

  // Mettre à jour les données d'un onglet
  const updateTabData = useCallback((tabId, newData) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, data: { ...t.data, ...newData } } : t
    ));
  }, []);

  // Mettre à jour le label d'un onglet
  const updateTabLabel = useCallback((tabId, newLabel) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, label: newLabel } : t
    ));
  }, []);

  const value = {
    tabs,
    activeTab,
    activeTabId,
    openTab,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
    activateTab,
    goBack,
    canGoBack: history.length > 1,
    updateTabData,
    updateTabLabel
  };

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
};

export default TabsContext;
