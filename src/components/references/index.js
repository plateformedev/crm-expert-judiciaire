// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE RÉFÉRENCES
// Base documentaire DTU et jurisprudence pour expertise BTP
// ============================================================================

export {
  BaseDTU,
  DTU_DATABASE,
  CATEGORIES_DTU,
  DTUSearchWidget
} from './BaseDTU';

export {
  BaseJurisprudence,
  JURISPRUDENCE_DATABASE,
  THEMES_JURISPRUDENCE,
  JurisprudenceSearchWidget
} from './BaseJurisprudence';

// Default exports
import BaseDTU from './BaseDTU';
import BaseJurisprudence from './BaseJurisprudence';

export default { BaseDTU, BaseJurisprudence };
