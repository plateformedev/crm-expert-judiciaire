// ============================================================================
// CRM EXPERT JUDICIAIRE - APPLICATION PRINCIPALE
// Avec React Router et tous les modules connectés
// ============================================================================

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Home, Folder, Users, Calendar, FileText, AlertCircle, Euro,
  BarChart3, BookOpen, Settings, Award, Wand2, Scale,
  Plus, Search, Filter, ChevronRight, Clock, MapPin,
  CheckCircle, XCircle, AlertTriangle, TrendingUp,
  Camera, MessageSquare, FileEdit, Calculator, Mic,
  Target, Upload, Shield, Gavel, ArrowLeft
} from 'lucide-react';

// Composants UI
import { Card, Badge, Button, ProgressBar, EmptyState, LoadingSpinner } from './components/ui';
import { ToastProvider, ConfirmationProvider, useToast } from './components/ui';
import { DemoBanner, HelpPanel, HelpButton, useHelp } from './components/ui';

// Composants Layout
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Composants Navigation - Onglets
import { TabsProvider, useTabs } from './contexts/TabsContext';
import TabBar from './components/navigation/TabBar';

// Contexte Auth
import { useAuth } from './contexts/AuthContext';

// Composants métier - Imports directs
import { DashboardExpert } from './components/dashboard';
import { ListeAffaires, FicheAffaire } from './components/affaires';
import { CentreAlertes, AlertesWidget } from './components/alertes';
import { GestionDires, DiresWidget } from './components/dires';
import { GaleriePhotos } from './components/photos';
import { GenerateurRapport } from './components/rapport';
import { ModuleChiffrage } from './components/chiffrage';
import { CarnetSapiteurs } from './components/sapiteurs';
import { MatriceImputabilite } from './components/imputabilite';
import { DicteeVocale } from './components/dictee';
import { GenerateurCourriers } from './components/courriers';
import ChatbotIA from './components/ia/ChatbotIA';

// Module Excellence
import {
  GarantiesModule, ConformiteModule, ProtectionModule,
  DTUModule, JurisprudenceModule, QualificationModule,
  ImputabiliteModule as ExcellenceImputabilite, OpalexeModule
} from './components/excellence';

// Module Outils
import { Chronometre, CalculatriceTechnique } from './components/outils';

// Pages complètes
import {
  PageParametres,
  PageStatistiques,
  PageFacturation,
  PageDocuments,
  PageCalendrier
} from './components/pages';

// Hooks
import { usePersistedStorage, useNotifications, useKeyboardShortcuts } from './hooks';
import { useAffaires } from './hooks/useSupabase';

// Données
import { ETAPES_TUNNEL, DS } from './data';

// ============================================================================
// CONFIGURATION MODULES (Navigation)
// ============================================================================

// Navigation simplifiée - Modules essentiels uniquement
// Excellence et Outils sont intégrés dans la fiche affaire
const MODULES = [
  { id: 'dashboard', path: '/dashboard', label: 'Tableau de bord', icon: Home },
  { id: 'affaires', path: '/affaires', label: 'Affaires', icon: Folder },
  { id: 'alertes', path: '/alertes', label: 'Alertes', icon: AlertCircle },
  { id: 'calendrier', path: '/calendrier', label: 'Calendrier', icon: Calendar },
  { id: 'carnet', path: '/carnet', label: 'Carnet d\'adresses', icon: Users },
  { id: 'facturation', path: '/facturation', label: 'Facturation', icon: Euro },
  { id: 'statistiques', path: '/statistiques', label: 'Statistiques', icon: BarChart3 },
  { id: 'parametres', path: '/parametres', label: 'Paramètres', icon: Settings }
];

// ============================================================================
// PAGE: Carnet d'adresses (Sapiteurs, Avocats, Juges, etc.)
// ============================================================================

const PageCarnetAdresses = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold text-[#1f1f1f]">Carnet d'adresses</h1>
      <p className="text-[#757575] mt-1">Sapiteurs, avocats, experts, juridictions et contacts professionnels</p>
    </div>
    <CarnetSapiteurs />
  </div>
);

// ============================================================================
// PAGE: Excellence (Menu)
// ============================================================================

