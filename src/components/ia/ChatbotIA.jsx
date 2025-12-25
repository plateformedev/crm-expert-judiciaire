// ============================================================================
// CRM EXPERT JUDICIAIRE - CHATBOT IA EXPERT (AVEC CLAUDE API)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Brain, X, Send, Target, FileText, BookOpen, 
  Scale, Calculator, FileCheck, Copy, Sparkles, AlertCircle,
  Loader2, RefreshCw
} from 'lucide-react';
import { Card, Badge } from '../ui';
import { claudeService, RAG_CORPUS } from '../../services/claude';

// Suggestions rapides
const IA_SUGGESTIONS = [
  { id: 'qualifier', label: 'Qualifier un désordre', icon: Target, prompt: 'Aide-moi à qualifier ce désordre : ' },
  { id: 'rediger', label: 'Rédiger un paragraphe', icon: FileText, prompt: 'Rédige un paragraphe décrivant : ' },
  { id: 'dtu', label: 'Chercher un DTU', icon: BookOpen, prompt: 'Quelles sont les exigences du DTU pour : ' },
  { id: 'jurisprudence', label: 'Jurisprudence', icon: Scale, prompt: 'Quelle jurisprudence sur : ' },
  { id: 'chiffrer', label: 'Estimer un coût', icon: Calculator, prompt: 'Estime le coût de : ' },
  { id: 'procedure', label: 'Procédure CPC', icon: FileCheck, prompt: 'Quelle est la procédure pour : ' }
];

// Catégories du corpus
const IA_CORPUS_CATEGORIES = [
  { id: 'code-civil', label: 'Code Civil', count: 156 },
  { id: 'cpc', label: 'CPC', count: 89 },
  { id: 'dtu', label: 'DTU', count: 87 },
  { id: 'jurisprudence', label: 'Jurisprudence', count: 1250 }
];

const ChatbotIA = ({ affaire, onInsert }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Bonjour ! Je suis votre assistant expert judiciaire. Je peux vous aider à qualifier des désordres, rédiger des paragraphes, rechercher des DTU ou de la jurisprudence. Comment puis-je vous aider ?',
      actions: ['Qualifier un désordre', 'Rechercher DTU', 'Jurisprudence']
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const messagesEndRef = useRef(null);

  // Vérifier si l'API est configurée
  useEffect(() => {
    setIsConfigured(claudeService.isConfigured());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      let response;

      if (isConfigured) {
        // Appel API Claude réel
        response = await claudeService.chat(userMessage, { affaire });
      } else {
        // Mode simulation
        await new Promise(resolve => setTimeout(resolve, 800));
        response = claudeService.simulateResponse(userMessage);
      }

      // Extraire les actions suggérées du contenu
      const actions = extractActions(response.content);

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.content, 
        actions,
        simulated: response.simulated
      }]);
    } catch (err) {
      console.error('Erreur chatbot:', err);
      setError(err.message);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Désolé, une erreur s'est produite : ${err.message}. Veuillez réessayer.`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Extraire des actions suggérées du contenu
  const extractActions = (content) => {
    const actions = [];
    if (content.toLowerCase().includes('dtu')) actions.push('Voir DTU détaillé');
    if (content.toLowerCase().includes('décennale')) actions.push('Jurisprudence décennale');
    if (content.toLowerCase().includes('chiffrage') || content.toLowerCase().includes('coût')) actions.push('Détailler chiffrage');
    if (content.toLowerCase().includes('rédiger') || content.toLowerCase().includes('paragraphe')) actions.push('Insérer dans rapport');
    return actions.slice(0, 3);
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion.prompt);
  };

  const handleAction = (action) => {
    setInput(action);
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 100);
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
  };

  const handleInsert = (content) => {
    if (onInsert) {
      onInsert(content);
    }
  };

  const handleReset = () => {
    claudeService.resetConversation();
    setMessages([{ 
      role: 'assistant', 
      content: 'Conversation réinitialisée. Comment puis-je vous aider ?',
      actions: ['Qualifier un désordre', 'Rechercher DTU', 'Jurisprudence']
    }]);
  };

  // Bouton flottant quand fermé
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#2563EB] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#d4af37] transition-all z-50 group"
      >
        <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[420px] h-[600px] bg-white rounded-2xl shadow-2xl border border-[#e5e5e5] flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#e5e5e5] bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-white flex items-center gap-2">
              Assistant Expert IA
              {!isConfigured && (
                <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded">Démo</span>
              )}
            </h3>
            <p className="text-xs text-[#a3a3a3]">
              {isConfigured ? 'Claude API connectée' : 'Mode simulation'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleReset}
            className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Nouvelle conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsExpanded(false)} 
            className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Corpus info */}
      <div className="px-4 py-2 bg-[#fafafa] border-b border-[#e5e5e5] flex gap-2 overflow-x-auto">
        {IA_CORPUS_CATEGORIES.map(cat => (
          <span key={cat.id} className="px-2 py-1 bg-white border border-[#e5e5e5] rounded text-xs text-[#737373] whitespace-nowrap">
            {cat.label} ({cat.count})
          </span>
        ))}
      </div>

      {/* Erreur */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-600">{error}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 ${
              msg.role === 'user' 
                ? 'bg-[#1a1a1a] text-white' 
                : msg.isError
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-[#f5f5f5] text-[#1a1a1a]'
            }`}>
              {/* Badge simulation */}
              {msg.simulated && (
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded mb-2">
                  Réponse simulée
                </span>
              )}
              
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              
              {/* Actions */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#e5e5e5]/50">
                  {msg.actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleAction(action)}
                      className="px-3 py-1 bg-white border border-[#e5e5e5] rounded-full text-xs text-[#525252] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}

              {/* Boutons pour les réponses assistant */}
              {msg.role === 'assistant' && !msg.isError && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleCopy(msg.content)}
                    className="text-xs text-[#a3a3a3] hover:text-[#2563EB] flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copier
                  </button>
                  {onInsert && (
                    <button
                      onClick={() => handleInsert(msg.content)}
                      className="text-xs text-[#a3a3a3] hover:text-[#2563EB] flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> Insérer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#f5f5f5] rounded-2xl p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />
              <span className="text-sm text-[#737373]">Analyse en cours...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div className="px-4 py-2 border-t border-[#e5e5e5] flex gap-2 overflow-x-auto">
        {IA_SUGGESTIONS.slice(0, 4).map(sug => {
          const Icon = sug.icon;
          return (
            <button
              key={sug.id}
              onClick={() => handleSuggestion(sug)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fafafa] border border-[#e5e5e5] rounded-full text-xs text-[#525252] hover:border-[#2563EB] whitespace-nowrap transition-colors"
            >
              <Icon className="w-3 h-3" />
              {sug.label}
            </button>
          );
        })}
      </div>

      {/* Input */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-4 border-t border-[#e5e5e5]"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1 px-4 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-xl hover:bg-[#d4af37] disabled:bg-[#e5e5e5] disabled:text-[#a3a3a3] transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatbotIA;
