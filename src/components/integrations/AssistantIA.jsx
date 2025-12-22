// ============================================================================
// CRM EXPERT JUDICIAIRE - ASSISTANT IA RÉDACTION
// Aide à la rédaction de rapports d'expertise avec IA
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, Copy, RefreshCw, ThumbsUp, ThumbsDown,
  FileText, AlertTriangle, Loader2, ChevronDown, Settings,
  Wand2, BookOpen, Scale, Lightbulb, PenTool, Check,
  MessageSquare, History, X, Maximize2, Minimize2
} from 'lucide-react';
import { Card, Badge, Button, ModalBase } from '../ui';

// ============================================================================
// CONFIGURATION IA
// ============================================================================

const IA_CONFIG = {
  anthropicApiUrl: 'https://api.anthropic.com/v1/messages',
  openaiApiUrl: 'https://api.openai.com/v1/chat/completions',
  defaultModel: 'claude-3-sonnet',
  maxTokens: 4096
};

// Types d'assistance disponibles
const TYPES_ASSISTANCE = [
  {
    id: 'redaction',
    label: 'Rédaction',
    icon: PenTool,
    description: 'Aider à rédiger une section du rapport',
    prompt: 'En tant qu\'expert judiciaire en bâtiment, aide-moi à rédiger de manière professionnelle et précise:'
  },
  {
    id: 'reformulation',
    label: 'Reformulation',
    icon: RefreshCw,
    description: 'Reformuler un texte de manière plus claire',
    prompt: 'Reformule ce texte de manière plus claire et professionnelle pour un rapport d\'expertise judiciaire:'
  },
  {
    id: 'technique',
    label: 'Explication technique',
    icon: Lightbulb,
    description: 'Expliquer un concept technique',
    prompt: 'Explique de manière accessible pour un non-spécialiste ce concept technique du BTP:'
  },
  {
    id: 'juridique',
    label: 'Aspect juridique',
    icon: Scale,
    description: 'Éclaircissement juridique',
    prompt: 'Dans le contexte d\'une expertise judiciaire, explique les aspects juridiques de:'
  },
  {
    id: 'dtu',
    label: 'Conformité DTU',
    icon: BookOpen,
    description: 'Analyse de conformité aux normes',
    prompt: 'Analyse la conformité aux DTU et normes techniques applicables pour:'
  },
  {
    id: 'conclusion',
    label: 'Aide conclusion',
    icon: FileText,
    description: 'Structurer les conclusions',
    prompt: 'Aide-moi à structurer les conclusions de mon expertise concernant:'
  }
];

// ============================================================================
// SERVICE IA
// ============================================================================

class IAService {
  constructor() {
    this.anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    this.openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.history = [];
  }

  isConfigured() {
    return !!this.anthropicKey || !!this.openaiKey;
  }

  getProvider() {
    if (this.anthropicKey) return 'anthropic';
    if (this.openaiKey) return 'openai';
    return null;
  }

