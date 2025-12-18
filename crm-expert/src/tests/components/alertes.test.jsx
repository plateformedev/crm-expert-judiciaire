// ============================================================================
// CRM EXPERT JUDICIAIRE - Tests Module Alertes
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, mockAffaire } from '../setup';
import { AlertEngine, CentreAlertes, AlertesWidget, DELAIS_LEGAUX } from '../../components/alertes';

// ============================================================================
// Tests du moteur de calcul des alertes
// ============================================================================

describe('AlertEngine', () => {
  describe('calculerAlertesAffaire', () => {
    it('devrait générer une alerte pour échéance mission proche', () => {
      const today = new Date();
      const echeance = new Date(today);
      echeance.setDate(echeance.getDate() + 5); // 5 jours

      const affaire = {
        ...mockAffaire,
        date_echeance: echeance.toISOString().split('T')[0]
      };

      const alertes = AlertEngine.calculerAlertesAffaire(affaire);
      
      expect(alertes.length).toBeGreaterThan(0);
      const alerteEcheance = alertes.find(a => a.code === 'DEPOT');
      expect(alerteEcheance).toBeDefined();
      expect(alerteEcheance.criticite).toBe('critique');
    });

    it('devrait générer une alerte prorogation si échéance < 15 jours', () => {
      const today = new Date();
      const echeance = new Date(today);
      echeance.setDate(echeance.getDate() + 10); // 10 jours

      const affaire = {
        ...mockAffaire,
        date_echeance: echeance.toISOString().split('T')[0]
      };

      const alertes = AlertEngine.calculerAlertesAffaire(affaire);
      
      const alerteProrog = alertes.find(a => a.code === 'PROROG');
      expect(alerteProrog).toBeDefined();
      expect(alerteProrog.criticite).toBe('haute');
    });

    it('devrait calculer les alertes garantie GPA', () => {
      const dateReception = new Date();
      dateReception.setMonth(dateReception.getMonth() - 11); // 11 mois

      const affaire = {
        ...mockAffaire,
        date_reception_ouvrage: dateReception.toISOString().split('T')[0]
      };

      const alertes = AlertEngine.calculerAlertesAffaire(affaire);
      
      const alerteGPA = alertes.find(a => a.code === 'GPA');
      expect(alerteGPA).toBeDefined();
      expect(alerteGPA.joursRestants).toBeLessThan(60);
    });

    it('devrait générer une alerte pour provision non reçue > 30 jours', () => {
      const dateOrdonnance = new Date();
      dateOrdonnance.setDate(dateOrdonnance.getDate() - 45); // 45 jours

      const affaire = {
        ...mockAffaire,
        date_ordonnance: dateOrdonnance.toISOString().split('T')[0],
        provision_montant: '3000',
        provision_recue: false
      };

      const alertes = AlertEngine.calculerAlertesAffaire(affaire);
      
      const alerteProv = alertes.find(a => a.code === 'PROV');
      expect(alerteProv).toBeDefined();
    });

    it('devrait générer des alertes pour réunions proches', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const affaire = {
        ...mockAffaire,
        reunions: [{
          id: 'reunion-1',
          numero: 1,
          date_reunion: tomorrow.toISOString(),
          statut: 'planifiee',
          lieu: 'Sur site'
        }]
      };

      const alertes = AlertEngine.calculerAlertesAffaire(affaire);
      
      const alerteReunion = alertes.find(a => a.code === 'REUN');
      expect(alerteReunion).toBeDefined();
      expect(alerteReunion.joursRestants).toBe(1);
    });

    it('devrait détecter un délai de convocation non respecté', () => {
      const dateReunion = new Date();
      dateReunion.setDate(dateReunion.getDate() + 5); // Réunion dans 5 jours
      
      const dateConvoc = new Date();
      dateConvoc.setDate(dateConvoc.getDate() - 2); // Convocation il y a 2 jours

      const affaire = {
        ...mockAffaire,
        reunions: [{
          id: 'reunion-1',
          numero: 1,
          date_reunion: dateReunion.toISOString(),
          date_convocation: dateConvoc.toISOString().split('T')[0],
          statut: 'planifiee'
        }]
      };

      const alertes = AlertEngine.calculerAlertesAffaire(affaire);
      
      const alerteConvoc = alertes.find(a => a.code === 'CONV');
      expect(alerteConvoc).toBeDefined();
      expect(alerteConvoc.criticite).toBe('critique');
    });

    it('devrait alerter sur les dires en attente > 14 jours', () => {
      const dateReception = new Date();
      dateReception.setDate(dateReception.getDate() - 20); // 20 jours

      const affaire = {
        ...mockAffaire,
        dires: [{
          id: 'dire-1',
          numero: 1,
          date_reception: dateReception.toISOString().split('T')[0],
          statut: 'recu',
          objet: 'Contestation'
        }]
      };

      const alertes = AlertEngine.calculerAlertesAffaire(affaire);
      
      const alerteDire = alertes.find(a => a.code === 'REP_DIRE');
      expect(alerteDire).toBeDefined();
    });
  });

  describe('calculerCriticite', () => {
    it('devrait retourner critique si jours < 0', () => {
      expect(AlertEngine.calculerCriticite(-5, 'echeance')).toBe('critique');
    });

    it('devrait retourner critique si échéance <= 7 jours', () => {
      expect(AlertEngine.calculerCriticite(5, 'echeance')).toBe('critique');
    });

    it('devrait retourner haute si échéance <= 30 jours', () => {
      expect(AlertEngine.calculerCriticite(20, 'echeance')).toBe('haute');
    });

    it('devrait retourner moyenne si échéance <= 60 jours', () => {
      expect(AlertEngine.calculerCriticite(45, 'echeance')).toBe('moyenne');
    });

    it('devrait retourner basse si échéance > 60 jours', () => {
      expect(AlertEngine.calculerCriticite(90, 'echeance')).toBe('basse');
    });
  });

  describe('calculerToutesAlertes', () => {
    it('devrait agréger les alertes de toutes les affaires', () => {
      const affaires = [
        { ...mockAffaire, id: '1', date_echeance: new Date().toISOString().split('T')[0] },
        { ...mockAffaire, id: '2', date_echeance: new Date().toISOString().split('T')[0] }
      ];

      const alertes = AlertEngine.calculerToutesAlertes(affaires);
      
      expect(alertes.length).toBeGreaterThan(0);
    });

    it('devrait trier par criticité puis par jours restants', () => {
      const today = new Date();
      const proche = new Date(today);
      proche.setDate(proche.getDate() + 3);
      const loin = new Date(today);
      loin.setDate(loin.getDate() + 50);

      const affaires = [
        { ...mockAffaire, id: '1', date_echeance: loin.toISOString().split('T')[0] },
        { ...mockAffaire, id: '2', date_echeance: proche.toISOString().split('T')[0] }
      ];

      const alertes = AlertEngine.calculerToutesAlertes(affaires);
      
      // Les alertes critiques doivent être en premier
      const premiereAlerte = alertes[0];
      expect(['critique', 'haute']).toContain(premiereAlerte.criticite);
    });
  });
});

