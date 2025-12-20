// ============================================================================
// CRM EXPERT JUDICIAIRE - SIDEBAR Style Google
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
      bg-white border-r border-[#dadce0] flex flex-col transition-all duration-300
      ${collapsed ? 'w-20' : 'w-72'}
    `}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#dadce0]">
        {!collapsed && (
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-[#fef9e7] rounded-2xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-[#c9a227]" />
            </div>
            <div>
              <span className="font-medium text-lg text-[#202124]">Expert</span>
              <span className="text-[#c9a227] text-lg font-medium">.CRM</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div
            className="w-10 h-10 bg-[#fef9e7] rounded-2xl flex items-center justify-center mx-auto cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Scale className="w-6 h-6 text-[#c9a227]" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors"
        >
          <Menu className="w-5 h-5 text-[#5f6368]" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-3">
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
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-full transition-all duration-200
                  ${isActive
                    ? 'bg-[#fef9e7] text-[#a68618]'
                    : 'text-[#5f6368] hover:bg-[#f1f3f4]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-[#c9a227]' : 'text-[#5f6368]'
                  }`} />
                  {!collapsed && (
                    <>
                      <span className={`text-sm font-medium ${
                        isActive ? 'text-[#a68618]' : 'text-[#3c4043]'
                      }`}>
                        {module.label}
                      </span>
                      {badge > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#ea4335] text-white">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {!collapsed && hasSubModules && (
                  isExpanded
                    ? <ChevronDown className="w-4 h-4 text-[#5f6368]" />
                    : <ChevronRight className="w-4 h-4 text-[#5f6368]" />
                )}
              </button>

              {/* Sous-modules */}
              {!collapsed && hasSubModules && isExpanded && (
                <div className="ml-4 mt-1 border-l-2 border-[#e8eaed]">
                  {module.sousModules.map(sub => {
                    const SubIcon = sub.icon || ICONS[sub.iconName] || Folder;
                    const isSubActive = sousModuleActif === sub.id;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSubModuleClick(sub)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 ml-2 rounded-full transition-colors
                          ${isSubActive
                            ? 'bg-[#fef9e7] text-[#a68618]'
                            : 'text-[#5f6368] hover:bg-[#f1f3f4]'
                          }
                        `}
                      >
                        <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-[#c9a227]' : ''}`} />
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
        <div className="p-3 border-t border-[#dadce0]">
          <button
            onClick={() => navigate('/parametres')}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-colors
              ${location.pathname === '/parametres'
                ? 'bg-[#fef9e7] text-[#a68618]'
                : 'text-[#5f6368] hover:bg-[#f1f3f4]'
              }
            `}
          >
            <Settings className={`w-5 h-5 ${location.pathname === '/parametres' ? 'text-[#c9a227]' : ''}`} />
            <span className="text-sm font-medium">Paramètres</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
