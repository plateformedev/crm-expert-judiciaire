// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE CONVOCATION
// Génération et envoi de convocations aux parties
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  Send, Mail, FileText, Users, Calendar, Clock, MapPin,
  Check, AlertTriangle, Edit, Eye, Copy, Download, Printer,
  Plus, Trash2, ChevronRight, Building, User, Briefcase,
  CheckCircle, XCircle, RefreshCw, Wand2, Save, ExternalLink,
  Phone, AtSign, Home, FileCheck, Stamp, X, ArrowLeft
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase, useToast } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// CONSTANTES
// ============================================================================

const MODES_ENVOI = [
  {
    id: 'email',
    label: 'Email simple',
    icon: Mail,
    description: 'Envoi par email - rapide mais sans valeur probante',
    color: 'blue',
    delai: 'Instantané'
  },
  {
    id: 'ar24',
    label: 'AR24 / RPVJ',
    icon: Stamp,
    description: 'Lettre recommandée électronique avec accusé de réception',
    color: 'green',
    delai: '24-48h',
    legal: true
  },
  {
    id: 'lrar',
    label: 'LRAR Postale',
    icon: Send,
    description: 'Lettre recommandée papier avec accusé de réception',
    color: 'amber',
    delai: '3-5 jours',
    legal: true
  },
  {
    id: 'courrier_simple',
    label: 'Courrier simple',
    icon: FileText,
    description: 'Envoi postal simple sans accusé de réception',
    color: 'gray',
    delai: '2-3 jours'
  }
];

const STATUTS_ENVOI = {
  brouillon: { label: 'Brouillon', color: 'gray', icon: Edit },
  pret: { label: 'Prêt à envoyer', color: 'blue', icon: FileCheck },
  envoye: { label: 'Envoyé', color: 'amber', icon: Send },
  distribue: { label: 'Distribué', color: 'green', icon: CheckCircle },
  erreur: { label: 'Erreur', color: 'red', icon: XCircle }
};

// ============================================================================
// TEMPLATE DE CONVOCATION PAR DÉFAUT
// ============================================================================

const TEMPLATE_CONVOCATION = (affaire, reunion, partie, expert) => {
  const isFirstReunion = reunion?.numero === 1;

  return `Madame, Monsieur,

En ma qualité d'expert judiciaire désigné par ordonnance ${affaire.date_ordonnance ? `du ${formatDateFr(affaire.date_ordonnance)}` : ''} de ${affaire.tribunal || '[Tribunal]'} dans l'affaire enregistrée sous le numéro RG ${affaire.rg || '[N° RG]'}, j'ai l'honneur de vous convoquer à ${isFirstReunion ? 'la première réunion' : `la réunion n°${reunion?.numero || ''}`} d'expertise qui se tiendra :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 DATE : ${reunion?.date_reunion ? formatDateFr(reunion.date_reunion) : '[Date à définir]'}
🕐 HEURE : ${reunion?.heure || '[Heure à définir]'}
📍 LIEU : ${reunion?.lieu || affaire.bien_adresse || '[Adresse du bien]'}
         ${affaire.bien_code_postal || ''} ${affaire.bien_ville || ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${isFirstReunion ? `ORDRE DU JOUR DE CETTE PREMIÈRE RÉUNION :
• Présentation des parties et de leurs conseils
• Rappel de la mission confiée par le tribunal
• Exposé des faits par chaque partie
• Visite des lieux et premières constatations
• Recueil des observations des parties
• Organisation de la suite des opérations d'expertise

` : ''}Je vous rappelle que, conformément aux dispositions de l'article 160 du Code de procédure civile, vous pouvez vous faire assister ou représenter par toute personne de votre choix.

En cas d'empêchement majeur, je vous prie de bien vouloir m'en informer dans les plus brefs délais afin que nous puissions convenir d'une nouvelle date.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${expert?.prenom || '[Prénom]'} ${expert?.nom || '[Nom]'}
Expert Judiciaire près la Cour d'Appel de ${expert?.cour_appel || '[Ville]'}
${expert?.telephone ? `Tél. : ${expert.telephone}` : ''}
${expert?.email ? `Email : ${expert.email}` : ''}`;
};

// ============================================================================
// COMPOSANT: Sélecteur de destinataire
// ============================================================================

