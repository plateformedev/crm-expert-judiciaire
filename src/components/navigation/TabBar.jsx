// ============================================================================
// CRM EXPERT JUDICIAIRE - BARRE D'ONGLETS (BROWSER-LIKE TABS)
// ============================================================================

import React, { useRef, useEffect, useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Home, Folder, FileText,
  Users, Calendar, AlertCircle, Settings, MoreHorizontal
} from 'lucide-react';
import { useTabs } from '../../contexts/TabsContext';

// Icônes par type d'onglet
const TAB_ICONS = {
  dashboard: Home,
  affaires: Folder,
  affaire: FileText,
  contacts: Users,
  calendrier: Calendar,
  alertes: AlertCircle,
  parametres: Settings,
  default: FileText
};

// Couleurs par type
const TAB_COLORS = {
  affaire: 'border-[#2563EB]',
  dashboard: 'border-blue-500',
  default: 'border-gray-400'
};

const TabBar = () => {
  const {
    tabs,
    activeTabId,
    activateTab,
    closeTab,
    goBack,
    canGoBack,
    closeOtherTabs,
    closeAllTabs
  } = useTabs();

  const tabsContainerRef = useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  // Vérifier si on a besoin des boutons de scroll
  useEffect(() => {
    const checkScroll = () => {
      if (tabsContainerRef.current) {
        const { scrollWidth, clientWidth } = tabsContainerRef.current;
        setShowScrollButtons(scrollWidth > clientWidth);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs]);

  // Scroll vers l'onglet actif
  useEffect(() => {
    if (tabsContainerRef.current && activeTabId) {
      const activeElement = tabsContainerRef.current.querySelector(`[data-tab-id="${activeTabId}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTabId]);

  const scroll = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleContextMenu = (e, tab) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tab
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Fermer le menu contextuel quand on clique ailleurs
  useEffect(() => {
    if (contextMenu) {
      const handleClick = () => handleCloseContextMenu();
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#f5f5f5] border-b border-[#e5e5e5] flex items-center">
      {/* Bouton retour */}
      <button
        onClick={goBack}
        disabled={!canGoBack}
        className={`p-2 mx-1 rounded-lg transition-colors ${
          canGoBack
            ? 'text-[#525252] hover:bg-[#e5e5e5] hover:text-[#1a1a1a]'
            : 'text-[#d4d4d4] cursor-not-allowed'
        }`}
        title="Retour (Alt+←)"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Bouton scroll gauche */}
      {showScrollButtons && (
        <button
          onClick={() => scroll('left')}
          className="p-1 text-[#737373] hover:text-[#1a1a1a] hover:bg-[#e5e5e5] rounded"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Container des onglets avec scroll */}
      <div
        ref={tabsContainerRef}
        className="flex-1 flex items-end overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const Icon = TAB_ICONS[tab.type] || TAB_ICONS.default;
          const borderColor = isActive ? (TAB_COLORS[tab.type] || TAB_COLORS.default) : 'border-transparent';

          return (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => activateTab(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab)}
              className={`
                group flex items-center gap-2 px-4 py-2 min-w-[140px] max-w-[220px]
                cursor-pointer select-none border-t-2 transition-all
                ${borderColor}
                ${isActive
                  ? 'bg-white border-b-white -mb-[1px] rounded-t-lg'
                  : 'bg-[#ebebeb] hover:bg-[#e0e0e0] border-b border-[#e5e5e5]'
                }
              `}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-[#737373]'}`} />

              <span className={`flex-1 truncate text-sm ${isActive ? 'text-[#1a1a1a] font-medium' : 'text-[#525252]'}`}>
                {tab.label}
              </span>

              {/* Bouton fermer */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className={`
                  p-0.5 rounded transition-colors
                  ${isActive
                    ? 'text-[#a3a3a3] hover:text-[#1a1a1a] hover:bg-[#e5e5e5]'
                    : 'text-transparent group-hover:text-[#a3a3a3] hover:text-[#1a1a1a] hover:bg-[#d4d4d4]'
                  }
                `}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Bouton scroll droit */}
      {showScrollButtons && (
        <button
          onClick={() => scroll('right')}
          className="p-1 text-[#737373] hover:text-[#1a1a1a] hover:bg-[#e5e5e5] rounded"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Bouton menu (fermer tous, etc.) */}
      {tabs.length > 1 && (
        <button
          onClick={(e) => handleContextMenu(e, null)}
          className="p-2 mx-1 text-[#737373] hover:text-[#1a1a1a] hover:bg-[#e5e5e5] rounded-lg"
          title="Options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )}

      {/* Menu contextuel */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-[#e5e5e5] py-1 z-50 min-w-[180px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.tab && (
            <>
              <button
                onClick={() => {
                  closeTab(contextMenu.tab.id);
                  handleCloseContextMenu();
                }}
                className="w-full px-4 py-2 text-left text-sm text-[#525252] hover:bg-[#f5f5f5]"
              >
                Fermer cet onglet
              </button>
              <button
                onClick={() => {
                  closeOtherTabs(contextMenu.tab.id);
                  handleCloseContextMenu();
                }}
                className="w-full px-4 py-2 text-left text-sm text-[#525252] hover:bg-[#f5f5f5]"
              >
                Fermer les autres onglets
              </button>
              <div className="border-t border-[#e5e5e5] my-1" />
            </>
          )}
          <button
            onClick={() => {
              closeAllTabs();
              handleCloseContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Fermer tous les onglets
          </button>
        </div>
      )}
    </div>
  );
};

export default TabBar;
