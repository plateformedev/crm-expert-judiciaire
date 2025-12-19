// ============================================================================
// CRM EXPERT JUDICIAIRE - SERVICE EXPORT EXCEL AVANCÉ
// Génération de fichiers Excel avec mise en forme professionnelle
// ============================================================================

import * as XLSX from 'xlsx';

// ============================================================================
// SERVICE EXCEL
// ============================================================================

export const excelService = {
  // --------------------------------------------------------------------------
  // Créer un classeur Excel
  // --------------------------------------------------------------------------
  createWorkbook() {
    return XLSX.utils.book_new();
  },

  // --------------------------------------------------------------------------
  // Ajouter une feuille avec données
  // --------------------------------------------------------------------------
  addSheet(workbook, sheetName, data, options = {}) {
    const {
      headers = null,
      columnWidths = [],
      styles = {}
    } = options;

    // Créer la feuille
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });

    // Appliquer les largeurs de colonnes
    if (columnWidths.length > 0) {
      worksheet['!cols'] = columnWidths.map(w => ({ wch: w }));
    }

    // Ajouter la feuille au classeur
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    return worksheet;
  },

  // --------------------------------------------------------------------------
  // Ajouter une feuille avec tableau formaté
  // --------------------------------------------------------------------------
  addFormattedSheet(workbook, sheetName, config) {
    const {
      title,
      subtitle,
      headers,
      data,
      totals,
      columnWidths,
      headerStyle,
      dateColumns = []
    } = config;

    const rows = [];
    let currentRow = 0;

    // Titre
    if (title) {
      rows.push([title]);
      currentRow++;
    }

    // Sous-titre
    if (subtitle) {
      rows.push([subtitle]);
      currentRow++;
    }

    // Ligne vide
    if (title || subtitle) {
      rows.push([]);
      currentRow++;
    }

    // En-têtes
    if (headers) {
      rows.push(headers);
      currentRow++;
    }

    // Données
    data.forEach(row => {
      const formattedRow = headers.map(h => {
        const value = row[h] ?? row[h.toLowerCase()] ?? '';
        // Formater les dates
        if (dateColumns.includes(h) && value) {
          return new Date(value).toLocaleDateString('fr-FR');
        }
        return value;
      });
      rows.push(formattedRow);
      currentRow++;
    });

    // Totaux
    if (totals) {
      rows.push([]);
      rows.push(totals);
    }

    // Créer la feuille
    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Largeurs de colonnes
    if (columnWidths) {
      worksheet['!cols'] = columnWidths.map(w => ({ wch: w }));
    }

    // Fusionner les cellules du titre
    if (title && headers) {
      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
      ];
      if (subtitle) {
        worksheet['!merges'].push(
          { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }
        );
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return worksheet;
  },

  // --------------------------------------------------------------------------
  // Télécharger le fichier Excel
  // --------------------------------------------------------------------------
  download(workbook, filename) {
    const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    XLSX.writeFile(workbook, finalFilename);
  },

  // --------------------------------------------------------------------------
  // Convertir en buffer (pour envoi par email, etc.)
  // --------------------------------------------------------------------------
  toBuffer(workbook) {
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  },

  // --------------------------------------------------------------------------
  // Lire un fichier Excel
  // --------------------------------------------------------------------------
  async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          resolve({ success: true, workbook });
        } catch (error) {
          reject({ success: false, error: error.message });
        }
      };
      reader.onerror = () => reject({ success: false, error: 'Erreur lecture fichier' });
      reader.readAsArrayBuffer(file);
    });
  },

  // --------------------------------------------------------------------------
  // Convertir une feuille en JSON
  // --------------------------------------------------------------------------
  sheetToJson(workbook, sheetName) {
    const sheet = workbook.Sheets[sheetName || workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
  }
};

// ============================================================================
// EXPORTS SPÉCIFIQUES MÉTIER
// ============================================================================

