// ============================================================================
// CRM EXPERT JUDICIAIRE - SIDEBAR avec React Router
// ============================================================================

import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Folder, Users, Calendar, FileText, AlertCircle, Euro,
  BarChart3, BookOpen, Settings, Menu, ChevronDown, ChevronRight,
  Scale, Award, Wand2, Shield, Gavel, Target, Upload, Clock,
  Calculator, Mic, CheckCircle
} from 'lucide-react';

// Icônes mapping
const ICONS = {
  Home, Folder, Users, Calendar, FileText, AlertCircle, Euro,
  BarChart3, BookOpen, Settings, Scale, Award, Wand2, Shield,
  Gavel, Target, Upload, Clock, Calculator, Mic, CheckCircle
};

const Sidebar = ({ 
  modules = [], 
  collapsed = false, 
  setCollapsed,
  badges = {}
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState({});

  // Déterminer le module actif depuis l'URL
  const { moduleActif, sousModuleActif } = useMemo(() => {
    const path = location.pathname;
    
    for (const module of modules) {
      if (module.sousModules) {
        for (const sub of module.sousModules) {
          if (sub.path && path === sub.path) {
            return { moduleActif: module.id, sousModuleActif: sub.id };
          }
        }
        if (path.startsWith(module.path) && module.path !== '/') {
          return { moduleActif: module.id, sousModuleActif: null };
        }
      } else if (module.path === path || (module.path !== '/' && path.startsWith(module.path))) {
        return { moduleActif: module.id, sousModuleActif: null };
      }
    }
    
    // Dashboard par défaut
    if (path === '/') {
      return { moduleActif: 'dashboard', sousModuleActif: null };
    }
    
    return { moduleActif: null, sousModuleActif: null };
  }, [location.pathname, modules]);

  const toggleExpand = (moduleId) => {
    setExpanded(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleModuleClick = (module) => {
    if (module.sousModules && module.sousModules.length > 0) {
      toggleExpand(module.id);
      // Si pas déjà sur ce module, naviguer vers le menu
      if (moduleActif !== module.id) {
        navigate(module.path);
      }
    } else if (module.path) {
      navigate(module.path);
    }
  };

  const handleSubModuleClick = (subModule) => {
    if (subModule.path) {
      navigate(subModule.path);
    }
  };

  return (
    <div className={`bg-[#1a1a1a] text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-[#262626]">
        {!collapsed && (
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <Scale className="w-8 h-8 text-[#c9a227]" />
            <div>
              <span className="font-light text-xl tracking-wide text-white">Expert</span>
              <span className="text-[#c9a227] text-xl">.</span>
              <span className="font-light text-xl tracking-wide text-white">CRM</span>
            </div>
          </div>
        )}
        {collapsed && (
          <Scale 
            className="w-8 h-8 text-[#c9a227] mx-auto cursor-pointer" 
            onClick={() => navigate('/')}
          />
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-2 hover:bg-[#262626] rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-[#737373]" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {modules.map(module => {
          const Icon = module.icon || ICONS[module.iconName] || Folder;
          const isActive = moduleActif === module.id;
          const hasSubModules = module.sousModules && module.sousModules.length > 0;
          const isExpanded = expanded[module.id] || (isActive && hasSubModules);
          const isGold = module.color === 'gold';
          const badge = module.badge || badges[module.id] || 0;

          return (
            <div key={module.id}>
              <button
                onClick={() => handleModuleClick(module)}
                className={`w-full flex items-center justify-between px-6 py-3 transition-all duration-200 ${
                  isActive 
                    ? isGold 
                      ? 'bg-[#c9a227]/10 border-l-2 border-[#c9a227]' 
                      : 'bg-[#262626] border-l-2 border-white'
                    : 'hover:bg-[#262626]/50 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 ${
                    isActive 
                      ? isGold ? 'text-[#c9a227]' : 'text-white' 
                      : 'text-[#737373]'
                  }`} />
                  {!collapsed && (
                    <>
                      <span className={`text-sm font-medium tracking-wide ${
                        isActive 
                          ? isGold ? 'text-[#c9a227]' : 'text-white' 
                          : 'text-[#a3a3a3]'
                      }`}>
                        {module.label}
                      </span>
                      {badge > 0 && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          isGold ? 'bg-[#c9a227] text-white' : 'bg-[#404040] text-white'
                        }`}>
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {!collapsed && hasSubModules && (
                  isExpanded 
                    ? <ChevronDown className="w-4 h-4 text-[#737373]" />
                    : <ChevronRight className="w-4 h-4 text-[#737373]" />
                )}
              </button>

              {/* Sous-modules */}
              {!collapsed && hasSubModules && isExpanded && (
                <div className="bg-[#0d0d0d]">
                  {module.sousModules.map(sub => {
                    const SubIcon = sub.icon || ICONS[sub.iconName] || Folder;
                    const isSubActive = sousModuleActif === sub.id;
                    
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSubModuleClick(sub)}
                        className={`w-full flex items-center gap-3 px-6 pl-14 py-2.5 transition-colors ${
                          isSubActive 
                            ? isGold 
                              ? 'text-[#c9a227] bg-[#c9a227]/5' 
                              : 'text-white bg-[#262626]'
                            : 'text-[#737373] hover:text-[#a3a3a3] hover:bg-[#262626]/30'
                        }`}
                      >
                        <SubIcon className="w-4 h-4" />
                        <span className="text-sm">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-[#262626]">
          <button 
            onClick={() => navigate('/parametres')}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#737373] hover:text-white hover:bg-[#262626] rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Paramètres</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
