// ============================================================================
// CRM EXPERT JUDICIAIRE - Tests Utilitaires
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  formatDateFr,
  formatDateCourt,
  formatMontant,
  formaterMontant,
  joursEntre,
  genererReference,
  genererReferenceAffaire,
  slugify,
  capitalizeFirst,
  truncate,
  isValidEmail,
  validerEmail,
  isValidPhone,
  validerTelephone,
  formatPhoneFr,
  calculerTVA,
  calculerDelaiRestant,
  ajouterJours
} from '../../utils/helpers';

// ============================================================================
// Tests formatDateFr (format long avec jour de la semaine)
// ============================================================================

describe('formatDateFr', () => {
  it('devrait formater une date ISO en format français long', () => {
    const date = '2024-01-15';
    const result = formatDateFr(date);
    expect(result).toContain('15');
    expect(result).toContain('janvier');
    expect(result).toContain('2024');
  });

  it('devrait inclure le jour de la semaine', () => {
    const date = new Date(2024, 0, 15); // Lundi 15 janvier 2024
    const result = formatDateFr(date);
    expect(result.toLowerCase()).toContain('lundi');
  });

  it('devrait retourner chaîne vide pour date invalide', () => {
    expect(formatDateFr(null)).toBe('');
    expect(formatDateFr(undefined)).toBe('');
    expect(formatDateFr('')).toBe('');
  });

  it('devrait gérer une chaîne de date invalide', () => {
    expect(formatDateFr('not-a-date')).toBe('');
  });
});

// ============================================================================
// Tests formatMontant
// ============================================================================

describe('formatMontant', () => {
  it('devrait formater un nombre en euros', () => {
    const result = formatMontant(1234.56);
    expect(result).toMatch(/1[\s\u202f]?234,56[\s\u202f]?€/);
  });

  it('devrait gérer les grands nombres', () => {
    const result = formatMontant(1234567.89);
    expect(result).toContain('234');
    expect(result).toContain('567');
  });

  it('devrait gérer zéro', () => {
    const result = formatMontant(0);
    expect(result).toMatch(/0,00[\s\u202f]?€/);
  });

  it('devrait gérer les valeurs négatives', () => {
    const result = formatMontant(-500);
    expect(result).toContain('500');
  });

  it('devrait retourner 0€ pour valeur invalide', () => {
    expect(formatMontant(null)).toMatch(/0,00[\s\u202f]?€/);
    expect(formatMontant(undefined)).toMatch(/0,00[\s\u202f]?€/);
  });

  it('formaterMontant et formatMontant doivent être identiques', () => {
    expect(formaterMontant(100)).toBe(formatMontant(100));
  });
});

// ============================================================================
// Tests joursEntre
// ============================================================================

describe('joursEntre', () => {
  it('devrait calculer les jours entre deux dates', () => {
    const date1 = new Date(2024, 0, 1);
    const date2 = new Date(2024, 0, 10);
    expect(joursEntre(date1, date2)).toBe(9);
  });

  it('devrait retourner un nombre négatif si date1 > date2', () => {
    const date1 = new Date(2024, 0, 10);
    const date2 = new Date(2024, 0, 1);
    expect(joursEntre(date1, date2)).toBe(-9);
  });

  it('devrait retourner 0 pour la même date', () => {
    const date = new Date(2024, 0, 15);
    expect(joursEntre(date, date)).toBe(0);
  });

  it('devrait gérer les chaînes de date ISO', () => {
    expect(joursEntre('2024-01-01', '2024-01-15')).toBe(14);
  });

  it('devrait retourner 0 pour dates nulles', () => {
    expect(joursEntre(null, new Date())).toBe(0);
    expect(joursEntre(new Date(), null)).toBe(0);
  });
});

// ============================================================================
// Tests genererReference
// ============================================================================

describe('genererReference / genererReferenceAffaire', () => {
  it('devrait générer une référence au format TRI-YYYY-XXXX', () => {
    const ref = genererReference('Paris', 2024);
    expect(ref).toMatch(/^PAR-2024-\d{4}$/);
  });

  it('devrait utiliser les 3 premières lettres du tribunal', () => {
    const ref = genererReferenceAffaire('Versailles', 2024);
    expect(ref).toContain('VER-');
  });

  it('devrait être en majuscules', () => {
    const ref = genererReference('marseille', 2024);
    expect(ref).toMatch(/^MAR-/);
  });

  it('genererReference et genererReferenceAffaire doivent être identiques', () => {
    const ref1 = genererReference('Lyon', 2024);
    const ref2 = genererReferenceAffaire('Lyon', 2024);
    expect(ref1.substring(0, 9)).toBe(ref2.substring(0, 9));
  });
});

// ============================================================================
// Tests slugify
// ============================================================================