export const expertExports = {
  // --------------------------------------------------------------------------
  // Export liste des affaires
  // --------------------------------------------------------------------------
  exportAffaires(affaires, options = {}) {
    const { includeDetails = false } = options;

    const wb = excelService.createWorkbook();

    // Données formatées
    const data = affaires.map(a => ({
      'Référence': a.reference,
      'Statut': a.statut,
      'Tribunal': a.tribunal || '',
      'N° RG': a.rg || '',
      'Date ordonnance': a.date_ordonnance ? new Date(a.date_ordonnance).toLocaleDateString('fr-FR') : '',
      'Date échéance': a.date_echeance ? new Date(a.date_echeance).toLocaleDateString('fr-FR') : '',
      'Adresse bien': a.bien_adresse || '',
      'Ville': a.bien_ville || '',
      'Code postal': a.bien_code_postal || '',
      'Nb réunions': a.reunions?.length || 0,
      'Nb désordres': a.pathologies?.length || 0,
      'Provision': a.provision_montant || 0,
      'Provision reçue': a.provision_recue ? 'Oui' : 'Non'
    }));

    excelService.addFormattedSheet(wb, 'Affaires', {
      title: 'Liste des affaires',
      subtitle: `Export du ${new Date().toLocaleDateString('fr-FR')}`,
      headers: Object.keys(data[0] || {}),
      data,
      columnWidths: [15, 12, 20, 15, 15, 15, 30, 20, 10, 12, 12, 12, 12]
    });

    // Feuille détaillée si demandé
    if (includeDetails) {
      // Parties
      const partiesData = [];
      affaires.forEach(a => {
        (a.parties || []).forEach(p => {
          partiesData.push({
            'Référence affaire': a.reference,
            'Type': p.type,
            'Nom': p.nom || p.raison_sociale || '',
            'Prénom': p.prenom || '',
            'Email': p.email || '',
            'Téléphone': p.telephone || '',
            'Avocat': p.avocat_nom || ''
          });
        });
      });

      if (partiesData.length > 0) {
        excelService.addFormattedSheet(wb, 'Parties', {
          title: 'Parties à l\'expertise',
          headers: Object.keys(partiesData[0]),
          data: partiesData,
          columnWidths: [15, 12, 25, 15, 25, 15, 25]
        });
      }

      // Désordres
      const desordresData = [];
      affaires.forEach(a => {
        (a.pathologies || []).forEach(p => {
          desordresData.push({
            'Référence affaire': a.reference,
            'N°': p.numero,
            'Intitulé': p.intitule,
            'Localisation': p.localisation || '',
            'Garantie': p.garantie || '',
            'Chiffrage HT': p.chiffrage_ht || 0
          });
        });
      });

      if (desordresData.length > 0) {
        excelService.addFormattedSheet(wb, 'Désordres', {
          title: 'Désordres constatés',
          headers: Object.keys(desordresData[0]),
          data: desordresData,
          columnWidths: [15, 5, 40, 25, 15, 15]
        });
      }
    }

    const filename = `affaires_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    excelService.download(wb, filename);

    return { success: true, filename };
  },

  // --------------------------------------------------------------------------
  // Export état financier
  // --------------------------------------------------------------------------
  exportFinancier(affaires, periode = {}) {
    const wb = excelService.createWorkbook();

    // Calculs
    const provisionsTotal = affaires.reduce((sum, a) => sum + (parseFloat(a.provision_montant) || 0), 0);
    const provisionsRecues = affaires.filter(a => a.provision_recue).reduce((sum, a) => sum + (parseFloat(a.provision_montant) || 0), 0);
    const vacationsTotal = affaires.reduce((sum, a) => {
      const vacations = a.vacations || [];
      return sum + vacations.reduce((s, v) => s + (parseFloat(v.montant) || 0), 0);
    }, 0);

    // Données par affaire
    const data = affaires.map(a => {
      const vacations = a.vacations || [];
      const totalVacations = vacations.reduce((s, v) => s + (parseFloat(v.montant) || 0), 0);
      
      return {
        'Référence': a.reference,
        'Statut': a.statut,
        'Provision': parseFloat(a.provision_montant) || 0,
        'Provision reçue': a.provision_recue ? parseFloat(a.provision_montant) || 0 : 0,
        'Provision en attente': !a.provision_recue ? parseFloat(a.provision_montant) || 0 : 0,
        'Vacations': totalVacations,
        'Nb heures': vacations.reduce((s, v) => s + (parseFloat(v.heures) || 0), 0),
        'Solde': (parseFloat(a.provision_montant) || 0) - totalVacations
      };
    });

    // Totaux
    const totaux = [
      'TOTAL',
      '',
      provisionsTotal,
      provisionsRecues,
      provisionsTotal - provisionsRecues,
      vacationsTotal,
      '',
      provisionsTotal - vacationsTotal
    ];

    excelService.addFormattedSheet(wb, 'Synthèse', {
      title: 'État financier des expertises',
      subtitle: periode.debut && periode.fin 
        ? `Période du ${periode.debut} au ${periode.fin}`
        : `Au ${new Date().toLocaleDateString('fr-FR')}`,
      headers: Object.keys(data[0] || {}),
      data,
      totals: totaux,
      columnWidths: [15, 12, 15, 15, 15, 15, 12, 15]
    });

    // Feuille détail vacations
    const vacationsData = [];
    affaires.forEach(a => {
      (a.vacations || []).forEach(v => {
        vacationsData.push({
          'Référence affaire': a.reference,
          'Date': v.date ? new Date(v.date).toLocaleDateString('fr-FR') : '',
          'Description': v.description || '',
          'Heures': v.heures || 0,
          'Taux horaire': v.taux_horaire || 0,
          'Montant': v.montant || 0
        });
      });
    });

    if (vacationsData.length > 0) {
      excelService.addFormattedSheet(wb, 'Vacations', {
        title: 'Détail des vacations',
        headers: Object.keys(vacationsData[0]),
        data: vacationsData,
        columnWidths: [15, 12, 40, 10, 12, 12]
      });
    }

    const filename = `etat_financier_${new Date().toISOString().split('T')[0]}.xlsx`;
    excelService.download(wb, filename);

    return { success: true, filename };
  },

  // --------------------------------------------------------------------------
  // Export chiffrage détaillé
  // --------------------------------------------------------------------------
  exportChiffrage(affaire, chiffrage) {
    const wb = excelService.createWorkbook();

    // Informations générales
    const infoData = [
      ['CHIFFRAGE DES TRAVAUX RÉPARATOIRES'],
      [''],
      ['Référence affaire', affaire.reference],
      ['Adresse', `${affaire.bien_adresse}, ${affaire.bien_code_postal} ${affaire.bien_ville}`],
      ['Date du chiffrage', new Date().toLocaleDateString('fr-FR')],
      ['']
    ];

    // Postes de chiffrage
    const postesHeaders = ['N°', 'Désignation', 'Unité', 'Quantité', 'P.U. HT', 'Total HT'];
    const postesData = (chiffrage.postes || []).map((p, i) => [
      i + 1,
      p.designation,
      p.unite,
      p.quantite,
      p.prix_unitaire,
      p.total_ht
    ]);

    // Totaux
    const totalHT = (chiffrage.postes || []).reduce((s, p) => s + (parseFloat(p.total_ht) || 0), 0);
    const tauxTVA = chiffrage.taux_tva || 20;
    const tva = totalHT * (tauxTVA / 100);
    const totalTTC = totalHT + tva;

    const totauxData = [
      [''],
      ['', '', '', '', 'Total HT', totalHT],
      ['', '', '', '', `TVA ${tauxTVA}%`, tva],
      ['', '', '', '', 'Total TTC', totalTTC]
    ];

    // Créer la feuille
    const allData = [...infoData, postesHeaders, ...postesData, ...totauxData];
    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Largeurs colonnes
    ws['!cols'] = [
      { wch: 5 },
      { wch: 50 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 }
    ];

    // Fusionner titre
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Chiffrage');

    const filename = `chiffrage_${affaire.reference.replace(/\//g, '-')}.xlsx`;
    excelService.download(wb, filename);

    return { success: true, filename };
  },

  // --------------------------------------------------------------------------
  // Export matrice d'imputabilité
  // --------------------------------------------------------------------------
  exportImputabilite(affaire, matrice, intervenants) {
    const wb = excelService.createWorkbook();

    // En-têtes : Désordre + tous les intervenants
    const headers = ['Désordre', ...intervenants.map(i => i.nom || i.raison_sociale), 'Total'];

    // Données
    const data = (affaire.pathologies || []).map(p => {
      const row = {
        'Désordre': `D${p.numero} - ${p.intitule}`
      };

      let total = 0;
      intervenants.forEach(i => {
        const cell = matrice[p.id]?.[i.id];
        const pourcentage = cell?.pourcentage || 0;
        row[i.nom || i.raison_sociale] = pourcentage > 0 ? `${pourcentage}%` : '-';
        total += pourcentage;
      });

      row['Total'] = `${total}%`;
      return row;
    });

    excelService.addFormattedSheet(wb, 'Imputabilité', {
      title: 'Matrice d\'imputabilité',
      subtitle: `Affaire ${affaire.reference}`,
      headers,
      data,
      columnWidths: [40, ...intervenants.map(() => 15), 10]
    });

    // Feuille justifications
    const justifData = [];
    (affaire.pathologies || []).forEach(p => {
      intervenants.forEach(i => {
        const cell = matrice[p.id]?.[i.id];
        if (cell?.pourcentage > 0) {
          justifData.push({
            'Désordre': `D${p.numero}`,
            'Intervenant': i.nom || i.raison_sociale,
            'Pourcentage': `${cell.pourcentage}%`,
            'Fondement': cell.fondement || '',
            'DTU': cell.dtuNonRespecte || '',
            'Justification': cell.justification || ''
          });
        }
      });
    });

    if (justifData.length > 0) {
      excelService.addFormattedSheet(wb, 'Justifications', {
        title: 'Justifications des imputations',
        headers: Object.keys(justifData[0]),
        data: justifData,
        columnWidths: [10, 25, 12, 30, 30, 50]
      });
    }

    const filename = `imputabilite_${affaire.reference.replace(/\//g, '-')}.xlsx`;
    excelService.download(wb, filename);

    return { success: true, filename };
  },

  // --------------------------------------------------------------------------
  // Export planning des réunions
  // --------------------------------------------------------------------------
  exportPlanning(reunions, periode) {
    const wb = excelService.createWorkbook();

    const data = reunions.map(r => ({
      'Date': r.date_reunion ? new Date(r.date_reunion).toLocaleDateString('fr-FR') : '',
      'Heure': r.heure_debut || '',
      'Affaire': r.affaire?.reference || '',
      'Type': r.type || 'Expertise',
      'Lieu': r.lieu || '',
      'Statut': r.statut || '',
      'Participants': (r.presences || []).map(p => p.nom).join(', ')
    }));

    excelService.addFormattedSheet(wb, 'Planning', {
      title: 'Planning des réunions',
      subtitle: periode ? `${periode.debut} - ${periode.fin}` : '',
      headers: Object.keys(data[0] || {}),
      data,
      columnWidths: [12, 8, 15, 15, 30, 12, 40]
    });

    const filename = `planning_reunions_${new Date().toISOString().split('T')[0]}.xlsx`;
    excelService.download(wb, filename);

    return { success: true, filename };
  }
};

// ============================================================================
// COMPOSANT BOUTON EXPORT
// ============================================================================

import React, { useState } from 'react';
import { Download, FileSpreadsheet, Loader2, Check } from 'lucide-react';

export const ExportExcelButton = ({
  type,
  data,
  options = {},
  label = 'Exporter Excel',
  variant = 'secondary'
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      let result;
      switch (type) {
        case 'affaires':
          result = expertExports.exportAffaires(data, options);
          break;
        case 'financier':
          result = expertExports.exportFinancier(data, options);
          break;
        case 'chiffrage':
          result = expertExports.exportChiffrage(data.affaire, data.chiffrage);
          break;
        case 'imputabilite':
          result = expertExports.exportImputabilite(data.affaire, data.matrice, data.intervenants);
          break;
        case 'planning':
          result = expertExports.exportPlanning(data, options);
          break;
        default:
          throw new Error('Type d\'export non supporté');
      }

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Erreur export:', error);
    } finally {
      setLoading(false);
    }
  };

  const baseClass = variant === 'primary'
    ? 'bg-gold-500 hover:bg-gold-600 text-white'
    : 'bg-white border border-neutral-200 hover:border-gold-500 text-neutral-700';

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${baseClass} disabled:opacity-50`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : success ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <FileSpreadsheet className="w-5 h-5" />
      )}
      {label}
    </button>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  excelService,
  expertExports,
  ExportExcelButton
};
