// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE CHIFFRAGE PROFESSIONNEL
// Base de prix, indices BT INSEE, multi-scénarios, ventilation
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  Euro, Plus, Calculator, TrendingUp, Trash2, Edit, Copy,
  Download, Save, Check, AlertCircle, RefreshCw, ChevronDown,
  ChevronRight, Building, Hammer, Wrench, PaintBucket, Zap,
  Droplet, Wind, Shield, FileText, BarChart3
} from 'lucide-react';
import { Card, Badge, Button, Input, Select, ModalBase, EmptyState } from '../ui';
import { formatMontant, formatDateFr } from '../../utils/helpers';

// ============================================================================
// BASE DE PRIX UNITAIRES (IDF 2024)
// ============================================================================

export const BASE_PRIX_UNITAIRES = {
  // GROS ŒUVRE
  demolition: {
    categorie: 'Gros œuvre',
    icon: Hammer,
    postes: [
      { code: 'DEM001', designation: 'Démolition maçonnerie', unite: 'm³', prixMin: 80, prixMax: 150, prixMoyen: 115 },
      { code: 'DEM002', designation: 'Démolition cloison légère', unite: 'm²', prixMin: 15, prixMax: 35, prixMoyen: 25 },
      { code: 'DEM003', designation: 'Démolition carrelage', unite: 'm²', prixMin: 20, prixMax: 40, prixMoyen: 30 },
      { code: 'DEM004', designation: 'Évacuation gravats', unite: 'm³', prixMin: 45, prixMax: 80, prixMoyen: 62 }
    ]
  },
  maconnerie: {
    categorie: 'Gros œuvre',
    icon: Building,
    postes: [
      { code: 'MAC001', designation: 'Reprise en sous-œuvre', unite: 'ml', prixMin: 800, prixMax: 1500, prixMoyen: 1150 },
      { code: 'MAC002', designation: 'Reprise fissure structurelle (agrafage)', unite: 'ml', prixMin: 150, prixMax: 300, prixMoyen: 225 },
      { code: 'MAC003', designation: 'Rejointoiement pierre', unite: 'm²', prixMin: 60, prixMax: 120, prixMoyen: 90 },
      { code: 'MAC004', designation: 'Réfection enduit façade (chaux)', unite: 'm²', prixMin: 80, prixMax: 140, prixMoyen: 110 },
      { code: 'MAC005', designation: 'Création ouverture (linteau compris)', unite: 'u', prixMin: 1500, prixMax: 3500, prixMoyen: 2500 },
      { code: 'MAC006', designation: 'Injection résine fondations', unite: 'ml', prixMin: 200, prixMax: 400, prixMoyen: 300 }
    ]
  },
  
  // ÉTANCHÉITÉ
  etancheite: {
    categorie: 'Étanchéité',
    icon: Droplet,
    postes: [
      { code: 'ETA001', designation: 'Étanchéité terrasse (multicouche)', unite: 'm²', prixMin: 80, prixMax: 150, prixMoyen: 115 },
      { code: 'ETA002', designation: 'Étanchéité toiture végétalisée', unite: 'm²', prixMin: 120, prixMax: 200, prixMoyen: 160 },
      { code: 'ETA003', designation: 'Traitement remontées capillaires', unite: 'ml', prixMin: 150, prixMax: 300, prixMoyen: 225 },
      { code: 'ETA004', designation: 'Réfection joint de dilatation', unite: 'ml', prixMin: 40, prixMax: 80, prixMoyen: 60 },
      { code: 'ETA005', designation: 'Cuvelage cave', unite: 'm²', prixMin: 200, prixMax: 400, prixMoyen: 300 }
    ]
  },

  // COUVERTURE
  couverture: {
    categorie: 'Couverture',
    icon: Shield,
    postes: [
      { code: 'COU001', designation: 'Réfection couverture tuiles', unite: 'm²', prixMin: 80, prixMax: 150, prixMoyen: 115 },
      { code: 'COU002', designation: 'Réfection couverture zinc', unite: 'm²', prixMin: 120, prixMax: 200, prixMoyen: 160 },
      { code: 'COU003', designation: 'Réfection couverture ardoise', unite: 'm²', prixMin: 150, prixMax: 280, prixMoyen: 215 },
      { code: 'COU004', designation: 'Reprise faîtage', unite: 'ml', prixMin: 60, prixMax: 120, prixMoyen: 90 },
      { code: 'COU005', designation: 'Remplacement gouttière zinc', unite: 'ml', prixMin: 80, prixMax: 150, prixMoyen: 115 }
    ]
  },

  // MENUISERIES
  menuiseries: {
    categorie: 'Menuiseries',
    icon: Building,
    postes: [
      { code: 'MEN001', designation: 'Remplacement fenêtre PVC (fourni posé)', unite: 'u', prixMin: 400, prixMax: 800, prixMoyen: 600 },
      { code: 'MEN002', designation: 'Remplacement fenêtre bois', unite: 'u', prixMin: 600, prixMax: 1200, prixMoyen: 900 },
      { code: 'MEN003', designation: 'Remplacement porte-fenêtre', unite: 'u', prixMin: 800, prixMax: 1500, prixMoyen: 1150 },
      { code: 'MEN004', designation: 'Réparation menuiserie bois', unite: 'h', prixMin: 45, prixMax: 65, prixMoyen: 55 },
      { code: 'MEN005', designation: 'Remplacement porte intérieure', unite: 'u', prixMin: 300, prixMax: 600, prixMoyen: 450 }
    ]
  },

  // PLOMBERIE
  plomberie: {
    categorie: 'Plomberie',
    icon: Droplet,
    postes: [
      { code: 'PLO001', designation: 'Recherche de fuite', unite: 'u', prixMin: 150, prixMax: 400, prixMoyen: 275 },
      { code: 'PLO002', designation: 'Remplacement canalisation cuivre', unite: 'ml', prixMin: 80, prixMax: 150, prixMoyen: 115 },
      { code: 'PLO003', designation: 'Remplacement canalisation PER', unite: 'ml', prixMin: 40, prixMax: 80, prixMoyen: 60 },
      { code: 'PLO004', designation: 'Débouchage canalisation', unite: 'u', prixMin: 100, prixMax: 300, prixMoyen: 200 },
      { code: 'PLO005', designation: 'Remplacement chauffe-eau', unite: 'u', prixMin: 800, prixMax: 1500, prixMoyen: 1150 }
    ]
  },

  // ÉLECTRICITÉ
  electricite: {
    categorie: 'Électricité',
    icon: Zap,
    postes: [
      { code: 'ELE001', designation: 'Mise aux normes tableau électrique', unite: 'u', prixMin: 800, prixMax: 2000, prixMoyen: 1400 },
      { code: 'ELE002', designation: 'Création point lumineux', unite: 'u', prixMin: 80, prixMax: 150, prixMoyen: 115 },
      { code: 'ELE003', designation: 'Création prise électrique', unite: 'u', prixMin: 60, prixMax: 120, prixMoyen: 90 },
      { code: 'ELE004', designation: 'Rénovation installation complète', unite: 'm²', prixMin: 80, prixMax: 150, prixMoyen: 115 }
    ]
  },

  // PEINTURE / FINITIONS
  peinture: {
    categorie: 'Peinture / Finitions',
    icon: PaintBucket,
    postes: [
      { code: 'PEI001', designation: 'Peinture murs (2 couches)', unite: 'm²', prixMin: 20, prixMax: 40, prixMoyen: 30 },
      { code: 'PEI002', designation: 'Peinture plafond', unite: 'm²', prixMin: 25, prixMax: 45, prixMoyen: 35 },
      { code: 'PEI003', designation: 'Réfection papier peint', unite: 'm²', prixMin: 25, prixMax: 50, prixMoyen: 37 },
      { code: 'PEI004', designation: 'Enduit de rebouchage', unite: 'm²', prixMin: 15, prixMax: 30, prixMoyen: 22 },
      { code: 'PEI005', designation: 'Peinture boiseries', unite: 'ml', prixMin: 15, prixMax: 30, prixMoyen: 22 }
    ]
  },

  // REVÊTEMENTS DE SOL
  sols: {
    categorie: 'Revêtements de sol',
    icon: Building,
    postes: [
      { code: 'SOL001', designation: 'Pose carrelage (fourni posé)', unite: 'm²', prixMin: 60, prixMax: 120, prixMoyen: 90 },
      { code: 'SOL002', designation: 'Pose parquet flottant', unite: 'm²', prixMin: 40, prixMax: 80, prixMoyen: 60 },
      { code: 'SOL003', designation: 'Pose parquet massif', unite: 'm²', prixMin: 80, prixMax: 150, prixMoyen: 115 },
      { code: 'SOL004', designation: 'Ragréage sol', unite: 'm²', prixMin: 20, prixMax: 40, prixMoyen: 30 },
      { code: 'SOL005', designation: 'Chape liquide', unite: 'm²', prixMin: 25, prixMax: 45, prixMoyen: 35 }
    ]
  }
};