const EXCELLENCE_MODULES = [
  { id: 'garanties', path: '/excellence/garanties', label: 'Garanties', icon: Shield, description: 'GPA, Biennale, Décennale' },
  { id: 'conformite', path: '/excellence/conformite', label: 'Conformité', icon: CheckCircle, description: 'Checklists règlementaires' },
  { id: 'dtu', path: '/excellence/dtu', label: 'Base DTU', icon: BookOpen, description: 'Documents Techniques Unifiés' },
  { id: 'jurisprudence', path: '/excellence/jurisprudence', label: 'Jurisprudence', icon: Scale, description: 'Décisions de référence' },
  { id: 'qualification', path: '/excellence/qualification', label: 'Qualification', icon: Target, description: 'Qualification des désordres' },
  { id: 'imputabilite', path: '/excellence/imputabilite', label: 'Imputabilité', icon: Users, description: 'Matrice d\'imputabilité' },
  { id: 'opalexe', path: '/excellence/opalexe', label: 'OPALEXE', icon: Upload, description: 'Dépôt dématérialisé' },
  { id: 'protection', path: '/excellence/protection', label: 'Protection', icon: Shield, description: 'Sécurité et conformité' }
];

const PageExcellence = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Module Excellence</h1>
        <p className="text-[#737373] mt-1">Outils professionnels pour l'expertise judiciaire</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {EXCELLENCE_MODULES.map(sub => {
          const Icon = sub.icon;
          return (
            <Card
              key={sub.id}
              onClick={() => navigate(sub.path)}
              className="p-6 cursor-pointer hover:border-[#c9a227] transition-all hover:shadow-lg group"
            >
              <div className="w-12 h-12 bg-[#f5e6c8] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#c9a227] transition-colors">
                <Icon className="w-6 h-6 text-[#c9a227] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-medium text-[#1a1a1a]">{sub.label}</h3>
              <p className="text-sm text-[#737373] mt-1">{sub.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// PAGE: Outils (Menu)
// ============================================================================

const OUTILS_MODULES = [
  { id: 'chronometre', path: '/outils/chronometre', label: 'Chronomètre', icon: Clock, description: 'Suivi du temps passé' },
  { id: 'calculatrice', path: '/outils/calculatrice', label: 'Calculatrice', icon: Calculator, description: 'Calculs techniques' },
  { id: 'dictee', path: '/outils/dictee', label: 'Dictée vocale', icon: Mic, description: 'Transcription vocale' }
];

const PageOutils = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Outils</h1>
        <p className="text-[#737373] mt-1">Utilitaires pour faciliter votre travail quotidien</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {OUTILS_MODULES.map(sub => {
          const Icon = sub.icon;
          return (
            <Card
              key={sub.id}
              onClick={() => navigate(sub.path)}
              className="p-6 cursor-pointer hover:border-[#c9a227] transition-all hover:shadow-lg group"
            >
              <div className="w-12 h-12 bg-[#f5e6c8] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#c9a227] transition-colors">
                <Icon className="w-6 h-6 text-[#c9a227] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-medium text-[#1a1a1a]">{sub.label}</h3>
              <p className="text-sm text-[#737373] mt-1">{sub.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// PAGE: Affaire Detail Wrapper
// ============================================================================

const AffaireDetailWrapper = () => {
  const { id } = useParams();
  const { affaires, updateAffaire, loading } = useAffaires();
  
  const affaire = useMemo(() => {
    return affaires.find(a => a.id === id);
  }, [affaires, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!affaire) {
    return (
      <Card className="p-8">
        <EmptyState
          icon={Folder}
          title="Affaire non trouvée"
          description="Cette affaire n'existe pas ou a été supprimée"
        />
      </Card>
    );
  }

  return <FicheAffaire affaireId={id} onBack={() => window.history.back()} />;
};

// ============================================================================
// WRAPPERS POUR ROUTES AVEC ID AFFAIRE
// ============================================================================

const GaleriePhotosWrapper = () => {
  const { id } = useParams();
  return <GaleriePhotos affaireId={id} />;
};

const GestionDiresWrapper = () => {
  const { id } = useParams();
  const { affaires } = useAffaires();
  const affaire = affaires.find(a => a.id === id);
  return <GestionDires affaireId={id} affaire={affaire} parties={affaire?.parties || []} />;
};

const ModuleChiffrageWrapper = () => {
  const { id } = useParams();
  const { affaires } = useAffaires();
  const affaire = affaires.find(a => a.id === id);
  return <ModuleChiffrage affaireId={id} affaire={affaire} pathologies={affaire?.pathologies || []} />;
};

const GenerateurRapportWrapper = () => {
  const { id } = useParams();
  const { affaires } = useAffaires();
  const { expert } = useAuth();
  const affaire = affaires.find(a => a.id === id);
  return <GenerateurRapport affaireId={id} affaire={affaire} expert={expert} />;
};

const MatriceImputabiliteWrapper = () => {
  const { id } = useParams();
  const { affaires } = useAffaires();
  const affaire = affaires.find(a => a.id === id);
  return <MatriceImputabilite affaireId={id} pathologies={affaire?.pathologies || []} parties={affaire?.parties || []} />;
};

const GenerateurCourriersWrapper = () => {
  const { id } = useParams();
  const { affaires } = useAffaires();
  const { expert } = useAuth();
  const affaire = affaires.find(a => a.id === id);
  const toast = useToast();

  const handleSave = (courrier) => {
    // Sauvegarder le courrier dans les documents de l'affaire
    toast.success('Courrier enregistré', `${courrier.titre} a été sauvegardé`);
  };

  return <GenerateurCourriers affaire={affaire} expert={expert} onSave={handleSave} />;
};

const CentreAlertesWrapper = () => {
  const navigate = useNavigate();
  const { affaires } = useAffaires();

  const handleAlertClick = (alerte) => {
    if (alerte.affaireId) {
      navigate(`/affaires/${alerte.affaireId}`);
    }
  };

  return <CentreAlertes affaires={affaires} onAlertClick={handleAlertClick} />;
};

// ============================================================================
// DASHBOARD WRAPPER - Avec navigation fonctionnelle
// ============================================================================

const DashboardWrapper = () => {
  const navigate = useNavigate();
  const { affaires } = useAffaires();
  const { expert } = useAuth();
  const toast = useToast();

  const handleNavigate = (action) => {
    switch (action) {
      case 'nouvelle-affaire':
        navigate('/affaires/nouveau');
        break;
      case 'nouvelle-reunion':
        // Si des affaires existent, aller vers la première pour planifier
        if (affaires.length > 0) {
          navigate(`/affaires/${affaires[0].id}`);
        } else {
          navigate('/affaires');
        }
        break;
      case 'document':
        // Aller vers la liste des affaires pour choisir
        navigate('/affaires');
        break;
      case 'lrar':
        toast.info('Fonctionnalité à venir', 'Le module LRAR sera bientôt disponible');
        break;
      case 'alertes':
        navigate('/alertes');
        break;
      case 'dires':
        if (affaires.length > 0) {
          navigate(`/affaires/${affaires[0].id}/dires`);
        }
        break;
      case 'finances':
        navigate('/facturation');
        break;
      default:
        toast.info('Action', `Navigation vers "${action}" en cours de développement`);
    }
  };

  const handleSelectAffaire = (affaire) => {
    navigate(`/affaires/${affaire.id}`);
  };

  return (
    <DashboardExpert
      expert={expert}
      affaires={affaires}
      onNavigate={handleNavigate}
      onSelectAffaire={handleSelectAffaire}
    />
  );
};

// ============================================================================
// LAYOUT PRINCIPAL
// ============================================================================

const AppLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Sidebar avec préférence sauvegardée
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch { return false; }
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Sauvegarder préférence sidebar
  useEffect(() => {
    try { localStorage.setItem('sidebar_collapsed', sidebarCollapsed); } catch {}
  }, [sidebarCollapsed]);
  const { notifications } = useNotifications();
  const { affaires } = useAffaires();
  const { goBack, canGoBack, tabs, openTab } = useTabs();
  const { isHelpOpen, initialTerm, openHelp, closeHelp } = useHelp();

  // Calculer les badges pour la navigation
  const badges = useMemo(() => ({
    affaires: affaires?.length || 0,
    alertes: affaires?.filter(a => a.urgent).length || 0
  }), [affaires]);

  // Raccourcis clavier
  useKeyboardShortcuts({
    'ctrl+k': () => document.querySelector('[data-search]')?.focus(),
    'ctrl+n': () => navigate('/affaires/nouveau'),
    'ctrl+h': () => navigate('/'),
    'alt+ArrowLeft': () => canGoBack && goBack(),
  });

  // Ouvrir automatiquement un onglet quand on navigue vers une affaire
  useEffect(() => {
    const match = location.pathname.match(/^\/affaires\/([^/]+)$/);
    if (match && match[1] !== 'nouveau') {
      const affaireId = match[1];
      const affaire = affaires.find(a => a.id === affaireId);
      if (affaire) {
        openTab({
          id: `affaire-${affaireId}`,
          type: 'affaire',
          label: affaire.reference || 'Affaire',
          path: location.pathname,
          data: { affaireId }
        });
      }
    }
  }, [location.pathname, affaires, openTab]);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Bannière mode démo */}
      <DemoBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          modules={MODULES}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          badges={badges}
        />

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f8f9fa]">
          {/* Header */}
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            notifications={notifications}
          />

          {/* Barre d'onglets (style navigateur) */}
          <TabBar />

          {/* Bouton retour contextuel */}
          {canGoBack && (
            <div className="px-8 pt-4">
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-sm text-[#5f6368] hover:text-[#c9a227] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
            </div>
          )}

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Chatbot IA */}
        <ChatbotIA />
      </div>

      {/* Bouton d'aide global */}
      <HelpButton onClick={() => openHelp()} />

      {/* Panneau d'aide */}
      <HelpPanel isOpen={isHelpOpen} onClose={closeHelp} initialTerm={initialTerm} />
    </div>
  );
};

// ============================================================================
// APPLICATION PRINCIPALE
// ============================================================================

const App = () => {
  const { user, loading: authLoading } = useAuth();

  // Écran de chargement
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-[#737373]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <ConfirmationProvider>
        <TabsProvider>
          <AppLayout>
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Routes>
          {/* Dashboard - Page d'accueil */}
          <Route path="/" element={<DashboardWrapper />} />
          <Route path="/dashboard" element={<DashboardWrapper />} />

          {/* Affaires */}
          <Route path="/affaires" element={<ListeAffaires />} />
          <Route path="/affaires/nouveau" element={<ListeAffaires />} />
          <Route path="/affaires/:id" element={<AffaireDetailWrapper />} />
          <Route path="/affaires/:id/photos" element={<GaleriePhotosWrapper />} />
          <Route path="/affaires/:id/dires" element={<GestionDiresWrapper />} />
          <Route path="/affaires/:id/chiffrage" element={<ModuleChiffrageWrapper />} />
          <Route path="/affaires/:id/rapport" element={<GenerateurRapportWrapper />} />
          <Route path="/affaires/:id/imputabilite" element={<MatriceImputabiliteWrapper />} />
          <Route path="/affaires/:id/courriers" element={<GenerateurCourriersWrapper />} />

          {/* Alertes */}
          <Route path="/alertes" element={<CentreAlertesWrapper />} />

          {/* Pages principales */}
          <Route path="/calendrier" element={<PageCalendrier />} />
          <Route path="/carnet" element={<PageCarnetAdresses />} />
          <Route path="/facturation" element={<PageFacturation />} />
          <Route path="/statistiques" element={<PageStatistiques />} />
          <Route path="/parametres" element={<PageParametres />} />

          {/* Redirections pour anciennes URLs */}
          <Route path="/contacts" element={<Navigate to="/carnet" replace />} />
          <Route path="/documents" element={<Navigate to="/affaires" replace />} />
          
          {/* Module Excellence */}
          <Route path="/excellence" element={<PageExcellence />} />
          <Route path="/excellence/garanties" element={<GarantiesModule />} />
          <Route path="/excellence/conformite" element={<ConformiteModule />} />
          <Route path="/excellence/protection" element={<ProtectionModule />} />
          <Route path="/excellence/dtu" element={<DTUModule />} />
          <Route path="/excellence/jurisprudence" element={<JurisprudenceModule />} />
          <Route path="/excellence/qualification" element={<QualificationModule />} />
          <Route path="/excellence/imputabilite" element={<ExcellenceImputabilite />} />
          <Route path="/excellence/opalexe" element={<OpalexeModule />} />
          
          {/* Module Outils */}
          <Route path="/outils" element={<PageOutils />} />
          <Route path="/outils/chronometre" element={<Chronometre />} />
          <Route path="/outils/calculatrice" element={<CalculatriceTechnique />} />
          <Route path="/outils/dictee" element={<DicteeVocale />} />
          
              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AppLayout>
        </TabsProvider>
      </ConfirmationProvider>
    </ToastProvider>
  );
};

export default App;
