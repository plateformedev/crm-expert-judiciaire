// ============================================================================
// CRM EXPERT JUDICIAIRE - SUIVI LA POSTE
// Suivi des envois postaux (courriers recommandés, colis)
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Package, Truck, MapPin, Clock, CheckCircle, XCircle,
  AlertTriangle, RefreshCw, Loader2, ExternalLink, Search,
  Plus, Trash2, Copy, History, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase, EmptyState } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// CONFIGURATION LA POSTE
// ============================================================================

const LAPOSTE_CONFIG = {
  apiUrl: 'https://api.laposte.fr/suivi/v2',
  trackingUrl: 'https://www.laposte.fr/outils/suivre-vos-envois',
  isConfigured: () => !!import.meta.env.VITE_LAPOSTE_API_KEY
};

// Statuts d'envoi
const STATUTS_ENVOI = {
  'PRIS_EN_CHARGE': { label: 'Pris en charge', color: 'blue', icon: Package },
  'EN_COURS_ACHEMINEMENT': { label: 'En cours d\'acheminement', color: 'blue', icon: Truck },
  'ARRIVE_SITE_DISTRIBUTION': { label: 'Arrivé sur site', color: 'amber', icon: MapPin },
  'EN_COURS_DISTRIBUTION': { label: 'En cours de distribution', color: 'amber', icon: Truck },
  'DISTRIBUE': { label: 'Distribué', color: 'green', icon: CheckCircle },
  'AVIS_PASSAGE': { label: 'Avis de passage', color: 'amber', icon: AlertTriangle },
  'INSTANCE': { label: 'En instance', color: 'amber', icon: Clock },
  'RETOUR_ENVOYEUR': { label: 'Retourné à l\'expéditeur', color: 'red', icon: XCircle },
  'PRET_RETRAIT': { label: 'Prêt à être retiré', color: 'green', icon: Package },
  'INCONNU': { label: 'Statut inconnu', color: 'gray', icon: AlertTriangle }
};

// ============================================================================
// SERVICE LA POSTE
// ============================================================================

class LaPosteService {
  constructor() {
    this.apiKey = import.meta.env.VITE_LAPOSTE_API_KEY;
    this.envoisSuivis = this.loadEnvoisSuivis();
  }

  isConfigured() {
    return LAPOSTE_CONFIG.isConfigured();
  }