// ============================================================================
// INDICES BT INSEE
// ============================================================================

export const INDICES_BT = {
  BT01: { nom: 'Tous corps d\'état', description: 'Indice général BTP' },
  BT02: { nom: 'Terrassements', description: 'Travaux de terrassement' },
  BT03: { nom: 'Maçonnerie béton armé', description: 'Structure béton' },
  BT06: { nom: 'Ossature métallique', description: 'Charpente métallique' },
  BT07: { nom: 'Charpente bois', description: 'Charpente traditionnelle' },
  BT08: { nom: 'Couverture zinc', description: 'Couverture zinc et cuivre' },
  BT09: { nom: 'Couverture tuiles/ardoises', description: 'Couverture traditionnelle' },
  BT26: { nom: 'Plâtrerie', description: 'Cloisons et plafonds' },
  BT30: { nom: 'Carrelage', description: 'Revêtements céramiques' },
  BT38: { nom: 'Menuiseries bois', description: 'Portes et fenêtres bois' },
  BT40: { nom: 'Menuiseries PVC/Alu', description: 'Menuiseries industrielles' },
  BT41: { nom: 'Vitrerie', description: 'Vitrages' },
  BT42: { nom: 'Peinture', description: 'Peinture et revêtements' },
  BT45: { nom: 'Électricité', description: 'Installations électriques' },
  BT46: { nom: 'Chauffage', description: 'Chauffage et climatisation' },
  BT47: { nom: 'Plomberie sanitaire', description: 'Plomberie' },
  BT49: { nom: 'Ascenseurs', description: 'Équipements élévateurs' }
};

