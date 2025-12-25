// ============================================================================
// CRM EXPERT JUDICIAIRE - DASHBOARD EXPERT QUOTIDIEN
// Vue complète des actions à mener chaque jour
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, Calendar, Clock, AlertTriangle, CheckCircle,
  Euro, FileText, Users, Scale, TrendingUp, ChevronRight,
  Sun, Moon, Coffee, Target, Briefcase, Bell, MessageSquare,
  MapPin, Phone, Mail, ArrowRight, BarChart3, PieChart,
  Folder, Timer, CalendarDays, Activity
} from 'lucide-react';
import { Card, Badge, Button, ProgressBar } from '../ui';
import { AlertesWidget } from '../alertes';
import { DiresWidget } from '../dires';
import { formatDateFr, joursEntre, formatMontant } from '../../utils/helpers';
import { useAlertes, AlertEngine } from '../alertes';

// ============================================================================
// COMPOSANT PRINCIPAL DASHBOARD
// ============================================================================

export const DashboardExpert = ({ 
  expert, 
  affaires = [], 
  onNavigate,
  onSelectAffaire 
}) => {
  const [periode, setPeriode] = useState('semaine'); // jour, semaine, mois
  const { alertes, stats: alerteStats } = useAlertes(affaires);

  // Calculs statistiques
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const affairesEnCours = affaires.filter(a => a.statut === 'en-cours' || a.statut === 'pre-rapport');
    const affairesUrgentes = affaires.filter(a => a.urgent);
    
    // Réunions de la semaine
    const debutSemaine = new Date(today);
    debutSemaine.setDate(today.getDate() - today.getDay() + 1);
    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(debutSemaine.getDate() + 6);
    
    const reunionsSemaine = [];
    affaires.forEach(a => {
      (a.reunions || []).forEach(r => {
        const dateR = new Date(r.date_reunion);
        if (dateR >= debutSemaine && dateR <= finSemaine && r.statut !== 'annulee' && r.statut !== 'terminee') {
          reunionsSemaine.push({ ...r, affaire: a });
        }
      });
    });
    reunionsSemaine.sort((a, b) => new Date(a.date_reunion) - new Date(b.date_reunion));

    // Dires en attente
    let diresEnAttente = 0;
    let diresEnRetard = 0;
    affaires.forEach(a => {
      (a.dires || []).forEach(d => {
        if (d.statut !== 'repondu' && d.statut !== 'clos') {
          diresEnAttente++;
          const jours = joursEntre(new Date(d.date_reception), today);
          if (jours > 21) diresEnRetard++;
        }
      });
    });

    // Finances
    let totalProvisions = 0;
    let provisionsRecues = 0;
    let totalVacations = 0;
    affaires.forEach(a => {
      if (a.provision_montant) {
        totalProvisions += parseFloat(a.provision_montant);
        if (a.provision_recue) provisionsRecues += parseFloat(a.provision_montant);
      }
      (a.vacations || []).forEach(v => {
        totalVacations += parseFloat(v.montant || 0);
      });
    });

    // Échéances proches (30 jours)
    const echeancesProches = affaires.filter(a => {
      if (!a.date_echeance) return false;
      const jours = joursEntre(today, new Date(a.date_echeance));
      return jours >= 0 && jours <= 30;
    }).length;

    return {
      totalAffaires: affaires.length,
      affairesEnCours: affairesEnCours.length,
      affairesUrgentes: affairesUrgentes.length,
      reunionsSemaine,
      diresEnAttente,
      diresEnRetard,
      totalProvisions,
      provisionsRecues,
      totalVacations,
      echeancesProches,
      tauxRecouvrement: totalProvisions > 0 ? Math.round((provisionsRecues / totalProvisions) * 100) : 0
    };
  }, [affaires]);

  // Salutation selon l'heure
  const getSalutation = () => {
    const heure = new Date().getHours();
    if (heure < 12) return { text: 'Bonjour', icon: Sun };
    if (heure < 18) return { text: 'Bon après-midi', icon: Coffee };
    return { text: 'Bonsoir', icon: Moon };
  };
  const salutation = getSalutation();
  const SalutIcon = salutation.icon;

  return (
    <div className="space-y-6">
      {/* En-tête personnalisé - Style Professionnel Juridique */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2563EB] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/70 mb-2">
              <SalutIcon className="w-5 h-5" />
              <span className="text-sm">{formatDateFr(new Date(), true)}</span>
            </div>
            <h1 className="text-3xl font-semibold mb-2">
              {salutation.text}, {expert?.prenom || 'Expert'}
            </h1>
            {/* Message contextuel avec nombre d'actions */}
            <p className="text-white/80 text-lg">
              {alerteStats.critiques > 0 ? (
                <span className="text-red-300">
                  ⚠️ {alerteStats.critiques + alerteStats.hautes} affaire(s) nécessitent votre attention
                </span>
              ) : stats.reunionsSemaine.length > 0 ? (
                <span>
                  📅 {stats.reunionsSemaine.length} réunion(s) cette semaine • {stats.diresEnAttente} dire(s) à traiter
                </span>
              ) : stats.diresEnAttente > 0 ? (
                <span>
                  📝 {stats.diresEnAttente} dire(s) en attente de réponse
                </span>
              ) : (
                <span className="text-green-300">
                  ✨ Vous êtes à jour ! Aucune action urgente.
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Météo des alertes - Style badge arrondi */}
            <div className={`px-5 py-3 rounded-2xl ${
              alerteStats.critiques > 0 ? 'bg-red-500/20 border border-red-500/30' :
              alerteStats.hautes > 0 ? 'bg-orange-500/20 border border-orange-500/30' :
              'bg-green-500/20 border border-green-500/30'
            }`}>
              {alerteStats.critiques > 0 ? (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <div>
                    <span className="text-red-300 font-semibold text-lg">{alerteStats.critiques}</span>
                    <span className="text-red-300/70 text-sm ml-1">critique(s)</span>
                  </div>
                </div>
              ) : alerteStats.hautes > 0 ? (
                <div className="flex items-center gap-2">
                  <Bell className="w-6 h-6 text-orange-400" />
                  <div>
                    <span className="text-orange-300 font-semibold text-lg">{alerteStats.hautes}</span>
                    <span className="text-orange-300/70 text-sm ml-1">alerte(s)</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-green-300 font-medium">Tout va bien</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-5 gap-4">
        <KPICard
          icon={Briefcase}
          label="Affaires actives"
          value={stats.affairesEnCours}
          subValue={`${stats.affairesUrgentes} urgente(s)`}
          trend={stats.affairesUrgentes > 0 ? 'warning' : 'neutral'}
          onClick={() => onNavigate && onNavigate('affaires')}
        />
        <KPICard
          icon={Calendar}
          label="Réunions semaine"
          value={stats.reunionsSemaine.length}
          subValue="À venir"
          trend="neutral"
          onClick={() => onNavigate && onNavigate('calendrier')}
        />
        <KPICard
          icon={MessageSquare}
          label="Dires en attente"
          value={stats.diresEnAttente}
          subValue={stats.diresEnRetard > 0 ? `${stats.diresEnRetard} en retard` : 'À jour'}
          trend={stats.diresEnRetard > 0 ? 'danger' : 'success'}
        />
        <KPICard
          icon={Clock}
          label="Échéances 30j"
          value={stats.echeancesProches}
          subValue="À surveiller"
          trend={stats.echeancesProches > 3 ? 'warning' : 'neutral'}
          onClick={() => onNavigate && onNavigate('alertes')}
        />
        <KPICard
          icon={Euro}
          label="Provisions reçues"
          value={`${stats.tauxRecouvrement}%`}
          subValue={formatMontant(stats.provisionsRecues)}
          trend={stats.tauxRecouvrement >= 80 ? 'success' : stats.tauxRecouvrement >= 50 ? 'neutral' : 'warning'}
          onClick={() => onNavigate && onNavigate('finances')}
        />
      </div>

      {/* Contenu principal en 3 colonnes */}
      <div className="grid grid-cols-3 gap-6">
        {/* Colonne 1 : Agenda */}
        <div className="space-y-6">
          <AgendaSemaine 
            reunions={stats.reunionsSemaine} 
            onSelectAffaire={onSelectAffaire}
          />
          <ActionsRapides onNavigate={onNavigate} />
        </div>

        {/* Colonne 2 : Alertes et Dires */}
        <div className="space-y-6">
          <AlertesWidget 
            affaires={affaires} 
            limit={4}
            onViewAll={() => onNavigate && onNavigate('alertes')}
          />
          <DiresWidget 
            affaires={affaires}
            onViewAll={() => onNavigate && onNavigate('dires')}
          />
        </div>

        {/* Colonne 3 : Activité et Finances */}
        <div className="space-y-6">
          <AffairesRecentes 
            affaires={affaires.slice(0, 5)} 
            onSelect={onSelectAffaire}
          />
          <ResumeFinancier stats={stats} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANTS WIDGETS
// ============================================================================

// KPI Card - Style Professionnel avec grands chiffres et tendances
const KPICard = ({ icon: Icon, label, value, subValue, trend, onClick }) => {
  const trendConfig = {
    success: {
      color: 'text-[#059669]',
      bgColor: 'bg-[#ECFDF5]',
      arrow: '↗',
      iconBg: 'bg-[#D1FAE5]'
    },
    warning: {
      color: 'text-[#D97706]',
      bgColor: 'bg-[#FFFBEB]',
      arrow: '→',
      iconBg: 'bg-[#FEF3C7]'
    },
    danger: {
      color: 'text-[#DC2626]',
      bgColor: 'bg-[#FEF2F2]',
      arrow: '↘',
      iconBg: 'bg-[#FEE2E2]'
    },
    neutral: {
      color: 'text-[#6B7280]',
      bgColor: 'bg-[#F9FAFB]',
      arrow: '',
      iconBg: 'bg-[#EFF6FF]'
    }
  };

  const config = trendConfig[trend] || trendConfig.neutral;

  return (
    <Card
      className={`p-6 ${onClick ? 'cursor-pointer hover:border-[#3B82F6] hover:shadow-md transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-[#6B7280] uppercase tracking-wide font-medium">{label}</p>
        <div className={`w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${trend === 'neutral' ? 'text-[#2563EB]' : config.color}`} />
        </div>
      </div>

      {/* Valeur principale - Grand et lisible */}
      <p className="text-4xl font-bold text-[#111827] leading-none mb-2">{value}</p>

      {/* Sous-valeur avec flèche tendance */}
      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${config.bgColor}`}>
        {config.arrow && <span className={`${config.color} font-medium`}>{config.arrow}</span>}
        <span className={`text-sm font-medium ${config.color}`}>{subValue}</span>
      </div>
    </Card>
  );
};

// Agenda de la semaine
const AgendaSemaine = ({ reunions, onSelectAffaire }) => {
  const joursLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();
  const debutSemaine = new Date(today);
  debutSemaine.setDate(today.getDate() - today.getDay() + 1);

  const joursSemaine = Array.from({ length: 7 }, (_, i) => {
    const jour = new Date(debutSemaine);
    jour.setDate(debutSemaine.getDate() + i);
    return jour;
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#DBEAFE] rounded-xl flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div>
            <h3 className="font-medium text-[#1a1a1a]">Cette semaine</h3>
            <p className="text-sm text-[#737373]">{reunions.length} réunion(s)</p>
          </div>
        </div>
      </div>

      {/* Mini calendrier semaine */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {joursSemaine.map((jour, i) => {
          const isToday = jour.toDateString() === today.toDateString();
          const hasReunion = reunions.some(r => 
            new Date(r.date_reunion).toDateString() === jour.toDateString()
          );
          
          return (
            <div
              key={i}
              className={`text-center py-2 rounded-lg ${
                isToday ? 'bg-[#2563EB] text-white' :
                hasReunion ? 'bg-[#DBEAFE] text-[#2563EB]' :
                'bg-[#fafafa] text-[#737373]'
              }`}
            >
              <p className="text-xs">{joursLabels[i]}</p>
              <p className="text-lg font-medium">{jour.getDate()}</p>
              {hasReunion && !isToday && (
                <div className="w-1.5 h-1.5 bg-[#2563EB] rounded-full mx-auto mt-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Liste des réunions */}
      {reunions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🗓️</div>
          <p className="font-medium text-[#1a1a1a] mb-1">Semaine libre !</p>
          <p className="text-sm text-[#737373] mb-4">Aucune réunion planifiée cette semaine</p>
          <Button
            variant="secondary"
            size="sm"
            icon={Calendar}
            onClick={() => {}}
          >
            Planifier une réunion
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {reunions.slice(0, 4).map((reunion, i) => {
            const dateR = new Date(reunion.date_reunion);
            const isToday = dateR.toDateString() === today.toDateString();
            
            return (
              <div
                key={i}
                className={`p-3 rounded-xl cursor-pointer hover:shadow-sm transition-shadow ${
                  isToday ? 'bg-[#DBEAFE] border border-[#2563EB]' : 'bg-[#fafafa]'
                }`}
                onClick={() => onSelectAffaire && onSelectAffaire(reunion.affaire)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#a3a3a3]">
                      {formatDateFr(dateR)} à {dateR.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="font-medium text-sm text-[#1a1a1a]">
                      Réunion n°{reunion.numero} - {reunion.affaire?.reference}
                    </p>
                  </div>
                  {isToday && <Badge variant="gold">Aujourd'hui</Badge>}
                </div>
                {reunion.lieu && (
                  <p className="text-xs text-[#737373] mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {reunion.lieu}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

// Actions rapides
const ActionsRapides = ({ onNavigate }) => {
  const actions = [
    { label: 'Nouvelle affaire', icon: Folder, action: 'nouvelle-affaire', color: 'bg-blue-100 text-blue-600' },
    { label: 'Planifier réunion', icon: Calendar, action: 'nouvelle-reunion', color: 'bg-green-100 text-green-600' },
    { label: 'Générer document', icon: FileText, action: 'document', color: 'bg-purple-100 text-purple-600' },
    { label: 'Envoyer LRAR', icon: Mail, action: 'lrar', color: 'bg-amber-100 text-amber-600' }
  ];

  return (
    <Card className="p-6">
      <h3 className="font-medium text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-[#2563EB]" />
        Actions rapides
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              onClick={() => onNavigate && onNavigate(action.action)}
              className="p-4 rounded-xl bg-[#fafafa] hover:bg-[#f5f5f5] transition-colors text-left group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${action.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-[#1a1a1a] group-hover:text-[#2563EB] transition-colors">
                {action.label}
              </p>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

// Affaires récentes - Style Pennylane épuré
const AffairesRecentes = ({ affaires, onSelect, onViewAll }) => {
  // Statut avec couleur et icône
  const getStatutConfig = (statut, urgent) => {
    if (urgent) return { color: 'bg-red-500', icon: '🔴' };
    switch (statut) {
      case 'termine': return { color: 'bg-green-500', icon: '🟢' };
      case 'pre-rapport': return { color: 'bg-amber-500', icon: '🟡' };
      case 'suspendu': return { color: 'bg-gray-400', icon: '⚪' };
      default: return { color: 'bg-blue-500', icon: '🔵' };
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#DBEAFE] rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#2563EB]" />
          </div>
          <h3 className="font-medium text-[#1a1a1a]">Affaires récentes</h3>
        </div>
      </div>

      {/* Liste épurée - max 4 items */}
      <div className="space-y-2">
        {affaires.slice(0, 4).map(affaire => {
          const config = getStatutConfig(affaire.statut, affaire.urgent);
          return (
            <div
              key={affaire.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#fafafa] cursor-pointer transition-colors group"
              onClick={() => onSelect && onSelect(affaire)}
            >
              {/* Indicateur statut */}
              <div className={`w-2 h-2 rounded-full ${config.color} flex-shrink-0`} />

              {/* Infos principales */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#1a1a1a] truncate group-hover:text-[#2563EB]">
                  {affaire.reference}
                </p>
                <p className="text-xs text-[#737373] truncate">
                  {affaire.bien_ville || affaire.tribunal}
                </p>
              </div>

              {/* Montant à droite */}
              {affaire.provision_montant && (
                <span className="text-sm font-semibold text-[#1a1a1a]">
                  {parseFloat(affaire.provision_montant).toLocaleString('fr-FR')} €
                </span>
              )}

              <ChevronRight className="w-4 h-4 text-[#a3a3a3] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>

      {/* Lien "Voir toutes" */}
      {affaires.length > 4 && (
        <button
          onClick={onViewAll}
          className="w-full mt-4 py-2.5 text-sm font-medium text-[#2563EB] hover:bg-[#EFF6FF] rounded-xl transition-colors"
        >
          Voir toutes les affaires →
        </button>
      )}
    </Card>
  );
};

// Résumé financier
const ResumeFinancier = ({ stats }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Euro className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-medium text-[#1a1a1a]">Finances</h3>
        </div>
      </div>

      <div className="space-y-4">
        {/* Provisions */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[#737373]">Provisions</span>
            <span className="font-medium">{stats.tauxRecouvrement}%</span>
          </div>
          <ProgressBar 
            value={stats.tauxRecouvrement} 
            size="sm" 
            color={stats.tauxRecouvrement >= 80 ? 'green' : stats.tauxRecouvrement >= 50 ? 'amber' : 'red'}
          />
          <div className="flex justify-between text-xs text-[#a3a3a3] mt-1">
            <span>{formatMontant(stats.provisionsRecues)} reçues</span>
            <span>{formatMontant(stats.totalProvisions)} total</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e5e5e5]">
          <div>
            <p className="text-xs text-[#a3a3a3] uppercase tracking-wider">Vacations</p>
            <p className="text-xl font-light text-[#1a1a1a]">{formatMontant(stats.totalVacations)}</p>
          </div>
          <div>
            <p className="text-xs text-[#a3a3a3] uppercase tracking-wider">En attente</p>
            <p className="text-xl font-light text-amber-600">
              {formatMontant(stats.totalProvisions - stats.provisionsRecues)}
            </p>
          </div>
        </div>

        {/* Projection annuelle */}
        <div className="p-3 bg-[#fafafa] rounded-xl">
          <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-1">CA Annuel estimé</p>
          <p className="text-2xl font-light text-[#1a1a1a]">
            {formatMontant(stats.totalProvisions * 1.2)}
          </p>
          <p className="text-xs text-[#737373]">Basé sur les provisions actuelles</p>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// COMPOSANT TEMPS PASSÉ AUJOURD'HUI
// ============================================================================

export const TempsAujourdhui = ({ vacationsJour = [] }) => {
  const totalMinutes = vacationsJour.reduce((acc, v) => acc + (parseFloat(v.duree_heures) * 60), 0);
  const heures = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Timer className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-medium text-[#1a1a1a]">Temps aujourd'hui</h3>
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-4xl font-light text-[#1a1a1a]">
          {heures}h{minutes > 0 ? minutes.toString().padStart(2, '0') : ''}
        </p>
        <p className="text-sm text-[#737373] mt-1">
          {vacationsJour.length} vacation(s) enregistrée(s)
        </p>
      </div>

      {vacationsJour.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-[#e5e5e5]">
          {vacationsJour.map((v, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-[#737373]">{v.affaire_ref || 'Affaire'}</span>
              <span className="font-medium">{v.duree_heures}h</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default DashboardExpert;
