import React, { useState, useMemo, useCallback } from 'react';
import {
  Calculator, Calendar, Clock, AlertTriangle, CheckCircle,
  XCircle, Info, ChevronDown, ChevronRight, Shield,
  Building, FileText, HelpCircle, Bell, Download,
  RefreshCw, Settings, Eye, Printer
} from 'lucide-react';
import { Card, Badge, Button, ModalBase, useToast } from '../ui';

// Types de garanties construction
const GARANTIES_CONSTRUCTION = [
  {
    id: 'parfait_achevement',
    nom: 'Garantie de parfait achèvement',
    duree: 1,
    unite: 'an',
    depart: 'reception',
    article: 'Article 1792-6 du Code civil',
    description: 'Couvre tous les désordres signalés lors de la réception ou apparus dans l\'année suivante, quelle que soit leur nature ou leur importance.',
    color: 'blue'
  },
  {
    id: 'biennale',
    nom: 'Garantie biennale (bon fonctionnement)',
    duree: 2,
    unite: 'ans',
    depart: 'reception',
    article: 'Article 1792-3 du Code civil',
    description: 'Couvre les éléments d\'équipement dissociables du bâtiment (volets, portes, radiateurs, robinetterie, etc.).',
    color: 'green'
  },
  {
    id: 'decennale',
    nom: 'Garantie décennale',
    duree: 10,
    unite: 'ans',
    depart: 'reception',
    article: 'Article 1792 du Code civil',
    description: 'Couvre les dommages qui compromettent la solidité de l\'ouvrage ou le rendent impropre à sa destination.',
    color: 'orange'
  },
  {
    id: 'dommages_ouvrage',
    nom: 'Assurance dommages-ouvrage',
    duree: 10,
    unite: 'ans',
    depart: 'reception',
    article: 'Article L.242-1 du Code des assurances',
    description: 'Préfinancement des réparations des dommages de nature décennale, sans attendre la décision de justice.',
    color: 'purple'
  },
  {
    id: 'responsabilite_contractuelle',
    nom: 'Responsabilité contractuelle',
    duree: 5,
    unite: 'ans',
    depart: 'connaissance_dommage',
    article: 'Article 2224 du Code civil',
    description: 'Action en responsabilité contre le constructeur pour manquement contractuel.',
    color: 'indigo'
  },
  {
    id: 'vices_caches',
    nom: 'Garantie des vices cachés',
    duree: 2,
    unite: 'ans',
    depart: 'decouverte',
    article: 'Article 1648 du Code civil',
    description: 'Action en garantie pour les vices cachés, à compter de la découverte du vice.',
    color: 'red'
  }
];

// Délais procéduraux
const DELAIS_PROCEDURAUX = [
  {
    id: 'depot_rapport',
    nom: 'Dépôt du rapport d\'expertise',
    description: 'Délai fixé par le juge pour le dépôt du rapport',
    configurable: true,
    defaut: 6,
    unite: 'mois'
  },
  {
    id: 'dire_recapitulatif',
    nom: 'Dire récapitulatif',
    description: 'Délai pour formuler les dires après réception du pré-rapport',
    configurable: true,
    defaut: 30,
    unite: 'jours'
  },
  {
    id: 'consignation',
    nom: 'Consignation des honoraires',
    description: 'Délai pour verser la provision à la Régie',
    configurable: true,
    defaut: 30,
    unite: 'jours'
  },
  {
    id: 'appel',
    nom: 'Délai d\'appel',
    description: 'Délai pour interjeter appel d\'une décision',
    configurable: false,
    defaut: 1,
    unite: 'mois'
  },
  {
    id: 'pourvoi',
    nom: 'Pourvoi en cassation',
    description: 'Délai pour former un pourvoi en cassation',
    configurable: false,
    defaut: 2,
    unite: 'mois'
  }
];