const SelecteurDestinataires = ({ parties, selectedIds, onToggle, onSelectAll, includeAvocats = true }) => {
  // Extraire les avocats avec coordonnées complètes
  const avocats = useMemo(() => {
    const avocatMap = new Map();
    parties.forEach(partie => {
      if (partie.avocat_nom && partie.avocat_email) {
        const avocatKey = `avocat_${partie.avocat_email}`;
        if (!avocatMap.has(avocatKey)) {
          avocatMap.set(avocatKey, {
            id: avocatKey,
            type: 'avocat',
            nom: partie.avocat_nom,
            cabinet: partie.avocat_cabinet,
            email: partie.avocat_email,
            telephone: partie.avocat_telephone,
            adresse: partie.avocat_adresse,
            representePour: [partie]
          });
        } else {
          avocatMap.get(avocatKey).representePour.push(partie);
        }
      }
    });
    return Array.from(avocatMap.values());
  }, [parties]);

  const allDestinataires = includeAvocats ? [...parties, ...avocats] : parties;
  const totalCount = allDestinataires.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#1a1a1a]">Destinataires</h4>
        <button
          onClick={() => onSelectAll(allDestinataires.map(d => d.id))}
          className="text-xs text-[#2563EB] hover:underline"
        >
          {selectedIds.length === totalCount ? 'Tout désélectionner' : 'Tout sélectionner'}
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="flex gap-2 text-xs">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          {parties.filter(p => selectedIds.includes(p.id)).length}/{parties.length} parties
        </span>
        {includeAvocats && avocats.length > 0 && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
            {avocats.filter(a => selectedIds.includes(a.id)).length}/{avocats.length} avocats
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {/* Parties */}
        {parties.length > 0 && (
          <>
            <div className="text-xs text-[#a3a3a3] uppercase tracking-wider mt-2">Parties</div>
            {parties.map(partie => {
              const isSelected = selectedIds.includes(partie.id);
              const nom = partie.raison_sociale || `${partie.prenom || ''} ${partie.nom}`.trim();

              return (
                <div
                  key={partie.id}
                  onClick={() => onToggle(partie.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#2563EB] bg-[#EFF6FF]'
                      : 'border-[#e5e5e5] hover:border-[#2563EB]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-[#2563EB] border-[#2563EB]' : 'border-[#d4d4d4]'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#737373]" />
                        <span className="font-medium text-sm text-[#1a1a1a]">{nom}</span>
                        <Badge variant={partie.type === 'demandeur' ? 'info' : partie.type === 'defendeur' ? 'warning' : 'default'}>
                          {partie.qualite || partie.type}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-[#737373]">
                        {partie.email && (
                          <span className="flex items-center gap-1">
                            <AtSign className="w-3 h-3" /> {partie.email}
                          </span>
                        )}
                        {partie.adresse && (
                          <span className="flex items-center gap-1 truncate max-w-[180px]">
                            <Home className="w-3 h-3" /> {partie.adresse}
                          </span>
                        )}
                      </div>

                      {partie.avocat_nom && (
                        <div className="mt-1 text-xs text-[#a3a3a3]">
                          <Briefcase className="w-3 h-3 inline mr-1" />
                          Représenté par Me {partie.avocat_nom}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Avocats */}
        {includeAvocats && avocats.length > 0 && (
          <>
            <div className="text-xs text-[#a3a3a3] uppercase tracking-wider mt-4">Avocats</div>
            {avocats.map(avocat => {
              const isSelected = selectedIds.includes(avocat.id);

              return (
                <div
                  key={avocat.id}
                  onClick={() => onToggle(avocat.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-[#e5e5e5] hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-purple-500 border-purple-500' : 'border-[#d4d4d4]'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                        <span className="font-medium text-sm text-[#1a1a1a]">Me {avocat.nom}</span>
                        <Badge className="bg-purple-100 text-purple-700">Avocat</Badge>
                      </div>

                      {avocat.cabinet && (
                        <p className="text-xs text-[#737373] mt-1">{avocat.cabinet}</p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-[#737373]">
                        {avocat.email && (
                          <span className="flex items-center gap-1">
                            <AtSign className="w-3 h-3" /> {avocat.email}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#a3a3a3] mt-1">
                        Représente : {avocat.representePour.map(p =>
                          p.raison_sociale || `${p.prenom || ''} ${p.nom}`.trim()
                        ).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {parties.length === 0 && (
          <div className="text-center py-8 text-[#737373]">
            <Users className="w-8 h-8 mx-auto mb-2 text-[#e5e5e5]" />
            <p>Aucune partie dans ce dossier</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT: Sélecteur du mode d'envoi
// ============================================================================

const SelecteurModeEnvoi = ({ selectedMode, onSelect }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[#1a1a1a]">Mode d'envoi</h4>

      <div className="grid grid-cols-2 gap-3">
        {MODES_ENVOI.map(mode => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => onSelect(mode.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-[#2563EB] bg-[#EFF6FF]'
                  : 'border-[#e5e5e5] hover:border-[#2563EB]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-[#2563EB] text-white' : 'bg-[#f5f5f5] text-[#737373]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-[#1a1a1a]">{mode.label}</span>
                    {mode.legal && (
                      <Badge variant="success" className="text-xs">Valeur légale</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#737373] mt-1">{mode.description}</p>
                  <p className="text-xs text-[#a3a3a3] mt-1">Délai : {mode.delai}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedMode === 'ar24' && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-xs text-green-700">
            <strong>AR24 / RPVJ</strong> : La lettre recommandée électronique a la même valeur juridique
            que la LRAR papier (Article L.100 du Code des postes et des communications électroniques).
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPOSANT: Éditeur de convocation
// ============================================================================

const EditeurConvocation = ({ contenu, onChange, affaire, reunion, partie, expert, onRegenerate }) => {
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#1a1a1a]">Contenu de la convocation</h4>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={onRegenerate}
          >
            Régénérer
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={previewMode ? Edit : Eye}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Éditer' : 'Aperçu'}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <div className="p-6 bg-white border border-[#e5e5e5] rounded-xl min-h-[400px]">
          <div className="max-w-xl mx-auto">
            {/* En-tête lettre */}
            <div className="text-right text-sm text-[#737373] mb-6">
              <p>{expert?.prenom} {expert?.nom}</p>
              <p>Expert Judiciaire</p>
              <p>{expert?.adresse || ''}</p>
            </div>

            <div className="text-sm text-[#737373] mb-6">
              <p>À l'attention de :</p>
              <p className="font-medium text-[#1a1a1a]">
                {partie?.raison_sociale || `${partie?.prenom || ''} ${partie?.nom || ''}`}
              </p>
              <p>{partie?.adresse || ''}</p>
            </div>

            <div className="text-right text-sm text-[#737373] mb-8">
              <p>Le {formatDateFr(new Date())}</p>
            </div>

            <div className="text-sm font-medium text-[#1a1a1a] mb-4">
              Objet : Convocation à réunion d'expertise - RG {affaire?.rg}
            </div>

            <pre className="whitespace-pre-wrap font-serif text-sm text-[#1a1a1a] leading-relaxed">
              {contenu}
            </pre>
          </div>
        </div>
      ) : (
        <textarea
          value={contenu}
          onChange={(e) => onChange(e.target.value)}
          rows={18}
          className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] font-mono text-sm leading-relaxed"
          placeholder="Rédigez votre convocation..."
        />
      )}

      <div className="flex items-center justify-between text-xs text-[#a3a3a3]">
        <span>{contenu.split(/\s+/).filter(w => w).length} mots</span>
        <span>Affaire : {affaire?.reference}</span>
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT: Historique des envois
// ============================================================================

const HistoriqueEnvois = ({ envois, parties }) => {
  if (!envois || envois.length === 0) {
    return (
      <div className="text-center py-8 text-[#737373]">
        <Send className="w-8 h-8 mx-auto mb-2 text-[#e5e5e5]" />
        <p>Aucun envoi effectué</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {envois.map((envoi, index) => {
        const statut = STATUTS_ENVOI[envoi.statut] || STATUTS_ENVOI.brouillon;
        const StatusIcon = statut.icon;
        const mode = MODES_ENVOI.find(m => m.id === envoi.mode);
        const partie = parties?.find(p => p.id === envoi.partie_id);

        return (
          <div
            key={index}
            className={`p-4 rounded-xl border-l-4 bg-white ${
              envoi.statut === 'distribue' ? 'border-l-green-500' :
              envoi.statut === 'erreur' ? 'border-l-red-500' :
              envoi.statut === 'envoye' ? 'border-l-amber-500' :
              'border-l-gray-400'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <StatusIcon className={`w-5 h-5 mt-0.5 ${
                  envoi.statut === 'distribue' ? 'text-green-500' :
                  envoi.statut === 'erreur' ? 'text-red-500' :
                  envoi.statut === 'envoye' ? 'text-amber-500' :
                  'text-gray-400'
                }`} />
                <div>
                  <p className="font-medium text-sm text-[#1a1a1a]">
                    {partie?.raison_sociale || `${partie?.prenom || ''} ${partie?.nom || ''}` || 'Destinataire'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={statut.color}>{statut.label}</Badge>
                    <span className="text-xs text-[#737373]">via {mode?.label || envoi.mode}</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-[#a3a3a3]">
                <p>{envoi.date_envoi ? formatDateFr(envoi.date_envoi) : '—'}</p>
                {envoi.date_distribution && (
                  <p className="text-green-600">Reçu le {formatDateFr(envoi.date_distribution)}</p>
                )}
              </div>
            </div>

            {envoi.erreur && (
              <p className="text-xs text-red-600 mt-2">{envoi.erreur}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL: Module Convocation
// ============================================================================

export const ModuleConvocation = ({ affaire, reunion, expert, onUpdate, onClose }) => {
  const toast = useToast();
  // États
  const [selectedParties, setSelectedParties] = useState([]);
  const [modeEnvoi, setModeEnvoi] = useState('ar24');
  const [contenu, setContenu] = useState('');
  const [activeTab, setActiveTab] = useState('composer'); // 'composer' | 'historique'
  const [sending, setSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const parties = affaire?.parties || [];
  const envois = reunion?.convocations_envoyees || [];

  // Initialiser le contenu
  const regenererContenu = useCallback(() => {
    const firstSelectedPartie = parties.find(p => selectedParties.includes(p.id));
    const newContenu = TEMPLATE_CONVOCATION(affaire, reunion, firstSelectedPartie, expert);
    setContenu(newContenu);
  }, [affaire, reunion, expert, parties, selectedParties]);

  // Initialiser au chargement
  React.useEffect(() => {
    if (!contenu && parties.length > 0) {
      setSelectedParties(parties.map(p => p.id));
      regenererContenu();
    }
  }, []);

  // Toggle sélection partie
  const togglePartie = (partieId) => {
    setSelectedParties(prev =>
      prev.includes(partieId)
        ? prev.filter(id => id !== partieId)
        : [...prev, partieId]
    );
  };

  // Sélectionner/désélectionner tout
  const toggleSelectAll = (allIds) => {
    if (selectedParties.length === allIds.length) {
      setSelectedParties([]);
    } else {
      setSelectedParties(allIds);
    }
  };

  // Envoyer les convocations
  const handleEnvoyer = async () => {
    setSending(true);

    // Simuler l'envoi
    const nouveauxEnvois = selectedParties.map(partieId => ({
      id: Date.now().toString() + partieId,
      partie_id: partieId,
      mode: modeEnvoi,
      contenu: contenu,
      date_envoi: new Date().toISOString(),
      statut: modeEnvoi === 'email' ? 'distribue' : 'envoye'
    }));

    // Mettre à jour l'affaire
    const updatedConvocations = [...envois, ...nouveauxEnvois];

    await onUpdate({
      reunions: affaire.reunions.map(r =>
        r.id === reunion.id
          ? {
              ...r,
              convocations_envoyees: updatedConvocations,
              date_convocation: new Date().toISOString()
            }
          : r
      )
    });

    setSending(false);
    setShowConfirmModal(false);
    setActiveTab('historique');
  };

  // Copier le contenu
  const handleCopier = () => {
    navigator.clipboard.writeText(contenu);
  };

  // Télécharger en PDF (simulé)
  const handleTelecharger = () => {
    toast.info('Mode démo', 'Le téléchargement PDF n\'est pas disponible en mode démonstration');
  };

  // Calculer si toutes les parties ont été convoquées
  const partiesConvoquees = useMemo(() => {
    return parties.filter(p =>
      envois.some(e => e.partie_id === p.id && (e.statut === 'envoye' || e.statut === 'distribue'))
    );
  }, [parties, envois]);

  const toutesPartiesConvoquees = partiesConvoquees.length === parties.length;

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
              Convocation {reunion?.numero === 1 ? 'R1 - Accédit contradictoire' : `R${reunion?.numero || ''}`}
            </h1>
            <p className="text-sm text-white/60">
              {affaire?.reference} • {parties.length} partie(s) à convoquer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Infos réunion compactes */}
          <div className="flex items-center gap-4 bg-white/10 rounded-lg px-4 py-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2563EB]" />
              <span>{reunion?.date_reunion ? formatDateFr(reunion.date_reunion) : 'Date non définie'}</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <span>{reunion?.heure || '—'}</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2563EB]" />
              <span className="max-w-[200px] truncate">{reunion?.lieu || affaire?.bien_adresse || 'Lieu non défini'}</span>
            </div>
          </div>

          {/* Statut */}
          {toutesPartiesConvoquees ? (
            <Badge variant="success" className="flex items-center gap-1 py-1.5">
              <CheckCircle className="w-3 h-3" />
              Toutes convoquées
            </Badge>
          ) : partiesConvoquees.length > 0 ? (
            <Badge variant="warning" className="flex items-center gap-1 py-1.5">
              <AlertTriangle className="w-3 h-3" />
              {partiesConvoquees.length}/{parties.length}
            </Badge>
          ) : (
            <Badge variant="info" className="py-1.5">
              À envoyer
            </Badge>
          )}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-[#e5e5e5] mb-6">
            <button
              onClick={() => setActiveTab('composer')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'composer'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#737373] hover:text-[#1a1a1a]'
              }`}
            >
              <Edit className="w-4 h-4 inline mr-2" />
              Composer la convocation
            </button>
            <button
              onClick={() => setActiveTab('historique')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'historique'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#737373] hover:text-[#1a1a1a]'
              }`}
            >
              <FileCheck className="w-4 h-4 inline mr-2" />
              Historique des envois ({envois.length})
            </button>
          </div>

          {activeTab === 'composer' ? (
            <div className="grid grid-cols-3 gap-6">
              {/* Colonne 1: Destinataires + Mode */}
              <div className="space-y-6">
                <Card className="p-4">
                  <SelecteurDestinataires
                    parties={parties}
                    selectedIds={selectedParties}
                    onToggle={togglePartie}
                    onSelectAll={toggleSelectAll}
                  />
                </Card>

                <Card className="p-4">
                  <SelecteurModeEnvoi
                    selectedMode={modeEnvoi}
                    onSelect={setModeEnvoi}
                  />
                </Card>
              </div>

              {/* Colonnes 2-3: Éditeur */}
              <div className="col-span-2">
                <Card className="p-4">
                  <EditeurConvocation
                    contenu={contenu}
                    onChange={setContenu}
                    affaire={affaire}
                    reunion={reunion}
                    partie={parties.find(p => selectedParties.includes(p.id))}
                    expert={expert}
                    onRegenerate={regenererContenu}
                  />

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e5e5e5]">
                    <div className="flex gap-2">
                      <Button variant="secondary" icon={Copy} onClick={handleCopier}>
                        Copier
                      </Button>
                      <Button variant="secondary" icon={Download} onClick={handleTelecharger}>
                        PDF
                      </Button>
                      <Button variant="secondary" icon={Printer}>
                        Imprimer
                      </Button>
                    </div>

                    <Button
                      variant="primary"
                      icon={Send}
                      onClick={() => setShowConfirmModal(true)}
                      disabled={selectedParties.length === 0 || !contenu}
                      className="bg-[#2563EB] hover:bg-[#b8922a]"
                    >
                      Envoyer la convocation ({selectedParties.length})
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="p-6">
              <h3 className="font-medium text-[#1a1a1a] mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#2563EB]" />
                Historique des envois
              </h3>
              <HistoriqueEnvois envois={envois} parties={parties} />
            </Card>
          )}
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirmModal && (
        <ModalBase
          isOpen={true}
          onClose={() => setShowConfirmModal(false)}
          title="Confirmer l'envoi"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-[#525252]">
              Vous êtes sur le point d'envoyer la convocation à <strong>{selectedParties.length}</strong> destinataire(s)
              via <strong>{MODES_ENVOI.find(m => m.id === modeEnvoi)?.label}</strong>.
            </p>

            <div className="p-4 bg-[#EFF6FF] rounded-xl">
              <p className="text-xs text-[#737373] mb-2">Destinataires :</p>
              <div className="space-y-1">
                {selectedParties.map(partieId => {
                  const partie = parties.find(p => p.id === partieId);
                  return (
                    <p key={partieId} className="text-sm text-[#1a1a1a]">
                      • {partie?.raison_sociale || `${partie?.prenom || ''} ${partie?.nom || ''}`}
                    </p>
                  );
                })}
              </div>
            </div>

            {modeEnvoi === 'ar24' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-xs text-green-700">
                  L'AR24 sera envoyé immédiatement. Vous recevrez une notification lors de la distribution.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowConfirmModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                icon={Send}
                className="flex-1"
                onClick={handleEnvoyer}
                loading={sending}
              >
                Confirmer l'envoi
              </Button>
            </div>
          </div>
        </ModalBase>
      )}
    </div>
  );
};

export default ModuleConvocation;
