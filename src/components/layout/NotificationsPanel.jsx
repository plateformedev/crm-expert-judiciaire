// ============================================================================
// CRM EXPERT JUDICIAIRE - PANNEAU NOTIFICATIONS (Style Pennylane)
// ============================================================================

import React, { useState } from 'react';
import {
  X, Bell, CheckCircle, Clock, AlertTriangle,
  ChevronRight, Calendar, FileText, MessageSquare
} from 'lucide-react';
import { Badge, Button } from '../ui';
import { formatDateFr } from '../../utils/helpers';

const NotificationsPanel = ({ isOpen, onClose, alertes = [], affaires = [] }) => {
  const [activeTab, setActiveTab] = useState('todo'); // todo | alertes | historique

  if (!isOpen) return null;

  // Calculer les tâches à faire
  const todos = [];
  affaires.forEach(a => {
    // Dires non répondus
    (a.dires || []).filter(d => d.statut !== 'repondu').forEach(d => {
      todos.push({
        id: `dire-${d.id}`,
        type: 'dire',
        label: `Répondre au dire de ${d.partie_nom || 'partie'}`,
        affaire: a.reference,
        date: d.date_reception,
        priority: 'high'
      });
    });
    // Réunions à venir sans compte-rendu
    (a.reunions || []).filter(r => r.statut === 'terminee' && !r.compte_rendu_envoye).forEach(r => {
      todos.push({
        id: `cr-${r.id}`,
        type: 'compte-rendu',
        label: `Rédiger compte-rendu R${r.numero}`,
        affaire: a.reference,
        date: r.date_reunion,
        priority: 'medium'
      });
    });
  });

  // Alertes critiques
  const alertesCritiques = alertes.filter(a => a.priorite === 'critique' || a.priorite === 'haute');

  const tabs = [
    { id: 'todo', label: 'À faire', count: todos.length },
    { id: 'alertes', label: 'Alertes', count: alertesCritiques.length },
    { id: 'historique', label: 'Historique', count: 0 }
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5e5]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#c9a227]" />
            <h2 className="font-semibold text-lg text-[#1a1a1a]">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#737373]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#e5e5e5]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[#c9a227]'
                  : 'text-[#737373] hover:text-[#1a1a1a]'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-[#c9a227] text-white' : 'bg-[#e5e5e5] text-[#737373]'
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c9a227]" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'todo' && (
            todos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🎉</div>
                <p className="font-medium text-[#1a1a1a] mb-1">Vous êtes à jour !</p>
                <p className="text-sm text-[#737373]">Aucune tâche en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map(todo => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            )
          )}

          {activeTab === 'alertes' && (
            alertesCritiques.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">✅</div>
                <p className="font-medium text-[#1a1a1a] mb-1">Tout va bien</p>
                <p className="text-sm text-[#737373]">Aucune alerte critique</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertesCritiques.map(alerte => (
                  <AlerteItem key={alerte.id} alerte={alerte} />
                ))}
              </div>
            )
          )}

          {activeTab === 'historique' && (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📋</div>
              <p className="font-medium text-[#1a1a1a] mb-1">Historique vide</p>
              <p className="text-sm text-[#737373]">Les actions passées apparaîtront ici</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Composant Todo Item
const TodoItem = ({ todo }) => {
  const icons = {
    dire: MessageSquare,
    'compte-rendu': FileText,
    reunion: Calendar
  };
  const Icon = icons[todo.type] || Clock;

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-blue-500'
  };

  return (
    <div className={`p-3 bg-[#fafafa] rounded-lg border-l-4 ${priorityColors[todo.priority] || 'border-l-gray-300'}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
          <Icon className="w-4 h-4 text-[#737373]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1a1a1a] truncate">{todo.label}</p>
          <p className="text-xs text-[#737373]">{todo.affaire}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-[#a3a3a3]" />
      </div>
    </div>
  );
};

// Composant Alerte Item
const AlerteItem = ({ alerte }) => {
  return (
    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800">{alerte.message}</p>
          <p className="text-xs text-red-600 mt-1">{alerte.affaire_reference}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
