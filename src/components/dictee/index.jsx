// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE DICTÉE VOCALE
// Transcription temps réel avec Whisper API pour prise de notes terrain
// ============================================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Mic, MicOff, Square, Play, Pause, Trash2, Save, Copy,
  Volume2, VolumeX, Settings, Download, FileText, Clock,
  CheckCircle, AlertCircle, Loader2, RefreshCw, Wand2
} from 'lucide-react';
import { Card, Badge, Button, ModalBase } from '../ui';
import { formatDuree } from '../../utils/helpers';

// ============================================================================
// CONFIGURATION WHISPER
// ============================================================================

const WHISPER_CONFIG = {
  apiUrl: 'https://api.openai.com/v1/audio/transcriptions',
  model: 'whisper-1',
  language: 'fr',
  responseFormat: 'json',
  maxDuration: 300, // 5 minutes max par segment
  sampleRate: 16000
};

// ============================================================================
// SERVICE WHISPER
// ============================================================================

class WhisperService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async transcribe(audioBlob, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Whisper API non configurée. Ajoutez VITE_OPENAI_API_KEY dans .env.local');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', WHISPER_CONFIG.model);
    formData.append('language', options.language || WHISPER_CONFIG.language);
    formData.append('response_format', options.responseFormat || WHISPER_CONFIG.responseFormat);
    
    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }

    try {
      const response = await fetch(WHISPER_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur transcription');
      }

      const data = await response.json();
      return {
        success: true,
        text: data.text,
        duration: data.duration
      };
    } catch (error) {
      console.error('Erreur Whisper:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Simulation pour mode démo
  async simulateTranscribe(duration) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const exemples = [
      "Lors de la visite du bien situé au 15 rue des Lilas, nous avons constaté la présence de fissures horizontales sur le mur pignon ouest.",
      "La fissure principale mesure environ 2 mètres de longueur et présente une ouverture de 3 millimètres en partie centrale.",
      "Les désordres observés semblent résulter d'un tassement différentiel des fondations, probablement lié à la nature argileuse du sol.",
      "Le demandeur nous a indiqué que les premières fissures sont apparues au cours de l'été 2023, après une période de sécheresse importante.",
      "Nous avons procédé à un relevé photographique complet des désordres. Les photos sont numérotées de 1 à 15."
    ];
    
    return {
      success: true,
      text: exemples[Math.floor(Math.random() * exemples.length)],
      duration,
      simulated: true
    };
  }
}

export const whisperService = new WhisperService();

// ============================================================================
// HOOK ENREGISTREMENT AUDIO
// ============================================================================

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Démarrer l'enregistrement
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: WHISPER_CONFIG.sampleRate,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Chunk every second

      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      // Timer
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

    } catch (err) {
      console.error('Erreur accès micro:', err);
      setError('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  }, []);

  // Mettre en pause
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  }, [isRecording]);

  // Reprendre
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
  }, [isPaused]);

  // Arrêter
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      clearInterval(timerRef.current);
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [isRecording]);

  // Reset
  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setError(null);
    chunksRef.current = [];
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording
  };
};

// ============================================================================
// COMPOSANT PRINCIPAL - DICTÉE VOCALE
// ============================================================================

