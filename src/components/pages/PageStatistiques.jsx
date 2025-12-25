// ============================================================================
// CRM EXPERT JUDICIAIRE - PAGE STATISTIQUES
// Dashboard analytique complet pour le suivi d'activité
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Calendar, Euro, Clock,
  Folder, Users, FileText, CheckCircle, AlertTriangle, Target,
  PieChart, Activity, Award, ArrowUp, ArrowDown, Minus,
  Filter, Download, RefreshCw, ChevronRight, Eye
} from 'lucide-react';
import { Card, Badge, Button, useToast } from '../ui';
import { getStoredAffaires } from '../../lib/demoData';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// COMPOSANT: Carte KPI
// ============================================================================

const KPICard = ({ title, value, unit, trend, trendValue, icon: Icon, color = 'gold', detail }) => {
  const colorMap = {
    gold: 'bg-[#f5e6c8] text-[#c9a227]',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-[#737373]'
  };

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trendColors[trend]}`}>
            <TrendIcon className="w-4 h-4" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-light text-[#1a1a1a]">
          {value}
          {unit && <span className="text-lg text-[#737373] ml-1">{unit}</span>}
        </p>
        <p className="text-sm text-[#737373] mt-1">{title}</p>
        {detail && <p className="text-xs text-[#a3a3a3] mt-1">{detail}</p>}
      </div>
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Graphique en barres simplifié
// ============================================================================

const SimpleBarChart = ({ data, title, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[#1a1a1a]">{title}</h4>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-xs text-[#737373] w-16 text-right">{item.label}</span>
            <div className="flex-1 h-6 bg-[#f5f5f5] rounded overflow-hidden">
              <div
                className="h-full bg-[#c9a227] rounded transition-all"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-[#1a1a1a] w-12">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT: Répartition circulaire simplifiée
// ============================================================================

const SimpleDonut = ({ data, title, centerLabel }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  const colors = ['#c9a227', '#4ade80', '#60a5fa', '#f97316', '#a78bfa', '#f472b6'];

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = -currentAngle;
            currentAngle += percentage;

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                pathLength="100"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-light text-[#1a1a1a]">{total}</p>
            <p className="text-xs text-[#737373]">{centerLabel}</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-[#1a1a1a]">{title}</h4>
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-xs text-[#737373]">{item.label}</span>
            <span className="text-xs font-medium text-[#1a1a1a]">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT: Tableau de classement
// ============================================================================

const RankingTable = ({ data, title, columns }) => (
  <div>
    <h4 className="text-sm font-medium text-[#1a1a1a] mb-3">{title}</h4>
    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#fafafa]">
          <tr>
            <th className="text-left px-3 py-2 text-xs font-medium text-[#737373]">#</th>
            {columns.map((col, i) => (
              <th key={i} className="text-left px-3 py-2 text-xs font-medium text-[#737373]">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 5).map((row, index) => (
            <tr key={index} className="border-t border-[#e5e5e5]">
              <td className="px-3 py-2 font-medium text-[#c9a227]">{index + 1}</td>
              {columns.map((col, i) => (
                <td key={i} className="px-3 py-2">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const PageStatistiques = () => {
  const toast = useToast();
  const [periode, setPeriode] = useState('annee'); // 'mois', 'trimestre', 'annee'
  const [refreshKey, setRefreshKey] = useState(0);
  const affaires = getStoredAffaires();

  // Exporter les statistiques en CSV
  const handleExport = useCallback(() => {
    try {
      const csvData = [
        ['Statistiques CRM Expert Judiciaire'],
        ['Export du', formatDateFr(new Date().toISOString())],
        ['Période', periode === 'mois' ? 'Ce mois' : periode === 'trimestre' ? 'Ce trimestre' : periode === 'annee' ? 'Cette année' : 'Depuis le début'],
        [],
        ['Indicateur', 'Valeur'],
        ['Affaires totales', affaires.length],
        ['Affaires en cours', affaires.filter(a => a.statut === 'en-cours').length],
        ['Affaires terminées', affaires.filter(a => a.statut === 'rapport-depose' || a.statut === 'archive').length],
        ['Affaires urgentes', affaires.filter(a => a.urgent).length],
        [],
        ['Finances', ''],
        ['Honoraires générés', affaires.reduce((sum, a) => sum + (a.vacations || []).reduce((s, v) => s + (v.montant || 0), 0), 0) + ' €'],
        ['Provisions reçues', affaires.filter(a => a.provision_recue).reduce((sum, a) => sum + (a.provision_montant || 0), 0) + ' €'],
        ['Provisions en attente', affaires.filter(a => !a.provision_recue && a.provision_montant).reduce((sum, a) => sum + (a.provision_montant || 0), 0) + ' €'],
        [],
        ['Activité', ''],
        ['Heures travaillées', affaires.reduce((sum, a) => sum + (a.vacations || []).reduce((s, v) => s + (v.duree_heures || 0), 0), 0) + ' h'],
        ['Réunions totales', affaires.reduce((sum, a) => sum + (a.reunions?.length || 0), 0)],
        ['Dires en attente', affaires.reduce((sum, a) => sum + (a.dires?.filter(d => d.statut === 'recu' || d.statut === 'en-analyse').length || 0), 0)]
      ];

      const csvContent = csvData.map(row => row.join(';')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statistiques_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export réussi', 'Les statistiques ont été exportées au format CSV');
    } catch (error) {
      toast.error('Erreur', 'Impossible d\'exporter les statistiques');
    }
  }, [affaires, periode, toast]);

  // Actualiser les données
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    toast.info('Actualisation', 'Les statistiques ont été actualisées');
  }, [toast]);

  // Calculs statistiques
  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Affaires de l'année en cours
    const affairesAnnee = affaires.filter(a => {
      const date = new Date(a.created_at || a.date_ordonnance);
      return date.getFullYear() === currentYear;
    });

    // Par statut
    const parStatut = {
      'en-cours': affaires.filter(a => a.statut === 'en-cours').length,
      'pre-rapport': affaires.filter(a => a.statut === 'pre-rapport').length,
      'rapport-depose': affaires.filter(a => a.statut === 'rapport-depose').length,
      'archive': affaires.filter(a => a.statut === 'archive').length
    };

    // Honoraires
    const totalHonoraires = affaires.reduce((sum, a) => {
      const vacations = a.vacations || [];
      return sum + vacations.reduce((s, v) => s + (v.montant || 0), 0);
    }, 0);

    const provisionsRecues = affaires
      .filter(a => a.provision_recue)
      .reduce((sum, a) => sum + (a.provision_montant || 0), 0);

    const provisionsEnAttente = affaires
      .filter(a => !a.provision_recue && a.provision_montant)
      .reduce((sum, a) => sum + (a.provision_montant || 0), 0);

    // Heures travaillées (arrondi à 2 décimales pour éviter 4.45999999)
    const totalHeures = Math.round(affaires.reduce((sum, a) => {
      const vacations = a.vacations || [];
      return sum + vacations.reduce((s, v) => s + (v.duree_heures || 0), 0);
    }, 0) * 100) / 100;

    // Réunions
    const totalReunions = affaires.reduce((sum, a) => sum + (a.reunions?.length || 0), 0);
    const reunionsTerminees = affaires.reduce((sum, a) =>
      sum + (a.reunions?.filter(r => r.statut === 'terminee').length || 0), 0);

    // Par tribunal
    const parTribunal = {};
    affaires.forEach(a => {
      const tribunal = a.tribunal || 'Non défini';
      parTribunal[tribunal] = (parTribunal[tribunal] || 0) + 1;
    });

    // Par mois (derniers 12 mois)
    const parMois = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentYear, currentMonth - 11 + i, 1);
      const mois = date.toLocaleDateString('fr-FR', { month: 'short' });
      const count = affaires.filter(a => {
        const d = new Date(a.created_at || a.date_ordonnance);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      }).length;
      return { label: mois, value: count };
    });

    // Délais moyens
    const affairesTerminees = affaires.filter(a =>
      a.statut === 'rapport-depose' || a.statut === 'archive'
    );

    const delaiMoyen = affairesTerminees.length > 0
      ? Math.round(affairesTerminees.reduce((sum, a) => {
          const debut = new Date(a.date_ordonnance);
          const fin = new Date(a.date_depot_rapport || new Date());
          return sum + (fin - debut) / (1000 * 60 * 60 * 24);
        }, 0) / affairesTerminees.length)
      : 0;

    // Top tribunaux
    const topTribunaux = Object.entries(parTribunal)
      .map(([tribunal, count]) => ({ tribunal, count }))
      .sort((a, b) => b.count - a.count);

    // Affaires urgentes
    const urgentes = affaires.filter(a => a.urgent).length;

    // Dires en attente
    const diresEnAttente = affaires.reduce((sum, a) =>
      sum + (a.dires?.filter(d => d.statut === 'recu' || d.statut === 'en-analyse').length || 0), 0);

    return {
      total: affaires.length,
      enCours: parStatut['en-cours'],
      terminees: parStatut['rapport-depose'] + parStatut['archive'],
      preRapport: parStatut['pre-rapport'],
      annee: affairesAnnee.length,
      totalHonoraires,
      provisionsRecues,
      provisionsEnAttente,
      totalHeures,
      totalReunions,
      reunionsTerminees,
      parStatut,
      parMois,
      topTribunaux,
      delaiMoyen,
      urgentes,
      diresEnAttente,
      tauxCompletion: affaires.length > 0
        ? Math.round((parStatut['rapport-depose'] + parStatut['archive']) / affaires.length * 100)
        : 0
    };
  }, [affaires, periode, refreshKey]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#1a1a1a]">Statistiques</h1>
          <p className="text-sm text-[#737373]">Tableau de bord analytique de votre activité</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#c9a227]"
          >
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
            <option value="tout">Depuis le début</option>
          </select>
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Exporter
          </Button>
          <Button variant="secondary" icon={RefreshCw} onClick={handleRefresh}>
            Actualiser
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-5 gap-4">
        <KPICard
          title="Affaires en cours"
          value={stats.enCours}
          icon={Folder}
          color="gold"
          trend="up"
          trendValue="+2"
          detail={`${stats.urgentes} urgente(s)`}
        />
        <KPICard
          title="Honoraires générés"
          value={stats.totalHonoraires.toLocaleString('fr-FR')}
          unit="€"
          icon={Euro}
          color="green"
          trend="up"
          trendValue="+12%"
        />
        <KPICard
          title="Provisions reçues"
          value={stats.provisionsRecues.toLocaleString('fr-FR')}
          unit="€"
          icon={CheckCircle}
          color="blue"
          detail={`${stats.provisionsEnAttente.toLocaleString('fr-FR')} € en attente`}
        />
        <KPICard
          title="Heures travaillées"
          value={stats.totalHeures}
          unit="h"
          icon={Clock}
          color="purple"
          trend="neutral"
          trendValue="="
        />
        <KPICard
          title="Taux de complétion"
          value={stats.tauxCompletion}
          unit="%"
          icon={Target}
          color={stats.tauxCompletion >= 70 ? 'green' : 'gold'}
          detail={`${stats.terminees} affaire(s) terminée(s)`}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-3 gap-6">
        {/* Évolution mensuelle */}
        <Card className="col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-[#1a1a1a]">Nouvelles affaires par mois</h3>
            <Badge variant="info">{stats.annee} cette année</Badge>
          </div>
          <SimpleBarChart
            data={stats.parMois}
            title=""
            maxValue={Math.max(...stats.parMois.map(m => m.value), 5)}
          />
        </Card>

        {/* Répartition par statut */}
        <Card className="p-6">
          <h3 className="font-medium text-[#1a1a1a] mb-6">Répartition par statut</h3>
          <SimpleDonut
            data={[
              { label: 'En cours', value: stats.parStatut['en-cours'] },
              { label: 'Pré-rapport', value: stats.parStatut['pre-rapport'] },
              { label: 'Terminées', value: stats.parStatut['rapport-depose'] },
              { label: 'Archives', value: stats.parStatut['archive'] }
            ]}
            title=""
            centerLabel="affaires"
          />
        </Card>
      </div>

      {/* Indicateurs secondaires */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-light text-[#1a1a1a]">{stats.totalReunions}</p>
              <p className="text-xs text-[#737373]">Réunions planifiées</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#e5e5e5]">
            <div className="flex justify-between text-xs">
              <span className="text-[#737373]">Terminées</span>
              <span className="font-medium text-green-600">{stats.reunionsTerminees}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-light text-[#1a1a1a]">{stats.diresEnAttente}</p>
              <p className="text-xs text-[#737373]">Dires en attente</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#e5e5e5]">
            <div className="flex justify-between text-xs">
              <span className="text-[#737373]">À traiter</span>
              <Badge variant={stats.diresEnAttente > 0 ? 'warning' : 'success'} className="text-xs">
                {stats.diresEnAttente > 0 ? 'Action requise' : 'À jour'}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-light text-[#1a1a1a]">{stats.delaiMoyen}</p>
              <p className="text-xs text-[#737373]">Délai moyen (jours)</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#e5e5e5]">
            <div className="flex justify-between text-xs">
              <span className="text-[#737373]">Objectif</span>
              <span className={`font-medium ${stats.delaiMoyen <= 180 ? 'text-green-600' : 'text-amber-600'}`}>
                180 jours
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-light text-[#1a1a1a]">{stats.urgentes}</p>
              <p className="text-xs text-[#737373]">Affaires urgentes</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#e5e5e5]">
            <div className="flex justify-between text-xs">
              <span className="text-[#737373]">Priorité haute</span>
              <Badge variant={stats.urgentes > 0 ? 'error' : 'success'} className="text-xs">
                {stats.urgentes > 0 ? `${stats.urgentes} à traiter` : 'RAS'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Tableaux et classements */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top tribunaux */}
        <Card className="p-6">
          <RankingTable
            title="Tribunaux les plus actifs"
            data={stats.topTribunaux}
            columns={[
              { key: 'tribunal', label: 'Tribunal' },
              {
                key: 'count',
                label: 'Affaires',
                render: (value) => <Badge variant="info">{value}</Badge>
              }
            ]}
          />
        </Card>

        {/* Performances */}
        <Card className="p-6">
          <h4 className="text-sm font-medium text-[#1a1a1a] mb-4">Performance globale</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#737373]">Affaires terminées / Total</span>
                <span className="font-medium">{stats.terminees} / {stats.total}</span>
              </div>
              <div className="h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${stats.tauxCompletion}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#737373]">Provisions encaissées</span>
                <span className="font-medium">
                  {Math.round(stats.provisionsRecues / (stats.provisionsRecues + stats.provisionsEnAttente || 1) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${stats.provisionsRecues / (stats.provisionsRecues + stats.provisionsEnAttente || 1) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#737373]">Réunions effectuées</span>
                <span className="font-medium">{stats.reunionsTerminees} / {stats.totalReunions}</span>
              </div>
              <div className="h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${stats.totalReunions > 0 ? (stats.reunionsTerminees / stats.totalReunions) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Conseil */}
          <div className="mt-6 p-3 bg-[#faf8f3] rounded-lg">
            <div className="flex items-start gap-2">
              <Award className="w-4 h-4 text-[#c9a227] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-[#1a1a1a]">Conseil performance</p>
                <p className="text-xs text-[#737373] mt-1">
                  {stats.diresEnAttente > 0
                    ? `Vous avez ${stats.diresEnAttente} dire(s) à traiter. Répondez-y pour maintenir un bon délai.`
                    : stats.urgentes > 0
                    ? `${stats.urgentes} affaire(s) urgente(s) nécessitent votre attention prioritaire.`
                    : 'Excellent travail ! Votre activité est bien gérée.'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Aide */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">À propos des statistiques</p>
            <p className="text-xs text-blue-600 mt-1">
              Ces statistiques sont calculées en temps réel à partir de vos affaires.
              Elles vous permettent de suivre votre activité, d'anticiper votre charge de travail
              et d'optimiser la gestion de vos dossiers.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PageStatistiques;