// Calcul de la date de fin de garantie
const calculerDateFin = (dateDepart, duree, unite) => {
  if (!dateDepart) return null;
  const date = new Date(dateDepart);

  switch (unite) {
    case 'an':
    case 'ans':
      date.setFullYear(date.getFullYear() + duree);
      break;
    case 'mois':
      date.setMonth(date.getMonth() + duree);
      break;
    case 'jours':
      date.setDate(date.getDate() + duree);
      break;
    default:
      break;
  }

  return date;
};

// Calcul du statut de la garantie
const getStatutGarantie = (dateFin) => {
  if (!dateFin) return { statut: 'inconnu', label: 'Date inconnue', color: 'gray' };

  const now = new Date();
  const diff = dateFin - now;
  const joursRestants = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (joursRestants < 0) {
    return {
      statut: 'expiree',
      label: 'Expirée',
      color: 'red',
      joursRestants: joursRestants
    };
  } else if (joursRestants <= 30) {
    return {
      statut: 'critique',
      label: `${joursRestants} jour(s)`,
      color: 'red',
      joursRestants
    };
  } else if (joursRestants <= 90) {
    return {
      statut: 'attention',
      label: `${joursRestants} jours`,
      color: 'orange',
      joursRestants
    };
  } else if (joursRestants <= 365) {
    return {
      statut: 'ok',
      label: `${Math.floor(joursRestants / 30)} mois`,
      color: 'green',
      joursRestants
    };
  } else {
    const annees = Math.floor(joursRestants / 365);
    const mois = Math.floor((joursRestants % 365) / 30);
    return {
      statut: 'ok',
      label: `${annees} an(s) ${mois > 0 ? `${mois} mois` : ''}`,
      color: 'green',
      joursRestants
    };
  }
};

