// ============================================================================
// CRM EXPERT JUDICIAIRE - INDEX DES COMPOSANTS UI
// ============================================================================

// Composants UI de base
export {
  Card,
  Badge,
  Button,
  Input,
  Select,
  Textarea,
  ModalBase,
  Tabs,
  ProgressBar,
  Tooltip,
  EmptyState,
  LoadingSpinner,
  DropZone
} from './index.jsx';

// Système de notifications Toast
export { ToastProvider, useToast } from './Toast';

// Modale de confirmation
export { ConfirmationProvider, useConfirmation } from './ConfirmationModal';

// Aide contextuelle et glossaire juridique
export { HelpTooltip, HelpPanel, HelpButton, useHelp } from './HelpTooltip';

// Bannière mode démonstration
export { DemoBanner, DemoIndicator } from './DemoBanner';

// Illustrations SVG pour états vides
export {
  IllustrationDossiers,
  IllustrationDocuments,
  IllustrationPhotos,
  IllustrationRecherche,
  IllustrationCalendrier,
  IllustrationContacts,
  IllustrationNotifications,
  IllustrationSucces,
  IllustrationErreur,
  IllustrationDashboard
} from './Illustrations';