  loadEnvoisSuivis() {
    try {
      const saved = localStorage.getItem('laposte_suivis');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveEnvoisSuivis() {
    try {
      localStorage.setItem('laposte_suivis', JSON.stringify(this.envoisSuivis));
    } catch (e) {
      console.error('Erreur sauvegarde suivis:', e);
    }
  }

  addEnvoiSuivi(numeroSuivi, metadata = {}) {
    const exists = this.envoisSuivis.find(e => e.numero === numeroSuivi);
    if (exists) return exists;

    const envoi = {
      id: `lp-${Date.now()}`,
      numero: numeroSuivi,
      dateAjout: new Date().toISOString(),
      ...metadata
    };

    this.envoisSuivis.unshift(envoi);
    this.saveEnvoisSuivis();
    return envoi;
  }

  removeEnvoiSuivi(id) {
    this.envoisSuivis = this.envoisSuivis.filter(e => e.id !== id);
    this.saveEnvoisSuivis();
  }

  getEnvoisSuivis() {
    return this.envoisSuivis;
  }

  async getTracking(numeroSuivi) {
    if (!this.isConfigured()) {
      return this.simulateTracking(numeroSuivi);
    }

    try {
      const response = await fetch(`${LAPOSTE_CONFIG.apiUrl}/idships/${numeroSuivi}`, {
        headers: {
          'Accept': 'application/json',
          'X-Okapi-Key': this.apiKey
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { error: 'Numéro de suivi non trouvé', status: 404 };
        }
        throw new Error('Erreur API La Poste');
      }

      const data = await response.json();
      return this.parseTrackingData(data);
    } catch (error) {
      console.error('Erreur suivi La Poste:', error);
      throw error;
    }
  }

  parseTrackingData(data) {
    const shipment = data.shipment || {};
    const events = (shipment.event || []).map(evt => ({
      date: evt.date,
      label: evt.label,
      code: evt.code,
      location: evt.location || null
    }));

    const latestEvent = events[0] || {};
    const statusCode = this.mapStatusCode(latestEvent.code);

    return {
      numero: shipment.idShip,
      type: shipment.product || 'Courrier',
      statut: statusCode,
      statutLabel: STATUTS_ENVOI[statusCode]?.label || latestEvent.label,
      statutColor: STATUTS_ENVOI[statusCode]?.color || 'gray',
      dateDerniereMAJ: latestEvent.date,
      isFinal: ['DISTRIBUE', 'RETOUR_ENVOYEUR'].includes(statusCode),
      events,
      holder: shipment.holder || null
    };
  }

  mapStatusCode(eventCode) {
    const mapping = {
      'DR1': 'DISTRIBUE',
      'PC1': 'PRIS_EN_CHARGE',
      'PC2': 'PRIS_EN_CHARGE',
      'ET1': 'EN_COURS_ACHEMINEMENT',
      'ET2': 'EN_COURS_ACHEMINEMENT',
      'ET3': 'EN_COURS_ACHEMINEMENT',
      'ET4': 'EN_COURS_ACHEMINEMENT',
      'EP1': 'EN_COURS_DISTRIBUTION',
      'DO1': 'AVIS_PASSAGE',
      'DO2': 'AVIS_PASSAGE',
      'AG1': 'PRET_RETRAIT',
      'RE1': 'RETOUR_ENVOYEUR'
    };
    return mapping[eventCode] || 'INCONNU';
  }

  simulateTracking(numeroSuivi) {
    // Simulation basée sur le numéro
    const hash = numeroSuivi.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const statuts = Object.keys(STATUTS_ENVOI);
    const randomStatut = statuts[hash % statuts.length];

    const now = new Date();
    const events = [
      {
        date: now.toISOString(),
        label: STATUTS_ENVOI[randomStatut]?.label || 'Événement',
        code: randomStatut,
        location: 'Paris (75)'
      },
      {
        date: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
        label: 'En cours d\'acheminement',
        code: 'EN_COURS_ACHEMINEMENT',
        location: 'Centre de tri Île-de-France'
      },
      {
        date: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
        label: 'Pris en charge',
        code: 'PRIS_EN_CHARGE',
        location: 'Bureau de poste Paris 15'
      }
    ];

    return {
      numero: numeroSuivi,
      type: 'Lettre recommandée',
      statut: randomStatut,
      statutLabel: STATUTS_ENVOI[randomStatut]?.label,
      statutColor: STATUTS_ENVOI[randomStatut]?.color,
      dateDerniereMAJ: now.toISOString(),
      isFinal: ['DISTRIBUE', 'RETOUR_ENVOYEUR'].includes(randomStatut),
      events,
      simulated: true
    };
  }

  async checkAllEnvois() {
    const results = [];
    for (const envoi of this.envoisSuivis) {
      try {
        const tracking = await this.getTracking(envoi.numero);
        results.push({ ...envoi, ...tracking });
      } catch (error) {
        results.push({ ...envoi, error: error.message });
      }
    }
    return results;
  }
}

export const laPosteService = new LaPosteService();

// ============================================================================
// COMPOSANT PRINCIPAL - SUIVI LA POSTE
// ============================================================================

export const SuiviLaPoste = ({ affaire }) => {
  const [envois, setEnvois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchNumero, setSearchNumero] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadEnvois();
  }, []);

  const loadEnvois = async () => {
    setLoading(true);
    try {
      const results = await laPosteService.checkAllEnvois();
      setEnvois(results);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchNumero.trim()) return;

    setSearching(true);
    setSearchResult(null);
    try {
      const result = await laPosteService.getTracking(searchNumero.trim());
      setSearchResult(result);
    } catch (error) {
      setSearchResult({ error: error.message });
    } finally {
      setSearching(false);
    }
  };

  const handleAddSuivi = () => {
    if (!searchNumero.trim() || !searchResult || searchResult.error) return;

    laPosteService.addEnvoiSuivi(searchNumero.trim(), {
      affaireId: affaire?.id,
      affaireRef: affaire?.reference
    });
    setSearchNumero('');
    setSearchResult(null);
    loadEnvois();
  };

  const handleRemoveSuivi = (id) => {
    laPosteService.removeEnvoiSuivi(id);
    setEnvois(prev => prev.filter(e => e.id !== id));
  };

  const isConfigured = laPosteService.isConfigured();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                          ${isConfigured ? 'bg-yellow-100' : 'bg-amber-100'}`}>
            <Package className={`w-6 h-6 ${isConfigured ? 'text-yellow-600' : 'text-amber-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-[#1a1a1a]">Suivi La Poste</h3>
            <p className="text-sm text-[#737373]">
              {isConfigured ? 'API connectée' : 'Mode simulation'}
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          icon={ExternalLink}
          onClick={() => window.open(LAPOSTE_CONFIG.trackingUrl, '_blank')}
        >
          Site La Poste
        </Button>
      </div>

      {/* Alerte mode simulation */}
      {!isConfigured && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800">Mode simulation</h4>
              <p className="text-sm text-amber-700 mt-1">
                L'API La Poste n'est pas configurée. Les statuts sont simulés.
                Configurez VITE_LAPOSTE_API_KEY pour activer le suivi réel.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Recherche de suivi */}
      <Card className="p-4">
        <h4 className="font-medium text-[#1a1a1a] mb-3">Rechercher un envoi</h4>
        <div className="flex gap-3">
          <Input
            icon={Search}
            placeholder="Numéro de suivi (ex: 1A12345678901)"
            value={searchNumero}
            onChange={(e) => setSearchNumero(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button
            variant="primary"
            icon={searching ? Loader2 : Search}
            onClick={handleSearch}
            disabled={!searchNumero.trim() || searching}
            className={searching ? 'animate-pulse' : ''}
          >
            Rechercher
          </Button>
        </div>

        {/* Résultat recherche */}
        {searchResult && (
          <div className="mt-4">
            {searchResult.error ? (
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  <span>{searchResult.error}</span>
                </div>
              </Card>
            ) : (
              <Card className="p-4 bg-[#fafafa]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <StatusIcon statut={searchResult.statut} />
                    <div>
                      <div className="font-mono font-medium">{searchResult.numero}</div>
                      <div className="text-sm text-[#737373]">{searchResult.type}</div>
                    </div>
                  </div>
                  <Badge className={getColorClass(searchResult.statutColor)}>
                    {searchResult.statutLabel}
                  </Badge>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={handleAddSuivi}
                >
                  Ajouter au suivi
                </Button>

                {searchResult.simulated && (
                  <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Données simulées
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </Card>

      {/* Liste des envois suivis */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-[#1a1a1a]">Mes envois suivis</h4>
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={loadEnvois}
            loading={loading}
          >
            Actualiser
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
          </div>
        ) : envois.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucun envoi suivi"
            description="Ajoutez des numéros de suivi pour suivre vos envois"
          />
        ) : (
          <div className="space-y-3">
            {envois.map(envoi => (
              <EnvoiCard
                key={envoi.id}
                envoi={envoi}
                onRemove={() => handleRemoveSuivi(envoi.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// CARTE ENVOI
// ============================================================================

const EnvoiCard = ({ envoi, onRemove }) => {
  const [expanded, setExpanded] = useState(false);
  const statutInfo = STATUTS_ENVOI[envoi.statut] || STATUTS_ENVOI.INCONNU;

  const copyNumero = () => {
    navigator.clipboard.writeText(envoi.numero);
  };

  return (
    <Card className={`p-4 ${envoi.isFinal ? 'opacity-75' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <StatusIcon statut={envoi.statut} />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium">{envoi.numero}</span>
              <button
                onClick={copyNumero}
                className="p-1 hover:bg-[#f5f5f5] rounded"
                title="Copier"
              >
                <Copy className="w-3 h-3 text-[#a3a3a3]" />
              </button>
            </div>
            <div className="text-sm text-[#737373]">
              {envoi.type}
              {envoi.affaireRef && (
                <span className="ml-2 text-[#2563EB]">• {envoi.affaireRef}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={getColorClass(envoi.statutColor)}>
            {envoi.statutLabel}
          </Badge>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-[#f5f5f5] rounded-lg"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-[#737373]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#737373]" />
            )}
          </button>
          <button
            onClick={onRemove}
            className="p-2 hover:bg-red-50 rounded-lg text-[#a3a3a3] hover:text-red-500"
            title="Retirer du suivi"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Historique événements */}
      {expanded && envoi.events && (
        <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
          <h5 className="text-sm font-medium text-[#737373] mb-3 flex items-center gap-2">
            <History className="w-4 h-4" />
            Historique
          </h5>
          <div className="space-y-3">
            {envoi.events.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  idx === 0 ? 'bg-[#2563EB]' : 'bg-[#e5e5e5]'
                }`} />
                <div className="flex-1">
                  <div className="text-sm text-[#1a1a1a]">{event.label}</div>
                  <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
                    <span>{formatDateFr(event.date, true)}</span>
                    {event.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {envoi.simulated && (
        <div className="mt-3 text-xs text-amber-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Données simulées
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// HELPERS
// ============================================================================

const StatusIcon = ({ statut }) => {
  const statutInfo = STATUTS_ENVOI[statut] || STATUTS_ENVOI.INCONNU;
  const Icon = statutInfo.icon;

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${colorClasses[statutInfo.color]}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
};

const getColorClass = (color) => {
  const classes = {
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700'
  };
  return classes[color] || classes.gray;
};

// ============================================================================
// WIDGET COMPACT
// ============================================================================

export const SuiviLaPosteWidget = ({ affaire }) => {
  const [showPanel, setShowPanel] = useState(false);
  const suivis = laPosteService.getEnvoisSuivis();

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        icon={Package}
        onClick={() => setShowPanel(true)}
      >
        La Poste
        {suivis.length > 0 && (
          <Badge className="ml-2 bg-[#2563EB] text-white">
            {suivis.length}
          </Badge>
        )}
      </Button>

      <ModalBase
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
        title="Suivi La Poste"
        size="lg"
      >
        <SuiviLaPoste affaire={affaire} />
      </ModalBase>
    </>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default SuiviLaPoste;
