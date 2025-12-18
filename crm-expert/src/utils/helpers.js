// ============================================================================
// CRM EXPERT JUDICIAIRE - FONCTIONS UTILITAIRES
// ============================================================================

import { GARANTIES, TAUX_VACATIONS, ETAPES_TUNNEL } from '../data';

// ============================================================================
// FORMATAGE DATES
// ============================================================================

export const formatDateFr = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Calcul du nombre de jours entre deux dates
export const joursEntre = (date1, date2) => {
  if (!date1 || !date2) return 0;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDateCourt = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR');
};

export const formatHeure = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export const formatDuree = (secondes) => {
  const h = Math.floor(secondes / 3600);
  const m = Math.floor((secondes % 3600) / 60);
  const s = secondes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const formatDureeHeures = (heures) => {
  const h = Math.floor(heures);
  const m = Math.round((heures - h) * 60);
  return `${h}h${m > 0 ? m.toString().padStart(2, '0') : '00'}`;
};

// ============================================================================
// CALCULS DATES ET DÉLAIS
// ============================================================================

export const calculerDelaiRestant = (dateEcheance) => {
  const now = new Date();
  const echeance = new Date(dateEcheance);
  const diff = echeance - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const calculerDateLimiteConvocation = (dateReunion) => {
  const d = new Date(dateReunion);
  d.setDate(d.getDate() - 8);
  return d;
};

export const ajouterJours = (date, jours) => {
  const d = new Date(date);
  d.setDate(d.getDate() + jours);
  return d;
};

export const ajouterMois = (date, mois) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + mois);
  return d;
};

// ============================================================================
// CALCULS GARANTIES
// ============================================================================

export const calculerEcheances = (dateReception) => {
  if (!dateReception) return null;
  const date = new Date(dateReception);
  const echeances = {};
  
  Object.entries(GARANTIES).forEach(([key, garantie]) => {
    const echeance = new Date(date.getTime() + garantie.dureeJours * 24 * 60 * 60 * 1000);
    const joursRestants = Math.ceil((echeance - new Date()) / (1000 * 60 * 60 * 24));
    
    echeances[key] = {
      ...garantie,
      echeance: echeance.toISOString(),
      joursRestants,
      statut: joursRestants <= 0 ? 'expiree' : joursRestants <= 90 ? 'critique' : joursRestants <= 365 ? 'attention' : 'ok'
    };
  });
  
  return echeances;
};

export const getStatutGarantie = (joursRestants) => {
  if (joursRestants <= 0) return { label: 'Expirée', color: 'red', icon: 'XCircle' };
  if (joursRestants <= 30) return { label: 'Critique', color: 'red', icon: 'AlertTriangle' };
  if (joursRestants <= 90) return { label: 'Urgent', color: 'amber', icon: 'AlertCircle' };
  if (joursRestants <= 365) return { label: 'Attention', color: 'yellow', icon: 'Clock' };
  return { label: 'OK', color: 'green', icon: 'CheckCircle' };
};

// ============================================================================
// CALCULS FINANCIERS
// ============================================================================

export const calculerMontantVacations = (vacations) => {
  return vacations.reduce((total, v) => {
    const taux = TAUX_VACATIONS[v.type]?.taux || 0;
    return total + (v.duree * taux);
  }, 0);
};

export const calculerTotalFrais = (frais) => {
  return frais.reduce((acc, f) => acc + (f.montant || 0), 0);
};

export const calculerEtatFrais = (vacations, frais, provision = 0, tauxTVA = 0.20) => {
  const totalVacations = calculerMontantVacations(vacations);
  const totalFrais = calculerTotalFrais(frais);
  const totalHT = totalVacations + totalFrais;
  const tva = totalHT * tauxTVA;
  const totalTTC = totalHT + tva;
  const solde = provision - totalTTC;
  
  return {
    totalVacations,
    totalFrais,
    totalHT,
    tva,
    totalTTC,
    provision,
    solde,
    depassement: solde < 0
  };
};

export const formaterMontant = (montant, devise = '€') => {
  if (montant === null || montant === undefined || isNaN(montant)) return '0,00 €';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(montant);
};

// Alias pour compatibilité avec les imports existants
export const formatMontant = formaterMontant;

// Calcul TVA
export const calculerTVA = (montantHT, taux = 20) => {
  if (!montantHT || isNaN(montantHT)) return { ht: 0, tva: 0, ttc: 0 };
  const ht = parseFloat(montantHT);
  const tauxDecimal = taux / 100;
  const tva = ht * tauxDecimal;
  const ttc = ht + tva;
  return {
    ht: Math.round(ht * 100) / 100,
    tva: Math.round(tva * 100) / 100,
    ttc: Math.round(ttc * 100) / 100,
    taux
  };
};

// ============================================================================
// CALCULS PROGRESSION
// ============================================================================

export const calculerAvancementTunnel = (affaire) => {
  if (!affaire) return { etapesValidees: 0, totalEtapes: ETAPES_TUNNEL.length, pourcentage: 0 };
  
  let etapesValidees = 0;
  
  // Assignation
  if (affaire.mission?.questionsJuge?.length > 0) etapesValidees++;
  
  // Parties
  const parties = affaire.assignation;
  if (parties && (parties.demandeurs?.length > 0 || parties.defenseurs?.length > 0)) etapesValidees++;
  
  // 1ère réunion
  if (affaire.reunions?.some(r => r.type === 'accedif' || r.numero === 1)) etapesValidees++;
  
  // Constatations
  if (affaire.pathologies?.length > 0) etapesValidees++;
  
  // Dires
  if (affaire.dires?.length > 0) etapesValidees++;
  
  // Analyses
  if (affaire.analyses?.length > 0 || affaire.excellence?.analyses) etapesValidees++;
  
  // Chiffrage
  if (affaire.chiffrage?.scenarios?.length > 0) etapesValidees++;
  
  // Pré-rapport
  if (affaire.noteSynthese) etapesValidees++;
  
  // Rapport final
  if (affaire.rapportFinal) etapesValidees++;
  
  return { 
    etapesValidees, 
    totalEtapes: ETAPES_TUNNEL.length, 
    pourcentage: Math.round((etapesValidees / ETAPES_TUNNEL.length) * 100) 
  };
};