  async sendMessage(message, type = 'redaction', context = {}) {
    const typeInfo = TYPES_ASSISTANCE.find(t => t.id === type) || TYPES_ASSISTANCE[0];

    const systemPrompt = `Tu es un assistant spécialisé pour les experts judiciaires en bâtiment et construction.
Tu dois aider à rédiger des rapports d'expertise clairs, précis et professionnels.
Respecte le vocabulaire technique du BTP et les exigences de forme des rapports d'expertise judiciaire.
Sois factuel et objectif. Cite les normes et DTU pertinents quand c'est approprié.

${context.affaire ? `Contexte de l'affaire: ${context.affaire.objet || 'Expertise judiciaire'}` : ''}
${context.mission ? `Mission de l'expert: ${context.mission}` : ''}`;

    const fullMessage = `${typeInfo.prompt}\n\n${message}`;

    if (!this.isConfigured()) {
      return this.simulateResponse(fullMessage, type);
    }

    try {
      if (this.getProvider() === 'anthropic') {
        return await this.sendToAnthropic(systemPrompt, fullMessage);
      } else {
        return await this.sendToOpenAI(systemPrompt, fullMessage);
      }
    } catch (error) {
      console.error('Erreur IA:', error);
      throw error;
    }
  }

  async sendToAnthropic(systemPrompt, message) {
    const response = await fetch(IA_CONFIG.anthropicApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: IA_CONFIG.maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!response.ok) {
      throw new Error('Erreur API Anthropic');
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      provider: 'anthropic',
      model: 'claude-3-sonnet'
    };
  }

  async sendToOpenAI(systemPrompt, message) {
    const response = await fetch(IA_CONFIG.openaiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        max_tokens: IA_CONFIG.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Erreur API OpenAI');
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      provider: 'openai',
      model: 'gpt-4-turbo'
    };
  }

  simulateResponse(message, type) {
    // Réponses simulées selon le type
    const responses = {
      redaction: `**Proposition de rédaction:**

Les constatations effectuées lors de notre visite du [DATE] permettent d'établir les observations suivantes:

1. **État des lieux initial**
   L'examen des ouvrages révèle [description des désordres observés].

2. **Analyse technique**
   Ces désordres sont caractéristiques de [origine technique probable].

3. **Éléments de réponse**
   Au regard des éléments recueillis et des règles de l'art applicables (DTU XX.X), il apparaît que...

*Note: Ce texte est une proposition à adapter selon les spécificités de votre dossier.*`,

      reformulation: `**Texte reformulé:**

[Votre texte original reformulé de manière plus claire et professionnelle]

Les modifications apportées visent à:
- Améliorer la clarté de l'expression
- Utiliser un vocabulaire technique approprié
- Structurer le propos de manière logique`,

      technique: `**Explication technique:**

Le phénomène décrit correspond à [définition].

**Mécanisme:**
1. [Étape 1 du processus]
2. [Étape 2 du processus]

**Références normatives:**
- DTU XX.X - [Titre du DTU]
- Norme NF EN XXXXX

**Impact sur l'ouvrage:**
[Description des conséquences]`,

      juridique: `**Éclairage juridique:**

Au regard du Code civil et de la jurisprudence:

1. **Articles applicables:**
   - Article 1792 (responsabilité décennale)
   - Article 1792-2 (éléments d'équipement)

2. **Jurisprudence pertinente:**
   Cass. 3e civ., [date], n° [numéro]

3. **Application au cas d'espèce:**
   [Analyse juridique adaptée]`,

      dtu: `**Analyse de conformité DTU:**

**Normes applicables:**
- DTU XX.X - [Domaine]
- Règles professionnelles [organisme]

**Points de conformité:**
✓ [Point conforme 1]
✓ [Point conforme 2]

**Points de non-conformité:**
✗ [Non-conformité 1]: [description et référence]
✗ [Non-conformité 2]: [description et référence]

**Conclusion:**
L'ouvrage présente des écarts par rapport aux règles de l'art définies par...`,

      conclusion: `**Structure de conclusion proposée:**

1. **Rappel de la mission**
   Par ordonnance du [date], nous avons été désigné en qualité d'expert...

2. **Synthèse des constatations**
   Nos opérations d'expertise ont permis d'établir que...

3. **Origine des désordres**
   L'analyse technique démontre que les désordres trouvent leur origine dans...

4. **Imputabilités**
   Au regard de ces éléments, il convient d'imputer...

5. **Évaluation des préjudices**
   Le coût des travaux de reprise s'établit à...`
    };

    return {
      content: responses[type] || responses.redaction,
      provider: 'simulation',
      model: 'demo',
      simulated: true
    };
  }
}

export const iaService = new IAService();

// ============================================================================
// COMPOSANT PRINCIPAL - ASSISTANT IA
// ============================================================================

