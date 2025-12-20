// ============================================================================
// CRM EXPERT JUDICIAIRE - MODALE DE CONFIRMATION
// Remplace les confirm() natifs par une modale élégante et accessible
// ============================================================================

import React, { useState, useCallback, createContext, useContext, useRef, useEffect } from 'react';
import { AlertTriangle, Trash2, CheckCircle, Info, HelpCircle, X } from 'lucide-react';

// ============================================================================
// CONTEXTE DE CONFIRMATION
// ============================================================================

const ConfirmationContext = createContext(null);

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation doit être utilisé dans un ConfirmationProvider');
  }
  return context;
};

// ============================================================================
// COMPOSANT MODALE
// ============================================================================

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type,
  details
}) => {
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  // Focus sur le bouton annuler à l'ouverture (plus sûr par défaut)
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    danger: Trash2,
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info,
    question: HelpCircle
  };

  const iconColors = {
    danger: 'text-red-500 bg-red-100',
    warning: 'text-amber-500 bg-amber-100',
    success: 'text-green-500 bg-green-100',
    info: 'text-blue-500 bg-blue-100',
    question: 'text-purple-500 bg-purple-100'
  };

  const buttonColors = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    question: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
  };

  const Icon = icons[type] || icons.question;

  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Conteneur centré */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Contenu */}
          <div className="p-6">
            {/* Icône */}
            <div className="flex justify-center mb-4">
              <div className={`p-3 rounded-full ${iconColors[type]}`}>
                <Icon className="w-8 h-8" />
              </div>
            </div>

            {/* Titre */}
            <h3
              id="modal-title"
              className="text-lg font-semibold text-center text-gray-900 mb-2"
            >
              {title}
            </h3>

            {/* Message */}
            <p className="text-center text-gray-600 mb-4">
              {message}
            </p>

            {/* Détails optionnels */}
            {details && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600">
                {details}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
            <button
              ref={cancelButtonRef}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              {cancelText}
            </button>
            <button
              ref={confirmButtonRef}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${buttonColors[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROVIDER DE CONFIRMATION
// ============================================================================

export const ConfirmationProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    type: 'question',
    details: null,
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showConfirmation = useCallback((options) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || 'Confirmation',
        message: options.message || 'Êtes-vous sûr de vouloir continuer ?',
        confirmText: options.confirmText || 'Confirmer',
        cancelText: options.cancelText || 'Annuler',
        type: options.type || 'question',
        details: options.details || null,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  }, []);

  const closeModal = useCallback(() => {
    modalState.onCancel();
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, [modalState]);

  const confirmAndClose = useCallback(() => {
    modalState.onConfirm();
  }, [modalState]);

  // Raccourcis pour les différents types de confirmations
  const confirm = {
    // Confirmation de suppression
    delete: (itemName) => showConfirmation({
      type: 'danger',
      title: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer ${itemName} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      details: 'Cette action est irréversible.'
    }),

    // Confirmation d'action dangereuse
    danger: (title, message, details) => showConfirmation({
      type: 'danger',
      title,
      message,
      confirmText: 'Continuer',
      cancelText: 'Annuler',
      details
    }),

    // Avertissement
    warning: (title, message, details) => showConfirmation({
      type: 'warning',
      title,
      message,
      confirmText: 'Continuer',
      cancelText: 'Annuler',
      details
    }),

    // Confirmation de sauvegarde
    save: (itemName) => showConfirmation({
      type: 'success',
      title: 'Enregistrer les modifications',
      message: `Voulez-vous enregistrer les modifications apportées à ${itemName} ?`,
      confirmText: 'Enregistrer',
      cancelText: 'Annuler'
    }),

    // Question générale
    ask: (title, message, options = {}) => showConfirmation({
      type: 'question',
      title,
      message,
      confirmText: options.confirmText || 'Oui',
      cancelText: options.cancelText || 'Non',
      details: options.details
    }),

    // Confirmation personnalisée
    custom: showConfirmation
  };

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={confirmAndClose}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
        details={modalState.details}
      />
    </ConfirmationContext.Provider>
  );
};

export default ConfirmationModal;
