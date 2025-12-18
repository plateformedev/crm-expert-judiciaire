// ============================================================================
// CRM EXPERT JUDICIAIRE - INTERFACE MOBILE RESPONSIVE
// Composants et hooks optimisés pour tablette et smartphone
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Home, Briefcase, Calendar, Bell, Settings, User, Search,
  Plus, Filter, MoreVertical, Camera, Mic, MapPin, Phone,
  Mail, FileText, Clock, AlertTriangle, Check, Loader2
} from 'lucide-react';

// ============================================================================
// HOOK DÉTECTION DEVICE
// ============================================================================

export const useDevice = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    orientation: 'portrait',
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setDevice({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isTouch,
        orientation: width > height ? 'landscape' : 'portrait',
        screenWidth: width,
        screenHeight: height
      });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return device;
};

// ============================================================================
// HOOK GESTES TACTILES
// ============================================================================

export const useSwipe = (onSwipeLeft, onSwipeRight, options = {}) => {
  const { threshold = 50, allowedTime = 300 } = options;
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Vérifier que c'est un swipe horizontal
    if (deltaTime <= allowedTime && Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        onSwipeRight && onSwipeRight();
      } else {
        onSwipeLeft && onSwipeLeft();
      }
    }
  }, [onSwipeLeft, onSwipeRight, threshold, allowedTime]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
};

// ============================================================================
// HOOK PULL TO REFRESH
// ============================================================================

export const usePullToRefresh = (onRefresh, options = {}) => {
  const { threshold = 80, resistance = 2.5 } = options;
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (containerRef.current?.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling) return;

    const currentY = e.touches[0].clientY;
    const delta = (currentY - startYRef.current) / resistance;

    if (delta > 0) {
      setPullDistance(Math.min(delta, threshold * 1.5));
      e.preventDefault();
    }
  }, [isPulling, resistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setIsPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};

// ============================================================================
// COMPOSANT NAVIGATION MOBILE (Bottom Tab Bar)
// ============================================================================

export const MobileNavigation = ({ currentRoute, onNavigate }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Accueil', route: '/' },
    { id: 'affaires', icon: Briefcase, label: 'Affaires', route: '/affaires' },
    { id: 'calendar', icon: Calendar, label: 'Agenda', route: '/agenda' },
    { id: 'alerts', icon: Bell, label: 'Alertes', route: '/alertes', badge: 3 },
    { id: 'more', icon: MoreVertical, label: 'Plus', route: '/menu' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 safe-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route || 
            (item.route !== '/' && currentRoute.startsWith(item.route));
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.route)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                isActive ? 'text-gold-600' : 'text-neutral-500'
              }`}
            >
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gold-500 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// ============================================================================
// COMPOSANT HEADER MOBILE
// ============================================================================

export const MobileHeader = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightActions = [],
  showSearch = false,
  onSearch
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 safe-top z-40">
      <div className="flex items-center h-14 px-4">
        {/* Bouton retour ou menu */}
        {showBack ? (
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-neutral-100 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">EXP</span>
          </div>
        )}

        {/* Titre */}
        {!searchOpen && (
          <div className="flex-1 ml-3 min-w-0">
            <h1 className="font-medium text-neutral-900 truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-neutral-500 truncate">{subtitle}</p>
            )}
          </div>
        )}

        {/* Barre de recherche */}
        {searchOpen && (
          <div className="flex-1 ml-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch && onSearch(searchQuery)}
              placeholder="Rechercher..."
              autoFocus
              className="w-full px-4 py-2 bg-neutral-100 rounded-full text-sm focus:outline-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 ml-2">
          {showSearch && (
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-neutral-100 rounded-full"
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          )}
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="p-2 hover:bg-neutral-100 rounded-full relative"
            >
              <action.icon className="w-5 h-5" />
              {action.badge && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// COMPOSANT BOTTOM SHEET
// ============================================================================

export const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  height = 'auto' // 'auto' | 'half' | 'full'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);

  const heightClass = {
    auto: 'max-h-[90vh]',
    half: 'h-1/2',
    full: 'h-[90vh]'
  }[height];

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      setDragY(delta);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 ${heightClass} animate-slide-up`}
        style={{ transform: `translateY(${dragY}px)` }}
      >
        {/* Handle */}
        <div
          className="flex justify-center py-3 cursor-grab"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-6 pb-4 border-b border-neutral-100">
            <h2 className="text-lg font-medium">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          {children}
        </div>
      </div>
    </>
  );
};

// ============================================================================
// COMPOSANT CARTE AFFAIRE MOBILE
// ============================================================================

