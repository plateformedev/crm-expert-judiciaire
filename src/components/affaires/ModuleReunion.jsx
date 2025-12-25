// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE RÉUNION D'EXPERTISE
// Guide complet pour la conduite de réunion d'expertise judiciaire
// ============================================================================

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Play, Pause, Square, Clock, Users, Camera, Mic, MicOff,
  Check, CheckCircle, Circle, ChevronRight, ChevronDown,
  FileText, MessageSquare, AlertTriangle, Eye, Image,
  Plus, Trash2, Edit, Save, X, Upload, Download,
  MapPin, Calendar, User, Briefcase, ClipboardList,
  Volume2, VolumeX, Settings, RefreshCw, Lightbulb
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// ÉTAPES DE LA RÉUNION D'EXPERTISE
// ============================================================================

const ETAPES_REUNION = [
  {
    id: 'accueil',
    numero: 1,
    titre: 'Accueil et présentation',
    description: 'Se présenter et vérifier l\'identité des participants',
    dureeEstimee: 5,
    checklist: [
      { id: 'presentation_expert', label: 'Se présenter en tant qu\'expert judiciaire' },
      { id: 'rappel_mission', label: 'Rappeler le cadre de la mission (n° RG, juridiction)' },
      { id: 'verification_parties', label: 'Vérifier l\'identité de chaque partie présente' },
      { id: 'pouvoirs_representation', label: 'Demander les pouvoirs de représentation si nécessaire' },
      { id: 'rappel_contradictoire', label: 'Rappeler le principe du contradictoire' }
    ],
    conseils: [
      'Créer un climat de confiance et de neutralité',
      'Expliquer le déroulement prévu de la réunion',
      'Préciser que chacun pourra s\'exprimer'
    ]
  },
  {
    id: 'presences',
    numero: 2,
    titre: 'Émargement des présences',
    description: 'Noter les présents et absents avec leurs qualités',
    dureeEstimee: 5,
    checklist: [
      { id: 'liste_presents', label: 'Établir la liste des personnes présentes' },
      { id: 'qualites_participants', label: 'Noter la qualité de chaque participant' },
      { id: 'absences_excusees', label: 'Noter les absences excusées' },
      { id: 'absences_non_excusees', label: 'Noter les absences non excusées' }
    ],
    conseils: [
      'Faire signer une feuille de présence si possible',
      'Noter l\'heure d\'arrivée de chaque participant'
    ]
  },
  {
    id: 'expose_demandeur',
    numero: 3,
    titre: 'Exposé du demandeur',
    description: 'Écouter la version des faits du demandeur',
    dureeEstimee: 15,
    checklist: [
      { id: 'version_demandeur', label: 'Recueillir l\'exposé des faits par le demandeur' },
      { id: 'chronologie_demandeur', label: 'Noter la chronologie des événements' },
      { id: 'doleances_demandeur', label: 'Lister les doléances et désordres signalés' },
      { id: 'questions_demandeur', label: 'Poser des questions de clarification' }
    ],
    conseils: [
      'Ne pas interrompre sauf pour clarification',
      'Prendre des notes détaillées',
      'Rester neutre dans vos réactions'
    ]
  },
  {
    id: 'expose_defendeur',
    numero: 4,
    titre: 'Exposé du défendeur',
    description: 'Écouter la version des faits du défendeur',
    dureeEstimee: 15,
    checklist: [
      { id: 'version_defendeur', label: 'Recueillir l\'exposé des faits par le défendeur' },
      { id: 'reponse_doleances', label: 'Noter les réponses aux doléances du demandeur' },
      { id: 'arguments_defendeur', label: 'Lister les arguments de défense' },
      { id: 'questions_defendeur', label: 'Poser des questions de clarification' }
    ],
    conseils: [
      'Accorder le même temps de parole qu\'au demandeur',
      'Noter les points de convergence et divergence'
    ]
  },
  {
    id: 'expose_intervenants',
    numero: 5,
    titre: 'Exposé des autres parties',
    description: 'Écouter les autres intervenants (assureurs, entreprises...)',
    dureeEstimee: 10,
    checklist: [
      { id: 'autres_versions', label: 'Recueillir les positions des autres parties' },
      { id: 'responsabilites_invoquees', label: 'Noter les responsabilités invoquées' },
      { id: 'garanties_invoquees', label: 'Identifier les garanties mobilisables' }
    ],
    conseils: [
      'Chaque partie doit pouvoir s\'exprimer',
      'Identifier les chaînes de responsabilité'
    ]
  },
  {
    id: 'visite_lieux',
    numero: 6,
    titre: 'Visite des lieux',
    description: 'Visite et constatations sur site',
    dureeEstimee: 30,
    checklist: [
      { id: 'tour_complet', label: 'Effectuer un tour complet des lieux' },
      { id: 'identifier_desordres', label: 'Identifier et localiser chaque désordre' },
      { id: 'photos_desordres', label: 'Photographier les désordres constatés' },
      { id: 'mesures', label: 'Prendre les mesures nécessaires' },
      { id: 'environnement', label: 'Observer l\'environnement général' }
    ],
    conseils: [
      'Faire accompagner la visite par toutes les parties',
      'Commenter les photos à haute voix pour les parties',
      'Ne pas hésiter à demander des explications sur place'
    ],
    photos: true
  },
  {
    id: 'constatations',
    numero: 7,
    titre: 'Constatations techniques',
    description: 'Analyse technique des désordres',
    dureeEstimee: 20,
    checklist: [
      { id: 'nature_desordres', label: 'Décrire la nature de chaque désordre' },
      { id: 'etendue_desordres', label: 'Évaluer l\'étendue des désordres' },
      { id: 'causes_probables', label: 'Identifier les causes probables' },
      { id: 'evolution_previsible', label: 'Évaluer l\'évolution prévisible' },
      { id: 'documents_techniques', label: 'Examiner les documents techniques fournis' }
    ],
    conseils: [
      'Être précis et factuel dans les descriptions',
      'Distinguer les faits des hypothèses'
    ]
  },
  {
    id: 'observations',
    numero: 8,
    titre: 'Observations des parties',
    description: 'Recueillir les observations finales de chaque partie',
    dureeEstimee: 10,
    checklist: [
      { id: 'observations_demandeur', label: 'Recueillir les observations du demandeur' },
      { id: 'observations_defendeur', label: 'Recueillir les observations du défendeur' },
      { id: 'observations_autres', label: 'Recueillir les observations des autres parties' },
      { id: 'documents_supplementaires', label: 'Noter les documents à fournir' }
    ],
    conseils: [
      'Demander si quelqu\'un souhaite ajouter quelque chose',
      'Noter les engagements de chaque partie'
    ]
  },
  {
    id: 'cloture',
    numero: 9,
    titre: 'Clôture et suite',
    description: 'Annoncer les prochaines étapes',
    dureeEstimee: 5,
    checklist: [
      { id: 'recap_points', label: 'Résumer les principaux points abordés' },
      { id: 'delai_dires', label: 'Fixer le délai pour les dires écrits' },
      { id: 'prochaine_reunion', label: 'Annoncer si une autre réunion est nécessaire' },
      { id: 'calendrier_previsionnel', label: 'Donner un calendrier prévisionnel' },
      { id: 'remerciements', label: 'Remercier les participants' }
    ],
    conseils: [
      'Rappeler la possibilité d\'adresser des dires écrits',
      'Être transparent sur le calendrier'
    ]
  }
];

