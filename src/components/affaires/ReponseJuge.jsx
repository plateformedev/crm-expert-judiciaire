// ============================================================================
// CRM EXPERT JUDICIAIRE - RÉPONSE AU JUGE
// ============================================================================

import React, { useState } from 'react';
import {
  Check, X, AlertTriangle, Send, FileText, Calendar,
  Clock, Copy, Download, Mail
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase } from '../ui';
import { STATUTS_REPONSE_JUGE, MOTIFS_REFUS } from '../../data';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// COMPOSANT: Panneau de réponse au juge
// ============================================================================

export const ReponseJuge = ({ affaire, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'accepter' | 'refuser' | 'recuser'

  // Calculer le délai restant pour répondre (15 jours)
  const getDelaiRestant = () => {
    if (!affaire.date_ordonnance) return null;
    const dateOrdonnance = new Date(affaire.date_ordonnance);
    const dateLimit = new Date(dateOrdonnance);
    dateLimit.setDate(dateLimit.getDate() + 15);
    const today = new Date();
    const diffTime = dateLimit - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const delaiRestant = getDelaiRestant();
  const isUrgent = delaiRestant !== null && delaiRestant <= 5;
  const isDepasse = delaiRestant !== null && delaiRestant <= 0;

  // Ouvrir modal
  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  // État pour le mode modification
  const [showModifyConfirm, setShowModifyConfirm] = useState(false);

  // Annuler/Modifier la réponse
  const handleModifyResponse = async () => {
    try {
      await onUpdate({
        reponse_juge: null,
        date_reponse_juge: null,
        motif_refus: null,
        motif_recusation: null
      });
      setShowModifyConfirm(false);
    } catch (error) {
      console.error('Erreur modification réponse:', error);
    }
  };

  // Si déjà répondu
  if (affaire.reponse_juge) {
    const reponse = STATUTS_REPONSE_JUGE.find(s => s.id === affaire.reponse_juge);
    return (
      <>
        <Card className={`p-5 ${
          affaire.reponse_juge === 'acceptee' ? 'border-green-200 bg-green-50' :
          affaire.reponse_juge === 'refusee' ? 'border-red-200 bg-red-50' :
          'border-orange-200 bg-orange-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {affaire.reponse_juge === 'acceptee' ? (
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              ) : affaire.reponse_juge === 'refusee' ? (
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <p className="font-medium text-[#1a1a1a]">{reponse?.label}</p>
                {affaire.date_reponse_juge && (
                  <p className="text-sm text-[#737373]">
                    Répondu le {formatDateFr(affaire.date_reponse_juge)}
                  </p>
                )}
                {affaire.motif_refus && (
                  <p className="text-sm text-[#737373] mt-1">
                    Motif : {MOTIFS_REFUS.find(m => m.id === affaire.motif_refus)?.label}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={FileText}>
                Voir le courrier
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModifyConfirm(true)}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                Modifier ma réponse
              </Button>
            </div>
          </div>

          {/* Actions supplémentaires selon le statut */}
          {affaire.reponse_juge === 'acceptee' && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm text-green-700 mb-3">
                Vous pouvez encore vous récuser si un conflit d'intérêt apparaît.
              </p>
              <Button
                variant="secondary"
                size="sm"
                icon={AlertTriangle}
                onClick={() => openModal('recuser')}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                Me récuser maintenant
              </Button>
            </div>
          )}
        </Card>

        {/* Modal de confirmation pour modifier la réponse */}
        {showModifyConfirm && (
          <ModalBase
            isOpen={showModifyConfirm}
            onClose={() => setShowModifyConfirm(false)}
            title="Modifier votre réponse"
          >
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Attention</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Modifier votre réponse au juge est une action importante.
                      Un nouveau courrier devra être envoyé au tribunal.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[#525252]">
                Votre réponse actuelle : <strong>{reponse?.label}</strong>
              </p>
              <p className="text-sm text-[#737373]">
                En confirmant, vous pourrez sélectionner une nouvelle réponse
                (accepter, refuser ou vous récuser).
              </p>

              <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
                <Button
                  variant="secondary"
                  onClick={() => setShowModifyConfirm(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleModifyResponse}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  Confirmer la modification
                </Button>
              </div>
            </div>
          </ModalBase>
        )}
      </>
    );
  }

  // Si pas encore répondu
  return (
    <>
      <Card className={`p-5 ${isDepasse ? 'border-red-300 bg-red-50' : isUrgent ? 'border-amber-300 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDepasse ? 'bg-red-500' : isUrgent ? 'bg-amber-500' : 'bg-blue-500'
            }`}>
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-[#1a1a1a]">Réponse au juge requise</p>
              <p className="text-sm text-[#737373]">
                Vous devez accepter ou refuser cette mission dans les 15 jours suivant l'ordonnance.
              </p>
              {delaiRestant !== null && (
                <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                  isDepasse ? 'bg-red-200 text-red-700' :
                  isUrgent ? 'bg-amber-200 text-amber-700' :
                  'bg-blue-200 text-blue-700'
                }`}>
                  <Clock className="w-4 h-4" />
                  {isDepasse ? 'Délai dépassé !' : `J-${delaiRestant} pour répondre`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="mt-4 flex gap-3">
          <Button
            variant="primary"
            icon={Check}
            onClick={() => openModal('accepter')}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Accepter la mission
          </Button>
          <Button
            variant="secondary"
            icon={X}
            onClick={() => openModal('refuser')}
            className="flex-1"
          >
            Refuser
          </Button>
          <Button
            variant="secondary"
            icon={AlertTriangle}
            onClick={() => openModal('recuser')}
          >
            Me récuser
          </Button>
        </div>
      </Card>

      {/* Modal de réponse */}
      {showModal && (
        <ModalReponseJuge
          type={modalType}
          affaire={affaire}
          onClose={() => setShowModal(false)}
          onConfirm={(data) => {
            onUpdate(data);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

// ============================================================================
// COMPOSANT: Modal de réponse au juge
// ============================================================================

const ModalReponseJuge = ({ type, affaire, onClose, onConfirm }) => {
  const [motif, setMotif] = useState('');
  const [motifAutre, setMotifAutre] = useState('');
  const [dateReponse, setDateReponse] = useState(new Date().toISOString().split('T')[0]);
  const [courrierGenere, setCourrierGenere] = useState(false);

  const isRefus = type === 'refuser' || type === 'recuser';

  // Générer le courrier
  const genererCourrier = () => {
    setCourrierGenere(true);
  };

  // Confirmer la réponse
  const handleConfirm = () => {
    onConfirm({
      reponse_juge: type === 'accepter' ? 'acceptee' : type === 'refuser' ? 'refusee' : 'recusation',
      date_reponse_juge: dateReponse,
      motif_refus: isRefus ? motif : null,
      motif_refus_detail: motif === 'autre' ? motifAutre : null
    });
  };

  // Template du courrier
  const getCourrierTemplate = () => {
    if (type === 'accepter') {
      return `Monsieur/Madame le Président,

J'ai l'honneur d'accuser réception de votre ordonnance du ${affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : '___'} me désignant en qualité d'expert dans l'affaire :

RG : ${affaire.rg || '___'}
${affaire.tribunal || '___'}

J'ai l'honneur de vous informer que j'accepte cette mission d'expertise.

Je procéderai aux opérations d'expertise conformément aux termes de votre ordonnance et vous tiendrai informé du déroulement de mes travaux.

Je vous prie d'agréer, Monsieur/Madame le Président, l'expression de ma haute considération.

[Votre signature]`;
    } else if (type === 'refuser') {
      const motifLabel = MOTIFS_REFUS.find(m => m.id === motif)?.label || motifAutre || '___';
      return `Monsieur/Madame le Président,

J'ai l'honneur d'accuser réception de votre ordonnance du ${affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : '___'} me désignant en qualité d'expert dans l'affaire :

RG : ${affaire.rg || '___'}
${affaire.tribunal || '___'}

Je suis au regret de vous informer que je ne suis pas en mesure d'accepter cette mission pour le motif suivant :

${motifLabel}

Je vous prie de bien vouloir me remplacer dans cette mission et vous prie d'agréer, Monsieur/Madame le Président, l'expression de ma haute considération.

[Votre signature]`;
    } else {
      const motifLabel = MOTIFS_REFUS.find(m => m.id === motif)?.label || motifAutre || '___';
      return `Monsieur/Madame le Président,

J'ai l'honneur d'accuser réception de votre ordonnance du ${affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : '___'} me désignant en qualité d'expert dans l'affaire :

RG : ${affaire.rg || '___'}
${affaire.tribunal || '___'}

Conformément aux articles 234 et suivants du Code de procédure civile, j'ai l'honneur de solliciter ma récusation pour le motif suivant :

${motifLabel}

Je vous serais reconnaissant de bien vouloir procéder à mon remplacement et vous prie d'agréer, Monsieur/Madame le Président, l'expression de ma haute considération.

[Votre signature]`;
    }
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title={
        type === 'accepter' ? 'Accepter la mission' :
        type === 'refuser' ? 'Refuser la mission' :
        'Demande de récusation'
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Info affaire */}
        <div className="p-4 bg-[#faf8f3] rounded-xl">
          <p className="text-xs text-[#737373] uppercase tracking-wider mb-1">Affaire concernée</p>
          <p className="font-medium text-[#1a1a1a]">{affaire.reference}</p>
          <p className="text-sm text-[#737373]">{affaire.tribunal} • RG {affaire.rg}</p>
        </div>

        {/* Date de réponse */}
        <Input
          label="Date de la réponse"
          type="date"
          value={dateReponse}
          onChange={(e) => setDateReponse(e.target.value)}
        />

        {/* Motif si refus ou récusation */}
        {isRefus && (
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
              Motif {type === 'recuser' ? 'de récusation' : 'du refus'}
            </label>
            <select
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
            >
              <option value="">Sélectionner un motif</option>
              {MOTIFS_REFUS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>

            {motif === 'autre' && (
              <textarea
                className="mt-3 w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
                placeholder="Précisez le motif..."
                rows={3}
                value={motifAutre}
                onChange={(e) => setMotifAutre(e.target.value)}
              />
            )}
          </div>
        )}

        {/* Génération du courrier */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium uppercase tracking-wider text-[#737373]">
              Courrier au juge
            </label>
            <Button variant="secondary" size="sm" icon={FileText} onClick={genererCourrier}>
              Générer le courrier
            </Button>
          </div>

          {courrierGenere && (
            <div className="relative">
              <textarea
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] font-mono text-sm"
                rows={12}
                defaultValue={getCourrierTemplate()}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  className="p-1.5 bg-white rounded border hover:bg-gray-50"
                  title="Copier"
                  onClick={() => navigator.clipboard.writeText(getCourrierTemplate())}
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1.5 bg-white rounded border hover:bg-gray-50" title="Télécharger">
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Options d'envoi */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-sm font-medium text-[#1a1a1a] mb-3">Mode d'envoi</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="envoi" value="opalex" className="text-[#c9a227]" />
              <span className="text-sm">Via OPALEX / RPVJ</span>
              <Badge variant="info" className="ml-2">Recommandé</Badge>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="envoi" value="email" className="text-[#c9a227]" />
              <span className="text-sm">Par email au greffe</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="envoi" value="courrier" className="text-[#c9a227]" />
              <span className="text-sm">Par courrier postal</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            icon={Send}
            className={`flex-1 ${
              type === 'accepter' ? 'bg-green-600 hover:bg-green-700' :
              type === 'refuser' ? 'bg-red-600 hover:bg-red-700' :
              'bg-orange-600 hover:bg-orange-700'
            }`}
            onClick={handleConfirm}
            disabled={isRefus && !motif}
          >
            {type === 'accepter' ? 'Confirmer l\'acceptation' :
             type === 'refuser' ? 'Confirmer le refus' :
             'Confirmer la récusation'}
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

export default ReponseJuge;
