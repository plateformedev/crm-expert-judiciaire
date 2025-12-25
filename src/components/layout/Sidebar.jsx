// ============================================================================
// CRM EXPERT JUDICIAIRE - SIDEBAR Style Samsung One UI
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
      return { moduleActif: 'affaires', sousModuleActif: null };
    }

    return { moduleActif: null, sousModuleActif: null };
  }, [location.pathname, modules]);

  const toggleExpand = (moduleId) => {
    setExpanded(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleModuleClick = (module) => {
    if (module.sousModules && module.sousModules.length > 0) {
      toggleExpand(module.id);
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
    <div className={`
      bg-white border-r border-[#e0e0e0] flex flex-col transition-all duration-300
      ${collapsed ? 'w-20' : 'w-72'}
    `}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#e0e0e0]">
        {!collapsed && (
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-11 h-11 bg-[#fdf8e8] rounded-2xl flex items-center justify-center border-2 border-[#c9a227]">
              <Scale className="w-6 h-6 text-[#c9a227]" />
            </div>
            <div>
              <span className="font-bold text-lg text-[#1f1f1f]">Expert</span>
              <span className="text-[#c9a227] text-lg font-bold">.CRM</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div
            className="w-11 h-11 bg-[#fdf8e8] rounded-2xl flex items-center justify-center mx-auto cursor-pointer border-2 border-[#c9a227]"
            onClick={() => navigate('/')}
          >
            <Scale className="w-6 h-6 text-[#c9a227]" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2.5 hover:bg-[#f0f0f0] active:bg-[#e4e4e4] rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5 text-[#555555]" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {modules.map(module => {
          const Icon = module.icon || ICONS[module.iconName] || Folder;
          const isActive = moduleActif === module.id;
          const hasSubModules = module.sousModules && module.sousModules.length > 0;
          const isExpanded = expanded[module.id] || (isActive && hasSubModules);
          const badge = module.badge || badges[module.id] || 0;

          return (
            <div key={module.id} className="mb-1">
              <button
                onClick={() => handleModuleClick(module)}
                title={collapsed ? module.label : undefined}
                className={`
                  w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200
                  ${isActive
                    ? 'bg-[#fdf8e8] border-2 border-[#c9a227]'
                    : 'border-2 border-transparent hover:bg-[#f7f7f7] active:bg-[#f0f0f0]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                    ${isActive ? 'bg-[#c9a227]' : 'bg-[#f0f0f0]'}
                  `}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#555555]'}`} />
                  </div>
                  {!collapsed && (
                    <>
                      <span className={`text-[15px] font-semibold ${
                        isActive ? 'text-[#9a7b1c]' : 'text-[#1f1f1f]'
                      }`}>
                        {module.label}
                      </span>
                      {badge > 0 && (
                        <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-[#ff3b30] text-white">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {!collapsed && hasSubModules && (
                  isExpanded
                    ? <ChevronDown className="w-5 h-5 text-[#757575]" />
                    : <ChevronRight className="w-5 h-5 text-[#757575]" />
                )}
              </button>

              {/* Sous-modules */}
              {!collapsed && hasSubModules && isExpanded && (
                <div className="ml-6 mt-2 space-y-1">
                  {module.sousModules.map(sub => {
                    const SubIcon = sub.icon || ICONS[sub.iconName] || Folder;
                    const isSubActive = sousModuleActif === sub.id;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSubModuleClick(sub)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                          ${isSubActive
                            ? 'bg-[#fdf8e8] text-[#9a7b1c]'
                            : 'text-[#555555] hover:bg-[#f7f7f7] active:bg-[#f0f0f0]'
                          }
                        `}
                      >
                        <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-[#c9a227]' : 'text-[#757575]'}`} />
                        <span className={`text-[14px] ${isSubActive ? 'font-semibold' : 'font-medium'}`}>
                          {sub.label}
                        </span>
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
        <div className="p-3 border-t border-[#e0e0e0]">
          <button
            onClick={() => navigate('/parametres')}
            className={`
              w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors
              ${location.pathname === '/parametres'
                ? 'bg-[#fdf8e8] border-2 border-[#c9a227]'
                : 'border-2 border-transparent hover:bg-[#f7f7f7] active:bg-[#f0f0f0]'
              }
            `}
          >
            <div className={`
              w-9 h-9 rounded-xl flex items-center justify-center
              ${location.pathname === '/parametres' ? 'bg-[#c9a227]' : 'bg-[#f0f0f0]'}
            `}>
              <Settings className={`w-5 h-5 ${location.pathname === '/parametres' ? 'text-white' : 'text-[#555555]'}`} />
            </div>
            <span className={`text-[15px] font-semibold ${
              location.pathname === '/parametres' ? 'text-[#9a7b1c]' : 'text-[#1f1f1f]'
            }`}>
              Paramètres
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
