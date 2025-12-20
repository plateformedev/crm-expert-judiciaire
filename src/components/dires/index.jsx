// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE GESTION DES DIRES
// Réception, suivi, réponses, traçabilité contradictoire
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  FileText, Plus, Search, Filter, Clock, CheckCircle, AlertTriangle,
  MessageSquare, Reply, Link2, Calendar, User, Building, Send,
  Eye, Edit, Trash2, Download, Copy, ChevronRight, Paperclip,
  AlertCircle, FileCheck, Mail, Archive, Tag
} from 'lucide-react';
import { Card, Badge, Button, Input, Select, Textarea, ModalBase, EmptyState } from '../ui';
import { formatDateFr, joursEntre } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// ============================================================================
// CONSTANTES
// ============================================================================

const STATUTS_DIRE = {
  recu: { label: 'Reçu', color: 'blue', icon: Mail },
  'en-analyse': { label: 'En analyse', color: 'amber', icon: Eye },
  repondu: { label: 'Répondu', color: 'green', icon: CheckCircle },
  clos: { label: 'Clos', color: 'gray', icon: Archive }
};

const DELAI_REPONSE_RECOMMANDE = 21; // jours

// ============================================================================
// HOOK GESTION DES DIRES
// ============================================================================

export const useDires = (affaireId) => {
  const [dires, setDires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les dires
  const fetchDires = async () => {
    if (!affaireId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dires')
        .select(`
          *,
          partie:parties(id, nom, prenom, raison_sociale, type, avocat_nom)
        `)
        .eq('affaire_id', affaireId)
        .order('numero', { ascending: true });

      if (error) throw error;
      setDires(data || []);
    } catch (err) {
      console.error('Erreur fetch dires:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDires();
  }, [affaireId]);

  // Ajouter un dire
  const addDire = async (direData) => {
    try {
      const numero = dires.length + 1;
      const { data, error } = await supabase
        .from('dires')
        .insert({
          affaire_id: affaireId,
          numero,
          statut: 'recu',
          ...direData
        })
        .select(`
          *,
          partie:parties(id, nom, prenom, raison_sociale, type)
        `)
        .single();

      if (error) throw error;
      setDires(prev => [...prev, data]);
      return { success: true, dire: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Mettre à jour un dire
  const updateDire = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('dires')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setDires(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Répondre à un dire
  const repondre = async (id, reponse) => {
    return updateDire(id, {
      reponse_expert: reponse,
      date_reponse: new Date().toISOString().split('T')[0],
      statut: 'repondu'
    });
  };

  // Statistiques
  const stats = useMemo(() => ({
    total: dires.length,
    enAttente: dires.filter(d => d.statut === 'recu' || d.statut === 'en-analyse').length,
    repondus: dires.filter(d => d.statut === 'repondu').length,
    enRetard: dires.filter(d => {
      if (d.statut === 'repondu' || d.statut === 'clos') return false;
      const joursAttente = joursEntre(new Date(d.date_reception), new Date());
      return joursAttente > DELAI_REPONSE_RECOMMANDE;
    }).length
  }), [dires]);

  return { dires, loading, error, stats, addDire, updateDire, repondre, refetch: fetchDires };
};

// ============================================================================
// COMPOSANT PRINCIPAL - LISTE DES DIRES
// ============================================================================

export const GestionDires = ({ affaireId, affaire, parties = [] }) => {
  const { dires, loading, stats, addDire, updateDire, repondre } = useDires(affaireId);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const diresFiltres = useMemo(() => {
    return dires.filter(d => {
      const matchSearch = search === '' ||
        d.objet?.toLowerCase().includes(search.toLowerCase()) ||
        d.contenu?.toLowerCase().includes(search.toLowerCase()) ||
        d.partie?.nom?.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || d.statut === filter;
      return matchSearch && matchFilter;
    });
  }, [dires, search, filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-[#a3a3a3] uppercase tracking-wider">Total dires</p>
          <p className="text-2xl font-light text-[#1a1a1a]">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-xs text-blue-600 uppercase tracking-wider">En attente</p>
          <p className="text-2xl font-light text-blue-700">{stats.enAttente}</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-xs text-green-600 uppercase tracking-wider">Répondus</p>
          <p className="text-2xl font-light text-green-700">{stats.repondus}</p>
        </Card>
        <Card className={`p-4 ${stats.enRetard > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
          <p className={`text-xs uppercase tracking-wider ${stats.enRetard > 0 ? 'text-red-600' : 'text-[#a3a3a3]'}`}>
            En retard
          </p>
          <p className={`text-2xl font-light ${stats.enRetard > 0 ? 'text-red-700' : 'text-[#1a1a1a]'}`}>
            {stats.enRetard}
          </p>
        </Card>
      </div>

      {/* Barre d'outils */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
          <input
            type="text"
            placeholder="Rechercher dans les dires..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
        >
          <option value="all">Tous statuts</option>
          <option value="recu">Reçus</option>
          <option value="en-analyse">En analyse</option>
          <option value="repondu">Répondus</option>
          <option value="clos">Clos</option>
        </select>

        <Button variant="primary" icon={Plus} onClick={() => setShowNewModal(true)}>
          Nouveau dire
        </Button>
      </div>

      {/* Liste des dires */}
      {diresFiltres.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Aucun dire"
          description="Les dires des parties apparaîtront ici"
          action={() => setShowNewModal(true)}
          actionLabel="Enregistrer un dire"
        />
      ) : (
        <div className="space-y-4">
          {diresFiltres.map(dire => (
            <DireCard
              key={dire.id}
              dire={dire}
              onView={() => setShowDetailModal(dire)}
              onReply={() => setShowReplyModal(dire)}
              onStatusChange={(status) => updateDire(dire.id, { statut: status })}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showNewModal && (
        <ModalNouveauDire
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          parties={parties}
          onSubmit={async (data) => {
            const result = await addDire(data);
            if (result.success) setShowNewModal(false);
            return result;
          }}
        />
      )}

      {showDetailModal && (
        <ModalDetailDire
          isOpen={!!showDetailModal}
          onClose={() => setShowDetailModal(null)}
          dire={showDetailModal}
          onReply={() => {
            setShowDetailModal(null);
            setShowReplyModal(showDetailModal);
          }}
        />
      )}

      {showReplyModal && (
        <ModalRepondreDire
          isOpen={!!showReplyModal}
          onClose={() => setShowReplyModal(null)}
          dire={showReplyModal}
          onSubmit={async (reponse) => {
            const result = await repondre(showReplyModal.id, reponse);
            if (result.success) setShowReplyModal(null);
            return result;
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// CARTE DIRE
// ============================================================================

const DireCard = ({ dire, onView, onReply, onStatusChange }) => {
  const joursAttente = dire.date_reception 
    ? joursEntre(new Date(dire.date_reception), new Date())
    : 0;
  const enRetard = (dire.statut === 'recu' || dire.statut === 'en-analyse') && joursAttente > DELAI_REPONSE_RECOMMANDE;
  const statutInfo = STATUTS_DIRE[dire.statut] || STATUTS_DIRE.recu;
  const StatusIcon = statutInfo.icon;

  const nomPartie = dire.partie 
    ? dire.partie.raison_sociale || `${dire.partie.nom} ${dire.partie.prenom || ''}`
    : 'Partie inconnue';

  return (
    <Card className={`p-5 hover:shadow-md transition-all ${enRetard ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Numéro */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          enRetard ? 'bg-red-100' : 'bg-[#f5e6c8]'
        }`}>
          <span className={`font-medium ${enRetard ? 'text-red-600' : 'text-[#c9a227]'}`}>
            D{dire.numero}
          </span>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={
              dire.statut === 'repondu' ? 'success' :
              dire.statut === 'en-analyse' ? 'warning' :
              enRetard ? 'error' : 'info'
            }>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statutInfo.label}
            </Badge>
            {enRetard && (
              <Badge variant="error">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {joursAttente - DELAI_REPONSE_RECOMMANDE}j de retard
              </Badge>
            )}
          </div>

          <h4 className="font-medium text-[#1a1a1a] mb-1">
            {dire.objet || 'Dire sans objet'}
          </h4>
          
          <div className="flex items-center gap-4 text-sm text-[#737373] mb-2">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {nomPartie}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Reçu le {formatDateFr(dire.date_reception)}
            </span>
            {dire.pieces_jointes?.length > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="w-4 h-4" />
                {dire.pieces_jointes.length} pièce(s)
              </span>
            )}
          </div>

          {/* Extrait du contenu */}
          <p className="text-sm text-[#525252] line-clamp-2">
            {dire.contenu}
          </p>

          {/* Réponse si existante */}
          {dire.reponse_expert && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-600 uppercase tracking-wider mb-1">
                Réponse du {formatDateFr(dire.date_reponse)}
              </p>
              <p className="text-sm text-green-800 line-clamp-2">{dire.reponse_expert}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" icon={Eye} onClick={onView}>
            Voir
          </Button>
          {dire.statut !== 'repondu' && dire.statut !== 'clos' && (
            <Button variant="primary" size="sm" icon={Reply} onClick={onReply}>
              Répondre
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// MODAL NOUVEAU DIRE
// ============================================================================

const ModalNouveauDire = ({ isOpen, onClose, parties, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    partie_id: '',
    date_reception: new Date().toISOString().split('T')[0],
    objet: '',
    contenu: '',
    pieces_jointes: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Enregistrer un dire" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Partie émettrice *"
            value={formData.partie_id}
            onChange={(e) => setFormData(prev => ({ ...prev, partie_id: e.target.value }))}
            options={[
              { value: '', label: 'Sélectionner une partie...' },
              ...parties.map(p => ({
                value: p.id,
                label: `${p.raison_sociale || p.nom} (${p.type})`
              }))
            ]}
            required
          />
          
          <Input
            label="Date de réception *"
            type="date"
            value={formData.date_reception}
            onChange={(e) => setFormData(prev => ({ ...prev, date_reception: e.target.value }))}
            required
          />
        </div>

        <Input
          label="Objet du dire"
          value={formData.objet}
          onChange={(e) => setFormData(prev => ({ ...prev, objet: e.target.value }))}
          placeholder="Ex: Contestation du montant des travaux"
        />

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
            Contenu du dire *
          </label>
          <textarea
            value={formData.contenu}
            onChange={(e) => setFormData(prev => ({ ...prev, contenu: e.target.value }))}
            rows={8}
            required
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] resize-none"
            placeholder="Collez ou saisissez le contenu du dire..."
          />
        </div>

        {/* Zone upload pièces jointes */}
        <div className="p-4 border-2 border-dashed border-[#e5e5e5] rounded-xl text-center">
          <Paperclip className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
          <p className="text-sm text-[#737373]">
            Glissez des fichiers ici ou <span className="text-[#c9a227] cursor-pointer">parcourez</span>
          </p>
          <p className="text-xs text-[#a3a3a3] mt-1">PDF, DOC, images (max 10 Mo)</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Enregistrer le dire
          </Button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// MODAL DÉTAIL DIRE
// ============================================================================

const ModalDetailDire = ({ isOpen, onClose, dire, onReply }) => {
  const joursAttente = dire.date_reception 
    ? joursEntre(new Date(dire.date_reception), new Date())
    : 0;
  const nomPartie = dire.partie 
    ? dire.partie.raison_sociale || `${dire.partie.nom} ${dire.partie.prenom || ''}`
    : 'Partie inconnue';

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Dire n°${dire.numero}`} size="lg">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div>
            <Badge variant={STATUTS_DIRE[dire.statut]?.color === 'green' ? 'success' : 'info'}>
              {STATUTS_DIRE[dire.statut]?.label}
            </Badge>
            <h3 className="font-medium text-lg text-[#1a1a1a] mt-2">
              {dire.objet || 'Dire sans objet'}
            </h3>
          </div>
          <div className="text-right text-sm text-[#737373]">
            <p>Reçu le {formatDateFr(dire.date_reception)}</p>
            <p>Il y a {joursAttente} jours</p>
          </div>
        </div>

        {/* Émetteur */}
        <Card className="p-4 bg-[#fafafa]">
          <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-2">Émetteur</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f5e6c8] rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-[#c9a227]" />
            </div>
            <div>
              <p className="font-medium text-[#1a1a1a]">{nomPartie}</p>
              {dire.partie?.avocat_nom && (
                <p className="text-sm text-[#737373]">Représenté par Me {dire.partie.avocat_nom}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Contenu */}
        <div>
          <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-2">Contenu du dire</p>
          <div className="p-4 bg-[#fafafa] rounded-xl max-h-64 overflow-y-auto">
            <p className="text-[#525252] whitespace-pre-wrap">{dire.contenu}</p>
          </div>
        </div>

        {/* Pièces jointes */}
        {dire.pieces_jointes?.length > 0 && (
          <div>
            <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-2">
              Pièces jointes ({dire.pieces_jointes.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {dire.pieces_jointes.map((piece, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#f5f5f5] rounded-lg">
                  <Paperclip className="w-4 h-4 text-[#737373]" />
                  <span className="text-sm">{piece}</span>
                  <Download className="w-4 h-4 text-[#a3a3a3] cursor-pointer hover:text-[#c9a227]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Réponse existante */}
        {dire.reponse_expert && (
          <div>
            <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-2">
              Réponse de l'expert ({formatDateFr(dire.date_reponse)})
            </p>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-[#525252] whitespace-pre-wrap">{dire.reponse_expert}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-[#e5e5e5]">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={Copy} onClick={() => {
              const text = `Dire de ${dire.partie_nom || 'N/C'}\n\n${dire.contenu || ''}${dire.reponse_expert ? `\n\nRéponse:\n${dire.reponse_expert}` : ''}`;
              navigator.clipboard.writeText(text);
              alert('Contenu copié dans le presse-papier');
            }}>
              Copier
            </Button>
            <Button variant="ghost" size="sm" icon={Download} onClick={() => {
              const text = `DIRE - ${dire.partie_nom || 'N/C'}\nDate: ${dire.date_reception || ''}\n\nContenu:\n${dire.contenu || ''}${dire.reponse_expert ? `\n\nRéponse de l'expert:\n${dire.reponse_expert}` : ''}`;
              const blob = new Blob([text], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `dire-${dire.id || 'export'}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}>
              Exporter
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Fermer
            </Button>
            {!dire.reponse_expert && (
              <Button variant="primary" icon={Reply} onClick={onReply}>
                Répondre
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// MODAL RÉPONDRE AU DIRE
// ============================================================================

const ModalRepondreDire = ({ isOpen, onClose, dire, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [reponse, setReponse] = useState('');
  const [showAI, setShowAI] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(reponse);
    setLoading(false);
  };

  // Suggestions de réponse pré-remplies
  const suggestions = [
    "L'expert prend acte du dire de la partie et indique que...",
    "En réponse au dire, l'expert précise que les constatations effectuées lors de la réunion du...",
    "L'expert conteste l'analyse présentée dans ce dire pour les raisons suivantes...",
    "Ce point sera traité dans le rapport final. Toutefois, l'expert peut d'ores et déjà indiquer que..."
  ];

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Répondre au dire n°${dire.numero}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rappel du dire */}
        <Card className="p-4 bg-[#fafafa]">
          <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-2">Dire à traiter</p>
          <p className="font-medium text-[#1a1a1a] mb-1">{dire.objet || 'Sans objet'}</p>
          <p className="text-sm text-[#737373] line-clamp-3">{dire.contenu}</p>
        </Card>

        {/* Suggestions */}
        <div>
          <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-2">Formulations suggérées</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setReponse(prev => prev + (prev ? '\n\n' : '') + sug)}
                className="px-3 py-1.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-lg text-xs text-[#525252] hover:border-[#c9a227] transition-colors text-left"
              >
                {sug.substring(0, 50)}...
              </button>
            ))}
          </div>
        </div>

        {/* Zone de réponse */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3]">
              Votre réponse *
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAI(true)}
            >
              🤖 Assistance IA
            </Button>
          </div>
          <textarea
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            rows={10}
            required
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] resize-none"
            placeholder="Rédigez votre réponse..."
          />
        </div>

        {/* Information contradictoire */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Rappel contradictoire</p>
              <p className="text-sm text-amber-700">
                Cette réponse sera automatiquement communiquée à toutes les parties 
                conformément au principe du contradictoire (Art. 16 CPC).
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" loading={loading} icon={Send}>
            Envoyer la réponse
          </Button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// WIDGET DIRES POUR DASHBOARD
// ============================================================================

export const DiresWidget = ({ affaires = [], onViewAll }) => {
  const diresEnAttente = useMemo(() => {
    const allDires = [];
    affaires.forEach(affaire => {
      (affaire.dires || []).forEach(dire => {
        if (dire.statut !== 'repondu' && dire.statut !== 'clos') {
          const joursAttente = joursEntre(new Date(dire.date_reception), new Date());
          allDires.push({
            ...dire,
            affaireRef: affaire.reference,
            joursAttente,
            enRetard: joursAttente > DELAI_REPONSE_RECOMMANDE
          });
        }
      });
    });
    return allDires.sort((a, b) => b.joursAttente - a.joursAttente).slice(0, 5);
  }, [affaires]);

  if (diresEnAttente.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-[#1a1a1a]">Aucun dire en attente</h3>
            <p className="text-sm text-[#737373]">Tous les dires ont été traités</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-[#1a1a1a]">Dires en attente</h3>
            <p className="text-sm text-[#737373]">{diresEnAttente.length} réponse(s) à rédiger</p>
          </div>
        </div>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Voir tout <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {diresEnAttente.map(dire => (
          <div
            key={dire.id}
            className={`p-3 rounded-xl ${dire.enRetard ? 'bg-red-50 border border-red-200' : 'bg-[#fafafa]'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#a3a3a3] mb-1">{dire.affaireRef}</p>
                <p className="font-medium text-sm text-[#1a1a1a]">
                  Dire n°{dire.numero} - {dire.objet || 'Sans objet'}
                </p>
              </div>
              <Badge variant={dire.enRetard ? 'error' : 'warning'}>
                {dire.joursAttente}j
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  GestionDires,
  DiresWidget,
  useDires,
  STATUTS_DIRE
};
