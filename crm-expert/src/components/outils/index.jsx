// ============================================================================
// CRM EXPERT JUDICIAIRE - COMPOSANTS OUTILS
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, Play, Pause, RotateCcw, Mic, MicOff, 
  Calculator, Camera, FolderOpen, CalendarClock,
  Receipt, Library, FileSignature, Plus, X
} from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { TAUX_VACATIONS, CALCULS_TECHNIQUES } from '../../data';
import { formatDuree } from '../../utils/helpers';

// ============================================================================
// CHRONOMÈTRE VACATION
// ============================================================================

export const Chronometre = ({ onSave, affaireRef }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [typeVacation, setTypeVacation] = useState('expertise');
  const [description, setDescription] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => { setIsRunning(false); setSeconds(0); };
  
  const handleSave = () => {
    if (seconds > 0 && onSave) {
      onSave({
        type: typeVacation,
        duree: seconds / 3600,
        description,
        date: new Date().toISOString(),
        affaireRef
      });
      handleReset();
      setDescription('');
    }
  };

  const heures = seconds / 3600;
  const montant = heures * (TAUX_VACATIONS[typeVacation]?.taux || 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f5e6c8] rounded-xl flex items-center justify-center">
            <Timer className="w-5 h-5 text-[#c9a227]" />
          </div>
          <span className="font-medium text-[#1a1a1a]">Chronomètre Vacation</span>
        </div>
        <Badge variant={isRunning ? 'success' : 'default'}>
          {isRunning ? 'En cours' : 'Arrêté'}
        </Badge>
      </div>

      {/* Affichage temps */}
      <div className="text-center mb-6 py-6 bg-[#fafafa] rounded-2xl">
        <p className="text-5xl font-light text-[#1a1a1a] font-mono tracking-wider">
          {formatDuree(seconds)}
        </p>
        <p className="text-sm text-[#737373] mt-2">
          {montant.toFixed(2)} € ({TAUX_VACATIONS[typeVacation]?.taux}€/h)
        </p>
      </div>

      {/* Contrôles */}
      <div className="flex gap-2 justify-center mb-6">
        {!isRunning ? (
          <button 
            onClick={handleStart} 
            className="px-6 py-3 bg-green-500 text-white rounded-xl flex items-center gap-2 hover:bg-green-600 transition-colors"
          >
            <Play className="w-5 h-5" /> Démarrer
          </button>
        ) : (
          <button 
            onClick={handlePause} 
            className="px-6 py-3 bg-amber-500 text-white rounded-xl flex items-center gap-2 hover:bg-amber-600 transition-colors"
          >
            <Pause className="w-5 h-5" /> Pause
          </button>
        )}
        <button 
          onClick={handleReset} 
          className="px-4 py-3 bg-[#f5f5f5] text-[#525252] rounded-xl flex items-center gap-2 hover:bg-[#e5e5e5] transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Type et description */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
            Type de vacation
          </label>
          <select
            value={typeVacation}
            onChange={(e) => setTypeVacation(e.target.value)}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
          >
            {Object.entries(TAUX_VACATIONS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.description} ({val.taux}€/{val.unite})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
            Description
          </label>
          <input
            type="text"
            placeholder="Description de la vacation..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
          />
        </div>
        
        <button 
          onClick={handleSave}
          disabled={seconds === 0}
          className="w-full py-3 bg-[#1a1a1a] text-white rounded-xl font-medium disabled:bg-[#e5e5e5] disabled:text-[#a3a3a3] hover:bg-[#0d0d0d] transition-colors"
        >
          Enregistrer la vacation
        </button>
      </div>
    </Card>
  );
};

// ============================================================================
// CALCULATRICE TECHNIQUE
// ============================================================================

