// ============================================================================
// CRM EXPERT JUDICIAIRE - GESTION DES RÉUNIONS (R1, R2, R3...)
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Calendar, CalendarPlus, Users, MapPin, Clock, FileText, Send,
  Check, X, AlertTriangle, Plus, Edit, Trash2, Eye, Camera,
  ClipboardList, MessageSquare, ChevronDown, ChevronRight, Play,
  Pause, CheckCircle, Mail, Phone, Download, Copy
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase, useToast } from '../ui';
import { TYPES_REUNION, STATUTS_REUNION } from '../../data';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// COMPOSANT: Carte d'une réunion
// ============================================================================

const ReunionCard = ({ reunion, parties, onEdit, onStartNotes, onViewCompteRendu, onConvoquer }) => {
  const [expanded, setExpanded] = useState(false);

  const statutInfo = STATUTS_REUNION.find(s => s.id === reunion.statut) || STATUTS_REUNION[0];
  const typeInfo = TYPES_REUNION.find(t => t.id === reunion.type) || TYPES_REUNION[0];

  const getStatutColor = () => {
    switch (reunion.statut) {
      case 'terminee': return 'bg-green-100 border-green-300';
      case 'en-cours': return 'bg-amber-100 border-amber-300';
      case 'planifiee':
      case 'convocations-envoyees':
      case 'confirmee': return 'bg-blue-100 border-blue-300';
      case 'reportee': return 'bg-orange-100 border-orange-300';
      case 'annulee': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  // Présents à la réunion
  const presentsCount = reunion.presents?.length || 0;
  const absentsCount = reunion.absents?.length || 0;

  return (
    <Card className={`border-2 ${getStatutColor()} overflow-hidden`}>
      {/* En-tête */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Numéro de réunion */}
            <div className="w-12 h-12 bg-[#c9a227] text-white rounded-xl flex items-center justify-center font-bold text-lg">
              R{reunion.numero}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-[#1a1a1a]">
                  Réunion n°{reunion.numero}
                </h3>
                <Badge variant={
                  statutInfo.color === 'green' ? 'success' :
                  statutInfo.color === 'amber' || statutInfo.color === 'orange' ? 'warning' :
                  statutInfo.color === 'red' ? 'error' : 'info'
                }>
                  {statutInfo.label}
                </Badge>
              </div>
              <p className="text-sm text-[#737373]">{typeInfo.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Date et heure */}
            {reunion.date_reunion && (
              <div className="text-right">
                <p className="font-medium text-[#1a1a1a]">
                  {formatDateFr(reunion.date_reunion)}
                </p>
                {reunion.heure_debut && (
                  <p className="text-sm text-[#737373]">
                    {reunion.heure_debut} - {reunion.heure_fin || '...'}
                  </p>
                )}
              </div>
            )}

            <ChevronDown className={`w-5 h-5 text-[#a3a3a3] transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Indicateurs rapides */}
        <div className="mt-3 flex items-center gap-4 text-sm text-[#737373]">
          {reunion.lieu && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {reunion.lieu}
            </span>
          )}
          {presentsCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {presentsCount} présent{presentsCount > 1 ? 's' : ''}
            </span>
          )}
          {reunion.compte_rendu && (
            <span className="flex items-center gap-1 text-green-600">
              <FileText className="w-4 h-4" />
              CR rédigé
            </span>
          )}
          {reunion.notes && (
            <span className="flex items-center gap-1 text-blue-600">
              <ClipboardList className="w-4 h-4" />
              Notes
            </span>
          )}
        </div>
      </div>

      {/* Contenu étendu */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[#e5e5e5] space-y-4">
          {/* Lieu */}
          {reunion.lieu && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-1">Lieu</p>
              <p className="text-sm text-[#1a1a1a]">{reunion.lieu}</p>
            </div>
          )}

          {/* Objet */}
          {reunion.objet && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-1">Objet</p>
              <p className="text-sm text-[#1a1a1a]">{reunion.objet}</p>
            </div>
          )}

          {/* Présents / Absents */}
          {(presentsCount > 0 || absentsCount > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {presentsCount > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-green-600 mb-1">
                    Présents ({presentsCount})
                  </p>
                  <div className="space-y-1">
                    {reunion.presents?.map((p, i) => (
                      <p key={i} className="text-sm text-[#525252]">{p}</p>
                    ))}
                  </div>
                </div>
              )}
              {absentsCount > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-red-600 mb-1">
                    Absents ({absentsCount})
                  </p>
                  <div className="space-y-1">
                    {reunion.absents?.map((a, i) => (
                      <p key={i} className="text-sm text-[#525252]">{a}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {reunion.notes && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-1">Notes</p>
              <p className="text-sm text-[#525252] whitespace-pre-wrap line-clamp-3">
                {reunion.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {/* Avant la réunion */}
            {!reunion.convocations_envoyees && reunion.statut === 'planifiee' && (
              <Button variant="primary" size="sm" icon={Send} onClick={() => onConvoquer(reunion)}>
                Envoyer convocations
              </Button>
            )}

            {/* Pendant / après la réunion */}
            {(reunion.statut === 'confirmee' || reunion.statut === 'en-cours') && (
              <Button variant="primary" size="sm" icon={ClipboardList} onClick={() => onStartNotes(reunion)}>
                {reunion.notes ? 'Continuer les notes' : 'Prendre des notes'}
              </Button>
            )}

            {/* Après la réunion */}
            {reunion.statut === 'terminee' && !reunion.compte_rendu && (
              <Button variant="primary" size="sm" icon={FileText} onClick={() => onViewCompteRendu(reunion)}>
                Rédiger le compte-rendu
              </Button>
            )}

            {reunion.compte_rendu && (
              <Button variant="secondary" size="sm" icon={Eye} onClick={() => onViewCompteRendu(reunion)}>
                Voir le compte-rendu
              </Button>
            )}

            <Button variant="secondary" size="sm" icon={Edit} onClick={() => onEdit(reunion)}>
              Modifier
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Liste des réunions
// ============================================================================

export const GestionReunions = ({ affaire, onUpdate }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showConvocModal, setShowConvocModal] = useState(false);
  const [showCRModal, setShowCRModal] = useState(false);
  const [selectedReunion, setSelectedReunion] = useState(null);

  const reunions = affaire.reunions || [];

  // Prochaine réunion (planifiée ou confirmée)
  const prochaineReunion = useMemo(() => {
    return reunions.find(r =>
      ['planifiee', 'convocations-envoyees', 'confirmee'].includes(r.statut)
    );
  }, [reunions]);

  // Ajouter une réunion
  const handleAddReunion = (data) => {
    const newReunion = {
      id: `reunion-${Date.now()}`,
      numero: reunions.length + 1,
      ...data,
      statut: 'planifiee',
      convocations_envoyees: false,
      created_at: new Date().toISOString()
    };

    onUpdate({
      reunions: [...reunions, newReunion]
    });
    setShowAddModal(false);
  };

  // Mettre à jour une réunion
  const handleUpdateReunion = (reunionId, updates) => {
    onUpdate({
      reunions: reunions.map(r =>
        r.id === reunionId ? { ...r, ...updates } : r
      )
    });
  };

  // Ouvrir la prise de notes
  const openNotes = (reunion) => {
    setSelectedReunion(reunion);
    setShowNotesModal(true);
  };

  // Ouvrir les convocations
  const openConvocations = (reunion) => {
    setSelectedReunion(reunion);
    setShowConvocModal(true);
  };

  // Ouvrir le compte-rendu
  const openCompteRendu = (reunion) => {
    setSelectedReunion(reunion);
    setShowCRModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Prochaine réunion - mise en avant */}
      {prochaineReunion && (
        <Card className="p-4 bg-gradient-to-r from-[#faf8f3] to-white border-l-4 border-[#c9a227]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#c9a227] rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#c9a227] font-medium">
                  Prochaine réunion
                </p>
                <p className="font-medium text-[#1a1a1a]">
                  R{prochaineReunion.numero} - {prochaineReunion.date_reunion ? formatDateFr(prochaineReunion.date_reunion) : 'Date à définir'}
                </p>
              </div>
            </div>
            {!prochaineReunion.convocations_envoyees && (
              <Button variant="primary" size="sm" icon={Send} onClick={() => openConvocations(prochaineReunion)}>
                Envoyer convocations
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Liste des réunions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-[#1a1a1a]">
            Réunions ({reunions.length})
          </h3>
          <Button variant="primary" icon={CalendarPlus} onClick={() => setShowAddModal(true)}>
            Planifier R{reunions.length + 1}
          </Button>
        </div>

        {reunions.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-[#a3a3a3] mx-auto mb-3" />
            <p className="text-[#737373]">Aucune réunion planifiée</p>
            <Button variant="primary" icon={CalendarPlus} className="mt-4" onClick={() => setShowAddModal(true)}>
              Planifier la première réunion
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {reunions.map(reunion => (
              <ReunionCard
                key={reunion.id}
                reunion={reunion}
                parties={affaire.parties}
                onEdit={(r) => {
                  setSelectedReunion(r);
                  setShowAddModal(true);
                }}
                onStartNotes={openNotes}
                onViewCompteRendu={openCompteRendu}
                onConvoquer={openConvocations}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal ajout/édition réunion */}
      {showAddModal && (
        <ModalAjoutReunion
          reunion={selectedReunion}
          reunionNumero={selectedReunion?.numero || reunions.length + 1}
          affaire={affaire}
          onClose={() => {
            setShowAddModal(false);
            setSelectedReunion(null);
          }}
          onSave={selectedReunion ?
            (data) => {
              handleUpdateReunion(selectedReunion.id, data);
              setShowAddModal(false);
              setSelectedReunion(null);
            } : handleAddReunion
          }
        />
      )}

      {/* Modal prise de notes */}
      {showNotesModal && selectedReunion && (
        <ModalPriseNotes
          reunion={selectedReunion}
          affaire={affaire}
          onClose={() => {
            setShowNotesModal(false);
            setSelectedReunion(null);
          }}
          onSave={(notes) => {
            handleUpdateReunion(selectedReunion.id, {
              notes,
              statut: 'en-cours'
            });
            setShowNotesModal(false);
            setSelectedReunion(null);
          }}
          onTerminer={(notes) => {
            handleUpdateReunion(selectedReunion.id, {
              notes,
              statut: 'terminee',
              heure_fin: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            });
            setShowNotesModal(false);
            setSelectedReunion(null);
          }}
        />
      )}

      {/* Modal convocations */}
      {showConvocModal && selectedReunion && (
        <ModalConvocations
          reunion={selectedReunion}
          parties={affaire.parties || []}
          affaire={affaire}
          onClose={() => {
            setShowConvocModal(false);
            setSelectedReunion(null);
          }}
          onSend={() => {
            handleUpdateReunion(selectedReunion.id, {
              convocations_envoyees: true,
              date_convocations: new Date().toISOString(),
              statut: 'convocations-envoyees'
            });
            setShowConvocModal(false);
            setSelectedReunion(null);
          }}
        />
      )}

      {/* Modal compte-rendu */}
      {showCRModal && selectedReunion && (
        <ModalCompteRendu
          reunion={selectedReunion}
          affaire={affaire}
          onClose={() => {
            setShowCRModal(false);
            setSelectedReunion(null);
          }}
          onSave={(cr) => {
            handleUpdateReunion(selectedReunion.id, { compte_rendu: cr });
            setShowCRModal(false);
            setSelectedReunion(null);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// MODAL: Ajout/Édition d'une réunion
// ============================================================================

const ModalAjoutReunion = ({ reunion, reunionNumero, affaire, onClose, onSave }) => {
  const [data, setData] = useState({
    type: reunion?.type || 'expertise',
    date_reunion: reunion?.date_reunion || '',
    heure_debut: reunion?.heure_debut || '09:00',
    heure_fin: reunion?.heure_fin || '',
    lieu: reunion?.lieu || `${affaire.bien_adresse || ''}, ${affaire.bien_code_postal || ''} ${affaire.bien_ville || ''}`.trim(),
    objet: reunion?.objet || `Expertise contradictoire - Réunion n°${reunionNumero}`
  });

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title={reunion ? `Modifier la réunion R${reunion.numero}` : `Planifier la réunion R${reunionNumero}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
            Type de réunion
          </label>
          <select
            value={data.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
          >
            {TYPES_REUNION.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Date et heures */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Date"
            type="date"
            value={data.date_reunion}
            onChange={(e) => handleChange('date_reunion', e.target.value)}
            required
          />
          <Input
            label="Heure début"
            type="time"
            value={data.heure_debut}
            onChange={(e) => handleChange('heure_debut', e.target.value)}
          />
          <Input
            label="Heure fin (prévisionnelle)"
            type="time"
            value={data.heure_fin}
            onChange={(e) => handleChange('heure_fin', e.target.value)}
          />
        </div>

        {/* Lieu */}
        <Input
          label="Lieu"
          value={data.lieu}
          onChange={(e) => handleChange('lieu', e.target.value)}
          placeholder="Adresse de la réunion"
        />

        {/* Objet */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
            Objet de la réunion
          </label>
          <textarea
            value={data.objet}
            onChange={(e) => handleChange('objet', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
            placeholder="Décrire l'objet de cette réunion..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => onSave(data)}>
            {reunion ? 'Enregistrer' : 'Planifier'}
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// MODAL: Prise de notes pendant la réunion
// ============================================================================

const ModalPriseNotes = ({ reunion, affaire, onClose, onSave, onTerminer }) => {
  const toast = useToast();
  const [notes, setNotes] = useState(reunion.notes || '');
  const [presents, setPresents] = useState(reunion.presents || []);
  const [absents, setAbsents] = useState(reunion.absents || []);

  // Liste des parties pour cocher présents/absents
  const parties = affaire.parties || [];

  const togglePresent = (partieName) => {
    if (presents.includes(partieName)) {
      setPresents(presents.filter(p => p !== partieName));
    } else {
      setPresents([...presents, partieName]);
      setAbsents(absents.filter(a => a !== partieName));
    }
  };

  const toggleAbsent = (partieName) => {
    if (absents.includes(partieName)) {
      setAbsents(absents.filter(a => a !== partieName));
    } else {
      setAbsents([...absents, partieName]);
      setPresents(presents.filter(p => p !== partieName));
    }
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title={`Notes - Réunion R${reunion.numero}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Info réunion */}
        <div className="p-3 bg-[#faf8f3] rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 bg-[#c9a227] rounded-full flex items-center justify-center text-white font-bold">
            R{reunion.numero}
          </div>
          <div>
            <p className="font-medium">{formatDateFr(reunion.date_reunion)}</p>
            <p className="text-sm text-[#737373]">{reunion.lieu}</p>
          </div>
        </div>

        {/* Présents / Absents */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373] mb-3">
            Feuille de présence
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {parties.map((partie, i) => {
              const name = partie.raison_sociale || `${partie.prenom || ''} ${partie.nom}`.trim();
              return (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm">{name}</span>
                  <div className="flex gap-2">
                    <button
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        presents.includes(name) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                      onClick={() => togglePresent(name)}
                    >
                      Présent
                    </button>
                    <button
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        absents.includes(name) ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                      onClick={() => toggleAbsent(name)}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone de notes */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
            Notes et observations
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] font-mono text-sm"
            placeholder="Saisissez vos notes pendant la réunion...

• Constatations visuelles
• Déclarations des parties
• Points de désaccord
• Documents présentés
• Photos prises (références)
• Questions en suspens"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
          <Button
            variant="secondary"
            icon={Camera}
            onClick={() => toast.info('Fonctionnalité à venir', 'L\'ajout de photos sera bientôt disponible')}
          >
            Ajouter photo
          </Button>
          <div className="flex-1" />
          <Button
            variant="secondary"
            onClick={() => onSave(notes)}
          >
            Sauvegarder
          </Button>
          <Button
            variant="primary"
            icon={CheckCircle}
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onTerminer(notes)}
          >
            Terminer la réunion
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// MODAL: Convocations
// ============================================================================

const ModalConvocations = ({ reunion, parties, affaire, onClose, onSend }) => {
  const [selectedParties, setSelectedParties] = useState(
    parties.map(p => p.id || p.nom)
  );

  const getConvocationTemplate = () => {
    return `Convocation à expertise contradictoire

Affaire : ${affaire.reference}
Tribunal : ${affaire.tribunal}
RG : ${affaire.rg}

Je vous prie de bien vouloir vous présenter ou vous faire représenter à la réunion d'expertise qui se tiendra :

Date : ${reunion.date_reunion ? formatDateFr(reunion.date_reunion) : '___'}
Heure : ${reunion.heure_debut || '___'}
Lieu : ${reunion.lieu || '___'}

Objet : ${reunion.objet || 'Expertise contradictoire'}

Je vous rappelle que, conformément aux dispositions de l'article 160 du Code de procédure civile, vous avez la possibilité de vous faire assister par tout conseil de votre choix.

Vous voudrez bien me confirmer votre présence ou votre représentation.

L'Expert Judiciaire`;
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title={`Convocations - R${reunion.numero}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Parties à convoquer */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373] mb-3">
            Parties à convoquer
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {parties.map((partie, i) => {
              const id = partie.id || partie.nom;
              const name = partie.raison_sociale || `${partie.prenom || ''} ${partie.nom}`.trim();
              return (
                <label key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedParties.includes(id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedParties([...selectedParties, id]);
                      } else {
                        setSelectedParties(selectedParties.filter(p => p !== id));
                      }
                    }}
                    className="w-4 h-4 text-[#c9a227] rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-[#737373]">{partie.type} {partie.email && `• ${partie.email}`}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Aperçu de la convocation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium uppercase tracking-wider text-[#737373]">
              Modèle de convocation
            </label>
            <div className="flex gap-1">
              <button
                className="p-1.5 bg-white rounded border hover:bg-gray-50"
                title="Copier"
                onClick={() => navigator.clipboard.writeText(getConvocationTemplate())}
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1.5 bg-white rounded border hover:bg-gray-50" title="Télécharger">
                <Download className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <textarea
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] font-mono text-sm"
            rows={12}
            defaultValue={getConvocationTemplate()}
          />
        </div>

        {/* Mode d'envoi */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-sm font-medium text-[#1a1a1a] mb-3">Mode d'envoi</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="envoi" value="lrar" defaultChecked className="text-[#c9a227]" />
              <span className="text-sm">LRAR (Lettre recommandée avec AR)</span>
              <Badge variant="info" className="ml-2">Obligatoire</Badge>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="envoi" value="email" className="text-[#c9a227]" />
              <span className="text-sm">Email (en complément)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="envoi" value="rpvj" className="text-[#c9a227]" />
              <span className="text-sm">RPVJ (pour les avocats)</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" icon={Send} className="flex-1" onClick={onSend}>
            Marquer comme envoyées
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// MODAL: Compte-rendu de réunion
// ============================================================================

const ModalCompteRendu = ({ reunion, affaire, onClose, onSave }) => {
  const [cr, setCR] = useState(reunion.compte_rendu || '');

  const generateCRTemplate = () => {
    const template = `COMPTE-RENDU DE RÉUNION D'EXPERTISE

═══════════════════════════════════════════════════════════════════
INFORMATIONS GÉNÉRALES
═══════════════════════════════════════════════════════════════════

Affaire : ${affaire.reference}
Tribunal : ${affaire.tribunal}
RG : ${affaire.rg}

Date de la réunion : ${reunion.date_reunion ? formatDateFr(reunion.date_reunion) : '___'}
Lieu : ${reunion.lieu || '___'}
Heure de début : ${reunion.heure_debut || '___'}
Heure de fin : ${reunion.heure_fin || '___'}

═══════════════════════════════════════════════════════════════════
PRÉSENTS
═══════════════════════════════════════════════════════════════════

${reunion.presents?.map(p => `• ${p}`).join('\n') || '• [À compléter]'}

═══════════════════════════════════════════════════════════════════
ABSENTS / EXCUSÉS
═══════════════════════════════════════════════════════════════════

${reunion.absents?.map(a => `• ${a}`).join('\n') || '• Néant'}

═══════════════════════════════════════════════════════════════════
DÉROULEMENT DE LA RÉUNION
═══════════════════════════════════════════════════════════════════

${reunion.notes || '[Insérer les notes de la réunion]'}

═══════════════════════════════════════════════════════════════════
CONSTATATIONS
═══════════════════════════════════════════════════════════════════

[Décrire les constatations effectuées]

═══════════════════════════════════════════════════════════════════
DÉCLARATIONS DES PARTIES
═══════════════════════════════════════════════════════════════════

[Résumer les déclarations importantes]

═══════════════════════════════════════════════════════════════════
DEMANDES COMPLÉMENTAIRES
═══════════════════════════════════════════════════════════════════

[Lister les documents ou informations demandés]

═══════════════════════════════════════════════════════════════════
SUITE À DONNER
═══════════════════════════════════════════════════════════════════

[ ] Réunion supplémentaire nécessaire
[ ] Note de synthèse à rédiger
[ ] Demande de consignation complémentaire
[ ] Attente de pièces

═══════════════════════════════════════════════════════════════════

Fait à [Ville], le ${new Date().toLocaleDateString('fr-FR')}

L'Expert Judiciaire`;
    setCR(template);
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title={`Compte-rendu - R${reunion.numero}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Bouton générer template */}
        {!cr && (
          <Button variant="secondary" icon={FileText} onClick={generateCRTemplate}>
            Générer le modèle
          </Button>
        )}

        {/* Éditeur */}
        <div>
          <textarea
            value={cr}
            onChange={(e) => setCR(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] font-mono text-sm"
            placeholder="Rédigez le compte-rendu de la réunion..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="secondary" icon={Copy} onClick={() => navigator.clipboard.writeText(cr)}>
            Copier
          </Button>
          <Button variant="secondary" icon={Download}>
            Exporter PDF
          </Button>
          <div className="flex-1" />
          <Button variant="primary" onClick={() => onSave(cr)}>
            Enregistrer
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

export default GestionReunions;