export const DicteeVocale = ({ 
  onTranscription, 
  context = '',
  placeholder = 'La transcription apparaîtra ici...',
  autoSave = false
}) => {
  const recorder = useAudioRecorder();
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [segments, setSegments] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    language: 'fr',
    autoTranscribe: true,
    punctuation: true
  });

  // Transcrire l'audio
  const handleTranscribe = async () => {
    if (!recorder.audioBlob) return;

    setIsTranscribing(true);

    try {
      let result;
      
      if (whisperService.isConfigured()) {
        result = await whisperService.transcribe(recorder.audioBlob, {
          language: settings.language,
          prompt: context ? `Contexte: expertise judiciaire BTP. ${context}` : 'Contexte: expertise judiciaire BTP, construction, désordres.'
        });
      } else {
        result = await whisperService.simulateTranscribe(recorder.duration);
      }

      if (result.success) {
        const newSegment = {
          id: Date.now(),
          text: result.text,
          duration: recorder.duration,
          timestamp: new Date().toISOString(),
          simulated: result.simulated
        };

        setSegments(prev => [...prev, newSegment]);
        setTranscription(prev => prev + (prev ? '\n\n' : '') + result.text);
        
        if (onTranscription) {
          onTranscription(result.text, newSegment);
        }

        recorder.resetRecording();
      } else {
        console.error('Erreur transcription:', result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Auto-transcription à l'arrêt
  useEffect(() => {
    if (settings.autoTranscribe && recorder.audioBlob && !recorder.isRecording) {
      handleTranscribe();
    }
  }, [recorder.audioBlob, recorder.isRecording, settings.autoTranscribe]);

  // Copier la transcription
  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
  };

  // Effacer tout
  const handleClear = () => {
    setTranscription('');
    setSegments([]);
    recorder.resetRecording();
  };

  return (
    <div className="space-y-4">
      {/* Zone de contrôle */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              recorder.isRecording 
                ? 'bg-red-100 animate-pulse' 
                : 'bg-[#f5e6c8]'
            }`}>
              {recorder.isRecording ? (
                <Mic className="w-6 h-6 text-red-600" />
              ) : (
                <MicOff className="w-6 h-6 text-[#c9a227]" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-[#1a1a1a]">Dictée vocale</h3>
              <p className="text-sm text-[#737373]">
                {recorder.isRecording 
                  ? `Enregistrement en cours... ${formatDuree(recorder.duration)}`
                  : recorder.audioBlob 
                    ? `Enregistrement : ${formatDuree(recorder.duration)}`
                    : 'Appuyez pour démarrer'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!whisperService.isConfigured() && (
              <Badge variant="warning">Mode démo</Badge>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-[#f5f5f5] rounded-lg"
            >
              <Settings className="w-5 h-5 text-[#737373]" />
            </button>
          </div>
        </div>

        {/* Visualisation audio */}
        {recorder.isRecording && (
          <div className="mb-6">
            <AudioVisualizer isActive={recorder.isRecording && !recorder.isPaused} />
          </div>
        )}

        {/* Boutons de contrôle */}
        <div className="flex items-center justify-center gap-4">
          {!recorder.isRecording && !recorder.audioBlob && (
            <button
              onClick={recorder.startRecording}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105"
            >
              <Mic className="w-8 h-8" />
            </button>
          )}

          {recorder.isRecording && (
            <>
              <button
                onClick={recorder.isPaused ? recorder.resumeRecording : recorder.pauseRecording}
                className="w-12 h-12 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center text-white"
              >
                {recorder.isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
              </button>
              <button
                onClick={recorder.stopRecording}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg"
              >
                <Square className="w-8 h-8" />
              </button>
            </>
          )}

          {recorder.audioBlob && !recorder.isRecording && (
            <>
              <button
                onClick={recorder.resetRecording}
                className="w-12 h-12 bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-full flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5 text-[#737373]" />
              </button>
              <button
                onClick={recorder.startRecording}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg"
              >
                <Mic className="w-8 h-8" />
              </button>
              <button
                onClick={handleTranscribe}
                disabled={isTranscribing}
                className="w-12 h-12 bg-[#c9a227] hover:bg-[#b8922b] rounded-full flex items-center justify-center text-white disabled:opacity-50"
              >
                {isTranscribing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Lecteur audio */}
        {recorder.audioUrl && (
          <div className="mt-4 p-3 bg-[#fafafa] rounded-xl">
            <audio src={recorder.audioUrl} controls className="w-full" />
          </div>
        )}

        {recorder.error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {recorder.error}
          </div>
        )}
      </Card>

      {/* Zone de transcription */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-[#1a1a1a] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c9a227]" />
            Transcription
            {segments.length > 0 && (
              <Badge variant="default">{segments.length} segment(s)</Badge>
            )}
          </h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={Copy} onClick={handleCopy} disabled={!transcription}>
              Copier
            </Button>
            <Button variant="ghost" size="sm" icon={Trash2} onClick={handleClear} disabled={!transcription}>
              Effacer
            </Button>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder={placeholder}
            rows={8}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] resize-none"
          />
          
          {isTranscribing && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-[#c9a227]" />
                <span className="text-[#737373]">Transcription en cours...</span>
              </div>
            </div>
          )}
        </div>

        {/* Historique des segments */}
        {segments.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-[#a3a3a3] uppercase tracking-wider">Historique</p>
            {segments.map((segment, i) => (
              <div key={segment.id} className="p-3 bg-[#fafafa] rounded-lg text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#a3a3a3]">Segment {i + 1}</span>
                  <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
                    <Clock className="w-3 h-3" />
                    {formatDuree(segment.duration)}
                    {segment.simulated && <Badge variant="warning">Démo</Badge>}
                  </div>
                </div>
                <p className="text-[#525252]">{segment.text}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal paramètres */}
      {showSettings && (
        <ModalBase 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
          title="Paramètres dictée"
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Langue</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
              </select>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.autoTranscribe}
                onChange={(e) => setSettings(prev => ({ ...prev, autoTranscribe: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-[#525252]">Transcrire automatiquement à l'arrêt</span>
            </label>

            <div className="pt-4 border-t border-[#e5e5e5]">
              <p className="text-xs text-[#a3a3a3]">
                Coût estimé : ~0,006€ par minute d'audio
              </p>
            </div>
          </div>
        </ModalBase>
      )}
    </div>
  );
};

// ============================================================================
// VISUALISATION AUDIO
// ============================================================================

const AudioVisualizer = ({ isActive }) => {
  const bars = 20;
  
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-[#c9a227] rounded-full transition-all ${
            isActive ? 'animate-pulse' : ''
          }`}
          style={{
            height: isActive ? `${Math.random() * 100}%` : '20%',
            animationDelay: `${i * 50}ms`
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// WIDGET DICTÉE COMPACT
// ============================================================================

export const DicteeWidget = ({ onResult }) => {
  const recorder = useAudioRecorder();
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleStop = async () => {
    recorder.stopRecording();
    
    // Attendre que le blob soit disponible
    setTimeout(async () => {
      if (recorder.audioBlob) {
        setIsTranscribing(true);
        const result = whisperService.isConfigured()
          ? await whisperService.transcribe(recorder.audioBlob)
          : await whisperService.simulateTranscribe(recorder.duration);
        
        setIsTranscribing(false);
        
        if (result.success && onResult) {
          onResult(result.text);
        }
        recorder.resetRecording();
      }
    }, 500);
  };

  return (
    <div className="flex items-center gap-2">
      {!recorder.isRecording ? (
        <button
          onClick={recorder.startRecording}
          className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 transition-colors"
          title="Démarrer la dictée"
        >
          <Mic className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white animate-pulse transition-colors"
          title="Arrêter et transcrire"
        >
          <Square className="w-5 h-5" />
        </button>
      )}
      
      {recorder.isRecording && (
        <span className="text-sm text-red-600">{formatDuree(recorder.duration)}</span>
      )}
      
      {isTranscribing && (
        <Loader2 className="w-5 h-5 animate-spin text-[#c9a227]" />
      )}
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default DicteeVocale;
// whisperService déjà exporté en haut du fichier
