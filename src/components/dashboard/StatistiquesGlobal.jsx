import React, { useState, useMemo } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, PieChart, Calendar,
  Euro, Clock, Users, FileText, AlertTriangle, CheckCircle,
  Folder, Target, Activity, ArrowUpRight, ArrowDownRight,
  Filter, Download, RefreshCw, ChevronRight, Eye,
  Building, Scale, Gavel, MapPin
} from 'lucide-react';
import { Card, Badge, Button } from '../ui';

// Composant de statistique avec tendance
const StatCard = ({ title, value, subtitle, trend, trendValue, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> :
             trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-900 mt-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </Card>
  );
};

// Composant graphique barre horizontale simple
const BarreHorizontale = ({ label, value, max, color = 'blue' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    gray: 'bg-gray-500'
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Composant camembert simple avec CSS
const SimplePieChart = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePercentage = 0;

  const getConicGradient = () => {
    const segments = data.map(d => {
      const start = cumulativePercentage;
      const percentage = total > 0 ? (d.value / total) * 100 : 0;
      cumulativePercentage += percentage;
      return `${d.color} ${start}% ${cumulativePercentage}%`;
    });
    return `conic-gradient(${segments.join(', ')})`;
  };

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-32 h-32 rounded-full"
        style={{ background: getConicGradient() }}
      />
      <div className="space-y-2">
        {data.map((d, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-gray-600">{d.label}</span>
            <span className="font-medium text-gray-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Ligne d'affaire récente
const AffaireRecente = ({ affaire, onClick }) => {
  const statutColors = {
    'en-cours': 'bg-blue-100 text-blue-700',
    'pre-rapport': 'bg-orange-100 text-orange-700',
    'termine': 'bg-green-100 text-green-700',
    'suspendu': 'bg-gray-100 text-gray-700',
    'archive': 'bg-gray-100 text-gray-500'
  };

  return (
    <div
      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
      onClick={() => onClick && onClick(affaire)}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Folder className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{affaire.reference}</p>
          <p className="text-xs text-gray-500">{affaire.tribunal || 'Non défini'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${statutColors[affaire.statut] || statutColors['en-cours']}`}>
          {affaire.statut === 'en-cours' ? 'En cours' :
           affaire.statut === 'pre-rapport' ? 'Pré-rapport' :
           affaire.statut === 'termine' ? 'Terminé' :
           affaire.statut === 'suspendu' ? 'Suspendu' :
           affaire.statut === 'archive' ? 'Archivé' : affaire.statut}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

// Alerte délai
const AlerteDelai = ({ affaire, type, joursRestants }) => {
  const isUrgent = joursRestants <= 7;

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      isUrgent ? 'bg-red-50' : 'bg-orange-50'
    }`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className={`w-5 h-5 ${isUrgent ? 'text-red-500' : 'text-orange-500'}`} />
        <div>
          <p className="font-medium text-gray-900">{affaire.reference}</p>
          <p className={`text-xs ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
            {type}
          </p>
        </div>
      </div>
      <span className={`text-sm font-bold ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
        {joursRestants}j
      </span>
    </div>
  );
};

// Composant principal
export const StatistiquesGlobal = ({ affaires = [], onSelectAffaire }) => {
  const [periodeFilter, setPeriodeFilter] = useState('all'); // 'all' | 'year' | 'month'

  // Calculs statistiques
  const stats = useMemo(() => {
    const now = new Date();
    const debutAnnee = new Date(now.getFullYear(), 0, 1);
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filtrer par période si nécessaire
    let affairesFiltrees = affaires;
    if (periodeFilter === 'year') {
      affairesFiltrees = affaires.filter(a => new Date(a.created_at) >= debutAnnee);
    } else if (periodeFilter === 'month') {
      affairesFiltrees = affaires.filter(a => new Date(a.created_at) >= debutMois);
    }

    // Statistiques de base
    const total = affairesFiltrees.length;
    const enCours = affairesFiltrees.filter(a => a.statut === 'en-cours').length;
    const preRapport = affairesFiltrees.filter(a => a.statut === 'pre-rapport').length;
    const termines = affairesFiltrees.filter(a => a.statut === 'termine').length;
    const suspendus = affairesFiltrees.filter(a => a.statut === 'suspendu').length;
    const archives = affairesFiltrees.filter(a => a.statut === 'archive').length;

    // Calcul CA (simulation basée sur honoraires)
    const caTotal = affairesFiltrees.reduce((sum, a) => {
      const honoraires = a.honoraires_total || a.montant_consignation || 0;
      return sum + honoraires;
    }, 0);

    // Nombre de parties
    const totalParties = affairesFiltrees.reduce((sum, a) => {
      return sum + (a.parties?.length || 0);
    }, 0);

    // Nombre de réunions
    const totalReunions = affairesFiltrees.reduce((sum, a) => {
      return sum + (a.reunions?.length || 0);
    }, 0);

    // Délais critiques (affaires avec date_limite proche)
    const alertesDelais = affairesFiltrees
      .filter(a => a.date_limite && a.statut === 'en-cours')
      .map(a => {
        const dateLimite = new Date(a.date_limite);
        const joursRestants = Math.ceil((dateLimite - now) / (1000 * 60 * 60 * 24));
        return { affaire: a, joursRestants, type: 'Dépôt rapport' };
      })
      .filter(a => a.joursRestants <= 30 && a.joursRestants > -30)
      .sort((a, b) => a.joursRestants - b.joursRestants);

    // Répartition par tribunal
    const parTribunal = {};
    affairesFiltrees.forEach(a => {
      const tribunal = a.tribunal || 'Non défini';
      parTribunal[tribunal] = (parTribunal[tribunal] || 0) + 1;
    });

    // Répartition par ville
    const parVille = {};
    affairesFiltrees.forEach(a => {
      const ville = a.bien_ville || 'Non définie';
      parVille[ville] = (parVille[ville] || 0) + 1;
    });

    // Affaires récentes
    const recentes = [...affairesFiltrees]
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, 5);

    // Tendance (comparaison mois précédent)
    const moisPrecedent = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const finMoisPrecedent = new Date(now.getFullYear(), now.getMonth(), 0);
    const affairesMoisPrecedent = affaires.filter(a => {
      const date = new Date(a.created_at);
      return date >= moisPrecedent && date <= finMoisPrecedent;
    }).length;
    const affairesMoisActuel = affaires.filter(a => {
      const date = new Date(a.created_at);
      return date >= debutMois;
    }).length;
    const tendanceNouveaux = affairesMoisActuel - affairesMoisPrecedent;

    return {
      total,
      enCours,
      preRapport,
      termines,
      suspendus,
      archives,
      caTotal,
      totalParties,
      totalReunions,
      alertesDelais,
      parTribunal,
      parVille,
      recentes,
      tendanceNouveaux,
      affairesMoisActuel
    };
  }, [affaires, periodeFilter]);

  // Données pour le camembert
  const pieData = [
    { label: 'En cours', value: stats.enCours, color: '#3B82F6' },
    { label: 'Pré-rapport', value: stats.preRapport, color: '#F59E0B' },
    { label: 'Terminés', value: stats.termines, color: '#10B981' },
    { label: 'Suspendus', value: stats.suspendus, color: '#6B7280' },
    { label: 'Archivés', value: stats.archives, color: '#9CA3AF' }
  ].filter(d => d.value > 0);

  // Top tribunaux
  const topTribunaux = Object.entries(stats.parTribunal)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxTribunal = topTribunaux[0]?.[1] || 1;

  // Top villes
  const topVilles = Object.entries(stats.parVille)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxVille = topVilles[0]?.[1] || 1;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Tableau de bord
          </h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtre période */}
          <select
            value={periodeFilter}
            onChange={(e) => setPeriodeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les périodes</option>
            <option value="year">Cette année</option>
            <option value="month">Ce mois</option>
          </select>
          <Button variant="secondary" icon={Download}>
            Exporter
          </Button>
        </div>
      </div>

      {/* Cartes statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Dossiers actifs"
          value={stats.enCours + stats.preRapport}
          subtitle={`${stats.enCours} en cours, ${stats.preRapport} pré-rapport`}
          icon={Folder}
          color="blue"
          trend={stats.tendanceNouveaux > 0 ? 'up' : stats.tendanceNouveaux < 0 ? 'down' : null}
          trendValue={stats.tendanceNouveaux !== 0 ? `${Math.abs(stats.tendanceNouveaux)} ce mois` : null}
        />
        <StatCard
          title="Dossiers terminés"
          value={stats.termines}
          subtitle={`sur ${stats.total} total`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={`${(stats.caTotal / 1000).toFixed(0)}k€`}
          subtitle="Honoraires et provisions"
          icon={Euro}
          color="purple"
        />
        <StatCard
          title="Alertes délais"
          value={stats.alertesDelais.length}
          subtitle={stats.alertesDelais.length > 0 ? `${stats.alertesDelais.filter(a => a.joursRestants <= 7).length} urgent(s)` : 'Tout est à jour'}
          icon={AlertTriangle}
          color={stats.alertesDelais.length > 0 ? 'orange' : 'green'}
        />
      </div>

      {/* Ligne secondaire */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Parties impliquées"
          value={stats.totalParties}
          subtitle={`~${stats.total > 0 ? (stats.totalParties / stats.total).toFixed(1) : 0} par dossier`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Réunions planifiées"
          value={stats.totalReunions}
          subtitle={`~${stats.total > 0 ? (stats.totalReunions / stats.total).toFixed(1) : 0} par dossier`}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Taux de complétion"
          value={`${stats.total > 0 ? Math.round((stats.termines / stats.total) * 100) : 0}%`}
          subtitle={`${stats.termines} terminés sur ${stats.total}`}
          icon={Target}
          color="green"
        />
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition par statut */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-gray-400" />
            Répartition par statut
          </h3>
          {pieData.length > 0 ? (
            <SimplePieChart data={pieData} />
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée</p>
          )}
        </Card>

        {/* Top tribunaux */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-gray-400" />
            Par juridiction
          </h3>
          <div className="space-y-3">
            {topTribunaux.length > 0 ? topTribunaux.map(([tribunal, count], idx) => (
              <BarreHorizontale
                key={tribunal}
                label={tribunal}
                value={count}
                max={maxTribunal}
                color={['blue', 'green', 'orange', 'purple', 'indigo'][idx] || 'gray'}
              />
            )) : (
              <p className="text-gray-500 text-center py-4">Aucune donnée</p>
            )}
          </div>
        </Card>

        {/* Top villes */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-400" />
            Par ville
          </h3>
          <div className="space-y-3">
            {topVilles.length > 0 ? topVilles.map(([ville, count], idx) => (
              <BarreHorizontale
                key={ville}
                label={ville}
                value={count}
                max={maxVille}
                color={['indigo', 'purple', 'blue', 'green', 'orange'][idx] || 'gray'}
              />
            )) : (
              <p className="text-gray-500 text-center py-4">Aucune donnée</p>
            )}
          </div>
        </Card>
      </div>

      {/* Alertes et affaires récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes délais */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Délais à surveiller
            {stats.alertesDelais.length > 0 && (
              <Badge variant="warning">{stats.alertesDelais.length}</Badge>
            )}
          </h3>
          <div className="space-y-2">
            {stats.alertesDelais.length > 0 ? (
              stats.alertesDelais.slice(0, 5).map((alerte, idx) => (
                <AlerteDelai
                  key={idx}
                  affaire={alerte.affaire}
                  type={alerte.type}
                  joursRestants={alerte.joursRestants}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto text-green-300 mb-2" />
                <p className="text-gray-500">Aucune alerte</p>
                <p className="text-xs text-gray-400">Tous les délais sont respectés</p>
              </div>
            )}
          </div>
        </Card>

        {/* Affaires récentes */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Activité récente
          </h3>
          <div className="space-y-1">
            {stats.recentes.length > 0 ? (
              stats.recentes.map(affaire => (
                <AffaireRecente
                  key={affaire.id}
                  affaire={affaire}
                  onClick={onSelectAffaire}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <Folder className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Aucune affaire</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Indicateurs de performance */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-400" />
          Indicateurs de performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {stats.total > 0 ? (stats.totalReunions / stats.total).toFixed(1) : 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Réunions / dossier</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {stats.total > 0 ? Math.round((stats.termines / stats.total) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-500 mt-1">Taux de clôture</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {stats.total > 0 ? Math.round(stats.caTotal / stats.total) : 0}€
            </p>
            <p className="text-sm text-gray-500 mt-1">CA moyen / dossier</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">
              {stats.affairesMoisActuel}
            </p>
            <p className="text-sm text-gray-500 mt-1">Nouveaux ce mois</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatistiquesGlobal;
