// ============================================================================
// CRM EXPERT JUDICIAIRE - Configuration des tests
// ============================================================================

// IMPORTS EN HAUT DU FICHIER
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// ============================================================================
// Cleanup automatique après chaque test
// ============================================================================

afterEach(() => {
  cleanup();
});

// ============================================================================
// Mocks globaux
// ============================================================================

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock de matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de scrollTo
window.scrollTo = vi.fn();

// Mock de navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
});

// Mock de navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(),
  },
});

// Mock de URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// ============================================================================
// Mock Supabase
// ============================================================================

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
        download: vi.fn(() => Promise.resolve({ data: null, error: null })),
        remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } })),
      })),
    },
  })),
}));

// ============================================================================
// Helpers de test
// ============================================================================

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    nom: 'Dupont',
    prenom: 'Jean',
  },
};

export const mockAffaire = {
  id: 'test-affaire-id',
  reference: '2024/EXP/001',
  tribunal: 'TJ Paris',
  statut: 'en-cours',
  bien_adresse: '1 rue de Test',
  bien_ville: 'Paris',
  bien_code_postal: '75001',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockPartie = {
  id: 'test-partie-id',
  affaire_id: 'test-affaire-id',
  type: 'demandeur',
  nom: 'Martin',
  prenom: 'Paul',
  email: 'martin@example.com',
};

export const mockPathologie = {
  id: 'test-patho-id',
  affaire_id: 'test-affaire-id',
  numero: 1,
  intitule: 'Infiltrations toiture',
  localisation: 'Combles',
  description: 'Infiltrations au niveau des combles',
  garantie: 'Décennale',
};

export const mockReunion = {
  id: 'test-reunion-id',
  affaire_id: 'test-affaire-id',
  numero: 1,
  date_reunion: '2024-02-15T10:00:00Z',
  lieu: 'Sur site',
  statut: 'planifiee',
};

export const mockDire = {
  id: 'test-dire-id',
  affaire_id: 'test-affaire-id',
  numero: 1,
  partie_id: 'test-partie-id',
  date_reception: '2024-01-15',
  objet: 'Contestation chiffrage',
  contenu: 'Le demandeur conteste le chiffrage proposé...',
  statut: 'recu',
};

// ============================================================================
// Custom render avec providers
// ============================================================================

export function renderWithProviders(ui, options = {}) {
  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
