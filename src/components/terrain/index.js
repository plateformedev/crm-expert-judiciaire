// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE TERRAIN
// Composants pour utilisation sur site (photos, notes, dictée, hors-ligne)
// ============================================================================

export {
  ModeTerrain,
  OfflineIndicator,
  useOfflineSync
} from './ModeTerrain';

export {
  PhotoCaptureTerrain,
  PhotoQuickCapture,
  useGeolocation,
  useCamera
} from './PhotoCaptureTerrain';

// Re-export depuis dictée
export {
  DicteeTerrain,
  DicteeRealtimeWidget,
  useRealtimeTranscription,
  TRANSCRIPTION_MODES,
  webSpeechService,
  whisperService
} from '../dictee';

// Default export
import ModeTerrain from './ModeTerrain';
export default ModeTerrain;
