// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE MATRICE IMPUTABILITÉ
// Attribution des responsabilités par désordre et intervenant
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  Grid, Users, AlertTriangle, Percent, Check, X,
  ChevronDown, ChevronRight, Edit, Save, Download,
  FileText, Scale, HelpCircle, Info, PieChart,
  RefreshCw, Copy, Plus, Trash2
} from 'lucide-react';
import { Card, Badge, Button, Input, Select, ModalBase, EmptyState } from '../ui';
import { formatMontant } from '../../utils/helpers';

// ============================================================================
// CONSTANTES
// ============================================================================

const TYPES_INTERVENANTS = [
  { value: 'maitre-ouvrage', label: 'Maître d\'ouvrage', abbr: 'MO' },
  { value: 'maitre-oeuvre', label: 'Maître d\'œuvre', abbr: 'MOE' },
  { value: 'architecte', label: 'Architecte', abbr: 'ARCH' },
  { value: 'bet', label: 'Bureau d\'études', abbr: 'BET' },
  { value: 'entrepreneur-general', label: 'Entrepreneur général', abbr: 'EG' },
  { value: 'sous-traitant', label: 'Sous-traitant', abbr: 'ST' },
  { value: 'fournisseur', label: 'Fournisseur', abbr: 'FOUR' },
  { value: 'controleur-technique', label: 'Contrôleur technique', abbr: 'CT' },
  { value: 'autre', label: 'Autre intervenant', abbr: 'AUT' }
];

const FONDEMENTS_RESPONSABILITE = [
  { value: 'decennale', label: 'Garantie décennale (Art. 1792)', ref: 'Art. 1792 CC' },
  { value: 'biennale', label: 'Garantie biennale (Art. 1792-3)', ref: 'Art. 1792-3 CC' },
  { value: 'gpa', label: 'Garantie parfait achèvement (Art. 1792-6)', ref: 'Art. 1792-6 CC' },
  { value: 'contractuelle', label: 'Responsabilité contractuelle (Art. 1231-1)', ref: 'Art. 1231-1 CC' },
  { value: 'delictuelle', label: 'Responsabilité délictuelle (Art. 1240)', ref: 'Art. 1240 CC' },
  { value: 'vices-caches', label: 'Garantie vices cachés (Art. 1641)', ref: 'Art. 1641 CC' }
];

// ============================================================================
// COMPOSANT PRINCIPAL - MATRICE IMPUTABILITÉ
// ============================================================================