export const AssistantIA = ({ affaire, onInsertText, expanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('redaction');
  const [showTypes, setShowTypes] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      type: selectedType,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await iaService.sendMessage(input, selectedType, { affaire });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.content,
        type: selectedType,
        provider: response.provider,
        model: response.model,
        simulated: response.simulated,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'error',
        content: 'Une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const insertInDocument = (text) => {
    onInsertText?.(text);
  };

  const selectedTypeInfo = TYPES_ASSISTANCE.find(t => t.id === selectedType);
  const isConfigured = iaService.isConfigured();

  return (
    <Card className={`flex flex-col ${isExpanded ? 'fixed inset-4 z-50' : 'h-[500px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#a88620] rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1a1a1a]">Assistant IA</h3>
            <p className="text-xs text-[#737373]">
              {isConfigured
                ? `${iaService.getProvider() === 'anthropic' ? 'Claude' : 'GPT-4'} actif`
                : 'Mode démo'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={History}
              onClick={() => setMessages([])}
              title="Effacer l'historique"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={isExpanded ? Minimize2 : Maximize2}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>
      </div>

      {/* Alerte mode démo */}
      {!isConfigured && messages.length === 0 && (
        <div className="p-3 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            Mode démonstration - Configurez votre clé API pour activer l'IA
          </div>
        </div>
      )}

      {/* Zone messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Sparkles className="w-12 h-12 text-[#c9a227] mb-4" />
            <h4 className="font-medium text-[#1a1a1a] mb-2">
              Comment puis-je vous aider ?
            </h4>
            <p className="text-sm text-[#737373] max-w-sm mb-6">
              Je peux vous aider à rédiger, reformuler ou expliquer des concepts
              techniques pour vos rapports d'expertise.
            </p>

            {/* Suggestions rapides */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {[
                'Rédiger une introduction',
                'Expliquer les fissures',
                'Conformité DTU 20.1',
                'Structurer mes conclusions'
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 bg-[#f5f5f5] hover:bg-[#e5e5e5] rounded-full text-sm text-[#737373] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              onCopy={copyToClipboard}
              onInsert={insertInDocument}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="p-4 border-t border-[#e5e5e5]">
        {/* Sélecteur de type */}
        <div className="relative mb-3">
          <button
            onClick={() => setShowTypes(!showTypes)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#f5f5f5] rounded-lg text-sm hover:bg-[#e5e5e5] transition-colors"
          >
            {selectedTypeInfo && <selectedTypeInfo.icon className="w-4 h-4 text-[#c9a227]" />}
            <span>{selectedTypeInfo?.label}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTypes ? 'rotate-180' : ''}`} />
          </button>

          {showTypes && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-[#e5e5e5] rounded-xl shadow-lg z-10 w-72">
              {TYPES_ASSISTANCE.map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                    setShowTypes(false);
                  }}
                  className={`w-full flex items-start gap-3 p-3 hover:bg-[#fafafa] transition-colors
                             ${type.id === selectedType ? 'bg-[#fafafa]' : ''}`}
                >
                  <type.icon className={`w-5 h-5 ${type.id === selectedType ? 'text-[#c9a227]' : 'text-[#737373]'}`} />
                  <div className="text-left">
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-[#a3a3a3]">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Décrivez ce que vous souhaitez rédiger..."
            rows={2}
            className="flex-1 px-4 py-3 border border-[#e5e5e5] rounded-xl resize-none
                       focus:outline-none focus:border-[#c9a227]"
          />
          <Button
            variant="primary"
            icon={loading ? Loader2 : Send}
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={loading ? 'animate-pulse' : ''}
          />
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// BULLE DE MESSAGE
// ============================================================================

const MessageBubble = ({ message, onCopy, onInsert }) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-[#c9a227] text-white rounded-2xl rounded-br-md px-4 py-3">
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
            {TYPES_ASSISTANCE.find(t => t.id === message.type)?.label}
          </div>
        </div>
      </div>
    );
  }

  if (message.role === 'error') {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{message.content}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] bg-[#f5f5f5] rounded-2xl rounded-bl-md px-4 py-3">
        <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
          {message.content}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#e5e5e5]">
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-white rounded-lg transition-colors"
              title="Copier"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-[#737373]" />
              )}
            </button>
            {onInsert && (
              <button
                onClick={() => onInsert(message.content)}
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                title="Insérer dans le document"
              >
                <FileText className="w-4 h-4 text-[#737373]" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFeedback('up')}
              className={`p-1.5 hover:bg-white rounded-lg transition-colors
                         ${feedback === 'up' ? 'bg-green-100' : ''}`}
            >
              <ThumbsUp className={`w-4 h-4 ${feedback === 'up' ? 'text-green-500' : 'text-[#a3a3a3]'}`} />
            </button>
            <button
              onClick={() => setFeedback('down')}
              className={`p-1.5 hover:bg-white rounded-lg transition-colors
                         ${feedback === 'down' ? 'bg-red-100' : ''}`}
            >
              <ThumbsDown className={`w-4 h-4 ${feedback === 'down' ? 'text-red-500' : 'text-[#a3a3a3]'}`} />
            </button>
          </div>
        </div>

        {message.simulated && (
          <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Réponse de démonstration
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// WIDGET COMPACT
// ============================================================================

export const AssistantIAWidget = ({ affaire, onInsertText }) => {
  const [showAssistant, setShowAssistant] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        icon={Sparkles}
        onClick={() => setShowAssistant(true)}
      >
        Assistant IA
      </Button>

      <ModalBase
        isOpen={showAssistant}
        onClose={() => setShowAssistant(false)}
        title=""
        size="xl"
        noPadding
      >
        <AssistantIA affaire={affaire} onInsertText={onInsertText} />
      </ModalBase>
    </>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default AssistantIA;