// ============================================================================
// COMPOSANT: Chronomètre de réunion
// ============================================================================

const ChronometreReunion = ({ isRunning, onStart, onPause, onStop, elapsedTime }) => {
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#2563EB]" />
          <div>
            <p className="text-xs text-white/60 uppercase">Durée réunion</p>
            <p className="text-2xl font-mono font-light">{formatTime(elapsedTime)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              onClick={onStart}
              className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
            >
              <Play className="w-5 h-5 text-white ml-0.5" />
            </button>
          ) : (
            <button
              onClick={onPause}
              className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors"
            >
              <Pause className="w-5 h-5 text-white" />
            </button>
          )}
          <button
            onClick={onStop}
            className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <Square className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Étape de réunion
// ============================================================================

const EtapeReunion = ({
  etape,
  isActive,
  isCompleted,
  checkedItems,
  onToggleItem,
  onSelect,
  notes,
  onNotesChange
}) => {
  const [expanded, setExpanded] = useState(false);
  const completedCount = checkedItems.filter(Boolean).length;
  const totalItems = etape.checklist.length;
  const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  return (
    <div className={`rounded-xl border-2 overflow-hidden transition-all ${
      isActive ? 'border-[#2563EB] bg-[#EFF6FF]' :
      isCompleted ? 'border-green-300 bg-green-50' :
      'border-[#e5e5e5] bg-white'
    }`}>
      {/* En-tête */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => { setExpanded(!expanded); onSelect(etape.id); }}
      >
        <div className="flex items-center gap-3">
          {/* Numéro/Statut */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isCompleted ? 'bg-green-500 text-white' :
            isActive ? 'bg-[#2563EB] text-white' :
            'bg-[#e5e5e5] text-[#737373]'
          }`}>
            {isCompleted ? <Check className="w-4 h-4" /> : etape.numero}
          </div>

          {/* Titre et description */}
          <div className="flex-1">
            <h4 className="font-medium text-[#1a1a1a]">{etape.titre}</h4>
            <p className="text-xs text-[#737373]">{etape.description}</p>
          </div>

          {/* Progression */}
          {totalItems > 0 && (
            <div className="text-right">
              <p className="text-xs text-[#737373]">{completedCount}/{totalItems}</p>
              <div className="w-20 h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-[#2563EB]'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Badge photo */}
          {etape.photos && (
            <Badge variant="info" className="text-xs">
              <Camera className="w-3 h-3 mr-1" /> Photos
            </Badge>
          )}

          {expanded ? (
            <ChevronDown className="w-5 h-5 text-[#737373]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[#737373]" />
          )}
        </div>
      </div>

      {/* Contenu détaillé */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#e5e5e5]">
          {/* Conseils */}
          {etape.conseils && etape.conseils.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-blue-700 mb-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Conseils
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                {etape.conseils.map((conseil, i) => (
                  <li key={i}>• {conseil}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Checklist */}
          <div className="mt-4 space-y-2">
            {etape.checklist.map((item, index) => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f5f5f5] cursor-pointer"
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    checkedItems[index]
                      ? 'bg-green-500 border-green-500'
                      : 'border-[#d4d4d4]'
                  }`}
                  onClick={(e) => { e.preventDefault(); onToggleItem(etape.id, index); }}
                >
                  {checkedItems[index] && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm ${checkedItems[index] ? 'line-through text-[#a3a3a3]' : 'text-[#525252]'}`}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          {/* Zone de notes */}
          <div className="mt-4">
            <label className="text-xs font-medium text-[#737373] block mb-2">
              Notes pour cette étape
            </label>
            <textarea
              value={notes || ''}
              onChange={(e) => onNotesChange(etape.id, e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#2563EB]"
              placeholder="Notez vos observations..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPOSANT: Gestionnaire de photos
// ============================================================================

const GestionnairePhotos = ({ photos, onAddPhoto, onDeletePhoto, onUpdatePhoto }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [newPhotoComment, setNewPhotoComment] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          onAddPhoto({
            id: Date.now().toString() + Math.random(),
            url: event.target.result,
            nom: file.name,
            commentaire: '',
            date: new Date().toISOString(),
            localisation: ''
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#2563EB]" />
          <h3 className="font-medium text-[#1a1a1a]">Photos ({photos.length})</h3>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          variant="primary"
          size="sm"
          icon={Camera}
          onClick={() => fileInputRef.current?.click()}
        >
          Ajouter
        </Button>
      </div>

      {photos.length === 0 ? (
        <div
          className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-8 text-center cursor-pointer hover:border-[#2563EB] transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="w-12 h-12 text-[#e5e5e5] mx-auto mb-3" />
          <p className="text-sm text-[#737373]">Cliquez pour ajouter des photos</p>
          <p className="text-xs text-[#a3a3a3] mt-1">ou glissez-déposez vos fichiers</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group rounded-lg overflow-hidden border border-[#e5e5e5]"
            >
              <img
                src={photo.url}
                alt={photo.nom}
                className="w-full h-32 object-cover cursor-pointer"
                onClick={() => { setSelectedPhoto(photo); setShowModal(true); }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  className="p-2 bg-white rounded-full"
                  onClick={() => { setSelectedPhoto(photo); setShowModal(true); }}
                >
                  <Eye className="w-4 h-4 text-[#1a1a1a]" />
                </button>
                <button
                  className="p-2 bg-red-500 rounded-full"
                  onClick={() => onDeletePhoto(photo.id)}
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
              {photo.commentaire && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70">
                  <p className="text-xs text-white truncate">{photo.commentaire}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal détail photo */}
      {showModal && selectedPhoto && (
        <ModalBase
          isOpen={true}
          onClose={() => { setShowModal(false); setSelectedPhoto(null); }}
          title="Détail photo"
          size="lg"
        >
          <div className="space-y-4">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.nom}
              className="w-full max-h-96 object-contain rounded-xl"
            />

            <Input
              label="Commentaire"
              value={selectedPhoto.commentaire || ''}
              onChange={(e) => {
                const updated = { ...selectedPhoto, commentaire: e.target.value };
                onUpdatePhoto(updated);
                setSelectedPhoto(updated);
              }}
              placeholder="Décrivez ce que montre cette photo..."
            />

            <Input
              label="Localisation"
              value={selectedPhoto.localisation || ''}
              onChange={(e) => {
                const updated = { ...selectedPhoto, localisation: e.target.value };
                onUpdatePhoto(updated);
                setSelectedPhoto(updated);
              }}
              placeholder="Ex: Salle de bain, 1er étage"
            />

            <div className="text-xs text-[#a3a3a3]">
              Prise le {selectedPhoto.date ? formatDateFr(selectedPhoto.date) : '—'}
            </div>
          </div>
        </ModalBase>
      )}
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Gestion des présences
// ============================================================================

const GestionPresences = ({ parties, presents, absents, onTogglePresence }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-[#2563EB]" />
        <h3 className="font-medium text-[#1a1a1a]">Présences</h3>
      </div>

      <div className="space-y-2">
        {parties.map(partie => {
          const nom = partie.raison_sociale || `${partie.prenom || ''} ${partie.nom}`.trim();
          const isPresent = presents.includes(partie.id);
          const isAbsent = absents.includes(partie.id);

          return (
            <div key={partie.id} className="flex items-center justify-between p-3 bg-[#EFF6FF] rounded-lg">
              <div>
                <p className="font-medium text-sm text-[#1a1a1a]">{nom}</p>
                <p className="text-xs text-[#737373]">{partie.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTogglePresence(partie.id, 'present')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isPresent
                      ? 'bg-green-500 text-white'
                      : 'bg-[#e5e5e5] text-[#737373] hover:bg-green-100'
                  }`}
                >
                  Présent
                </button>
                <button
                  onClick={() => onTogglePresence(partie.id, 'absent')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isAbsent
                      ? 'bg-red-500 text-white'
                      : 'bg-[#e5e5e5] text-[#737373] hover:bg-red-100'
                  }`}
                >
                  Absent
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL: Module Réunion
// ============================================================================

export const ModuleReunion = ({ affaire, reunion, expert, onUpdate, onClose }) => {
  // États
  const [activeEtape, setActiveEtape] = useState('accueil');
  const [checkedItems, setCheckedItems] = useState({});
  const [etapeNotes, setEtapeNotes] = useState(reunion?.notes_etapes || {});
  const [photos, setPhotos] = useState(reunion?.photos || []);
  const [presents, setPresents] = useState(reunion?.presents || []);
  const [absents, setAbsents] = useState(reunion?.absents || []);
  const [notesGenerales, setNotesGenerales] = useState(reunion?.notes || '');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const parties = affaire?.parties || [];

  // Chronomètre
  const startTimer = () => {
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Ne pas réinitialiser le temps pour conserver la durée
  };

  // Toggle item checklist
  const toggleCheckItem = (etapeId, itemIndex) => {
    setCheckedItems(prev => {
      const etapeItems = prev[etapeId] || [];
      const newItems = [...etapeItems];
      newItems[itemIndex] = !newItems[itemIndex];
      return { ...prev, [etapeId]: newItems };
    });
  };

  // Notes par étape
  const updateEtapeNotes = (etapeId, notes) => {
    setEtapeNotes(prev => ({ ...prev, [etapeId]: notes }));
  };

  // Photos
  const addPhoto = (photo) => {
    setPhotos(prev => [...prev, photo]);
  };

  const deletePhoto = (photoId) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const updatePhoto = (updatedPhoto) => {
    setPhotos(prev => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
  };

  // Présences
  const togglePresence = (partieId, type) => {
    if (type === 'present') {
      setPresents(prev =>
        prev.includes(partieId) ? prev.filter(id => id !== partieId) : [...prev, partieId]
      );
      setAbsents(prev => prev.filter(id => id !== partieId));
    } else {
      setAbsents(prev =>
        prev.includes(partieId) ? prev.filter(id => id !== partieId) : [...prev, partieId]
      );
      setPresents(prev => prev.filter(id => id !== partieId));
    }
  };

  // Calculer la progression globale
  const progressionGlobale = useMemo(() => {
    let totalItems = 0;
    let checkedCount = 0;

    ETAPES_REUNION.forEach(etape => {
      totalItems += etape.checklist.length;
      const etapeChecked = checkedItems[etape.id] || [];
      checkedCount += etapeChecked.filter(Boolean).length;
    });

    return totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  }, [checkedItems]);

  // Vérifier si une étape est complétée
  const isEtapeCompleted = (etapeId) => {
    const etape = ETAPES_REUNION.find(e => e.id === etapeId);
    if (!etape) return false;
    const etapeChecked = checkedItems[etapeId] || [];
    return etapeChecked.filter(Boolean).length === etape.checklist.length;
  };

  // Sauvegarder
  const handleSave = async () => {
    const updatedReunion = {
      ...reunion,
      notes_etapes: etapeNotes,
      notes: notesGenerales,
      photos: photos,
      presents: presents,
      absents: absents,
      duree_heures: Math.round(elapsedTime / 3600 * 10) / 10,
      checklist_progress: checkedItems,
      statut: progressionGlobale === 100 ? 'terminee' : 'en-cours'
    };

    await onUpdate({
      reunions: affaire.reunions.map(r =>
        r.id === reunion.id ? updatedReunion : r
      )
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f0] overflow-hidden flex flex-col">
      {/* En-tête fixe */}
      <div className="bg-[#1a1a1a] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="text-sm">Retour à l'affaire</span>
          </button>
          <div className="h-6 w-px bg-white/20" />
          <div>
            <h1 className="text-lg font-medium">
              Réunion {reunion?.numero === 1 ? 'R1 - Accédit contradictoire' : `R${reunion?.numero || ''}`}
            </h1>
            <p className="text-sm text-white/60">
              {affaire?.reference} • {formatDateFr(reunion?.date_reunion)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Chronomètre compact dans l'en-tête */}
          <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            <span className="text-lg font-mono">{formatTime(elapsedTime)}</span>
            <div className="flex items-center gap-1">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600"
                >
                  <Play className="w-4 h-4 text-white ml-0.5" />
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-600"
                >
                  <Pause className="w-4 h-4 text-white" />
                </button>
              )}
              <button
                onClick={stopTimer}
                className="w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <Square className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>

          <Badge variant={progressionGlobale === 100 ? 'success' : 'warning'} className="text-sm py-1.5">
            {progressionGlobale}% complété
          </Badge>

          <Button variant="primary" icon={Save} onClick={handleSave} className="bg-[#2563EB] hover:bg-[#b8922a]">
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Colonne 1: Étapes (2/3 de la largeur) */}
            <div className="col-span-2 space-y-4">
              <h2 className="text-lg font-medium text-[#1a1a1a] mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#2563EB]" />
                Guide d'expertise - 9 étapes
              </h2>

              {ETAPES_REUNION.map(etape => (
                <EtapeReunion
                  key={etape.id}
                  etape={etape}
                  isActive={activeEtape === etape.id}
                  isCompleted={isEtapeCompleted(etape.id)}
                  checkedItems={checkedItems[etape.id] || []}
                  onToggleItem={toggleCheckItem}
                  onSelect={setActiveEtape}
                  notes={etapeNotes[etape.id]}
                  onNotesChange={updateEtapeNotes}
                />
              ))}
            </div>

            {/* Colonne 2: Outils (1/3 de la largeur) */}
            <div className="space-y-4">
              {/* Présences */}
              <GestionPresences
                parties={parties}
                presents={presents}
                absents={absents}
                onTogglePresence={togglePresence}
              />

              {/* Photos */}
              <GestionnairePhotos
                photos={photos}
                onAddPhoto={addPhoto}
                onDeletePhoto={deletePhoto}
                onUpdatePhoto={updatePhoto}
              />

              {/* Notes générales */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-[#2563EB]" />
                  <h3 className="font-medium text-[#1a1a1a]">Notes générales</h3>
                </div>
                <textarea
                  value={notesGenerales}
                  onChange={(e) => setNotesGenerales(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#2563EB]"
                  placeholder="Notes libres sur la réunion..."
                />
              </Card>

              {/* Transcription (placeholder) */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-800">Transcription audio</h3>
                </div>
                <p className="text-xs text-blue-600 mb-3">
                  Connectez un outil de transcription (Plaud, Otter.ai...) pour enregistrer la réunion.
                </p>
                <Button variant="secondary" size="sm" icon={Settings}>
                  Configurer
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleReunion;
