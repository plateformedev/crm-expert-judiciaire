// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE INTÉGRATIONS
// Google Places, AR24, OPALEXE, Assistant IA, La Poste
// ============================================================================

// Google Places & Maps
export {
  AdresseAutocomplete,
  LienGoogleMaps,
  AdresseCliquable,
  FormulaireAdresse,
  useGooglePlaces
} from './GooglePlaces';

// AR24 - LRAR dématérialisées
export {
  AR24Panel,
  AR24Widget
} from './AR24Panel';

// OPALEXE - Échanges juridictions
export {
  OpalexePanel,
  OpalexeWidget,
  opalexeService
} from './OpalexePanel';

// Assistant IA rédaction
export {
  AssistantIA,
  AssistantIAWidget,
  iaService
} from './AssistantIA';

// Suivi La Poste
export {
  SuiviLaPoste,
  SuiviLaPosteWidget,
  laPosteService
} from './SuiviLaPoste';

// Default export
import AdresseAutocomplete from './GooglePlaces';
export default AdresseAutocomplete;
