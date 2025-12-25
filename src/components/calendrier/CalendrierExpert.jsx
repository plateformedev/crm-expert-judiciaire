// ============================================================================
// CRM EXPERT JUDICIAIRE - CALENDRIER EXPERT
// Vue calendrier de toutes les réunions et échéances
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users,
  AlertTriangle, FileText, Euro, Scale, Eye, Plus,
  CalendarDays, List, Grid3X3, Download
} from 'lucide-react';
import { Card, Badge, Button, ModalBase, useToast } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// CONSTANTES
// ============================================================================

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const TYPES_EVENEMENTS = {
  reunion: { label: 'Réunion', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-100' },
  echeance: { label: 'Échéance', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-100' },
  dire: { label: 'Dire', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-100' },
  provision: { label: 'Provision', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-100' },
  rapport: { label: 'Rapport', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-100' }
};

// ============================================================================
// FONCTIONS EXPORT ICS
// ============================================================================

const formatDateICS = (date) => {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const genererICS = (evenement) => {
  const now = new Date();
  const dateDebut = new Date(evenement.date);
  if (evenement.heure) {
    const [heures, minutes] = evenement.heure.split(':');
    if (heures && minutes) {
      dateDebut.setHours(parseInt(heures), parseInt(minutes));
    }
  }
  const dateFin = new Date(dateDebut);
  dateFin.setHours(dateFin.getHours() + 2); // Durée par défaut 2h

  const typeConfig = TYPES_EVENEMENTS[evenement.type] || TYPES_EVENEMENTS.reunion;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CRM Expert Judiciaire//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@crm-expert.fr
DTSTAMP:${formatDateICS(now)}
DTSTART:${formatDateICS(dateDebut)}
DTEND:${formatDateICS(dateFin)}
SUMMARY:${evenement.titre || typeConfig.label} - ${evenement.affaireRef || ''}
DESCRIPTION:${(evenement.description || '').replace(/\n/g, '\\n')}\\nAffaire: ${evenement.affaireRef || 'N/A'}\\nTribunal: ${evenement.tribunal || 'N/A'}
LOCATION:${evenement.lieu || ''}
CATEGORIES:${typeConfig.label}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Rappel: ${evenement.titre || typeConfig.label}
END:VALARM
END:VEVENT
END:VCALENDAR`;
};

const exporterEvenementICS = (evenement) => {
  const ics = genererICS(evenement);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${evenement.type}_${evenement.affaireRef || 'evenement'}.ics`;
  link.click();
  URL.revokeObjectURL(url);
};

const exporterMultipleICS = (evenements) => {
  const now = new Date();
  let events = '';

  evenements.forEach(evt => {
    const dateDebut = new Date(evt.date);
    if (evt.heure) {
      const [heures, minutes] = evt.heure.split(':');
      if (heures && minutes) {
        dateDebut.setHours(parseInt(heures), parseInt(minutes));
      }
    }
    const dateFin = new Date(dateDebut);
    dateFin.setHours(dateFin.getHours() + 2);

    const typeConfig = TYPES_EVENEMENTS[evt.type] || TYPES_EVENEMENTS.reunion;

    events += `BEGIN:VEVENT
UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@crm-expert.fr
DTSTAMP:${formatDateICS(now)}
DTSTART:${formatDateICS(dateDebut)}
DTEND:${formatDateICS(dateFin)}
SUMMARY:${evt.titre || typeConfig.label} - ${evt.affaireRef || ''}
DESCRIPTION:${(evt.description || '').replace(/\n/g, '\\n')}\\nAffaire: ${evt.affaireRef || 'N/A'}
LOCATION:${evt.lieu || ''}
CATEGORIES:${typeConfig.label}
STATUS:CONFIRMED
END:VEVENT
`;
  });

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CRM Expert Judiciaire//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events}END:VCALENDAR`;

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `calendrier_expert_${new Date().toISOString().split('T')[0]}.ics`;
  link.click();
  URL.revokeObjectURL(url);
};

// ============================================================================
// UTILITAIRES
// ============================================================================

const getJoursSemaine = (date) => {
  const jour = date.getDay();
  return jour === 0 ? 6 : jour - 1; // Lundi = 0, Dimanche = 6
};

const getJoursDansMois = (annee, mois) => {
  return new Date(annee, mois + 1, 0).getDate();
};

const isSameDay = (d1, d2) => {
  return d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();
};

// ============================================================================
// COMPOSANT: Cellule du calendrier
// ============================================================================

const CelluleCalendrier = ({ date, evenements, isCurrentMonth, isToday, onSelectDate, onSelectEvent }) => {
  const hasEvents = evenements.length > 0;
  const maxDisplay = 2;

  return (
    <div
      className={`min-h-24 p-1 border-b border-r border-[#e5e5e5] cursor-pointer transition-colors ${
        !isCurrentMonth ? 'bg-[#fafafa]' : 'bg-white hover:bg-[#EFF6FF]'
      } ${isToday ? 'ring-2 ring-[#2563EB] ring-inset' : ''}`}
      onClick={() => onSelectDate(date)}
    >
      {/* Numéro du jour */}
      <div className={`text-sm font-medium mb-1 ${
        isToday ? 'w-6 h-6 bg-[#2563EB] text-white rounded-full flex items-center justify-center' :
        !isCurrentMonth ? 'text-[#a3a3a3]' : 'text-[#1a1a1a]'
      }`}>
        {date.getDate()}
      </div>

      {/* Événements */}
      <div className="space-y-1">
        {evenements.slice(0, maxDisplay).map((evt, i) => {
          const typeConfig = TYPES_EVENEMENTS[evt.type] || TYPES_EVENEMENTS.reunion;
          return (
            <div
              key={i}
              className={`px-1.5 py-0.5 rounded text-xs truncate cursor-pointer ${typeConfig.bgLight} ${typeConfig.textColor}`}
              onClick={(e) => { e.stopPropagation(); onSelectEvent(evt); }}
              title={evt.titre}
            >
              {evt.heure && <span className="font-medium">{evt.heure} </span>}
              {evt.titre}
            </div>
          );
        })}
        {evenements.length > maxDisplay && (
          <div className="text-xs text-[#737373] px-1">
            +{evenements.length - maxDisplay} autre(s)
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT: Liste des événements d'un jour
// ============================================================================

const ListeEvenementsJour = ({ date, evenements, onSelectEvent }) => {
  if (evenements.length === 0) {
    return (
      <div className="text-center py-8 text-[#737373]">
        <CalendarDays className="w-12 h-12 mx-auto mb-2 text-[#e5e5e5]" />
        <p>Aucun événement ce jour</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {evenements.map((evt, i) => {
        const typeConfig = TYPES_EVENEMENTS[evt.type] || TYPES_EVENEMENTS.reunion;
        return (
          <div
            key={i}
            className={`p-4 rounded-xl border-l-4 cursor-pointer hover:shadow-md transition-shadow bg-white`}
            style={{ borderLeftColor: typeConfig.color.replace('bg-', '#').replace('-500', '') }}
            onClick={() => onSelectEvent(evt)}
          >
            <div className="flex items-start justify-between">
              <div>
                <Badge variant={evt.type === 'echeance' ? 'error' : evt.type === 'reunion' ? 'info' : 'default'}>
                  {typeConfig.label}
                </Badge>
                <h4 className="font-medium text-[#1a1a1a] mt-2">{evt.titre}</h4>
                <p className="text-sm text-[#737373]">{evt.affaireRef}</p>
              </div>
              {evt.heure && (
                <div className="text-right">
                  <p className="text-lg font-medium text-[#1a1a1a]">{evt.heure}</p>
                </div>
              )}
            </div>

            {evt.lieu && (
              <p className="text-xs text-[#737373] mt-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {evt.lieu}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// COMPOSANT: Modal détail événement
// ============================================================================

const ModalDetailEvenement = ({ evenement, onClose, onNavigate }) => {
  if (!evenement) return null;

  const typeConfig = TYPES_EVENEMENTS[evenement.type] || TYPES_EVENEMENTS.reunion;

  return (
    <ModalBase
      isOpen={!!evenement}
      onClose={onClose}
      title={evenement.titre}
      size="md"
    >
      <div className="space-y-4">
        {/* Type et date */}
        <div className="flex items-center gap-3">
          <Badge variant={evenement.type === 'echeance' ? 'error' : evenement.type === 'reunion' ? 'info' : 'default'}>
            {typeConfig.label}
          </Badge>
          <span className="text-[#737373]">
            {formatDateFr(evenement.date)}
            {evenement.heure && ` à ${evenement.heure}`}
          </span>
        </div>

        {/* Affaire */}
        <div className="p-4 bg-[#EFF6FF] rounded-xl">
          <p className="text-xs text-[#737373] uppercase tracking-wider mb-1">Affaire</p>
          <p className="font-medium text-[#1a1a1a]">{evenement.affaireRef}</p>
          {evenement.tribunal && (
            <p className="text-sm text-[#737373]">{evenement.tribunal}</p>
          )}
        </div>

        {/* Lieu si réunion */}
        {evenement.lieu && (
          <div className="flex items-center gap-2 text-[#525252]">
            <MapPin className="w-4 h-4 text-[#737373]" />
            <span>{evenement.lieu}</span>
          </div>
        )}

        {/* Description */}
        {evenement.description && (
          <p className="text-sm text-[#525252]">{evenement.description}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Fermer
          </Button>
          {evenement.affaireId && onNavigate && (
            <Button
              variant="primary"
              className="flex-1"
              icon={Eye}
              onClick={() => {
                onNavigate(evenement.affaireId);
                onClose();
              }}
            >
              Voir l'affaire
            </Button>
          )}
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL: Calendrier Expert
// ============================================================================

export const CalendrierExpert = ({ affaires = [], onSelectAffaire }) => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'list'

  // Export ICS
  const handleExportAll = () => {
    const futurs = evenements.filter(e => e.date >= new Date());
    if (futurs.length === 0) {
      toast({ title: "Aucun événement", description: "Pas d'événement futur à exporter" });
      return;
    }
    exporterMultipleICS(futurs);
    toast({ title: "Export réussi", description: `${futurs.length} événement(s) exporté(s)` });
  };

  const handleExportEvent = (evt) => {
    exporterEvenementICS(evt);
    toast({ title: "Export réussi", description: "Événement exporté au format ICS" });
  };

  // Extraire tous les événements
  const evenements = useMemo(() => {
    const events = [];

    affaires.forEach(affaire => {
      // Réunions
      (affaire.reunions || []).forEach(reunion => {
        if (reunion.date_reunion && reunion.statut !== 'annulee') {
          const dateR = new Date(reunion.date_reunion);
          events.push({
            type: 'reunion',
            date: dateR,
            heure: reunion.heure || dateR.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            titre: `Réunion R${reunion.numero}`,
            affaireId: affaire.id,
            affaireRef: affaire.reference,
            tribunal: affaire.tribunal,
            lieu: reunion.lieu || affaire.bien_adresse,
            description: reunion.objet,
            statut: reunion.statut
          });
        }
      });

      // Échéances
      if (affaire.date_echeance) {
        events.push({
          type: 'echeance',
          date: new Date(affaire.date_echeance),
          titre: 'Échéance rapport',
          affaireId: affaire.id,
          affaireRef: affaire.reference,
          tribunal: affaire.tribunal,
          description: 'Date limite de dépôt du rapport'
        });
      }

      // Dires avec date limite
      (affaire.dires || []).forEach(dire => {
        if (dire.date_limite && dire.statut !== 'repondu') {
          events.push({
            type: 'dire',
            date: new Date(dire.date_limite),
            titre: `Réponse dire n°${dire.numero}`,
            affaireId: affaire.id,
            affaireRef: affaire.reference,
            description: dire.objet
          });
        }
      });

      // Note de synthèse
      if (affaire.note_synthese_date) {
        events.push({
          type: 'rapport',
          date: new Date(affaire.note_synthese_date),
          titre: 'Note de synthèse',
          affaireId: affaire.id,
          affaireRef: affaire.reference,
          description: 'Envoi de la note de synthèse'
        });
      }

      // Rapport final
      if (affaire.rapport_final_date_depot) {
        events.push({
          type: 'rapport',
          date: new Date(affaire.rapport_final_date_depot),
          titre: 'Dépôt rapport',
          affaireId: affaire.id,
          affaireRef: affaire.reference,
          description: 'Dépôt du rapport final'
        });
      }
    });

    return events.sort((a, b) => a.date - b.date);
  }, [affaires]);

  // Événements du mois courant
  const evenementsMois = useMemo(() => {
    const debut = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const fin = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    return evenements.filter(evt =>
      evt.date >= debut && evt.date <= fin
    );
  }, [evenements, currentDate]);

  // Événements de la date sélectionnée
  const evenementsJour = useMemo(() => {
    if (!selectedDate) return [];
    return evenements.filter(evt => isSameDay(evt.date, selectedDate));
  }, [evenements, selectedDate]);

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Générer les jours du calendrier
  const joursCalendrier = useMemo(() => {
    const annee = currentDate.getFullYear();
    const mois = currentDate.getMonth();
    const premierJour = new Date(annee, mois, 1);
    const dernierJour = new Date(annee, mois + 1, 0);

    const jours = [];

    // Jours du mois précédent
    const jourDebutSemaine = getJoursSemaine(premierJour);
    for (let i = jourDebutSemaine - 1; i >= 0; i--) {
      const date = new Date(annee, mois, -i);
      jours.push({ date, isCurrentMonth: false });
    }

    // Jours du mois courant
    for (let i = 1; i <= dernierJour.getDate(); i++) {
      const date = new Date(annee, mois, i);
      jours.push({ date, isCurrentMonth: true });
    }

    // Jours du mois suivant
    const joursRestants = 42 - jours.length; // 6 semaines
    for (let i = 1; i <= joursRestants; i++) {
      const date = new Date(annee, mois + 1, i);
      jours.push({ date, isCurrentMonth: false });
    }

    return jours;
  }, [currentDate]);

  // Stats
  const stats = useMemo(() => ({
    reunionsMois: evenementsMois.filter(e => e.type === 'reunion').length,
    echeancesMois: evenementsMois.filter(e => e.type === 'echeance').length,
    prochainEvenement: evenements.find(e => e.date >= new Date())
  }), [evenementsMois, evenements]);

  const today = new Date();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a]">Calendrier</h2>
          <p className="text-sm text-[#737373]">
            {stats.reunionsMois} réunion(s) • {stats.echeancesMois} échéance(s) ce mois
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Aujourd'hui
          </Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportAll}>
            Export ICS
          </Button>
          <div className="flex items-center border border-[#e5e5e5] rounded-xl overflow-hidden">
            <button
              onClick={goToPrevMonth}
              className="p-2 hover:bg-[#f5f5f5]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 font-medium text-[#1a1a1a]">
              {MOIS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-[#f5f5f5]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Prochain événement */}
      {stats.prochainEvenement && (
        <Card className="p-4 bg-gradient-to-r from-[#EFF6FF] to-white border-l-4 border-l-[#2563EB]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#737373] uppercase">Prochain événement</p>
                <p className="font-medium text-[#1a1a1a]">{stats.prochainEvenement.titre}</p>
                <p className="text-sm text-[#737373]">
                  {formatDateFr(stats.prochainEvenement.date)}
                  {stats.prochainEvenement.heure && ` à ${stats.prochainEvenement.heure}`}
                  {' • '}{stats.prochainEvenement.affaireRef}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Eye}
              onClick={() => setSelectedEvent(stats.prochainEvenement)}
            >
              Voir
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-6">
        {/* Calendrier */}
        <div className="col-span-3">
          <Card className="overflow-hidden">
            {/* En-tête jours de la semaine */}
            <div className="grid grid-cols-7 bg-[#EFF6FF]">
              {JOURS_SEMAINE.map(jour => (
                <div key={jour} className="py-2 text-center text-xs font-medium text-[#737373] uppercase">
                  {jour}
                </div>
              ))}
            </div>

            {/* Grille du calendrier */}
            <div className="grid grid-cols-7">
              {joursCalendrier.map((jour, index) => {
                const evtsJour = evenements.filter(e => isSameDay(e.date, jour.date));
                return (
                  <CelluleCalendrier
                    key={index}
                    date={jour.date}
                    evenements={evtsJour}
                    isCurrentMonth={jour.isCurrentMonth}
                    isToday={isSameDay(jour.date, today)}
                    onSelectDate={setSelectedDate}
                    onSelectEvent={setSelectedEvent}
                  />
                );
              })}
            </div>
          </Card>

          {/* Légende */}
          <div className="flex items-center gap-4 mt-4">
            {Object.entries(TYPES_EVENEMENTS).map(([type, config]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${config.color}`} />
                <span className="text-xs text-[#737373]">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-4">
          {/* Date sélectionnée */}
          <Card className="p-4">
            <h3 className="font-medium text-[#1a1a1a] mb-4">
              {selectedDate
                ? formatDateFr(selectedDate, true)
                : 'Sélectionnez une date'
              }
            </h3>
            <ListeEvenementsJour
              date={selectedDate}
              evenements={evenementsJour}
              onSelectEvent={setSelectedEvent}
            />
          </Card>

          {/* Prochaines réunions */}
          <Card className="p-4">
            <h3 className="font-medium text-[#1a1a1a] mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2563EB]" />
              Prochaines réunions
            </h3>
            <div className="space-y-3">
              {evenements
                .filter(e => e.type === 'reunion' && e.date >= today)
                .slice(0, 5)
                .map((evt, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#EFF6FF] rounded-lg cursor-pointer hover:bg-[#DBEAFE] transition-colors"
                    onClick={() => setSelectedEvent(evt)}
                  >
                    <p className="text-sm font-medium text-[#1a1a1a]">{evt.titre}</p>
                    <p className="text-xs text-[#737373]">
                      {formatDateFr(evt.date)} • {evt.affaireRef}
                    </p>
                  </div>
                ))
              }
              {evenements.filter(e => e.type === 'reunion' && e.date >= today).length === 0 && (
                <p className="text-sm text-[#737373] text-center py-4">
                  Aucune réunion planifiée
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal détail */}
      <ModalDetailEvenement
        evenement={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onNavigate={onSelectAffaire}
      />
    </div>
  );
};

export default CalendrierExpert;