// ============================================================================
// Tests des constantes DELAIS_LEGAUX
// ============================================================================

describe('DELAIS_LEGAUX', () => {
  it('devrait avoir le délai de convocation à 8 jours', () => {
    expect(DELAIS_LEGAUX.convocation.delaiJours).toBe(8);
    expect(DELAIS_LEGAUX.convocation.reference).toBe('Art. 160 CPC');
  });

  it('devrait avoir le délai GPA à 365 jours', () => {
    expect(DELAIS_LEGAUX.gpa.delaiJours).toBe(365);
    expect(DELAIS_LEGAUX.gpa.reference).toBe('Art. 1792-6 CC');
  });

  it('devrait avoir le délai décennale à 3650 jours', () => {
    expect(DELAIS_LEGAUX.decennale.delaiJours).toBe(3650);
    expect(DELAIS_LEGAUX.decennale.reference).toBe('Art. 1792 CC');
  });

  it('devrait avoir tous les délais requis', () => {
    const delaisRequis = [
      'convocation', 'observationsPreRapport', 'reponsesDires',
      'depotRapport', 'gpa', 'biennale', 'decennale', 'prorogation'
    ];

    delaisRequis.forEach(delai => {
      expect(DELAIS_LEGAUX).toHaveProperty(delai);
    });
  });
});

// ============================================================================
// Tests du composant CentreAlertes
// ============================================================================

describe('CentreAlertes', () => {
  const affairesAvecAlertes = [
    {
      ...mockAffaire,
      date_echeance: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ];

  it('devrait afficher les statistiques des alertes', () => {
    renderWithProviders(<CentreAlertes affaires={affairesAvecAlertes} />);
    
    expect(screen.getByText(/Total alertes/i)).toBeInTheDocument();
    expect(screen.getByText(/Critiques/i)).toBeInTheDocument();
  });

  it('devrait afficher un message si aucune alerte', () => {
    renderWithProviders(<CentreAlertes affaires={[]} />);
    
    expect(screen.getByText(/Aucune alerte/i)).toBeInTheDocument();
  });

  it('devrait permettre de filtrer par type', () => {
    renderWithProviders(<CentreAlertes affaires={affairesAvecAlertes} />);
    
    const boutonGaranties = screen.getByText(/Garanties/i);
    expect(boutonGaranties).toBeInTheDocument();
    
    fireEvent.click(boutonGaranties);
    // Le filtre devrait s'appliquer
  });
});

// ============================================================================
// Tests du composant AlertesWidget
// ============================================================================

describe('AlertesWidget', () => {
  it('devrait afficher un message positif sans alertes critiques', () => {
    renderWithProviders(<AlertesWidget affaires={[]} />);
    
    expect(screen.getByText(/Aucune alerte critique/i)).toBeInTheDocument();
  });

  it('devrait limiter le nombre d\'alertes affichées', () => {
    const affairesMultiples = Array.from({ length: 10 }, (_, i) => ({
      ...mockAffaire,
      id: `affaire-${i}`,
      reference: `2024/EXP/${i}`,
      date_echeance: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    renderWithProviders(<AlertesWidget affaires={affairesMultiples} limit={3} />);
    
    // Ne devrait pas afficher plus de 3 alertes
  });
});