export const MatriceImputabilite = ({
  affaire,
  pathologies = [],
  parties = [],
  chiffrage,
  onSave
}) => {
  // État de la matrice : { [pathologieId]: { [partieId]: { pourcentage, fondement, justification } } }
  const [matrice, setMatrice] = useState(() => initMatrice(pathologies, parties));
  const [showDetail, setShowDetail] = useState(null);
  const [expandedPathologies, setExpandedPathologies] = useState([]);

  // Initialiser la matrice
  function initMatrice(pathos, parts) {
    const m = {};
    pathos.forEach(p => {
      m[p.id] = {};
      parts.forEach(partie => {
        m[p.id][partie.id] = {
          pourcentage: 0,
          fondement: '',
          justification: '',
          dtuNonRespecte: ''
        };
      });
    });
    return m;
  }

  // Intervenants BTP (filtrer les parties pertinentes)
  const intervenants = parties.filter(p => 
    ['defenseur', 'intervenant', 'assureur-do'].includes(p.type) ||
    p.role_btp
  );

  // Mettre à jour une cellule
  const updateCellule = useCallback((pathologieId, partieId, field, value) => {
    setMatrice(prev => ({
      ...prev,
      [pathologieId]: {
        ...prev[pathologieId],
        [partieId]: {
          ...prev[pathologieId]?.[partieId],
          [field]: value
        }
      }
    }));
  }, []);

  // Calculer le total par pathologie
  const getTotalPathologie = (pathologieId) => {
    const pathoMatrice = matrice[pathologieId] || {};
    return Object.values(pathoMatrice).reduce((sum, cell) => sum + (parseFloat(cell.pourcentage) || 0), 0);
  };

  // Calculer le total par intervenant
  const getTotalIntervenant = (partieId) => {
    let total = 0;
    let count = 0;
    Object.values(matrice).forEach(pathoMatrice => {
      const cell = pathoMatrice[partieId];
      if (cell?.pourcentage > 0) {
        total += parseFloat(cell.pourcentage) || 0;
        count++;
      }
    });
    return count > 0 ? Math.round(total / count) : 0;
  };

  // Calculer la répartition financière
  const repartitionFinanciere = useMemo(() => {
    if (!chiffrage?.total_ttc) return [];

    const totalTTC = parseFloat(chiffrage.total_ttc);
    const repartition = {};

    pathologies.forEach(patho => {
      const pathoMontant = patho.chiffrage_ttc || (totalTTC / pathologies.length);
      const pathoMatrice = matrice[patho.id] || {};

      Object.entries(pathoMatrice).forEach(([partieId, cell]) => {
        if (cell.pourcentage > 0) {
          if (!repartition[partieId]) {
            repartition[partieId] = { montant: 0, pathologies: [] };
          }
          const montantImpute = pathoMontant * (cell.pourcentage / 100);
          repartition[partieId].montant += montantImpute;
          repartition[partieId].pathologies.push({
            pathologie: patho,
            pourcentage: cell.pourcentage,
            montant: montantImpute
          });
        }
      });
    });

    return Object.entries(repartition).map(([partieId, data]) => {
      const partie = parties.find(p => p.id === partieId);
      return {
        partie,
        ...data
      };
    }).sort((a, b) => b.montant - a.montant);
  }, [matrice, pathologies, parties, chiffrage]);

  // Toggle expansion pathologie
  const togglePathologie = (pathologieId) => {
    setExpandedPathologies(prev =>
      prev.includes(pathologieId)
        ? prev.filter(id => id !== pathologieId)
        : [...prev, pathologieId]
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a]">Matrice d'imputabilité</h2>
          <p className="text-[#737373]">{affaire?.reference} — Répartition des responsabilités</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Download}>
            Exporter
          </Button>
          <Button variant="primary" icon={Save} onClick={() => onSave && onSave(matrice)}>
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Mode d'emploi</p>
            <p>Attribuez un pourcentage de responsabilité à chaque intervenant pour chaque désordre. 
               Le total doit être égal à 100% par désordre. Cliquez sur une cellule pour ajouter 
               le fondement juridique et la justification technique.</p>
          </div>
        </div>
      </Card>

      {/* Matrice */}
      {pathologies.length === 0 || intervenants.length === 0 ? (
        <EmptyState
          icon={Grid}
          title="Données insuffisantes"
          description="Ajoutez des désordres et des parties pour créer la matrice d'imputabilité"
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fafafa]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#a3a3a3] uppercase tracking-wider min-w-[250px]">
                  Désordre
                </th>
                {intervenants.map(intervenant => (
                  <th 
                    key={intervenant.id}
                    className="px-3 py-3 text-center text-xs font-medium text-[#a3a3a3] uppercase tracking-wider min-w-[100px]"
                  >
                    <div className="truncate max-w-[100px]" title={intervenant.raison_sociale || intervenant.nom}>
                      {intervenant.raison_sociale?.substring(0, 15) || intervenant.nom?.substring(0, 15)}
                    </div>
                    {intervenant.role_btp && (
                      <Badge variant="default" className="mt-1">{intervenant.role_btp}</Badge>
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-medium text-[#a3a3a3] uppercase tracking-wider w-24">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {pathologies.map((pathologie) => {
                const total = getTotalPathologie(pathologie.id);
                const isValid = Math.abs(total - 100) < 0.01;
                const isExpanded = expandedPathologies.includes(pathologie.id);

                return (
                  <React.Fragment key={pathologie.id}>
                    <tr className={`hover:bg-[#fafafa] ${!isValid && total > 0 ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePathologie(pathologie.id)}
                          className="flex items-center gap-2 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#737373]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#737373]" />
                          )}
                          <div>
                            <Badge variant={pathologie.garantie === 'Décennale' ? 'error' : 'warning'} className="mb-1">
                              D{pathologie.numero}
                            </Badge>
                            <p className="font-medium text-[#1a1a1a]">{pathologie.intitule}</p>
                            <p className="text-xs text-[#737373]">{pathologie.localisation}</p>
                          </div>
                        </button>
                      </td>
                      
                      {intervenants.map(intervenant => {
                        const cell = matrice[pathologie.id]?.[intervenant.id] || {};
                        return (
                          <td key={intervenant.id} className="px-3 py-3 text-center">
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={cell.pourcentage || ''}
                                onChange={(e) => updateCellule(
                                  pathologie.id, 
                                  intervenant.id, 
                                  'pourcentage', 
                                  e.target.value
                                )}
                                onClick={(e) => e.target.select()}
                                className={`w-16 text-center px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-[#c9a227] ${
                                  cell.pourcentage > 0 
                                    ? 'bg-[#f5e6c8] border-[#c9a227] font-medium' 
                                    : 'border-[#e5e5e5]'
                                }`}
                                placeholder="-"
                              />
                              {cell.pourcentage > 0 && (
                                <button
                                  onClick={() => setShowDetail({ pathologie, intervenant, cell })}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-[#c9a227] text-white rounded-full text-xs flex items-center justify-center"
                                >
                                  {cell.fondement ? <Check className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      
                      <td className="px-4 py-3 text-center">
                        <span className={`font-medium ${
                          isValid ? 'text-green-600' : 
                          total > 100 ? 'text-red-600' : 
                          'text-amber-600'
                        }`}>
                          {total}%
                          {isValid && <Check className="w-4 h-4 inline ml-1" />}
                        </span>
                      </td>
                    </tr>

                    {/* Ligne détail expandée */}
                    {isExpanded && (
                      <tr className="bg-[#fafafa]">
                        <td colSpan={intervenants.length + 2} className="px-8 py-4">
                          <div className="text-sm space-y-2">
                            <p><strong>Description :</strong> {pathologie.description}</p>
                            <p><strong>Garantie :</strong> {pathologie.garantie || 'Non qualifiée'}</p>
                            {pathologie.dtu_applicable && (
                              <p><strong>DTU applicable :</strong> {pathologie.dtu_applicable}</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot className="bg-[#1a1a1a] text-white">
              <tr>
                <td className="px-4 py-3 font-medium">Moyenne par intervenant</td>
                {intervenants.map(intervenant => (
                  <td key={intervenant.id} className="px-3 py-3 text-center font-medium">
                    {getTotalIntervenant(intervenant.id)}%
                  </td>
                ))}
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </Card>
      )}

      {/* Répartition financière */}
      {repartitionFinanciere.length > 0 && chiffrage?.total_ttc && (
        <Card className="p-6">
          <h3 className="font-medium text-[#1a1a1a] mb-4 flex items-center gap-2">
            <Euro className="w-5 h-5 text-[#c9a227]" />
            Répartition financière
          </h3>
          <div className="space-y-4">
            {repartitionFinanciere.map(({ partie, montant, pathologies: pathos }) => (
              <div key={partie.id} className="p-4 bg-[#fafafa] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-[#1a1a1a]">
                      {partie.raison_sociale || `${partie.nom} ${partie.prenom || ''}`}
                    </p>
                    {partie.role_btp && (
                      <Badge variant="default">{partie.role_btp}</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light text-[#c9a227]">{formatMontant(montant)}</p>
                    <p className="text-xs text-[#737373]">
                      {Math.round((montant / parseFloat(chiffrage.total_ttc)) * 100)}% du total
                    </p>
                  </div>
                </div>
                <div className="text-xs text-[#737373]">
                  {pathos.map((p, i) => (
                    <span key={i}>
                      D{p.pathologie.numero} ({p.pourcentage}% → {formatMontant(p.montant)})
                      {i < pathos.length - 1 ? ' • ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-[#e5e5e5]">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total chiffrage TTC</span>
                <span className="text-xl font-medium">{formatMontant(chiffrage.total_ttc)}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modal détail cellule */}
      {showDetail && (
        <ModalDetailImputabilite
          isOpen={!!showDetail}
          onClose={() => setShowDetail(null)}
          pathologie={showDetail.pathologie}
          intervenant={showDetail.intervenant}
          cell={showDetail.cell}
          onSave={(updates) => {
            Object.entries(updates).forEach(([field, value]) => {
              updateCellule(showDetail.pathologie.id, showDetail.intervenant.id, field, value);
            });
            setShowDetail(null);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// MODAL DÉTAIL IMPUTABILITÉ
// ============================================================================

const ModalDetailImputabilite = ({ isOpen, onClose, pathologie, intervenant, cell, onSave }) => {
  const [formData, setFormData] = useState({
    pourcentage: cell.pourcentage || 0,
    fondement: cell.fondement || '',
    justification: cell.justification || '',
    dtuNonRespecte: cell.dtuNonRespecte || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const nomIntervenant = intervenant.raison_sociale || `${intervenant.nom} ${intervenant.prenom || ''}`;

  return (
    <ModalBase 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Imputabilité - D${pathologie.numero}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Résumé */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-xs text-red-600 uppercase tracking-wider mb-1">Désordre</p>
            <p className="font-medium text-[#1a1a1a]">{pathologie.intitule}</p>
            <p className="text-sm text-[#737373]">{pathologie.localisation}</p>
          </Card>
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Intervenant</p>
            <p className="font-medium text-[#1a1a1a]">{nomIntervenant}</p>
            {intervenant.role_btp && (
              <Badge variant="default">{intervenant.role_btp}</Badge>
            )}
          </Card>
        </div>

        {/* Pourcentage */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
            Pourcentage de responsabilité
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={formData.pourcentage}
              onChange={(e) => setFormData({ ...formData, pourcentage: parseInt(e.target.value) })}
              className="flex-1"
            />
            <div className="w-20 text-center">
              <span className="text-2xl font-light text-[#c9a227]">{formData.pourcentage}%</span>
            </div>
          </div>
        </div>

        {/* Fondement juridique */}
        <Select
          label="Fondement juridique"
          value={formData.fondement}
          onChange={(e) => setFormData({ ...formData, fondement: e.target.value })}
          options={[
            { value: '', label: 'Sélectionner un fondement...' },
            ...FONDEMENTS_RESPONSABILITE.map(f => ({
              value: f.value,
              label: `${f.label} - ${f.ref}`
            }))
          ]}
        />

        {/* DTU non respecté */}
        <Input
          label="DTU / Norme non respecté(e)"
          value={formData.dtuNonRespecte}
          onChange={(e) => setFormData({ ...formData, dtuNonRespecte: e.target.value })}
          placeholder="Ex: DTU 20.1 § 5.3 - Épaisseur des joints"
        />

        {/* Justification */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
            Justification technique
          </label>
          <textarea
            value={formData.justification}
            onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
            rows={5}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] resize-none"
            placeholder="Expliquez les raisons de l'imputabilité (obligation non respectée, lien de causalité avec le désordre...)"
          />
        </div>

        {/* Suggestions */}
        <div className="p-4 bg-[#fafafa] rounded-xl">
          <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-2">Formulations suggérées</p>
          <div className="space-y-2">
            {[
              "Le désordre résulte d'une non-conformité aux règles de l'art dans l'exécution des travaux...",
              "L'intervenant n'a pas respecté les prescriptions du DTU applicable...",
              "Un défaut de conception est à l'origine du désordre constaté...",
              "L'absence de contrôle lors de la mise en œuvre a conduit au sinistre..."
            ].map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setFormData({ ...formData, justification: sug })}
                className="block w-full text-left px-3 py-2 text-sm text-[#525252] bg-white rounded-lg hover:bg-[#f5e6c8] transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" icon={Save}>
            Enregistrer
          </Button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// WIDGET RÉSUMÉ IMPUTABILITÉ
// ============================================================================

export const ImputabiliteWidget = ({ matrice, pathologies, parties, chiffrageTTC }) => {
  // Calculer synthèse rapide
  const synthese = useMemo(() => {
    const parIntervenant = {};
    
    pathologies.forEach(patho => {
      const pathoMatrice = matrice[patho.id] || {};
      Object.entries(pathoMatrice).forEach(([partieId, cell]) => {
        if (cell.pourcentage > 0) {
          if (!parIntervenant[partieId]) {
            parIntervenant[partieId] = { total: 0, count: 0 };
          }
          parIntervenant[partieId].total += cell.pourcentage;
          parIntervenant[partieId].count++;
        }
      });
    });

    return Object.entries(parIntervenant)
      .map(([partieId, data]) => ({
        partie: parties.find(p => p.id === partieId),
        moyenne: Math.round(data.total / data.count),
        montant: chiffrageTTC ? (chiffrageTTC * data.total / 100 / data.count) : 0
      }))
      .sort((a, b) => b.moyenne - a.moyenne)
      .slice(0, 3);
  }, [matrice, pathologies, parties, chiffrageTTC]);

  if (synthese.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="font-medium text-[#1a1a1a] mb-4 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-[#c9a227]" />
        Imputabilité (top 3)
      </h3>
      <div className="space-y-3">
        {synthese.map(({ partie, moyenne, montant }) => (
          <div key={partie.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#1a1a1a]">
                {partie.raison_sociale || partie.nom}
              </p>
              <p className="text-xs text-[#737373]">{partie.role_btp}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-[#c9a227]">{moyenne}%</p>
              {montant > 0 && (
                <p className="text-xs text-[#737373]">{formatMontant(montant)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  MatriceImputabilite,
  ImputabiliteWidget,
  TYPES_INTERVENANTS,
  FONDEMENTS_RESPONSABILITE
};
