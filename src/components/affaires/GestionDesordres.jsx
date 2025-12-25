// ============================================================================
// CRM EXPERT JUDICIAIRE - GESTION DES DÉSORDRES
// Module complet pour la gestion des désordres/pathologies du bâtiment
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, Plus, Edit, Trash2, ChevronDown, ChevronUp,
  Camera, MapPin, FileText, Search, Filter, Save, X, Eye,
  Building2, Layers, Check, AlertCircle, Home, Scale, Euro,
  CalendarDays, Image, Wrench, Tag, ClipboardList, Link2
} from 'lucide-react';
import { Card, Badge, Button, Input, Select, ModalBase, useToast } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// CONSTANTES
// ============================================================================

const GARANTIES = [
  { value: 'decennale', label: 'Garantie Décennale', description: '10 ans - Atteinte à la solidité ou impropriété à destination', color: 'red', duree: '10 ans' },
  { value: 'biennale', label: 'Garantie Biennale', description: '2 ans - Éléments d\'équipement dissociables', color: 'orange', duree: '2 ans' },
  { value: 'gpa', label: 'Parfait Achèvement', description: '1 an - Tous désordres signalés pendant l\'année', color: 'yellow', duree: '1 an' },
  { value: 'contractuelle', label: 'Resp. Contractuelle', description: 'Délai de droit commun', color: 'blue', duree: '5 ans' },
  { value: 'delictuelle', label: 'Resp. Délictuelle', description: 'Tiers non liés contractuellement', color: 'purple', duree: '5 ans' },
  { value: 'aucune', label: 'Aucune applicable', description: 'Hors garantie ou prescription', color: 'gray', duree: '-' }
];

const NATURES_DESORDRE = [
  { value: 'fissure', label: 'Fissures', icon: '↝' },
  { value: 'infiltration', label: 'Infiltrations', icon: '💧' },
  { value: 'humidite', label: 'Humidité', icon: '☔' },
  { value: 'decollement', label: 'Décollement', icon: '📄' },
  { value: 'affaissement', label: 'Affaissement', icon: '↓' },
  { value: 'malfacon', label: 'Malfaçon', icon: '⚠️' },
  { value: 'non_conformite', label: 'Non-conformité', icon: '✗' },
  { value: 'defaut_etancheite', label: 'Défaut étanchéité', icon: '🚿' },
  { value: 'condensation', label: 'Condensation', icon: '💨' },
  { value: 'acoustique', label: 'Défaut acoustique', icon: '🔊' },
  { value: 'thermique', label: 'Défaut thermique', icon: '🌡️' },
  { value: 'autre', label: 'Autre', icon: '•' }
];

const GRAVITES = [
  { value: 'mineure', label: 'Mineure', color: 'green', description: 'Esthétique, sans impact fonctionnel' },
  { value: 'moyenne', label: 'Moyenne', color: 'yellow', description: 'Gêne d\'usage modérée' },
  { value: 'majeure', label: 'Majeure', color: 'orange', description: 'Impact fonctionnel significatif' },
  { value: 'critique', label: 'Critique', color: 'red', description: 'Atteinte à la solidité ou sécurité' }
];

const LOCALISATIONS = [
  { value: 'facade_nord', label: 'Façade Nord' },
  { value: 'facade_sud', label: 'Façade Sud' },
  { value: 'facade_est', label: 'Façade Est' },
  { value: 'facade_ouest', label: 'Façade Ouest' },
  { value: 'toiture', label: 'Toiture' },
  { value: 'combles', label: 'Combles' },
  { value: 'rdc', label: 'RDC' },
  { value: 'etage_1', label: '1er étage' },
  { value: 'etage_2', label: '2ème étage' },
  { value: 'sous_sol', label: 'Sous-sol' },
  { value: 'cave', label: 'Cave' },
  { value: 'garage', label: 'Garage' },
  { value: 'terrasse', label: 'Terrasse' },
  { value: 'balcon', label: 'Balcon' },
  { value: 'sdb', label: 'Salle de bain' },
  { value: 'cuisine', label: 'Cuisine' },
  { value: 'sejour', label: 'Séjour' },
  { value: 'chambre', label: 'Chambre' },
  { value: 'exterieur', label: 'Extérieur' },
  { value: 'autre', label: 'Autre' }
];

// ============================================================================
// COMPOSANT: Carte de désordre
// ============================================================================