// Composant carte de garantie
const GarantieCard = ({ garantie, dateDepart, dateDecouverteVice, expanded, onToggle }) => {
  const dateReelle = garantie.depart === 'decouverte' ? dateDecouverteVice : dateDepart;
  const dateFin = calculerDateFin(dateReelle, garantie.duree, garantie.unite);
  const statut = getStatutGarantie(dateFin);

  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' }
  };

  const colors = colorClasses[garantie.color] || colorClasses.blue;

  const statutColorClasses = {
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
    gray: 'bg-gray-100 text-gray-500'
  };

  return (
    <div className={`rounded-xl border-2 overflow-hidden transition-all ${
      statut.statut === 'expiree' ? 'border-red-300 bg-red-50/30' :
      statut.statut === 'critique' ? 'border-orange-300 bg-orange-50/30' :
      `${colors.border} ${colors.bg}`
    }`}>
      <div
        className="p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${colors.bg}`}>
              <Shield className={`w-5 h-5 ${colors.icon}`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{garantie.nom}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{garantie.article}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statutColorClasses[statut.color]}`}>
              {statut.statut === 'expiree' ? (
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Expirée
                </span>
              ) : statut.statut === 'critique' ? (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {statut.label}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {statut.label}
                </span>
              )}
            </span>
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Barre de progression */}
        {dateReelle && dateFin && statut.statut !== 'expiree' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Réception: {new Date(dateReelle).toLocaleDateString('fr-FR')}</span>
              <span>Fin: {dateFin.toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              {(() => {
                const total = dateFin - new Date(dateReelle);
                const elapsed = new Date() - new Date(dateReelle);
                const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
                return (
                  <div
                    className={`h-full rounded-full transition-all ${
                      progress > 90 ? 'bg-red-500' :
                      progress > 75 ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Détails expandés */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-200 bg-white/50">
          <div className="pt-3 space-y-3">
            <p className="text-sm text-gray-600">{garantie.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Durée :</span>
                <span className="ml-2 font-medium">{garantie.duree} {garantie.unite}</span>
              </div>
              <div>
                <span className="text-gray-500">Point de départ :</span>
                <span className="ml-2 font-medium">
                  {garantie.depart === 'reception' ? 'Réception des travaux' :
                   garantie.depart === 'decouverte' ? 'Découverte du vice' :
                   garantie.depart === 'connaissance_dommage' ? 'Connaissance du dommage' :
                   garantie.depart}
                </span>
              </div>
            </div>

            {dateFin && (
              <div className={`p-3 rounded-lg ${
                statut.statut === 'expiree' ? 'bg-red-100' :
                statut.statut === 'critique' ? 'bg-orange-100' :
                'bg-green-100'
              }`}>
                <p className={`text-sm font-medium ${
                  statut.statut === 'expiree' ? 'text-red-700' :
                  statut.statut === 'critique' ? 'text-orange-700' :
                  'text-green-700'
                }`}>
                  {statut.statut === 'expiree'
                    ? `⚠️ Garantie expirée depuis ${Math.abs(statut.joursRestants)} jours`
                    : `✓ Date d'expiration : ${dateFin.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant délai procédural
const DelaiProceduralCard = ({ delai, dateDepart, onChangeDuree }) => {
  const dateFin = calculerDateFin(dateDepart, delai.defaut, delai.unite);
  const statut = getStatutGarantie(dateFin);

  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-gray-100">
            <Clock className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{delai.nom}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{delai.description}</p>
          </div>
        </div>

        <div className="text-right">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            statut.color === 'red' ? 'bg-red-100 text-red-700' :
            statut.color === 'orange' ? 'bg-orange-100 text-orange-700' :
            'bg-green-100 text-green-700'
          }`}>
            {statut.label}
          </span>
          {dateFin && (
            <p className="text-xs text-gray-400 mt-1">
              {dateFin.toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      </div>

      {delai.configurable && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            defaultValue={delai.defaut}
            min={1}
            className="w-20 px-2 py-1 border rounded text-sm"
            onChange={(e) => onChangeDuree && onChangeDuree(delai.id, parseInt(e.target.value))}
          />
          <span className="text-sm text-gray-500">{delai.unite}</span>
        </div>
      )}
    </div>
  );
};

// Résumé des alertes
const ResumeAlertes = ({ garanties, dateReception }) => {
  const alertes = useMemo(() => {
    const result = [];

    garanties.forEach(g => {
      const dateFin = calculerDateFin(dateReception, g.duree, g.unite);
      const statut = getStatutGarantie(dateFin);

      if (statut.statut === 'critique' || statut.statut === 'expiree') {
        result.push({
          garantie: g,
          statut,
          dateFin
        });
      }
    });

    return result.sort((a, b) => (a.statut.joursRestants || 0) - (b.statut.joursRestants || 0));
  }, [garanties, dateReception]);

  if (alertes.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <h3 className="font-semibold text-red-900">Alertes délais</h3>
        <Badge variant="error">{alertes.length}</Badge>
      </div>
      <div className="space-y-2">
        {alertes.map(alerte => (
          <div
            key={alerte.garantie.id}
            className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100"
          >
            <div className="flex items-center gap-2">
              {alerte.statut.statut === 'expiree' ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              )}
              <span className="text-sm font-medium text-gray-900">{alerte.garantie.nom}</span>
            </div>
            <span className={`text-sm font-medium ${
              alerte.statut.statut === 'expiree' ? 'text-red-600' : 'text-orange-600'
            }`}>
              {alerte.statut.statut === 'expiree'
                ? `Expirée depuis ${Math.abs(alerte.statut.joursRestants)}j`
                : `${alerte.statut.joursRestants}j restants`
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Composant principal
export const CalculateurDelais = ({ affaire, onUpdate }) => {
  const { toast } = useToast();
  const [expandedGarantie, setExpandedGarantie] = useState(null);
  const [dateReception, setDateReception] = useState(affaire?.date_reception || '');
  const [dateDecouverteVice, setDateDecouverteVice] = useState(affaire?.date_decouverte_vice || '');
  const [activeTab, setActiveTab] = useState('garanties'); // 'garanties' | 'proceduraux'

  const handleSaveDates = useCallback(() => {
    if (onUpdate) {
      onUpdate({
        date_reception: dateReception,
        date_decouverte_vice: dateDecouverteVice
      });
    }
    toast({
      title: "Dates enregistrées",
      description: "Les dates ont été mises à jour."
    });
  }, [dateReception, dateDecouverteVice, onUpdate, toast]);

  const handleExport = () => {
    const data = GARANTIES_CONSTRUCTION.map(g => {
      const dateFin = calculerDateFin(
        g.depart === 'decouverte' ? dateDecouverteVice : dateReception,
        g.duree,
        g.unite
      );
      const statut = getStatutGarantie(dateFin);

      return {
        garantie: g.nom,
        article: g.article,
        duree: `${g.duree} ${g.unite}`,
        dateFin: dateFin?.toLocaleDateString('fr-FR') || 'N/A',
        statut: statut.label
      };
    });

    const csv = [
      ['Garantie', 'Article', 'Durée', 'Date fin', 'Statut'].join(';'),
      ...data.map(d => [d.garantie, d.article, d.duree, d.dateFin, d.statut].join(';'))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `delais_garanties_${affaire?.reference || 'affaire'}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: "Le tableau des délais a été exporté."
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            Calculateur de délais
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Garanties construction et délais procéduraux
          </p>
        </div>
        <Button variant="secondary" icon={Download} onClick={handleExport}>
          Exporter
        </Button>
      </div>

      {/* Dates de référence */}
      <Card className="p-4">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          Dates de référence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de réception des travaux
            </label>
            <input
              type="date"
              value={dateReception}
              onChange={(e) => setDateReception(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Point de départ des garanties de parfait achèvement, biennale et décennale
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de découverte du vice (optionnel)
            </label>
            <input
              type="date"
              value={dateDecouverteVice}
              onChange={(e) => setDateDecouverteVice(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Point de départ pour la garantie des vices cachés
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="primary" icon={CheckCircle} onClick={handleSaveDates}>
            Enregistrer les dates
          </Button>
        </div>
      </Card>

      {/* Alertes */}
      {dateReception && (
        <ResumeAlertes
          garanties={GARANTIES_CONSTRUCTION}
          dateReception={dateReception}
        />
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab('garanties')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'garanties'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Garanties construction
          </div>
        </button>
        <button
          onClick={() => setActiveTab('proceduraux')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'proceduraux'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Délais procéduraux
          </div>
        </button>
      </div>

      {/* Contenu tabs */}
      {activeTab === 'garanties' ? (
        <div className="space-y-4">
          {!dateReception && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Date de réception requise</p>
                <p className="text-sm text-amber-700 mt-1">
                  Veuillez renseigner la date de réception des travaux pour calculer les délais de garantie.
                </p>
              </div>
            </div>
          )}

          {GARANTIES_CONSTRUCTION.map(garantie => (
            <GarantieCard
              key={garantie.id}
              garantie={garantie}
              dateDepart={dateReception}
              dateDecouverteVice={dateDecouverteVice}
              expanded={expandedGarantie === garantie.id}
              onToggle={() => setExpandedGarantie(
                expandedGarantie === garantie.id ? null : garantie.id
              )}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Délais indicatifs</p>
              <p className="text-sm text-blue-700 mt-1">
                Ces délais sont fournis à titre indicatif. Vérifiez toujours les délais spécifiques
                fixés par le juge ou prévus par les textes applicables.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DELAIS_PROCEDURAUX.map(delai => (
              <DelaiProceduralCard
                key={delai.id}
                delai={delai}
                dateDepart={affaire?.date_ordonnance || new Date().toISOString()}
              />
            ))}
          </div>
        </div>
      )}

      {/* Info légale */}
      <div className="bg-gray-50 border rounded-lg p-4 text-xs text-gray-500">
        <p className="font-medium text-gray-700 mb-2">⚖️ Avertissement juridique</p>
        <p>
          Ce calculateur est fourni à titre informatif uniquement. Les délais peuvent varier
          selon les circonstances de l'espèce et la jurisprudence applicable. En cas de doute,
          consultez les textes en vigueur ou un conseil juridique.
        </p>
      </div>
    </div>
  );
};

export default CalculateurDelais;