export const calculerScoreConformite = (verifications) => {
  if (!verifications || typeof verifications !== 'object') return 0;
  const items = Object.values(verifications);
  if (items.length === 0) return 0;
  const valides = items.filter(Boolean).length;
  return Math.round((valides / items.length) * 100);
};

export const calculerScoreProtection = (verifications) => {
  return calculerScoreConformite(verifications);
};

// ============================================================================
// GÉNÉRATION NUMÉROS
// ============================================================================

export const genererNumeroDocument = (type, affaireRef, index) => {
  const prefixes = {
    convocation: 'CONV',
    'compte-rendu': 'CR',
    'demande-pieces': 'DP',
    'note-synthese': 'NS',
    'rapport-final': 'RF',
    'etat-frais': 'EF'
  };
  return `${prefixes[type] || 'DOC'}-${affaireRef}-${String(index).padStart(3, '0')}`;
};

export const genererReferenceAffaire = (tribunal, annee) => {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${tribunal.substring(0, 3).toUpperCase()}-${annee}-${random}`;
};

// Alias pour compatibilité
export const genererReference = genererReferenceAffaire;

// ============================================================================
// MANIPULATION DE TEXTE
// ============================================================================

// Convertir en slug (URL-friendly)
export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Éviter les tirets multiples
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début/fin
};

// Mettre la première lettre en majuscule
export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Tronquer un texte avec ellipsis
export const truncate = (text, maxLength = 50, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length).trim() + suffix;
};

// ============================================================================
// VALIDATION
// ============================================================================

export const validerEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Alias pour compatibilité
export const isValidEmail = validerEmail;

export const validerTelephone = (tel) => {
  if (!tel) return false;
  const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return re.test(tel);
};

// Alias pour compatibilité
export const isValidPhone = validerTelephone;

// Formater un téléphone au format français
export const formatPhoneFr = (tel) => {
  if (!tel) return '';
  // Nettoyer le numéro
  const cleaned = tel.replace(/\D/g, '');
  
  // Si commence par 33 ou 0033, remplacer par 0
  let normalized = cleaned;
  if (cleaned.startsWith('0033')) {
    normalized = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('33') && cleaned.length > 9) {
    normalized = '0' + cleaned.slice(2);
  }
  
  // Formater en XX XX XX XX XX
  if (normalized.length === 10) {
    return normalized.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return tel;
};

export const validerSIRET = (siret) => {
  if (!siret || siret.length !== 14) return false;
  return /^\d{14}$/.test(siret);
};

// ============================================================================
// CALCULS TECHNIQUES
// ============================================================================

export const calculerSurface = (type, ...args) => {
  switch (type) {
    case 'rectangle': return args[0] * args[1];
    case 'triangle': return (args[0] * args[1]) / 2;
    case 'cercle': return Math.PI * Math.pow(args[0], 2);
    case 'trapeze': return ((args[0] + args[1]) * args[2]) / 2;
    default: return 0;
  }
};

export const calculerVolume = (type, ...args) => {
  switch (type) {
    case 'parallelepipede': return args[0] * args[1] * args[2];
    case 'cylindre': return Math.PI * Math.pow(args[0], 2) * args[1];
    default: return 0;
  }
};

export const calculerPente = (hauteur, longueur, unite = 'pourcentage') => {
  if (longueur === 0) return 0;
  const pente = hauteur / longueur;
  return unite === 'pourcentage' ? pente * 100 : pente * 1000;
};

export const calculerResistanceThermique = (epaisseur, lambda) => {
  if (lambda === 0) return 0;
  return epaisseur / lambda;
};

export const calculerCoefficientU = (resistance) => {
  if (resistance === 0) return 0;
  return 1 / resistance;
};

// ============================================================================
// FILTRAGE ET TRI
// ============================================================================

export const filtrerAffaires = (affaires, filtres) => {
  return affaires.filter(affaire => {
    if (filtres.statut && affaire.statut !== filtres.statut) return false;
    if (filtres.tribunal && affaire.tribunal !== filtres.tribunal) return false;
    if (filtres.recherche) {
      const search = filtres.recherche.toLowerCase();
      return (
        affaire.reference?.toLowerCase().includes(search) ||
        affaire.parties?.toLowerCase().includes(search) ||
        affaire.rg?.toLowerCase().includes(search)
      );
    }
    return true;
  });
};

export const trierAffaires = (affaires, critere, ordre = 'desc') => {
  return [...affaires].sort((a, b) => {
    let valA, valB;
    switch (critere) {
      case 'date':
        valA = new Date(a.dateCreation);
        valB = new Date(b.dateCreation);
        break;
      case 'echeance':
        valA = new Date(a.mission?.dateEcheance || '9999-12-31');
        valB = new Date(b.mission?.dateEcheance || '9999-12-31');
        break;
      case 'reference':
        valA = a.reference || '';
        valB = b.reference || '';
        break;
      default:
        return 0;
    }
    if (ordre === 'asc') return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });
};