export const CalculatriceTechnique = () => {
  const [categorie, setCategorie] = useState('surfaces');
  const [calcul, setCalcul] = useState(null);
  const [valeurs, setValeurs] = useState({});
  const [resultat, setResultat] = useState(null);

  const calculs = CALCULS_TECHNIQUES[categorie] || [];

  const calculer = () => {
    if (!calcul) return;
    
    let result = 0;
    const v = valeurs;
    
    switch(calcul.id) {
      case 'rectangle': result = (v.L || 0) * (v.l || 0); break;
      case 'triangle': result = ((v.B || 0) * (v.H || 0)) / 2; break;
      case 'cercle': result = Math.PI * Math.pow(v.R || 0, 2); break;
      case 'trapeze': result = (((v.B || 0) + (v.b || 0)) * (v.H || 0)) / 2; break;
      case 'parallelepipede': result = (v.L || 0) * (v.l || 0) * (v.H || 0); break;
      case 'cylindre': result = Math.PI * Math.pow(v.R || 0, 2) * (v.H || 0); break;
      case 'resistance': result = (v.e || 0) / (v.lambda || 1); break;
      case 'coefficient-u': result = 1 / (v.R || 1); break;
      case 'pourcentage': result = ((v.H || 0) / (v.L || 1)) * 100; break;
      case 'mm-m': result = (v.Hmm || 0) / (v.Lm || 1); break;
      default: result = 0;
    }
    
    setResultat(result);
  };

  // Extraire les variables de la formule
  const extractVariables = (formule) => {
    const matches = formule.match(/[A-Za-zλ]+/g) || [];
    return [...new Set(matches)].filter(v => v !== 'π');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#f5e6c8] rounded-xl flex items-center justify-center">
          <Calculator className="w-5 h-5 text-[#c9a227]" />
        </div>
        <span className="font-medium text-[#1a1a1a]">Calculatrice technique</span>
      </div>

      {/* Catégories */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.keys(CALCULS_TECHNIQUES).map(cat => (
          <button
            key={cat}
            onClick={() => { setCategorie(cat); setCalcul(null); setResultat(null); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              categorie === cat 
                ? 'bg-[#1a1a1a] text-white' 
                : 'bg-[#f5f5f5] text-[#525252] hover:bg-[#e5e5e5]'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Sélection du calcul */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {calculs.map(c => (
          <button
            key={c.id}
            onClick={() => { setCalcul(c); setValeurs({}); setResultat(null); }}
            className={`p-3 rounded-xl border text-left transition-all ${
              calcul?.id === c.id 
                ? 'border-[#c9a227] bg-[#f5e6c8]/20' 
                : 'border-[#e5e5e5] hover:border-[#d4d4d4]'
            }`}
          >
            <p className="font-medium text-sm text-[#1a1a1a]">{c.label}</p>
            <p className="text-xs text-[#737373]">{c.formule}</p>
          </button>
        ))}
      </div>

      {/* Formulaire de calcul */}
      {calcul && (
        <div className="space-y-4">
          <div className="p-3 bg-[#fafafa] rounded-xl">
            <p className="text-sm text-[#737373]">{calcul.description || calcul.formule}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {extractVariables(calcul.formule).map(variable => (
              <div key={variable}>
                <label className="text-xs text-[#737373] block mb-1">{variable}</label>
                <input
                  type="number"
                  step="0.01"
                  value={valeurs[variable] || ''}
                  onChange={(e) => setValeurs({ ...valeurs, [variable]: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-center focus:outline-none focus:border-[#c9a227]"
                />
              </div>
            ))}
          </div>

          <button 
            onClick={calculer} 
            className="w-full py-3 bg-[#c9a227] text-white rounded-xl font-medium hover:bg-[#d4af37] transition-colors"
          >
            Calculer
          </button>

          {resultat !== null && (
            <div className="p-4 bg-[#1a1a1a] rounded-xl text-center">
              <p className="text-3xl font-light text-white">
                {resultat.toFixed(2)} 
                <span className="text-lg text-[#c9a227] ml-2">{calcul.resultat || ''}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// DICTÉE VOCALE
// ============================================================================

export const DicteeVocale = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulation de transcription (à remplacer par API Whisper)
      const fakeTranscription = "Lors de la visite du quinze décembre deux mille vingt-quatre, nous avons constaté la présence de fissures en façade nord de l'immeuble. Ces fissures présentent une ouverture de deux millimètres environ.";
      setTranscription(fakeTranscription);
      if (onTranscription) onTranscription(fakeTranscription);
    } else {
      setIsRecording(true);
      setTranscription('');
      setDuration(0);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#f5e6c8] rounded-xl flex items-center justify-center">
          <Mic className="w-5 h-5 text-[#c9a227]" />
        </div>
        <span className="font-medium text-[#1a1a1a]">Dictée vocale</span>
      </div>

      <div className="text-center mb-6">
        <button
          onClick={toggleRecording}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isRecording 
              ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/30' 
              : 'bg-[#1a1a1a] hover:bg-[#0d0d0d]'
          }`}
        >
          {isRecording ? (
            <MicOff className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </button>
        <p className="text-sm text-[#737373] mt-4">
          {isRecording ? `Enregistrement en cours... ${formatDuree(duration)}` : 'Cliquez pour démarrer'}
        </p>
      </div>

      {transcription && (
        <div className="bg-[#fafafa] rounded-xl p-4">
          <p className="text-sm text-[#1a1a1a] leading-relaxed">{transcription}</p>
          <div className="flex gap-2 mt-4">
            <Button 
              variant="gold" 
              size="sm"
              onClick={() => navigator.clipboard.writeText(transcription)}
            >
              Copier
            </Button>
            <Button variant="secondary" size="sm">
              Corriger avec IA
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  Chronometre,
  CalculatriceTechnique,
  DicteeVocale
};