const DesordreCard = ({ desordre, photos, onEdit, onDelete, onLinkPhotos, expanded, onToggle }) => {
  const garantie = GARANTIES.find(g => g.value === desordre.garantie);
  const gravite = GRAVITES.find(g => g.value === desordre.gravite);
  const nature = NATURES_DESORDRE.find(n => n.value === desordre.nature);

  // Photos liées au désordre
  const linkedPhotos = photos?.filter(p =>
    desordre.photos_ids?.includes(p.id) ||
    p.desordre_id === desordre.id
  ) || [];

  const getGraviteColor = (g) => {
    const colors = {
      mineure: 'bg-green-100 text-green-700 border-green-200',
      moyenne: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      majeure: 'bg-orange-100 text-orange-700 border-orange-200',
      critique: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[g] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getGarantieColor = (g) => {
    const colors = {
      decennale: 'bg-red-100 text-red-700',
      biennale: 'bg-orange-100 text-orange-700',
      gpa: 'bg-yellow-100 text-yellow-700',
      contractuelle: 'bg-blue-100 text-blue-700',
      delictuelle: 'bg-purple-100 text-purple-700',
      aucune: 'bg-gray-100 text-gray-500'
    };
    return colors[g] || 'bg-gray-100 text-gray-500';
  };

  return (
    <Card className={`overflow-hidden transition-all ${desordre.gravite === 'critique' ? 'border-l-4 border-l-red-500' : desordre.gravite === 'majeure' ? 'border-l-4 border-l-orange-500' : ''}`}>
      {/* En-tête */}
      <div
        className="p-4 cursor-pointer hover:bg-[#f5f5f5]"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Numéro */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center font-bold text-sm">
              D{desordre.numero}
            </div>

            {/* Infos principales */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-[#1a1a1a]">{desordre.intitule}</p>
                {gravite && (
                  <Badge className={`text-xs ${getGraviteColor(desordre.gravite)}`}>
                    {gravite.label}
                  </Badge>
                )}
                {garantie && (
                  <Badge className={`text-xs ${getGarantieColor(desordre.garantie)}`}>
                    {garantie.label}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-1 text-sm text-[#737373]">
                {desordre.localisation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {desordre.localisation}
                  </span>
                )}
                {nature && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {nature.label}
                  </span>
                )}
                {linkedPhotos.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    {linkedPhotos.length} photo{linkedPhotos.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions + chevron */}
          <div className="flex items-center gap-2">
            {desordre.cout_estimation && (
              <span className="text-sm font-medium text-[#1a1a1a]">
                {Number(desordre.cout_estimation).toLocaleString('fr-FR')} €
              </span>
            )}
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-[#a3a3a3]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#a3a3a3]" />
            )}
          </div>
        </div>
      </div>

      {/* Détails expandés */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#e5e5e5] pt-4 space-y-4 animate-in slide-in-from-top-2">
          {/* Description */}
          {desordre.description && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-1">Description</p>
              <p className="text-sm text-[#525252]">{desordre.description}</p>
            </div>
          )}

          {/* Infos techniques en grille */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {desordre.cause && (
              <div>
                <p className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-1">Cause probable</p>
                <p className="text-sm text-[#1a1a1a]">{desordre.cause}</p>
              </div>
            )}
            {desordre.date_apparition && (
              <div>
                <p className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-1">Date apparition</p>
                <p className="text-sm text-[#1a1a1a]">{formatDateFr(desordre.date_apparition)}</p>
              </div>
            )}
            {desordre.reunion_numero && (
              <div>
                <p className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-1">Constaté lors</p>
                <p className="text-sm text-[#1a1a1a]">Réunion R{desordre.reunion_numero}</p>
              </div>
            )}
            {desordre.imputation && (
              <div>
                <p className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-1">Imputation</p>
                <p className="text-sm text-[#1a1a1a]">{desordre.imputation}</p>
              </div>
            )}
          </div>

          {/* Travaux préconisés */}
          {desordre.travaux_preconises && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-1">Travaux préconisés</p>
              <p className="text-sm text-[#525252]">{desordre.travaux_preconises}</p>
            </div>
          )}

          {/* Photos liées */}
          {linkedPhotos.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-2">Photos associées</p>
              <div className="flex gap-2 flex-wrap">
                {linkedPhotos.slice(0, 4).map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    className="w-16 h-16 rounded-lg bg-[#f5f5f5] border border-[#e5e5e5] overflow-hidden"
                  >
                    {photo.url || photo.preview ? (
                      <img
                        src={photo.url || photo.preview}
                        alt={photo.legende || `Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#a3a3a3]">
                        <Image className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                ))}
                {linkedPhotos.length > 4 && (
                  <div className="w-16 h-16 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-white text-sm font-medium">
                    +{linkedPhotos.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" size="sm" icon={Camera} onClick={onLinkPhotos}>
              Lier photos
            </Button>
            <Button variant="secondary" size="sm" icon={Edit} onClick={onEdit}>
              Modifier
            </Button>
            <Button variant="secondary" size="sm" icon={Trash2} onClick={onDelete} className="text-red-600 hover:bg-red-50">
              Supprimer
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Modal formulaire désordre
// ============================================================================

const ModalDesordreForm = ({ isOpen, onClose, onSave, desordre, reunions = [], mode = 'create' }) => {
  const [formData, setFormData] = useState(desordre || {
    intitule: '',
    nature: '',
    localisation: '',
    localisation_detail: '',
    description: '',
    garantie: '',
    gravite: '',
    cause: '',
    date_apparition: '',
    imputation: '',
    travaux_preconises: '',
    cout_estimation: '',
    reunion_numero: null,
    photos_ids: []
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.intitule.trim()) return;
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nouveau désordre' : `Modifier D${desordre?.numero}`}
      size="xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Section 1: Identification */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-[#1a1a1a] flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#2563EB]" />
            Identification
          </h4>

          <Input
            label="Intitulé du désordre *"
            value={formData.intitule}
            onChange={(e) => handleChange('intitule', e.target.value)}
            placeholder="Ex: Fissures en façade nord"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
                Nature du désordre
              </label>
              <select
                value={formData.nature || ''}
                onChange={(e) => handleChange('nature', e.target.value)}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              >
                <option value="">Sélectionner...</option>
                {NATURES_DESORDRE.map(n => (
                  <option key={n.value} value={n.value}>{n.icon} {n.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
                Constaté lors de
              </label>
              <select
                value={formData.reunion_numero || ''}
                onChange={(e) => handleChange('reunion_numero', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              >
                <option value="">Non lié à une réunion</option>
                {reunions.map(r => (
                  <option key={r.numero} value={r.numero}>
                    R{r.numero} - {r.date_reunion ? formatDateFr(r.date_reunion) : 'Date non définie'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Localisation */}
        <div className="space-y-4 pt-4 border-t border-[#e5e5e5]">
          <h4 className="text-sm font-medium text-[#1a1a1a] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2563EB]" />
            Localisation
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
                Zone / Pièce
              </label>
              <select
                value={formData.localisation || ''}
                onChange={(e) => handleChange('localisation', e.target.value)}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              >
                <option value="">Sélectionner...</option>
                {LOCALISATIONS.map(l => (
                  <option key={l.value} value={l.label}>{l.label}</option>
                ))}
              </select>
            </div>

            <Input
              label="Précision localisation"
              value={formData.localisation_detail || ''}
              onChange={(e) => handleChange('localisation_detail', e.target.value)}
              placeholder="Ex: Angle nord-ouest, sous fenêtre"
            />
          </div>
        </div>

        {/* Section 3: Description */}
        <div className="space-y-4 pt-4 border-t border-[#e5e5e5]">
          <h4 className="text-sm font-medium text-[#1a1a1a] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2563EB]" />
            Description
          </h4>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
              Description détaillée
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] resize-none"
              rows={4}
              placeholder="Décrivez le désordre constaté, son étendue, ses caractéristiques..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cause probable"
              value={formData.cause || ''}
              onChange={(e) => handleChange('cause', e.target.value)}
              placeholder="Ex: Mouvement de terrain, défaut d'exécution..."
            />

            <Input
              label="Date d'apparition"
              type="date"
              value={formData.date_apparition || ''}
              onChange={(e) => handleChange('date_apparition', e.target.value)}
            />
          </div>
        </div>

        {/* Section 4: Qualification juridique */}
        <div className="space-y-4 pt-4 border-t border-[#e5e5e5]">
          <h4 className="text-sm font-medium text-[#1a1a1a] flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#2563EB]" />
            Qualification juridique
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
                Garantie applicable
              </label>
              <select
                value={formData.garantie || ''}
                onChange={(e) => handleChange('garantie', e.target.value)}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              >
                <option value="">À qualifier</option>
                {GARANTIES.map(g => (
                  <option key={g.value} value={g.value}>{g.label} ({g.duree})</option>
                ))}
              </select>
              {formData.garantie && (
                <p className="text-xs text-[#737373] mt-1">
                  {GARANTIES.find(g => g.value === formData.garantie)?.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
                Gravité
              </label>
              <select
                value={formData.gravite || ''}
                onChange={(e) => handleChange('gravite', e.target.value)}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              >
                <option value="">Non définie</option>
                {GRAVITES.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
              {formData.gravite && (
                <p className="text-xs text-[#737373] mt-1">
                  {GRAVITES.find(g => g.value === formData.gravite)?.description}
                </p>
              )}
            </div>
          </div>

          <Input
            label="Imputation (responsable présumé)"
            value={formData.imputation || ''}
            onChange={(e) => handleChange('imputation', e.target.value)}
            placeholder="Ex: Entreprise de gros œuvre, Architecte..."
          />
        </div>

        {/* Section 5: Réparation */}
        <div className="space-y-4 pt-4 border-t border-[#e5e5e5]">
          <h4 className="text-sm font-medium text-[#1a1a1a] flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#2563EB]" />
            Réparation
          </h4>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
              Travaux préconisés
            </label>
            <textarea
              value={formData.travaux_preconises || ''}
              onChange={(e) => handleChange('travaux_preconises', e.target.value)}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] resize-none"
              rows={3}
              placeholder="Décrivez les travaux de reprise nécessaires..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Estimation coût réparation (€)"
              type="number"
              value={formData.cout_estimation || ''}
              onChange={(e) => handleChange('cout_estimation', e.target.value)}
              placeholder="5000"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5] sticky bottom-0 bg-white">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSubmit}
            disabled={!formData.intitule.trim()}
            className="flex-1"
          >
            {mode === 'create' ? 'Créer le désordre' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// COMPOSANT: Modal liaison photos
// ============================================================================

const ModalLierPhotos = ({ isOpen, onClose, desordre, photos, onSave }) => {
  const [selectedIds, setSelectedIds] = useState(desordre?.photos_ids || []);

  const togglePhoto = (photoId) => {
    setSelectedIds(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleSave = () => {
    onSave({ ...desordre, photos_ids: selectedIds });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`Lier des photos à D${desordre?.numero}`}
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-[#737373]">
          Sélectionnez les photos à associer à ce désordre.
        </p>

        {photos?.length > 0 ? (
          <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
            {photos.map(photo => {
              const isSelected = selectedIds.includes(photo.id);
              return (
                <div
                  key={photo.id}
                  onClick={() => togglePhoto(photo.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    isSelected ? 'border-[#2563EB] ring-2 ring-[#2563EB]/30' : 'border-transparent'
                  }`}
                >
                  {photo.url || photo.preview ? (
                    <img
                      src={photo.url || photo.preview}
                      alt={photo.legende || 'Photo'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center">
                      <Image className="w-8 h-8 text-[#a3a3a3]" />
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-[#2563EB] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {photo.legende && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                      {photo.legende}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-[#737373]">
            <Camera className="w-12 h-12 mx-auto mb-3 text-[#e5e5e5]" />
            <p>Aucune photo dans ce dossier</p>
            <p className="text-sm">Ajoutez des photos dans l'onglet Photos</p>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button variant="primary" icon={Link2} onClick={handleSave} className="flex-1">
            Lier {selectedIds.length} photo{selectedIds.length > 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL: Gestion des désordres
// ============================================================================

export const GestionDesordres = ({ affaire, onUpdate }) => {
  const toast = useToast();
  const [expandedId, setExpandedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDesordre, setEditingDesordre] = useState(null);
  const [linkingPhotos, setLinkingPhotos] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGarantie, setFilterGarantie] = useState('tous');
  const [filterGravite, setFilterGravite] = useState('tous');

  const desordres = affaire?.pathologies || [];
  const photos = affaire?.photos || [];
  const reunions = affaire?.reunions || [];

  // Filtrage et recherche
  const filteredDesordres = useMemo(() => {
    return desordres.filter(d => {
      const matchSearch = !searchQuery ||
        d.intitule?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.localisation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchGarantie = filterGarantie === 'tous' || d.garantie === filterGarantie;
      const matchGravite = filterGravite === 'tous' || d.gravite === filterGravite;

      return matchSearch && matchGarantie && matchGravite;
    });
  }, [desordres, searchQuery, filterGarantie, filterGravite]);

  // Statistiques
  const stats = useMemo(() => ({
    total: desordres.length,
    critique: desordres.filter(d => d.gravite === 'critique').length,
    majeure: desordres.filter(d => d.gravite === 'majeure').length,
    decennale: desordres.filter(d => d.garantie === 'decennale').length,
    coutTotal: desordres.reduce((sum, d) => sum + (Number(d.cout_estimation) || 0), 0)
  }), [desordres]);

  // Ajouter un désordre
  const handleAdd = async (formData) => {
    const newDesordre = {
      ...formData,
      id: `desordre_${Date.now()}`,
      numero: desordres.length + 1,
      date_creation: new Date().toISOString()
    };

    await onUpdate({ pathologies: [...desordres, newDesordre] });
    setShowAddModal(false);
    toast.success('Désordre ajouté');
  };

  // Modifier un désordre
  const handleEdit = async (formData) => {
    const updated = desordres.map(d =>
      d.id === editingDesordre.id ? { ...d, ...formData } : d
    );
    await onUpdate({ pathologies: updated });
    setEditingDesordre(null);
    toast.success('Désordre modifié');
  };

  // Supprimer un désordre
  const handleDelete = async (desordre) => {
    if (!window.confirm(`Supprimer le désordre D${desordre.numero} ?`)) return;
    const updated = desordres.filter(d => d.id !== desordre.id);
    await onUpdate({ pathologies: updated });
    toast.success('Désordre supprimé');
  };

  // Lier des photos
  const handleLinkPhotos = async (updatedDesordre) => {
    const updated = desordres.map(d =>
      d.id === updatedDesordre.id ? updatedDesordre : d
    );
    await onUpdate({ pathologies: updated });
    setLinkingPhotos(null);
    toast.success('Photos liées');
  };

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1a1a1a] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#2563EB]" />
            Désordres constatés
          </h3>
          <p className="text-sm text-[#737373]">
            {stats.total} désordre{stats.total > 1 ? 's' : ''} répertorié{stats.total > 1 ? 's' : ''}
            {stats.coutTotal > 0 && (
              <span className="ml-2">
                • Estimation totale : <strong>{stats.coutTotal.toLocaleString('fr-FR')} €</strong>
              </span>
            )}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
          Ajouter un désordre
        </Button>
      </div>

      {/* Statistiques */}
      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[#1a1a1a]">{stats.total}</p>
            <p className="text-xs text-[#737373]">Total</p>
          </Card>
          <Card className={`p-4 text-center ${stats.critique > 0 ? 'border-red-200 bg-red-50' : ''}`}>
            <p className={`text-2xl font-bold ${stats.critique > 0 ? 'text-red-600' : 'text-[#1a1a1a]'}`}>
              {stats.critique}
            </p>
            <p className="text-xs text-[#737373]">Critiques</p>
          </Card>
          <Card className={`p-4 text-center ${stats.majeure > 0 ? 'border-orange-200 bg-orange-50' : ''}`}>
            <p className={`text-2xl font-bold ${stats.majeure > 0 ? 'text-orange-600' : 'text-[#1a1a1a]'}`}>
              {stats.majeure}
            </p>
            <p className="text-xs text-[#737373]">Majeurs</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[#1a1a1a]">{stats.decennale}</p>
            <p className="text-xs text-[#737373]">Décennale</p>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un désordre..."
            className="w-full pl-10 pr-4 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
          />
        </div>
        <select
          value={filterGarantie}
          onChange={(e) => setFilterGarantie(e.target.value)}
          className="px-4 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
        >
          <option value="tous">Toutes garanties</option>
          {GARANTIES.map(g => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        <select
          value={filterGravite}
          onChange={(e) => setFilterGravite(e.target.value)}
          className="px-4 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
        >
          <option value="tous">Toutes gravités</option>
          {GRAVITES.map(g => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>

      {/* Liste des désordres */}
      {filteredDesordres.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-[#e5e5e5] mx-auto mb-4" />
          <p className="text-[#737373] mb-4">
            {desordres.length === 0
              ? 'Aucun désordre répertorié'
              : 'Aucun désordre ne correspond aux filtres'}
          </p>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            Ajouter un désordre
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDesordres.map(desordre => (
            <DesordreCard
              key={desordre.id}
              desordre={desordre}
              photos={photos}
              expanded={expandedId === desordre.id}
              onToggle={() => setExpandedId(expandedId === desordre.id ? null : desordre.id)}
              onEdit={() => setEditingDesordre(desordre)}
              onDelete={() => handleDelete(desordre)}
              onLinkPhotos={() => setLinkingPhotos(desordre)}
            />
          ))}
        </div>
      )}

      {/* Modal création */}
      <ModalDesordreForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAdd}
        reunions={reunions}
        mode="create"
      />

      {/* Modal édition */}
      <ModalDesordreForm
        isOpen={!!editingDesordre}
        onClose={() => setEditingDesordre(null)}
        onSave={handleEdit}
        desordre={editingDesordre}
        reunions={reunions}
        mode="edit"
      />

      {/* Modal liaison photos */}
      <ModalLierPhotos
        isOpen={!!linkingPhotos}
        onClose={() => setLinkingPhotos(null)}
        desordre={linkingPhotos}
        photos={photos}
        onSave={handleLinkPhotos}
      />
    </div>
  );
};

export default GestionDesordres;
