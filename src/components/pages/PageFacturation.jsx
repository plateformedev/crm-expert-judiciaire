// ============================================================================
// CRM EXPERT JUDICIAIRE - PAGE FACTURATION
// Gestion des états de frais, devis et facturation
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Euro, FileText, Clock, CheckCircle, AlertTriangle, Download,
  Plus, Filter, Search, Eye, Edit, Send, Printer, Calculator,
  Calendar, Building, Folder, TrendingUp, ArrowRight, Copy,
  FileCheck, Receipt, CreditCard, Banknote, PiggyBank
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase, useToast } from '../ui';
import { getStoredAffaires } from '../../lib/demoData';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// CONSTANTES
// ============================================================================

const STATUTS_FACTURE = {
  brouillon: { label: 'Brouillon', color: 'gray', icon: Edit },
  emise: { label: 'Émise', color: 'blue', icon: Send },
  envoyee: { label: 'Envoyée', color: 'indigo', icon: FileCheck },
  payee: { label: 'Payée', color: 'green', icon: CheckCircle },
  retard: { label: 'En retard', color: 'red', icon: AlertTriangle }
};

const TYPES_DOCUMENT = {
  devis: { label: 'Devis', icon: FileText, color: 'blue' },
  etat_frais: { label: 'État de frais', icon: Receipt, color: 'purple' },
  facture: { label: 'Facture', icon: Euro, color: 'green' }
};

// ============================================================================
// COMPOSANT: Carte résumé
// ============================================================================

const SummaryCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  const colorMap = {
    gold: 'bg-[#f5e6c8] text-[#c9a227]',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <Badge variant={trend > 0 ? 'success' : trend < 0 ? 'error' : 'default'} className="text-xs">
            {trend > 0 ? '+' : ''}{trend}%
          </Badge>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-light text-[#1a1a1a]">{value}</p>
        <p className="text-sm text-[#737373] mt-1">{title}</p>
        {subtitle && <p className="text-xs text-[#a3a3a3]">{subtitle}</p>}
      </div>
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Ligne de facturation
// ============================================================================

const FacturationRow = ({ item, onView, onEdit }) => {
  const statut = STATUTS_FACTURE[item.statut] || STATUTS_FACTURE.brouillon;
  const type = TYPES_DOCUMENT[item.type] || TYPES_DOCUMENT.facture;
  const StatusIcon = statut.icon;

  return (
    <div className="flex items-center gap-4 p-4 border border-[#e5e5e5] rounded-xl hover:border-[#c9a227] transition-colors">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        type.color === 'blue' ? 'bg-blue-100' :
        type.color === 'purple' ? 'bg-purple-100' : 'bg-green-100'
      }`}>
        <type.icon className={`w-5 h-5 ${
          type.color === 'blue' ? 'text-blue-600' :
          type.color === 'purple' ? 'text-purple-600' : 'text-green-600'
        }`} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-[#1a1a1a]">{item.numero}</p>
          <Badge variant={statut.color} className="text-xs flex items-center gap-1">
            <StatusIcon className="w-3 h-3" />
            {statut.label}
          </Badge>
        </div>
        <p className="text-sm text-[#737373]">{item.affaire_reference}</p>
        <p className="text-xs text-[#a3a3a3]">{item.client}</p>
      </div>

      <div className="text-right">
        <p className="text-lg font-medium text-[#1a1a1a]">
          {item.montant_ttc?.toLocaleString('fr-FR')} €
        </p>
        <p className="text-xs text-[#737373]">
          {formatDateFr(item.date_emission)}
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" icon={Eye} onClick={() => onView(item)}>
          Voir
        </Button>
        <Button variant="secondary" size="sm" icon={Download}>
          PDF
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const PageFacturation = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('tous');
  const [search, setSearch] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('annee');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showNewDocModal, setShowNewDocModal] = useState(null); // 'devis' | 'etat_frais' | 'facture'
  const [showSimulateur, setShowSimulateur] = useState(false);

  const affaires = getStoredAffaires();

  const handleViewItem = (item) => {
    setSelectedItem(item);
  };

  const handleEditItem = (item) => {
    toast.info('Édition', `L'édition de ${TYPES_DOCUMENT[item.type]?.label || 'ce document'} sera bientôt disponible`);
  };

  const handleCreateDevis = () => {
    setShowNewDocModal('devis');
  };

  const handleCreateEtatFrais = () => {
    setShowNewDocModal('etat_frais');
  };

  const handleCreateFacture = () => {
    setShowNewDocModal('facture');
  };

  const handleExport = () => {
    try {
      const csvData = [
        ['Type', 'Numéro', 'Affaire', 'Client', 'Date', 'Montant HT', 'TVA', 'Montant TTC', 'Statut'],
        ...facturation.map(item => [
          TYPES_DOCUMENT[item.type]?.label || item.type,
          item.numero,
          item.affaire_reference,
          item.client,
          formatDateFr(item.date_emission),
          item.montant_ht,
          item.tva,
          item.montant_ttc,
          STATUTS_FACTURE[item.statut]?.label || item.statut
        ])
      ];
      const csvContent = csvData.map(row => row.join(';')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facturation_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export réussi', 'Les données ont été exportées au format CSV');
    } catch (error) {
      toast.error('Erreur', 'Impossible d\'exporter les données');
    }
  };

  // Générer les données de facturation à partir des affaires
  const facturation = useMemo(() => {
    const items = [];
    let numeroDevis = 1;
    let numeroFacture = 1;

    affaires.forEach(affaire => {
      // Créer un état de frais pour chaque affaire avec des vacations
      const vacations = affaire.vacations || [];
      const frais = affaire.frais || [];

      if (vacations.length > 0 || frais.length > 0) {
        const montantVacations = vacations.reduce((sum, v) => sum + (v.montant || 0), 0);
        const montantFrais = frais.reduce((sum, f) => sum + (f.montant || 0), 0);
        const montantHT = montantVacations + montantFrais;
        const tva = montantHT * 0.2;
        const montantTTC = montantHT + tva;

        items.push({
          id: `ef-${affaire.id}`,
          type: 'etat_frais',
          numero: `EF-${affaire.reference}`,
          affaire_id: affaire.id,
          affaire_reference: affaire.reference,
          client: affaire.parties?.find(p => p.type === 'demandeur')?.nom || 'Client',
          tribunal: affaire.tribunal,
          date_emission: affaire.date_ordonnance,
          montant_ht: montantHT,
          tva: tva,
          montant_ttc: montantTTC,
          statut: affaire.provision_recue ? 'payee' : 'emise',
          vacations: vacations,
          frais: frais
        });
      }

      // Si provision demandée, créer un devis
      if (affaire.provision_montant && !affaire.provision_recue) {
        items.push({
          id: `dev-${affaire.id}`,
          type: 'devis',
          numero: `DEV-2024-${String(numeroDevis++).padStart(4, '0')}`,
          affaire_id: affaire.id,
          affaire_reference: affaire.reference,
          client: affaire.parties?.find(p => p.type === 'demandeur')?.nom || 'Client',
          tribunal: affaire.tribunal,
          date_emission: affaire.date_ordonnance,
          montant_ht: affaire.provision_montant * 0.8,
          tva: affaire.provision_montant * 0.2,
          montant_ttc: affaire.provision_montant,
          statut: 'envoyee',
          validite: 30
        });
      }

      // Si rapport déposé, créer une facture finale
      if (affaire.statut === 'rapport-depose' || affaire.statut === 'archive') {
        const totalVacations = (affaire.vacations || []).reduce((sum, v) => sum + (v.montant || 0), 0);
        const totalFrais = (affaire.frais || []).reduce((sum, f) => sum + (f.montant || 0), 0);
        const montantHT = totalVacations + totalFrais;
        const tva = montantHT * 0.2;

        items.push({
          id: `fact-${affaire.id}`,
          type: 'facture',
          numero: `FAC-2024-${String(numeroFacture++).padStart(4, '0')}`,
          affaire_id: affaire.id,
          affaire_reference: affaire.reference,
          client: affaire.parties?.find(p => p.type === 'demandeur')?.nom || 'Client',
          tribunal: affaire.tribunal,
          date_emission: affaire.date_depot_rapport || new Date().toISOString(),
          montant_ht: montantHT,
          tva: tva,
          montant_ttc: montantHT + tva,
          statut: 'payee'
        });
      }
    });

    return items.sort((a, b) => new Date(b.date_emission) - new Date(a.date_emission));
  }, [affaires]);

  // Filtrer
  const filteredItems = useMemo(() => {
    return facturation.filter(item => {
      const matchSearch = !search ||
        item.numero.toLowerCase().includes(search.toLowerCase()) ||
        item.affaire_reference.toLowerCase().includes(search.toLowerCase()) ||
        item.client?.toLowerCase().includes(search.toLowerCase());

      const matchTab = activeTab === 'tous' ||
        (activeTab === 'devis' && item.type === 'devis') ||
        (activeTab === 'etats' && item.type === 'etat_frais') ||
        (activeTab === 'factures' && item.type === 'facture') ||
        (activeTab === 'en_attente' && (item.statut === 'emise' || item.statut === 'envoyee'));

      return matchSearch && matchTab;
    });
  }, [facturation, search, activeTab]);

  // Statistiques
  const stats = useMemo(() => {
    const factures = facturation.filter(f => f.type === 'facture');
    const etats = facturation.filter(f => f.type === 'etat_frais');
    const devis = facturation.filter(f => f.type === 'devis');

    const caTotal = factures.reduce((sum, f) => sum + f.montant_ttc, 0);
    const caEncaisse = factures.filter(f => f.statut === 'payee').reduce((sum, f) => sum + f.montant_ttc, 0);
    const enAttente = factures.filter(f => f.statut !== 'payee').reduce((sum, f) => sum + f.montant_ttc, 0);
    const devisEnCours = devis.filter(d => d.statut !== 'payee').reduce((sum, d) => sum + d.montant_ttc, 0);

    return {
      nbFactures: factures.length,
      nbEtats: etats.length,
      nbDevis: devis.length,
      caTotal,
      caEncaisse,
      enAttente,
      devisEnCours,
      tauxEncaissement: caTotal > 0 ? Math.round((caEncaisse / caTotal) * 100) : 0
    };
  }, [facturation]);

  const tabs = [
    { id: 'tous', label: 'Tous', count: facturation.length },
    { id: 'devis', label: 'Devis', count: stats.nbDevis },
    { id: 'etats', label: 'États de frais', count: stats.nbEtats },
    { id: 'factures', label: 'Factures', count: stats.nbFactures },
    { id: 'en_attente', label: 'En attente', count: facturation.filter(f => f.statut === 'emise' || f.statut === 'envoyee').length }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#1a1a1a]">Facturation</h1>
          <p className="text-sm text-[#737373]">Gestion de vos états de frais, devis et factures</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Exporter
          </Button>
          <Button variant="secondary" icon={Calculator} onClick={() => setShowSimulateur(true)}>
            Simulateur
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowNewDocModal('devis')}>
            Nouveau document
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          title="Chiffre d'affaires"
          value={`${stats.caTotal.toLocaleString('fr-FR')} €`}
          subtitle="Total facturé"
          icon={TrendingUp}
          color="gold"
        />
        <SummaryCard
          title="Encaissé"
          value={`${stats.caEncaisse.toLocaleString('fr-FR')} €`}
          subtitle={`${stats.tauxEncaissement}% du CA`}
          icon={CheckCircle}
          color="green"
        />
        <SummaryCard
          title="En attente"
          value={`${stats.enAttente.toLocaleString('fr-FR')} €`}
          subtitle="À encaisser"
          icon={Clock}
          color="blue"
        />
        <SummaryCard
          title="Devis en cours"
          value={`${stats.devisEnCours.toLocaleString('fr-FR')} €`}
          subtitle={`${stats.nbDevis} devis`}
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Filtres et recherche */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-[#f5f5f5] text-[#737373] hover:bg-[#e5e5e5]'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-[#e5e5e5]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            className="w-64"
          />
          <select
            value={selectedPeriode}
            onChange={(e) => setSelectedPeriode(e.target.value)}
            className="px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm"
          >
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
            <option value="tout">Tout</option>
          </select>
        </div>
      </div>

      {/* Liste des documents */}
      <Card className="p-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-[#e5e5e5] mx-auto mb-4" />
            <p className="text-[#737373]">Aucun document trouvé</p>
            <p className="text-sm text-[#a3a3a3]">
              Créez des états de frais depuis vos affaires pour les voir apparaître ici
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <FacturationRow
                key={item.id}
                item={item}
                onView={() => handleViewItem(item)}
                onEdit={() => handleEditItem(item)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 hover:border-[#c9a227] transition-colors cursor-pointer" onClick={handleCreateDevis}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#1a1a1a]">Créer un devis</p>
              <p className="text-xs text-[#737373]">Estimation pour une nouvelle mission</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[#a3a3a3]" />
          </div>
        </Card>

        <Card className="p-4 hover:border-[#c9a227] transition-colors cursor-pointer" onClick={handleCreateEtatFrais}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#1a1a1a]">État de frais</p>
              <p className="text-xs text-[#737373]">Demande de taxation au juge</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[#a3a3a3]" />
          </div>
        </Card>

        <Card className="p-4 hover:border-[#c9a227] transition-colors cursor-pointer" onClick={handleCreateFacture}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Euro className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#1a1a1a]">Facture finale</p>
              <p className="text-xs text-[#737373]">Après dépôt du rapport</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[#a3a3a3]" />
          </div>
        </Card>
      </div>

      {/* Aide */}
      <Card className="p-4 bg-[#faf8f3] border-[#e5d9b3]">
        <div className="flex items-start gap-3">
          <PiggyBank className="w-5 h-5 text-[#c9a227] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#1a1a1a]">Conseil facturation</p>
            <p className="text-xs text-[#737373] mt-1">
              Pour l'expertise judiciaire, les honoraires sont fixés par le juge (taxation).
              L'état de frais doit être déposé avec le rapport définitif. Les provisions sont
              consignées au greffe et vous sont versées après taxation.
            </p>
          </div>
        </div>
      </Card>

      {/* Modal détail document */}
      {selectedItem && (
        <ModalBase
          title={`${TYPES_DOCUMENT[selectedItem.type]?.label || 'Document'} - ${selectedItem.numero}`}
          onClose={() => setSelectedItem(null)}
          size="lg"
        >
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-1">Affaire</p>
                <p className="font-medium text-[#1a1a1a]">{selectedItem.affaire_reference}</p>
              </div>
              <div>
                <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-1">Client</p>
                <p className="font-medium text-[#1a1a1a]">{selectedItem.client}</p>
              </div>
              <div>
                <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-1">Tribunal</p>
                <p className="text-[#1a1a1a]">{selectedItem.tribunal}</p>
              </div>
              <div>
                <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-1">Date d'émission</p>
                <p className="text-[#1a1a1a]">{formatDateFr(selectedItem.date_emission)}</p>
              </div>
            </div>

            {/* Détail vacations */}
            {selectedItem.vacations && selectedItem.vacations.length > 0 && (
              <div>
                <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-2">Vacations</p>
                <div className="bg-[#fafafa] rounded-xl p-4 space-y-2">
                  {selectedItem.vacations.map((v, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-[#737373]">{v.description || `Vacation ${idx + 1}`}</span>
                      <span className="font-medium">{(v.montant || 0).toLocaleString('fr-FR')} €</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Détail frais */}
            {selectedItem.frais && selectedItem.frais.length > 0 && (
              <div>
                <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-2">Frais</p>
                <div className="bg-[#fafafa] rounded-xl p-4 space-y-2">
                  {selectedItem.frais.map((f, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-[#737373]">{f.description || f.type || `Frais ${idx + 1}`}</span>
                      <span className="font-medium">{(f.montant || 0).toLocaleString('fr-FR')} €</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totaux */}
            <div className="bg-[#1a1a1a] text-white rounded-xl p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total HT</span>
                  <span>{(selectedItem.montant_ht || 0).toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">TVA (20%)</span>
                  <span>{(selectedItem.tva || 0).toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-700">
                  <span>Total TTC</span>
                  <span>{(selectedItem.montant_ttc || 0).toLocaleString('fr-FR')} €</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
              <Button variant="secondary" icon={Printer} onClick={() => toast.info('Impression', 'L\'impression sera bientôt disponible')} className="flex-1">
                Imprimer
              </Button>
              <Button variant="secondary" icon={Download} onClick={() => toast.info('Téléchargement', 'Le téléchargement PDF sera bientôt disponible')} className="flex-1">
                Télécharger PDF
              </Button>
              <Button variant="primary" icon={Send} onClick={() => toast.info('Envoi', 'L\'envoi par email sera bientôt disponible')} className="flex-1">
                Envoyer
              </Button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* Modal création de document */}
      {showNewDocModal && (
        <ModalCreationDocument
          type={showNewDocModal}
          affaires={affaires}
          onClose={() => setShowNewDocModal(null)}
          onSuccess={(doc) => {
            toast.success('Document créé', `${TYPES_DOCUMENT[doc.type]?.label || 'Document'} créé avec succès`);
            setShowNewDocModal(null);
          }}
        />
      )}

      {/* Modal simulateur */}
      {showSimulateur && (
        <ModalSimulateur
          onClose={() => setShowSimulateur(false)}
        />
      )}
    </div>
  );
};

// ============================================================================
// MODAL CRÉATION DOCUMENT
// ============================================================================

const ModalCreationDocument = ({ type, affaires, onClose, onSuccess }) => {
  const toast = useToast();
  const [selectedAffaire, setSelectedAffaire] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    montant_ht: 0,
    tva_taux: 20,
    validite: 30,
    conditions: ''
  });

  const affaire = affaires.find(a => a.id === selectedAffaire);

  const calculerMontants = () => {
    const montantHT = parseFloat(formData.montant_ht) || 0;
    const tva = montantHT * (formData.tva_taux / 100);
    return { montantHT, tva, montantTTC: montantHT + tva };
  };

  const handleSubmit = () => {
    if (!selectedAffaire) {
      toast.error('Erreur', 'Veuillez sélectionner une affaire');
      return;
    }

    const montants = calculerMontants();
    const doc = {
      id: `${type.substring(0, 3)}-${Date.now()}`,
      type,
      numero: `${type === 'devis' ? 'DEV' : type === 'etat_frais' ? 'EF' : 'FAC'}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      affaire_id: selectedAffaire,
      affaire_reference: affaire?.reference,
      client: affaire?.parties?.find(p => p.type === 'demandeur')?.nom || 'Client',
      tribunal: affaire?.tribunal,
      date_emission: new Date().toISOString(),
      montant_ht: montants.montantHT,
      tva: montants.tva,
      montant_ttc: montants.montantTTC,
      statut: 'brouillon',
      description: formData.description,
      validite: formData.validite
    };

    onSuccess(doc);
  };

  const montants = calculerMontants();

  return (
    <ModalBase
      title={`Créer un ${TYPES_DOCUMENT[type]?.label || 'document'}`}
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-6">
        {/* Sélection affaire */}
        <div>
          <label className="block text-sm font-medium text-[#525252] mb-2">Affaire concernée *</label>
          <select
            value={selectedAffaire}
            onChange={(e) => setSelectedAffaire(e.target.value)}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
          >
            <option value="">Sélectionner une affaire...</option>
            {affaires.map(a => (
              <option key={a.id} value={a.id}>{a.reference} - {a.parties?.find(p => p.type === 'demandeur')?.nom || 'Client'}</option>
            ))}
          </select>
        </div>

        {selectedAffaire && (
          <>
            {/* Infos affaire */}
            <Card className="p-4 bg-[#fafafa]">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#a3a3a3]">Référence</p>
                  <p className="font-medium">{affaire?.reference}</p>
                </div>
                <div>
                  <p className="text-[#a3a3a3]">Tribunal</p>
                  <p className="font-medium">{affaire?.tribunal}</p>
                </div>
                <div>
                  <p className="text-[#a3a3a3]">Client</p>
                  <p className="font-medium">{affaire?.parties?.find(p => p.type === 'demandeur')?.nom || 'Non défini'}</p>
                </div>
                <div>
                  <p className="text-[#a3a3a3]">Statut</p>
                  <p className="font-medium">{affaire?.statut}</p>
                </div>
              </div>
            </Card>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#525252] mb-2">Description / Objet</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={type === 'devis' ? 'Mission d\'expertise judiciaire...' : 'Honoraires et frais d\'expertise...'}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] resize-none h-24"
              />
            </div>

            {/* Montants */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#525252] mb-2">Montant HT (€)</label>
                <Input
                  type="number"
                  value={formData.montant_ht}
                  onChange={(e) => setFormData({ ...formData, montant_ht: e.target.value })}
                  icon={Euro}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#525252] mb-2">Taux TVA (%)</label>
                <select
                  value={formData.tva_taux}
                  onChange={(e) => setFormData({ ...formData, tva_taux: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
                >
                  <option value="0">0% (Non assujetti)</option>
                  <option value="10">10%</option>
                  <option value="20">20%</option>
                </select>
              </div>
              {type === 'devis' && (
                <div>
                  <label className="block text-sm font-medium text-[#525252] mb-2">Validité (jours)</label>
                  <Input
                    type="number"
                    value={formData.validite}
                    onChange={(e) => setFormData({ ...formData, validite: parseInt(e.target.value) })}
                  />
                </div>
              )}
            </div>

            {/* Récapitulatif */}
            <Card className="p-4 bg-[#1a1a1a] text-white">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total HT</span>
                  <span>{montants.montantHT.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TVA ({formData.tva_taux}%)</span>
                  <span>{montants.tva.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-700">
                  <span>Total TTC</span>
                  <span>{montants.montantTTC.toLocaleString('fr-FR')} €</span>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!selectedAffaire}
          >
            Créer le {TYPES_DOCUMENT[type]?.label || 'document'}
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// MODAL SIMULATEUR HONORAIRES
// ============================================================================

const ModalSimulateur = ({ onClose }) => {
  const [params, setParams] = useState({
    heuresExpertise: 0,
    heuresEtude: 0,
    heuresRedaction: 0,
    heuresDeplacement: 0,
    kilometres: 0,
    fraisDivers: 0,
    tauxExpertise: 90,
    tauxEtude: 80,
    tauxRedaction: 80,
    tauxDeplacement: 50,
    indemnitesKm: 0.60,
    tva: 20
  });

  const calculer = () => {
    const vacationsExpertise = params.heuresExpertise * params.tauxExpertise;
    const vacationsEtude = params.heuresEtude * params.tauxEtude;
    const vacationsRedaction = params.heuresRedaction * params.tauxRedaction;
    const vacationsDeplacement = params.heuresDeplacement * params.tauxDeplacement;
    const fraisKm = params.kilometres * params.indemnitesKm;

    const totalVacations = vacationsExpertise + vacationsEtude + vacationsRedaction + vacationsDeplacement;
    const totalFrais = fraisKm + parseFloat(params.fraisDivers || 0);
    const totalHT = totalVacations + totalFrais;
    const tva = totalHT * (params.tva / 100);
    const totalTTC = totalHT + tva;

    return {
      vacationsExpertise,
      vacationsEtude,
      vacationsRedaction,
      vacationsDeplacement,
      fraisKm,
      totalVacations,
      totalFrais,
      totalHT,
      tva,
      totalTTC
    };
  };

  const resultats = calculer();

  return (
    <ModalBase title="Simulateur d'honoraires" onClose={onClose} size="xl">
      <div className="grid grid-cols-2 gap-6">
        {/* Paramètres */}
        <div className="space-y-6">
          <Card className="p-4">
            <h4 className="font-medium text-[#1a1a1a] mb-4">Vacations (heures)</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-[#737373]">Expertise (réunion, visite)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={params.heuresExpertise}
                    onChange={(e) => setParams({ ...params, heuresExpertise: parseFloat(e.target.value) || 0 })}
                    className="w-20 text-right"
                  />
                  <span className="text-sm text-[#a3a3a3]">× {params.tauxExpertise}€</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-[#737373]">Étude de dossier</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={params.heuresEtude}
                    onChange={(e) => setParams({ ...params, heuresEtude: parseFloat(e.target.value) || 0 })}
                    className="w-20 text-right"
                  />
                  <span className="text-sm text-[#a3a3a3]">× {params.tauxEtude}€</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-[#737373]">Rédaction (CR, rapport)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={params.heuresRedaction}
                    onChange={(e) => setParams({ ...params, heuresRedaction: parseFloat(e.target.value) || 0 })}
                    className="w-20 text-right"
                  />
                  <span className="text-sm text-[#a3a3a3]">× {params.tauxRedaction}€</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-[#737373]">Déplacement</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={params.heuresDeplacement}
                    onChange={(e) => setParams({ ...params, heuresDeplacement: parseFloat(e.target.value) || 0 })}
                    className="w-20 text-right"
                  />
                  <span className="text-sm text-[#a3a3a3]">× {params.tauxDeplacement}€</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-medium text-[#1a1a1a] mb-4">Frais</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-[#737373]">Kilomètres</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={params.kilometres}
                    onChange={(e) => setParams({ ...params, kilometres: parseFloat(e.target.value) || 0 })}
                    className="w-20 text-right"
                  />
                  <span className="text-sm text-[#a3a3a3]">× {params.indemnitesKm}€</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-[#737373]">Frais divers (€)</label>
                <Input
                  type="number"
                  value={params.fraisDivers}
                  onChange={(e) => setParams({ ...params, fraisDivers: parseFloat(e.target.value) || 0 })}
                  className="w-24 text-right"
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-medium text-[#1a1a1a] mb-4">TVA</h4>
            <select
              value={params.tva}
              onChange={(e) => setParams({ ...params, tva: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl"
            >
              <option value="0">Non assujetti (0%)</option>
              <option value="10">Taux réduit (10%)</option>
              <option value="20">Taux normal (20%)</option>
            </select>
          </Card>
        </div>

        {/* Résultats */}
        <div className="space-y-4">
          <Card className="p-4 bg-[#fafafa]">
            <h4 className="font-medium text-[#1a1a1a] mb-4">Détail des vacations</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#737373]">Expertise</span>
                <span className="font-medium">{resultats.vacationsExpertise.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Étude</span>
                <span className="font-medium">{resultats.vacationsEtude.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Rédaction</span>
                <span className="font-medium">{resultats.vacationsRedaction.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Déplacement</span>
                <span className="font-medium">{resultats.vacationsDeplacement.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#e5e5e5] font-medium">
                <span>Sous-total vacations</span>
                <span>{resultats.totalVacations.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#fafafa]">
            <h4 className="font-medium text-[#1a1a1a] mb-4">Détail des frais</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#737373]">Indemnités km</span>
                <span className="font-medium">{resultats.fraisKm.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Frais divers</span>
                <span className="font-medium">{parseFloat(params.fraisDivers || 0).toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#e5e5e5] font-medium">
                <span>Sous-total frais</span>
                <span>{resultats.totalFrais.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-[#1a1a1a] text-white">
            <h4 className="font-medium mb-4">Total estimé</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total HT</span>
                <span className="text-xl">{resultats.totalHT.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">TVA ({params.tva}%)</span>
                <span>{resultats.tva.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-700">
                <span className="text-lg font-medium">Total TTC</span>
                <span className="text-2xl font-bold text-[#c9a227]">{resultats.totalTTC.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </Card>

          <p className="text-xs text-[#a3a3a3] text-center">
            Ce simulateur donne une estimation. Les honoraires définitifs sont fixés par le juge (taxation).
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[#e5e5e5]">
        <Button variant="secondary" onClick={onClose}>Fermer</Button>
      </div>
    </ModalBase>
  );
};

export default PageFacturation;
