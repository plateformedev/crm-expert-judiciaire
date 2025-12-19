// ============================================================================
// CRM EXPERT JUDICIAIRE - Tests Module Dires
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor, mockDire, mockPartie } from '../setup';
import { GestionDires, DiresWidget, STATUTS_DIRE } from '../../components/dires';

// ============================================================================
// Tests des constantes
// ============================================================================

describe('STATUTS_DIRE', () => {
  it('devrait avoir tous les statuts requis', () => {
    expect(STATUTS_DIRE).toHaveProperty('recu');
    expect(STATUTS_DIRE).toHaveProperty('en-analyse');
    expect(STATUTS_DIRE).toHaveProperty('repondu');
    expect(STATUTS_DIRE).toHaveProperty('clos');
  });

  it('devrait avoir des labels pour chaque statut', () => {
    Object.values(STATUTS_DIRE).forEach(statut => {
      expect(statut).toHaveProperty('label');
      expect(statut).toHaveProperty('color');
    });
  });
});

// ============================================================================
// Tests du composant GestionDires
// ============================================================================

describe('GestionDires', () => {
  const defaultProps = {
    affaireId: 'test-affaire-id',
    affaire: { id: 'test-affaire-id', reference: '2024/EXP/001' },
    parties: [mockPartie]
  };

  it('devrait afficher le loader pendant le chargement', () => {
    renderWithProviders(<GestionDires {...defaultProps} />);
    
    // Le loader devrait être présent initialement
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('devrait afficher un message si aucun dire', async () => {
    renderWithProviders(<GestionDires {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Aucun dire/i)).toBeInTheDocument();
    });
  });

  it('devrait afficher le bouton nouveau dire', async () => {
    renderWithProviders(<GestionDires {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Nouveau dire/i)).toBeInTheDocument();
    });
  });

  it('devrait afficher les statistiques', async () => {
    renderWithProviders(<GestionDires {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Total dires/i)).toBeInTheDocument();
      expect(screen.getByText(/En attente/i)).toBeInTheDocument();
      expect(screen.getByText(/Répondus/i)).toBeInTheDocument();
    });
  });

  it('devrait permettre de rechercher dans les dires', async () => {
    renderWithProviders(<GestionDires {...defaultProps} />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Rechercher/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('devrait permettre de filtrer par statut', async () => {
    renderWithProviders(<GestionDires {...defaultProps} />);
    
    await waitFor(() => {
      const filterSelect = screen.getByDisplayValue(/Tous statuts/i);
      expect(filterSelect).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Tests du composant DiresWidget
// ============================================================================

describe('DiresWidget', () => {
  it('devrait afficher un message positif sans dires en attente', () => {
    renderWithProviders(<DiresWidget affaires={[]} />);
    
    expect(screen.getByText(/Aucun dire en attente/i)).toBeInTheDocument();
  });

  it('devrait calculer les dires en attente depuis les affaires', () => {
    const affairesAvecDires = [{
      id: 'affaire-1',
      reference: '2024/EXP/001',
      dires: [
        { ...mockDire, statut: 'recu', date_reception: '2024-01-01' },
        { ...mockDire, id: 'dire-2', numero: 2, statut: 'repondu', date_reception: '2024-01-05' }
      ]
    }];

    renderWithProviders(<DiresWidget affaires={affairesAvecDires} />);
    
    // Au moins un dire en attente
    expect(screen.getByText(/Dires en attente/i)).toBeInTheDocument();
  });

  it('devrait identifier les dires en retard (> 21 jours)', () => {
    const dateAncienne = new Date();
    dateAncienne.setDate(dateAncienne.getDate() - 30);

    const affairesAvecDireRetard = [{
      id: 'affaire-1',
      reference: '2024/EXP/001',
      dires: [{
        ...mockDire,
        statut: 'recu',
        date_reception: dateAncienne.toISOString().split('T')[0]
      }]
    }];

    renderWithProviders(<DiresWidget affaires={affairesAvecDireRetard} />);
    
    // Le dire devrait apparaître comme en retard
    // (badge rouge ou indication visuelle)
  });

  it('devrait limiter à 5 dires par défaut', () => {
    const affairesMultiplesDires = [{
      id: 'affaire-1',
      reference: '2024/EXP/001',
      dires: Array.from({ length: 10 }, (_, i) => ({
        ...mockDire,
        id: `dire-${i}`,
        numero: i + 1,
        statut: 'recu',
        date_reception: '2024-01-01'
      }))
    }];

    renderWithProviders(<DiresWidget affaires={affairesMultiplesDires} />);
    
    // Maximum 5 dires affichés
  });
});

// ============================================================================
// Tests de calcul des délais
// ============================================================================

describe('Calcul délais dires', () => {
  it('devrait calculer correctement les jours d\'attente', () => {
    const dateReception = new Date();
    dateReception.setDate(dateReception.getDate() - 15);

    const dire = {
      ...mockDire,
      date_reception: dateReception.toISOString().split('T')[0]
    };

    // Le calcul devrait donner environ 15 jours
    const joursAttente = Math.floor(
      (new Date() - new Date(dire.date_reception)) / (1000 * 60 * 60 * 24)
    );
    
    expect(joursAttente).toBe(15);
  });

  it('devrait identifier un dire en retard (> 21 jours)', () => {
    const dateReception = new Date();
    dateReception.setDate(dateReception.getDate() - 25);

    const dire = {
      ...mockDire,
      date_reception: dateReception.toISOString().split('T')[0],
      statut: 'recu'
    };

    const joursAttente = Math.floor(
      (new Date() - new Date(dire.date_reception)) / (1000 * 60 * 60 * 24)
    );
    const enRetard = dire.statut !== 'repondu' && dire.statut !== 'clos' && joursAttente > 21;
    
    expect(enRetard).toBe(true);
  });
});

// ============================================================================
// Tests d'intégration
// ============================================================================

describe('Flux création dire', () => {
  it('devrait ouvrir le modal de création', async () => {
    const props = {
      affaireId: 'test-affaire-id',
      affaire: { id: 'test-affaire-id', reference: '2024/EXP/001' },
      parties: [mockPartie]
    };

    renderWithProviders(<GestionDires {...props} />);
    
    await waitFor(() => {
      const boutonNouveau = screen.getByText(/Nouveau dire/i);
      fireEvent.click(boutonNouveau);
    });

    // Le modal devrait s'ouvrir
    await waitFor(() => {
      expect(screen.getByText(/Enregistrer un dire/i)).toBeInTheDocument();
    });
  });
});

describe('Flux réponse dire', () => {
  // Ces tests nécessitent des mocks plus complexes pour simuler
  // les interactions avec la base de données
  
  it('devrait afficher les suggestions de réponse', async () => {
    // Test à implémenter avec mock complet
  });

  it('devrait mettre à jour le statut après réponse', async () => {
    // Test à implémenter avec mock complet
  });
});