// Service récupération indices INSEE
class IndicesBTService {
  constructor() {
    this.apiKey = import.meta.env.VITE_INSEE_API_KEY;
    this.baseUrl = 'https://api.insee.fr/series/BDM/V1/data';
    this.cache = {};
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async getIndice(codeIndice, periode = null) {
    const cacheKey = `${codeIndice}-${periode || 'latest'}`;
    
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    if (!this.isConfigured()) {
      // Valeurs simulées basées sur BT01 janvier 2024
      return this.getIndiceSimule(codeIndice);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/SERIES_BDM/${codeIndice}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Erreur API INSEE');

      const data = await response.json();
      const result = this.parseIndiceResponse(data);
      this.cache[cacheKey] = result;
      return result;
    } catch (error) {
      console.error('Erreur récupération indice:', error);
      return this.getIndiceSimule(codeIndice);
    }
  }

  getIndiceSimule(codeIndice) {
    // Valeurs approximatives janvier 2024 (base 100 en 2010)
    const valeurs = {
      BT01: 127.8,
      BT03: 125.4,
      BT07: 132.1,
      BT08: 128.5,
      BT09: 126.3,
      BT26: 124.8,
      BT30: 123.5,
      BT38: 129.7,
      BT40: 121.2,
      BT42: 125.1,
      BT45: 118.9,
      BT46: 122.4,
      BT47: 124.6
    };

    return {
      code: codeIndice,
      valeur: valeurs[codeIndice] || 125.0,
      periode: '2024-01',
      base: '100 en 2010',
      simule: true
    };
  }

  parseIndiceResponse(data) {
    // Parser la réponse INSEE
    const observations = data?.observations || [];
    const derniere = observations[observations.length - 1];
    
    return {
      code: data.idBank,
      valeur: parseFloat(derniere?.OBS_VALUE || 100),
      periode: derniere?.TIME_PERIOD,
      base: '100 en 2010',
      simule: false
    };
  }

  // Calculer l'actualisation
  calculerActualisation(montantInitial, indiceInitial, indiceFinal) {
    if (!indiceInitial || !indiceFinal) return montantInitial;
    return montantInitial * (indiceFinal / indiceInitial);
  }
}

export const indicesBTService = new IndicesBTService();

// ============================================================================
// COMPOSANT PRINCIPAL - MODULE CHIFFRAGE
// ============================================================================

export const ModuleChiffrage = ({ 
  affaireId,
  pathologies = [],
  onSave 
}) => {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [showPosteModal, setShowPosteModal] = useState(false);
  const [indiceBT, setIndiceBT] = useState(null);
  const [loading, setLoading] = useState(false);

  // Charger l'indice BT au montage
  useEffect(() => {
    indicesBTService.getIndice('BT01').then(setIndiceBT);
  }, []);

  // Créer un nouveau scénario
  const creerScenario = () => {
    const nouveau = {
      id: Date.now(),
      titre: `Scénario ${scenarios.length + 1}`,
      postes: [],
      indice: indiceBT,
      dateChiffrage: new Date().toISOString().split('T')[0],
      retenu: scenarios.length === 0
    };
    setScenarios(prev => [...prev, nouveau]);
    setActiveScenario(nouveau.id);
  };

  // Ajouter un poste
  const ajouterPoste = (posteData) => {
    setScenarios(prev => prev.map(s => {
      if (s.id === activeScenario) {
        return {
          ...s,
          postes: [...s.postes, {
            id: Date.now(),
            ...posteData,
            totalHT: posteData.quantite * posteData.prixUnitaire
          }]
        };
      }
      return s;
    }));
  };

  // Supprimer un poste
  const supprimerPoste = (posteId) => {
    setScenarios(prev => prev.map(s => {
      if (s.id === activeScenario) {
        return {
          ...s,
          postes: s.postes.filter(p => p.id !== posteId)
        };
      }
      return s;
    }));
  };

  // Calculs totaux du scénario actif
  const scenarioActif = scenarios.find(s => s.id === activeScenario);
  const totaux = useMemo(() => {
    if (!scenarioActif) return { ht: 0, tva: 0, ttc: 0 };
    
    const ht = scenarioActif.postes.reduce((acc, p) => acc + (p.totalHT || 0), 0);
    const tva = ht * 0.10; // TVA 10% rénovation
    const ttc = ht + tva;

    return { ht, tva, ttc };
  }, [scenarioActif]);

  return (
    <div className="space-y-6">
      {/* En-tête avec indice BT */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a]">Chiffrage des travaux</h2>
          <p className="text-[#737373]">{pathologies.length} désordre(s) à chiffrer</p>
        </div>
        <div className="flex items-center gap-4">
          {indiceBT && (
            <div className="px-4 py-2 bg-[#DBEAFE] rounded-xl">
              <span className="text-xs text-[#8b7355] uppercase tracking-wider">Indice BT01</span>
              <p className="font-medium text-[#1a1a1a]">
                {indiceBT.valeur.toFixed(1)}
                {indiceBT.simule && <Badge variant="warning" className="ml-2">Estimé</Badge>}
              </p>
            </div>
          )}
          <Button variant="primary" icon={Plus} onClick={creerScenario}>
            Nouveau scénario
          </Button>
        </div>
      </div>

      {scenarios.length === 0 ? (
        <EmptyState
          icon={Calculator}
          title="Aucun chiffrage"
          description="Créez un scénario pour commencer le chiffrage"
          action={creerScenario}
          actionLabel="Créer un scénario"
        />
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {/* Liste des scénarios */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-[#737373] uppercase tracking-wider mb-3">
              Scénarios
            </h3>
            {scenarios.map(scenario => {
              const total = scenario.postes.reduce((acc, p) => acc + (p.totalHT || 0), 0);
              return (
                <Card
                  key={scenario.id}
                  className={`p-4 cursor-pointer transition-all ${
                    activeScenario === scenario.id 
                      ? 'border-[#2563EB] bg-[#fefcf7]' 
                      : 'hover:border-[#d4d4d4]'
                  }`}
                  onClick={() => setActiveScenario(scenario.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#1a1a1a]">{scenario.titre}</p>
                      <p className="text-sm text-[#737373]">{scenario.postes.length} poste(s)</p>
                    </div>
                    {scenario.retenu && <Badge variant="gold">Retenu</Badge>}
                  </div>
                  <p className="text-lg font-medium text-[#2563EB] mt-2">
                    {formatMontant(total)} HT
                  </p>
                </Card>
              );
            })}
          </div>

          {/* Détail du scénario actif */}
          <div className="col-span-3 space-y-4">
            {scenarioActif && (
              <>
                {/* Postes */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-[#1a1a1a]">Postes de travaux</h3>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={Plus}
                      onClick={() => setShowPosteModal(true)}
                    >
                      Ajouter un poste
                    </Button>
                  </div>

                  {scenarioActif.postes.length === 0 ? (
                    <p className="text-[#737373] text-center py-8">
                      Aucun poste. Cliquez sur "Ajouter un poste" pour commencer.
                    </p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-[#a3a3a3] uppercase tracking-wider">
                          <th className="pb-3">Désignation</th>
                          <th className="pb-3 text-center">Qté</th>
                          <th className="pb-3 text-center">Unité</th>
                          <th className="pb-3 text-right">P.U. HT</th>
                          <th className="pb-3 text-right">Total HT</th>
                          <th className="pb-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenarioActif.postes.map(poste => (
                          <tr key={poste.id} className="border-t border-[#e5e5e5]">
                            <td className="py-3">
                              <p className="font-medium text-[#1a1a1a]">{poste.designation}</p>
                              {poste.desordre && (
                                <p className="text-xs text-[#a3a3a3]">Désordre n°{poste.desordre}</p>
                              )}
                            </td>
                            <td className="py-3 text-center">{poste.quantite}</td>
                            <td className="py-3 text-center text-[#737373]">{poste.unite}</td>
                            <td className="py-3 text-right">{formatMontant(poste.prixUnitaire)}</td>
                            <td className="py-3 text-right font-medium">{formatMontant(poste.totalHT)}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => supprimerPoste(poste.id)}
                                className="p-1 hover:bg-red-50 rounded text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Card>

                {/* Récapitulatif */}
                <Card className="p-6 bg-[#fafafa]">
                  <h3 className="font-medium text-[#1a1a1a] mb-4">Récapitulatif</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#737373]">Total HT</span>
                      <span className="font-medium">{formatMontant(totaux.ht)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737373]">TVA 10%</span>
                      <span>{formatMontant(totaux.tva)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#e5e5e5]">
                      <span className="font-medium text-[#1a1a1a]">Total TTC</span>
                      <span className="text-xl font-medium text-[#2563EB]">{formatMontant(totaux.ttc)}</span>
                    </div>
                  </div>
                  
                  {indiceBT && (
                    <p className="text-xs text-[#a3a3a3] mt-4">
                      Chiffrage établi sur base indice BT01 de {indiceBT.valeur.toFixed(1)} ({indiceBT.periode})
                    </p>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal ajout poste */}
      {showPosteModal && (
        <ModalAjoutPoste
          isOpen={showPosteModal}
          onClose={() => setShowPosteModal(false)}
          pathologies={pathologies}
          onSubmit={(data) => {
            ajouterPoste(data);
            setShowPosteModal(false);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// MODAL AJOUT POSTE
// ============================================================================

const ModalAjoutPoste = ({ isOpen, onClose, pathologies, onSubmit }) => {
  const [formData, setFormData] = useState({
    code: '',
    designation: '',
    quantite: 1,
    unite: 'u',
    prixUnitaire: 0,
    desordre: ''
  });
  const [categorieExpanded, setCategorieExpanded] = useState(null);

  // Sélectionner un poste de la base
  const selectPosteBase = (poste) => {
    setFormData({
      code: poste.code,
      designation: poste.designation,
      quantite: 1,
      unite: poste.unite,
      prixUnitaire: poste.prixMoyen,
      desordre: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Ajouter un poste" size="xl">
      <div className="grid grid-cols-2 gap-6">
        {/* Base de prix */}
        <div>
          <h4 className="font-medium text-[#1a1a1a] mb-4">Base de prix unitaires</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {Object.entries(BASE_PRIX_UNITAIRES).map(([key, categorie]) => {
              const Icon = categorie.icon;
              const isExpanded = categorieExpanded === key;
              
              return (
                <div key={key} className="border border-[#e5e5e5] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setCategorieExpanded(isExpanded ? null : key)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#fafafa]"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-[#2563EB]" />
                      {categorie.categorie}
                    </span>
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-[#e5e5e5] p-2 space-y-1">
                      {categorie.postes.map(poste => (
                        <button
                          key={poste.code}
                          onClick={() => selectPosteBase(poste)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#DBEAFE] transition-colors"
                        >
                          <p className="text-sm font-medium text-[#1a1a1a]">{poste.designation}</p>
                          <p className="text-xs text-[#737373]">
                            {formatMontant(poste.prixMin)} - {formatMontant(poste.prixMax)} / {poste.unite}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulaire */}
        <div>
          <h4 className="font-medium text-[#1a1a1a] mb-4">Détails du poste</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Désignation"
              value={formData.designation}
              onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
              required
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Quantité"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantite}
                onChange={(e) => setFormData(prev => ({ ...prev, quantite: parseFloat(e.target.value) || 0 }))}
                required
              />
              <Select
                label="Unité"
                value={formData.unite}
                onChange={(e) => setFormData(prev => ({ ...prev, unite: e.target.value }))}
                options={[
                  { value: 'u', label: 'Unité (u)' },
                  { value: 'm²', label: 'm²' },
                  { value: 'ml', label: 'ml' },
                  { value: 'm³', label: 'm³' },
                  { value: 'h', label: 'Heure' },
                  { value: 'ens', label: 'Ensemble' },
                  { value: 'fft', label: 'Forfait' }
                ]}
              />
              <Input
                label="Prix unitaire HT"
                type="number"
                step="0.01"
                min="0"
                value={formData.prixUnitaire}
                onChange={(e) => setFormData(prev => ({ ...prev, prixUnitaire: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            {pathologies.length > 0 && (
              <Select
                label="Lier à un désordre"
                value={formData.desordre}
                onChange={(e) => setFormData(prev => ({ ...prev, desordre: e.target.value }))}
                options={[
                  { value: '', label: 'Aucun (travaux généraux)' },
                  ...pathologies.map(p => ({ value: p.numero, label: `D${p.numero} - ${p.intitule}` }))
                ]}
              />
            )}

            <Card className="p-4 bg-[#DBEAFE]">
              <div className="flex justify-between items-center">
                <span className="text-[#8b7355]">Total HT</span>
                <span className="text-xl font-medium text-[#1a1a1a]">
                  {formatMontant(formData.quantite * formData.prixUnitaire)}
                </span>
              </div>
            </Card>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" type="button" onClick={onClose}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                Ajouter
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default ModuleChiffrage;
// BASE_PRIX_UNITAIRES, INDICES_BT, indicesBTService déjà exportés en haut du fichier
