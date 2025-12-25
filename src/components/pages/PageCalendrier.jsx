// ============================================================================
// CRM EXPERT JUDICIAIRE - PAGE CALENDRIER
// Calendrier complet avec tous les événements
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin,
  Users, FileText, AlertTriangle, CheckCircle, Eye, Edit,
  Filter, List, Grid, Bell, Video, Phone, Car, Trash2, X, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Input, ModalBase, useToast } from '../ui';
import { getStoredAffaires } from '../../lib/demoData';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// CONSTANTES
// ============================================================================

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const TYPES_EVENEMENT = {
  reunion: { label: 'Réunion', color: 'blue', icon: Users },
  echeance: { label: 'Échéance', color: 'red', icon: AlertTriangle },
  dire: { label: 'Délai dire', color: 'amber', icon: FileText },
  rapport: { label: 'Dépôt rapport', color: 'green', icon: CheckCircle },
  rdv: { label: 'RDV', color: 'purple', icon: Calendar }
};

// ============================================================================
// COMPOSANT: Événement du jour
// ============================================================================

const EventItem = ({ event, compact = false, onClick }) => {
  const type = TYPES_EVENEMENT[event.type] || TYPES_EVENEMENT.rdv;
  const Icon = type.icon;
  const isCustom = event.id?.startsWith('custom-');

  if (compact) {
    return (
      <div
        onClick={(e) => { e.stopPropagation(); onClick?.(event); }}
        className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
          type.color === 'blue' ? 'bg-blue-100 text-blue-700' :
          type.color === 'red' ? 'bg-red-100 text-red-700' :
          type.color === 'amber' ? 'bg-amber-100 text-amber-700' :
          type.color === 'green' ? 'bg-green-100 text-green-700' :
          'bg-purple-100 text-purple-700'
        }`}
        title={`${event.titre}${isCustom ? ' (Cliquer pour modifier)' : ''}`}
      >
        {event.heure && <span className="font-medium">{event.heure} </span>}
        {event.titre}
      </div>
    );
  }

  return (
    <Card
      onClick={() => onClick?.(event)}
      className="p-3 hover:border-[#2563EB] transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          type.color === 'blue' ? 'bg-blue-100' :
          type.color === 'red' ? 'bg-red-100' :
          type.color === 'amber' ? 'bg-amber-100' :
          type.color === 'green' ? 'bg-green-100' :
          'bg-purple-100'
        }`}>
          <Icon className={`w-5 h-5 ${
            type.color === 'blue' ? 'text-blue-600' :
            type.color === 'red' ? 'text-red-600' :
            type.color === 'amber' ? 'text-amber-600' :
            type.color === 'green' ? 'text-green-600' :
            'text-purple-600'
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-[#1f1f1f] truncate">{event.titre}</p>
            <Badge variant={type.color === 'amber' ? 'warning' : type.color === 'red' ? 'error' : type.color === 'green' ? 'success' : 'default'} className="text-xs">{type.label}</Badge>
            {isCustom && <Edit className="w-3 h-3 text-[#757575]" />}
          </div>
          <p className="text-xs text-[#757575] mt-0.5">{event.affaire_reference}</p>

          <div className="flex items-center gap-4 mt-2 text-xs text-[#757575]">
            {event.heure && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {event.heure}
              </span>
            )}
            {event.lieu && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.lieu}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Cellule du calendrier
// ============================================================================

const CalendarCell = ({ date, events, isCurrentMonth, isToday, isSelected, onClick, onEventClick }) => {
  const dayEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate.getDate() === date.getDate() &&
           eventDate.getMonth() === date.getMonth() &&
           eventDate.getFullYear() === date.getFullYear();
  });

  return (
    <div
      onClick={() => onClick(date)}
      className={`min-h-[100px] p-2 border border-[#e0e0e0] cursor-pointer transition-colors ${
        !isCurrentMonth ? 'bg-[#f7f7f7] text-[#ababab]' :
        isSelected ? 'bg-[#EFF6FF] border-[#2563EB] border-2' :
        isToday ? 'bg-[#e5f3ff] border-[#0381fe]' :
        'bg-white hover:bg-[#f7f7f7]'
      }`}
    >
      <div className={`text-sm font-semibold mb-1 ${
        isToday ? 'text-[#0381fe]' :
        !isCurrentMonth ? 'text-[#ababab]' : 'text-[#1f1f1f]'
      }`}>
        {date.getDate()}
      </div>

      <div className="space-y-1">
        {dayEvents.slice(0, 3).map((event, idx) => (
          <EventItem key={idx} event={event} compact onClick={onEventClick} />
        ))}
        {dayEvents.length > 3 && (
          <div className="text-xs text-[#757575] pl-1 font-medium">
            +{dayEvents.length - 3} autre(s)
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const PageCalendrier = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('mois'); // 'mois', 'semaine', 'liste'
  const [filterType, setFilterType] = useState('tous');
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [customEvents, setCustomEvents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('calendar_custom_events') || '[]');
    } catch {
      return [];
    }
  });
  const [newEvent, setNewEvent] = useState({
    type: 'rdv',
    titre: '',
    date: new Date().toISOString().split('T')[0],
    heure: '10:00',
    lieu: '',
    description: ''
  });

  const affaires = getStoredAffaires();

  const handleAddEvent = () => {
    if (!newEvent.titre.trim()) {
      toast.error('Erreur', 'Veuillez saisir un titre pour l\'événement');
      return;
    }

    const event = {
      id: `custom-${Date.now()}`,
      ...newEvent,
      affaire_reference: 'Personnel'
    };

    const updatedEvents = [...customEvents, event];
    setCustomEvents(updatedEvents);
    localStorage.setItem('calendar_custom_events', JSON.stringify(updatedEvents));

    toast.success('Événement créé', `"${newEvent.titre}" a été ajouté au calendrier`);

    setNewEvent({
      type: 'rdv',
      titre: '',
      date: new Date().toISOString().split('T')[0],
      heure: '10:00',
      lieu: '',
      description: ''
    });
    setShowNewEventModal(false);
  };

  // Modifier un événement personnalisé
  const handleUpdateEvent = () => {
    if (!editingEvent || !editingEvent.titre.trim()) {
      toast.error('Erreur', 'Veuillez saisir un titre pour l\'événement');
      return;
    }

    const updatedEvents = customEvents.map(e =>
      e.id === editingEvent.id ? editingEvent : e
    );
    setCustomEvents(updatedEvents);
    localStorage.setItem('calendar_custom_events', JSON.stringify(updatedEvents));

    toast.success('Événement modifié', `"${editingEvent.titre}" a été mis à jour`);
    setEditingEvent(null);
  };

  // Supprimer un événement personnalisé
  const handleDeleteEvent = (eventId) => {
    const event = customEvents.find(e => e.id === eventId);
    const updatedEvents = customEvents.filter(e => e.id !== eventId);
    setCustomEvents(updatedEvents);
    localStorage.setItem('calendar_custom_events', JSON.stringify(updatedEvents));

    toast.success('Événement supprimé', `"${event?.titre}" a été supprimé du calendrier`);
    setShowEventDetail(null);
  };

  // Ouvrir l'édition d'un événement
  const handleEventClick = (event) => {
    if (event.id.startsWith('custom-')) {
      setEditingEvent({ ...event });
    } else {
      setShowEventDetail(event);
    }
  };

  // Générer tous les événements
  const events = useMemo(() => {
    const allEvents = [];

    affaires.forEach(affaire => {
      // Réunions
      (affaire.reunions || []).forEach(reunion => {
        if (reunion.date_reunion) {
          allEvents.push({
            id: `reunion-${affaire.id}-${reunion.numero}`,
            type: 'reunion',
            titre: `Réunion R${reunion.numero}`,
            date: reunion.date_reunion,
            heure: reunion.heure || '10:00',
            lieu: reunion.lieu || affaire.bien_adresse,
            affaire_id: affaire.id,
            affaire_reference: affaire.reference,
            statut: reunion.statut
          });
        }
      });

      // Échéances
      if (affaire.date_echeance) {
        allEvents.push({
          id: `echeance-${affaire.id}`,
          type: 'echeance',
          titre: 'Échéance mission',
          date: affaire.date_echeance,
          affaire_id: affaire.id,
          affaire_reference: affaire.reference
        });
      }

      // Dires (délais de réponse)
      (affaire.dires || []).forEach((dire, idx) => {
        if (dire.date_limite_reponse && dire.statut !== 'repondu') {
          allEvents.push({
            id: `dire-${affaire.id}-${idx}`,
            type: 'dire',
            titre: `Réponse dire ${dire.partie}`,
            date: dire.date_limite_reponse,
            affaire_id: affaire.id,
            affaire_reference: affaire.reference
          });
        }
      });

      // Dépôt rapport prévu
      if (affaire.statut === 'pre-rapport' && affaire.date_depot_prevu) {
        allEvents.push({
          id: `rapport-${affaire.id}`,
          type: 'rapport',
          titre: 'Dépôt rapport prévu',
          date: affaire.date_depot_prevu,
          affaire_id: affaire.id,
          affaire_reference: affaire.reference
        });
      }
    });

    // Ajouter les événements personnalisés
    customEvents.forEach(event => {
      allEvents.push(event);
    });

    return allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [affaires, customEvents]);

  // Filtrer par type
  const filteredEvents = useMemo(() => {
    if (filterType === 'tous') return events;
    return events.filter(e => e.type === filterType);
  }, [events, filterType]);

  // Générer les jours du mois
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Ajuster pour commencer le lundi (0 = lundi dans notre grille)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days = [];

    // Jours du mois précédent
    const prevMonth = new Date(year, month, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonth.getDate() - i));
    }

    // Jours du mois actuel
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Jours du mois suivant pour compléter
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }, [currentDate]);

  // Événements du jour sélectionné
  const selectedDayEvents = useMemo(() => {
    return filteredEvents.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === selectedDate.getDate() &&
             eventDate.getMonth() === selectedDate.getMonth() &&
             eventDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [filteredEvents, selectedDate]);

  // Événements à venir (7 prochains jours)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return filteredEvents.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= now && eventDate <= nextWeek;
    }).slice(0, 5);
  }, [filteredEvents]);

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + direction,
      1
    ));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#1a1a1a]">Calendrier</h1>
          <p className="text-sm text-[#737373]">
            {events.length} événement(s) planifié(s)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm"
          >
            <option value="tous">Tous les types</option>
            {Object.entries(TYPES_EVENEMENT).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
          <Button variant="secondary" onClick={goToToday}>
            Aujourd'hui
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowNewEventModal(true)}>
            Nouvel événement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Calendrier principal */}
        <div className="col-span-3">
          <Card className="p-4">
            {/* Navigation du mois */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-[#f5f5f5] rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-[#737373]" />
              </button>

              <h2 className="text-lg font-medium text-[#1a1a1a]">
                {MOIS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>

              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-[#f5f5f5] rounded-lg"
              >
                <ChevronRight className="w-5 h-5 text-[#737373]" />
              </button>
            </div>

            {/* En-têtes des jours */}
            <div className="grid grid-cols-7 mb-2">
              {JOURS_SEMAINE.map(jour => (
                <div key={jour} className="text-center text-xs font-medium text-[#737373] py-2">
                  {jour}
                </div>
              ))}
            </div>

            {/* Grille du calendrier */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, idx) => (
                <CalendarCell
                  key={idx}
                  date={date}
                  events={filteredEvents}
                  isCurrentMonth={date.getMonth() === currentDate.getMonth()}
                  isToday={isToday(date)}
                  isSelected={
                    date.getDate() === selectedDate.getDate() &&
                    date.getMonth() === selectedDate.getMonth() &&
                    date.getFullYear() === selectedDate.getFullYear()
                  }
                  onClick={setSelectedDate}
                  onEventClick={handleEventClick}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-4">
          {/* Jour sélectionné */}
          <Card className="p-4">
            <h3 className="font-medium text-[#1a1a1a] mb-3">
              {selectedDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </h3>

            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="w-10 h-10 text-[#e0e0e0] mx-auto mb-2" />
                <p className="text-sm text-[#757575]">Aucun événement</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayEvents.map(event => (
                  <EventItem key={event.id} event={event} onClick={handleEventClick} />
                ))}
              </div>
            )}
          </Card>

          {/* À venir */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-[#2563EB]" />
              <h3 className="font-medium text-[#1a1a1a]">À venir (7 jours)</h3>
            </div>

            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-[#a3a3a3] text-center py-4">
                Aucun événement à venir
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-2 bg-[#fafafa] rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      event.type === 'reunion' ? 'bg-blue-500' :
                      event.type === 'echeance' ? 'bg-red-500' :
                      event.type === 'dire' ? 'bg-amber-500' :
                      event.type === 'rapport' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1a1a1a] truncate">{event.titre}</p>
                      <p className="text-xs text-[#737373]">
                        {formatDateFr(event.date)}
                        {event.heure && ` à ${event.heure}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Légende */}
          <Card className="p-4">
            <h3 className="font-medium text-[#1a1a1a] mb-3">Légende</h3>
            <div className="space-y-2">
              {Object.entries(TYPES_EVENEMENT).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${
                    value.color === 'blue' ? 'bg-blue-500' :
                    value.color === 'red' ? 'bg-red-500' :
                    value.color === 'amber' ? 'bg-amber-500' :
                    value.color === 'green' ? 'bg-green-500' :
                    'bg-purple-500'
                  }`} />
                  <span className="text-sm text-[#737373]">{value.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Aide */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Synchronisation automatique</p>
            <p className="text-xs text-blue-600 mt-1">
              Les réunions, échéances et délais de vos affaires sont automatiquement ajoutés au calendrier.
              Les notifications vous rappelleront les événements importants selon vos préférences.
            </p>
          </div>
        </div>
      </Card>

      {/* Modal nouvel événement */}
      {showNewEventModal && (
        <ModalBase
          title="Nouvel événement"
          onClose={() => setShowNewEventModal(false)}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
                Type d'événement
              </label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              >
                {Object.entries(TYPES_EVENEMENT).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={newEvent.titre}
                onChange={(e) => setNewEvent({ ...newEvent, titre: e.target.value })}
                placeholder="Ex: Rendez-vous client, Visite chantier..."
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
                  Heure
                </label>
                <input
                  type="time"
                  value={newEvent.heure}
                  onChange={(e) => setNewEvent({ ...newEvent, heure: e.target.value })}
                  className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
                Lieu (optionnel)
              </label>
              <input
                type="text"
                value={newEvent.lieu}
                onChange={(e) => setNewEvent({ ...newEvent, lieu: e.target.value })}
                placeholder="Adresse ou lieu de rendez-vous"
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Informations complémentaires..."
                rows={3}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
              <Button
                variant="secondary"
                onClick={() => setShowNewEventModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleAddEvent}
                className="flex-1"
              >
                Créer l'événement
              </Button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* Modal édition événement personnalisé */}
      {editingEvent && (
        <ModalBase
          title="Modifier l'événement"
          onClose={() => setEditingEvent(null)}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#757575] block mb-2">
                Type d'événement
              </label>
              <select
                value={editingEvent.type}
                onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#0381fe]"
              >
                {Object.entries(TYPES_EVENEMENT).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#757575] block mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={editingEvent.titre}
                onChange={(e) => setEditingEvent({ ...editingEvent, titre: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#0381fe]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#757575] block mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={editingEvent.date}
                  onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#0381fe]"
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#757575] block mb-2">
                  Heure
                </label>
                <input
                  type="time"
                  value={editingEvent.heure}
                  onChange={(e) => setEditingEvent({ ...editingEvent, heure: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#0381fe]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#757575] block mb-2">
                Lieu
              </label>
              <input
                type="text"
                value={editingEvent.lieu || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, lieu: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#0381fe]"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#e0e0e0]">
              <Button
                variant="secondary"
                onClick={() => handleDeleteEvent(editingEvent.id)}
                className="text-[#ff3b30]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
              <div className="flex-1" />
              <Button
                variant="secondary"
                onClick={() => setEditingEvent(null)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateEvent}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* Modal détail événement (non modifiable - lié à une affaire) */}
      {showEventDetail && (
        <ModalBase
          title="Détail de l'événement"
          onClose={() => setShowEventDetail(null)}
          size="md"
        >
          <div className="space-y-4">
            {(() => {
              const type = TYPES_EVENEMENT[showEventDetail.type] || TYPES_EVENEMENT.rdv;
              const Icon = type.icon;
              return (
                <>
                  <div className="flex items-center gap-4 p-4 bg-[#f7f7f7] rounded-2xl">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      type.color === 'blue' ? 'bg-blue-100' :
                      type.color === 'red' ? 'bg-red-100' :
                      type.color === 'amber' ? 'bg-amber-100' :
                      type.color === 'green' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      <Icon className={`w-7 h-7 ${
                        type.color === 'blue' ? 'text-blue-600' :
                        type.color === 'red' ? 'text-red-600' :
                        type.color === 'amber' ? 'text-amber-600' :
                        type.color === 'green' ? 'text-green-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-[#1f1f1f]">{showEventDetail.titre}</h3>
                      <Badge variant={type.color === 'amber' ? 'warning' : type.color === 'red' ? 'error' : type.color === 'green' ? 'success' : 'default'}>
                        {type.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[#1f1f1f]">
                      <Calendar className="w-5 h-5 text-[#757575]" />
                      <span>{formatDateFr(showEventDetail.date)}</span>
                      {showEventDetail.heure && (
                        <>
                          <Clock className="w-5 h-5 text-[#757575] ml-2" />
                          <span>{showEventDetail.heure}</span>
                        </>
                      )}
                    </div>

                    {showEventDetail.lieu && (
                      <div className="flex items-center gap-3 text-[#1f1f1f]">
                        <MapPin className="w-5 h-5 text-[#757575]" />
                        <span>{showEventDetail.lieu}</span>
                      </div>
                    )}

                    {showEventDetail.affaire_reference && (
                      <div className="flex items-center gap-3 text-[#1f1f1f]">
                        <FileText className="w-5 h-5 text-[#757575]" />
                        <span>Affaire : {showEventDetail.affaire_reference}</span>
                      </div>
                    )}
                  </div>

                  {showEventDetail.affaire_id && (
                    <div className="pt-4 border-t border-[#e0e0e0]">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setShowEventDetail(null);
                          navigate(`/affaires/${showEventDetail.affaire_id}`);
                        }}
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir l'affaire
                      </Button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </ModalBase>
      )}
    </div>
  );
};

export default PageCalendrier;