export const MobileAffaireCard = ({ affaire, onClick }) => {
  const statutColors = {
    nouveau: 'bg-blue-100 text-blue-700',
    'en-cours': 'bg-gold-100 text-gold-700',
    'pre-rapport': 'bg-amber-100 text-amber-700',
    termine: 'bg-green-100 text-green-700'
  };

  return (
    <div
      onClick={() => onClick(affaire)}
      className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statutColors[affaire.statut] || 'bg-neutral-100'}`}>
            {affaire.statut}
          </span>
        </div>
        <span className="text-xs text-neutral-400">
          {new Date(affaire.created_at).toLocaleDateString('fr-FR')}
        </span>
      </div>

      <h3 className="font-medium text-neutral-900 mb-1">{affaire.reference}</h3>
      <p className="text-sm text-neutral-500 mb-3 line-clamp-1">
        {affaire.bien_adresse}, {affaire.bien_ville}
      </p>

      <div className="flex items-center gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {affaire.reunions?.length || 0} réunions
        </span>
        <span className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          {affaire.pathologies?.length || 0} désordres
        </span>
      </div>

      {/* Barre de progression */}
      <div className="mt-3 pt-3 border-t border-neutral-100">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-neutral-500">Progression</span>
          <span className="font-medium">{affaire.progression || 0}%</span>
        </div>
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-500 rounded-full transition-all"
            style={{ width: `${affaire.progression || 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT LISTE SWIPABLE
// ============================================================================

export const SwipeableListItem = ({
  children,
  leftAction,
  rightAction,
  onSwipeLeft,
  onSwipeRight
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const actionWidth = 80;

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientX - startXRef.current;
    const maxDelta = actionWidth + 20;
    setTranslateX(Math.max(-maxDelta, Math.min(maxDelta, delta)));
  };

  const handleTouchEnd = () => {
    if (translateX > actionWidth / 2 && onSwipeRight) {
      onSwipeRight();
    } else if (translateX < -actionWidth / 2 && onSwipeLeft) {
      onSwipeLeft();
    }
    setTranslateX(0);
    setIsDragging(false);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Actions cachées */}
      {leftAction && (
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center justify-center bg-green-500 text-white"
          style={{ width: actionWidth }}
        >
          {leftAction}
        </div>
      )}
      {rightAction && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-500 text-white"
          style={{ width: actionWidth }}
        >
          {rightAction}
        </div>
      )}

      {/* Contenu */}
      <div
        className="relative bg-white"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT FLOATING ACTION BUTTON
// ============================================================================

export const FloatingActionButton = ({
  icon: Icon = Plus,
  onClick,
  actions = [],
  position = 'right'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const positionClass = position === 'right' ? 'right-4' : 'left-4';

  return (
    <div className={`fixed bottom-20 ${positionClass} z-40`}>
      {/* Actions secondaires */}
      {isExpanded && actions.length > 0 && (
        <div className="absolute bottom-16 right-0 space-y-2 animate-slide-up">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setIsExpanded(false);
              }}
              className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-lg"
            >
              <span className="text-sm text-neutral-700">{action.label}</span>
              <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                <action.icon className="w-5 h-5 text-neutral-600" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bouton principal */}
      <button
        onClick={() => {
          if (actions.length > 0) {
            setIsExpanded(!isExpanded);
          } else {
            onClick && onClick();
          }
        }}
        className={`w-14 h-14 bg-gold-500 rounded-full shadow-lg flex items-center justify-center text-white transform transition-transform ${
          isExpanded ? 'rotate-45' : ''
        }`}
      >
        <Icon className="w-6 h-6" />
      </button>
    </div>
  );
};

// ============================================================================
// COMPOSANT SKELETON MOBILE
// ============================================================================

export const MobileSkeleton = ({ type = 'card', count = 3 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-2xl p-4 space-y-3 animate-pulse">
            <div className="flex justify-between">
              <div className="h-6 w-20 bg-neutral-200 rounded-full" />
              <div className="h-4 w-16 bg-neutral-200 rounded" />
            </div>
            <div className="h-5 w-3/4 bg-neutral-200 rounded" />
            <div className="h-4 w-1/2 bg-neutral-200 rounded" />
            <div className="flex gap-4 pt-2">
              <div className="h-4 w-20 bg-neutral-200 rounded" />
              <div className="h-4 w-20 bg-neutral-200 rounded" />
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="bg-white p-4 flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-neutral-200 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-neutral-200 rounded" />
              <div className="h-3 w-1/2 bg-neutral-200 rounded" />
            </div>
          </div>
        );
      default:
        return <div className="h-20 bg-neutral-200 rounded-xl animate-pulse" />;
    }
  };

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
      ))}
    </div>
  );
};

// ============================================================================
// COMPOSANT WRAPPER RESPONSIVE
// ============================================================================

export const ResponsiveContainer = ({ children, mobileComponent, tabletComponent }) => {
  const { isMobile, isTablet } = useDevice();

  if (isMobile && mobileComponent) {
    return mobileComponent;
  }

  if (isTablet && tabletComponent) {
    return tabletComponent;
  }

  return children;
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  useDevice,
  useSwipe,
  usePullToRefresh,
  MobileNavigation,
  MobileHeader,
  BottomSheet,
  MobileAffaireCard,
  SwipeableListItem,
  FloatingActionButton,
  MobileSkeleton,
  ResponsiveContainer
};