describe('slugify', () => {
  it('devrait convertir en minuscules', () => {
    expect(slugify('HELLO')).toBe('hello');
  });

  it('devrait remplacer les espaces par des tirets', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('devrait supprimer les accents', () => {
    expect(slugify('éléphant')).toBe('elephant');
    expect(slugify('café')).toBe('cafe');
  });

  it('devrait supprimer les caractères spéciaux', () => {
    expect(slugify('hello@world!')).toBe('helloworld');
  });

  it('devrait gérer les espaces multiples', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('devrait gérer une chaîne vide', () => {
    expect(slugify('')).toBe('');
    expect(slugify(null)).toBe('');
  });
});

// ============================================================================
// Tests capitalizeFirst
// ============================================================================

describe('capitalizeFirst', () => {
  it('devrait mettre la première lettre en majuscule', () => {
    expect(capitalizeFirst('hello')).toBe('Hello');
  });

  it('devrait gérer une chaîne vide', () => {
    expect(capitalizeFirst('')).toBe('');
    expect(capitalizeFirst(null)).toBe('');
  });

  it('devrait gérer une seule lettre', () => {
    expect(capitalizeFirst('a')).toBe('A');
  });

  it('devrait mettre le reste en minuscules', () => {
    expect(capitalizeFirst('HELLO')).toBe('Hello');
  });
});

// ============================================================================
// Tests truncate
// ============================================================================

describe('truncate', () => {
  it('devrait tronquer une longue chaîne', () => {
    const text = 'Ceci est une très longue chaîne de caractères';
    const result = truncate(text, 20);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(result).toContain('...');
  });

  it('devrait ne pas modifier une chaîne courte', () => {
    const text = 'Court';
    expect(truncate(text, 20)).toBe('Court');
  });

  it('devrait permettre un suffixe personnalisé', () => {
    const text = 'Ceci est une très longue chaîne';
    const result = truncate(text, 20, ' [...]');
    expect(result).toContain('[...]');
  });

  it('devrait gérer une chaîne vide', () => {
    expect(truncate('')).toBe('');
    expect(truncate(null)).toBe('');
  });
});

// ============================================================================
// Tests validation email
// ============================================================================

describe('isValidEmail / validerEmail', () => {
  it('devrait valider un email correct', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.fr')).toBe(true);
  });

  it('devrait rejeter un email invalide', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });

  it('isValidEmail et validerEmail doivent être identiques', () => {
    expect(isValidEmail('test@test.com')).toBe(validerEmail('test@test.com'));
  });
});

// ============================================================================
// Tests validation téléphone
// ============================================================================

describe('isValidPhone / validerTelephone', () => {
  it('devrait valider un numéro français', () => {
    expect(isValidPhone('0612345678')).toBe(true);
    expect(isValidPhone('06 12 34 56 78')).toBe(true);
    expect(isValidPhone('+33612345678')).toBe(true);
  });

  it('devrait rejeter un numéro invalide', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('abcdefghij')).toBe(false);
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone(null)).toBe(false);
  });

  it('isValidPhone et validerTelephone doivent être identiques', () => {
    expect(isValidPhone('0612345678')).toBe(validerTelephone('0612345678'));
  });
});

// ============================================================================
// Tests formatage téléphone
// ============================================================================

describe('formatPhoneFr', () => {
  it('devrait formater un numéro français', () => {
    expect(formatPhoneFr('0612345678')).toBe('06 12 34 56 78');
  });

  it('devrait gérer un numéro avec +33', () => {
    expect(formatPhoneFr('+33612345678')).toBe('06 12 34 56 78');
  });

  it('devrait gérer un numéro avec 0033', () => {
    expect(formatPhoneFr('0033612345678')).toBe('06 12 34 56 78');
  });

  it('devrait retourner tel quel si invalide', () => {
    expect(formatPhoneFr('123')).toBe('123');
  });

  it('devrait gérer une chaîne vide', () => {
    expect(formatPhoneFr('')).toBe('');
    expect(formatPhoneFr(null)).toBe('');
  });
});

// ============================================================================
// Tests calcul TVA
// ============================================================================

describe('calculerTVA', () => {
  it('devrait calculer la TVA à 20%', () => {
    const result = calculerTVA(100, 20);
    expect(result.ht).toBe(100);
    expect(result.tva).toBe(20);
    expect(result.ttc).toBe(120);
    expect(result.taux).toBe(20);
  });

  it('devrait calculer la TVA à 10%', () => {
    const result = calculerTVA(100, 10);
    expect(result.tva).toBe(10);
    expect(result.ttc).toBe(110);
  });

  it('devrait calculer la TVA à 5.5%', () => {
    const result = calculerTVA(100, 5.5);
    expect(result.tva).toBeCloseTo(5.5, 2);
    expect(result.ttc).toBeCloseTo(105.5, 2);
  });

  it('devrait utiliser 20% par défaut', () => {
    const result = calculerTVA(100);
    expect(result.tva).toBe(20);
  });

  it('devrait gérer les valeurs nulles', () => {
    const result = calculerTVA(null);
    expect(result.ht).toBe(0);
    expect(result.tva).toBe(0);
    expect(result.ttc).toBe(0);
  });
});

// ============================================================================
// Tests calculerDelaiRestant
// ============================================================================

describe('calculerDelaiRestant', () => {
  it('devrait calculer le délai restant positif', () => {
    const futur = new Date();
    futur.setDate(futur.getDate() + 10);
    const delai = calculerDelaiRestant(futur);
    expect(delai).toBeGreaterThanOrEqual(9);
    expect(delai).toBeLessThanOrEqual(11);
  });

  it('devrait retourner un délai négatif pour une date passée', () => {
    const passe = new Date();
    passe.setDate(passe.getDate() - 5);
    const delai = calculerDelaiRestant(passe);
    expect(delai).toBeLessThan(0);
  });
});

// ============================================================================
// Tests ajouterJours
// ============================================================================

describe('ajouterJours', () => {
  it('devrait ajouter des jours à une date', () => {
    const date = new Date(2024, 0, 1);
    const result = ajouterJours(date, 10);
    expect(result.getDate()).toBe(11);
    expect(result.getMonth()).toBe(0);
  });

  it('devrait gérer le passage au mois suivant', () => {
    const date = new Date(2024, 0, 25);
    const result = ajouterJours(date, 10);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(4);
  });

  it('devrait permettre de soustraire des jours', () => {
    const date = new Date(2024, 0, 15);
    const result = ajouterJours(date, -5);
    expect(result.getDate()).toBe(10);
  });
});
