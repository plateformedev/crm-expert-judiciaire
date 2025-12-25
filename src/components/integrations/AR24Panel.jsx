// ============================================================================
// CRM EXPERT JUDICIAIRE - PANNEAU AR24
// Interface envoi LRAR dématérialisées et suivi
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Send, Mail, Clock, CheckCircle, XCircle, AlertTriangle,
  FileText, Download, Eye, RefreshCw, Euro, Package,
  ChevronDown, ChevronUp, ExternalLink, Loader2, Inbox
} from 'lucide-react';
import { Card, Badge, Button, ModalBase, EmptyState } from '../ui';
import { ar24Service, AR24_STATUTS, AR24_TYPES } from '../../services/ar24';
import { formatDateFr, formatMontant } from '../../utils/helpers';

// ============================================================================
// COMPOSANT PRINCIPAL - PANNEAU AR24
// ============================================================================

export const AR24Panel = ({ affaire, onEnvoiSuccess }) => {
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnvoiModal, setShowEnvoiModal] = useState(false);
  const [selectedDestinataire, setSelectedDestinataire] = useState(null);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [balanceData, historyData] = await Promise.all([
        ar24Service.getBalance(),
        ar24Service.getHistory()
      ]);
      setBalance(balanceData);
      setHistory(historyData.data || []);
    } catch (error) {
      console.error('Erreur chargement AR24:', error);
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = ar24Service.isConfigured();

  return (
    <div className="space-y-6">
      {/* Header avec statut */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                          ${isConfigured ? 'bg-green-100' : 'bg-amber-100'}`}>
            <Mail className={`w-6 h-6 ${isConfigured ? 'text-green-600' : 'text-amber-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-[#1a1a1a]">AR24 - LRAR Dématérialisées</h3>
            <p className="text-sm text-[#737373]">
              {isConfigured ? 'Connecté' : 'Mode simulation'}
            </p>
          </div>
        </div>

        {balance && (
          <div className="text-right">
            <div className="text-sm text-[#737373]">Solde disponible</div>
            <div className="text-xl font-semibold text-[#2563EB]">
              {formatMontant(balance.balance)}
            </div>
          </div>
        )}
      </div>

      {/* Alerte si non configuré */}
      {!isConfigured && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Mode simulation</h4>
              <p className="text-sm text-amber-700 mt-1">
                AR24 n'est pas configuré. Les envois sont simulés.
                Ajoutez vos clés API dans les paramètres pour activer les envois réels.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          className="p-4 hover:border-[#2563EB] cursor-pointer transition-colors"
          onClick={() => setShowEnvoiModal(true)}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-sm">Nouvel envoi</span>
          </div>
        </Card>

        {Object.values(AR24_TYPES).map(type => (
          <Card key={type.code} className="p-4">
            <div className="flex flex-col items-center text-center gap-1">
              <span className="text-sm text-[#737373]">{type.label}</span>
              <span className="font-semibold text-[#2563EB]">{formatMontant(type.prix)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Historique des envois */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-[#1a1a1a]">Historique des envois</h4>
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={loadData}
            loading={loading}
          >
            Actualiser
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Aucun envoi"
            description="Vos LRAR envoyées apparaîtront ici"
          />
        ) : (
          <div className="space-y-3">
            {history.map(envoi => (
              <EnvoiCard key={envoi.id} envoi={envoi} />
            ))}
          </div>
        )}
      </div>

      {/* Modal nouvel envoi */}
      {showEnvoiModal && (
        <ModalNouvelEnvoi
          isOpen={showEnvoiModal}
          onClose={() => setShowEnvoiModal(false)}
          affaire={affaire}
          onSuccess={(result) => {
            loadData();
            onEnvoiSuccess?.(result);
            setShowEnvoiModal(false);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// CARTE ENVOI
// ============================================================================

const EnvoiCard = ({ envoi }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  const statutInfo = AR24_STATUTS[envoi.status?.toUpperCase()] || {
    label: envoi.status,
    color: 'gray'
  };

  const loadDetails = async () => {
    if (details) {
      setExpanded(!expanded);
      return;
    }

    setLoading(true);
    try {
      const statusData = await ar24Service.getStatus(envoi.tracking_number);
      setDetails(statusData);
      setExpanded(true);
    } catch (error) {
      console.error('Erreur détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700'
  };

  return (
    <Card className="p-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={loadDetails}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center
                          ${colorClasses[statutInfo.color]}`}>
            {statutInfo.color === 'green' && <CheckCircle className="w-5 h-5" />}
            {statutInfo.color === 'red' && <XCircle className="w-5 h-5" />}
            {statutInfo.color === 'blue' && <Clock className="w-5 h-5" />}
            {!['green', 'red', 'blue'].includes(statutInfo.color) && <Mail className="w-5 h-5" />}
          </div>

          <div>
            <div className="font-medium text-[#1a1a1a]">
              {envoi.recipient?.name || 'Destinataire'}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#737373]">
              <span>Réf: {envoi.reference}</span>
              <span>•</span>
              <span>{formatDateFr(envoi.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={colorClasses[statutInfo.color]}>
            {statutInfo.label}
          </Badge>
          {loading ? (
            <Loader2 className="w-5 h-5 text-[#a3a3a3] animate-spin" />
          ) : (
            expanded ? (
              <ChevronUp className="w-5 h-5 text-[#a3a3a3]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#a3a3a3]" />
            )
          )}
        </div>
      </div>

      {/* Détails expandés */}
      {expanded && details && (
        <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-[#a3a3a3] uppercase">N° Suivi</div>
              <div className="font-mono text-sm">{envoi.tracking_number}</div>
            </div>
            {details.deliveredAt && (
              <div>
                <div className="text-xs text-[#a3a3a3] uppercase">Distribué le</div>
                <div className="text-sm">{formatDateFr(details.deliveredAt)}</div>
              </div>
            )}
          </div>

          {/* Timeline événements */}
          {details.events && details.events.length > 0 && (
            <div className="space-y-2">
              {details.events.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5" />
                  <div>
                    <div className="text-sm text-[#1a1a1a]">{event.description}</div>
                    <div className="text-xs text-[#a3a3a3]">
                      {formatDateFr(event.date, true)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={() => ar24Service.downloadProof(envoi.tracking_number, 'depot')}
            >
              Preuve de dépôt
            </Button>
            {['delivered', 'ar_received'].includes(envoi.status) && (
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={() => ar24Service.downloadProof(envoi.tracking_number, 'ar')}
              >
                Avis de réception
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// MODAL NOUVEL ENVOI
// ============================================================================

const ModalNouvelEnvoi = ({ isOpen, onClose, affaire, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destinataire: null,
    typeEnvoi: 'lrar',
    document: null,
    reference: ''
  });

  const handleSubmit = async () => {
    if (!formData.destinataire || !formData.document) return;

    setLoading(true);
    try {
      const result = await ar24Service.sendLRAR(
        formData.destinataire,
        formData.document,
        {
          type: formData.typeEnvoi,
          reference: formData.reference || `${affaire?.reference || 'EXP'}-${Date.now()}`
        }
      );
      onSuccess(result);
    } catch (error) {
      console.error('Erreur envoi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Nouvel envoi AR24"
      size="lg"
    >
      <div className="space-y-6">
        {/* Étape 1: Destinataire */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-medium text-[#1a1a1a]">1. Destinataire</h4>

            {affaire?.parties?.length > 0 ? (
              <div className="space-y-2">
                {affaire.parties.map((partie, idx) => (
                  <Card
                    key={idx}
                    className={`p-4 cursor-pointer transition-colors ${
                      formData.destinataire?.id === partie.id
                        ? 'border-[#2563EB] bg-[#fafafa]'
                        : 'hover:border-[#2563EB]'
                    }`}
                    onClick={() => setFormData({ ...formData, destinataire: partie })}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={formData.destinataire?.id === partie.id}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#2563EB]"
                      />
                      <div>
                        <div className="font-medium">{partie.nom}</div>
                        <div className="text-sm text-[#737373]">
                          {partie.adresse}, {partie.code_postal} {partie.ville}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nom"
                    className="px-4 py-2 border border-[#e5e5e5] rounded-lg"
                    onChange={(e) => setFormData({
                      ...formData,
                      destinataire: { ...formData.destinataire, nom: e.target.value }
                    })}
                  />
                  <input
                    type="text"
                    placeholder="Prénom"
                    className="px-4 py-2 border border-[#e5e5e5] rounded-lg"
                    onChange={(e) => setFormData({
                      ...formData,
                      destinataire: { ...formData.destinataire, prenom: e.target.value }
                    })}
                  />
                  <input
                    type="text"
                    placeholder="Adresse"
                    className="col-span-2 px-4 py-2 border border-[#e5e5e5] rounded-lg"
                    onChange={(e) => setFormData({
                      ...formData,
                      destinataire: { ...formData.destinataire, adresse: e.target.value }
                    })}
                  />
                  <input
                    type="text"
                    placeholder="Code postal"
                    className="px-4 py-2 border border-[#e5e5e5] rounded-lg"
                    onChange={(e) => setFormData({
                      ...formData,
                      destinataire: { ...formData.destinataire, code_postal: e.target.value }
                    })}
                  />
                  <input
                    type="text"
                    placeholder="Ville"
                    className="px-4 py-2 border border-[#e5e5e5] rounded-lg"
                    onChange={(e) => setFormData({
                      ...formData,
                      destinataire: { ...formData.destinataire, ville: e.target.value }
                    })}
                  />
                </div>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                disabled={!formData.destinataire}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}

        {/* Étape 2: Type d'envoi et document */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-medium text-[#1a1a1a]">2. Type d'envoi</h4>

            <div className="grid grid-cols-3 gap-4">
              {Object.values(AR24_TYPES).map(type => (
                <Card
                  key={type.code}
                  className={`p-4 cursor-pointer transition-colors text-center ${
                    formData.typeEnvoi === type.code
                      ? 'border-[#2563EB] bg-[#fafafa]'
                      : 'hover:border-[#2563EB]'
                  }`}
                  onClick={() => setFormData({ ...formData, typeEnvoi: type.code })}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-lg font-semibold text-[#2563EB] mt-1">
                    {formatMontant(type.prix)}
                  </div>
                </Card>
              ))}
            </div>

            <h4 className="font-medium text-[#1a1a1a] mt-6">Document</h4>
            <div className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-8 text-center">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                id="document-upload"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setFormData({
                        ...formData,
                        document: {
                          content: reader.result.split(',')[1],
                          filename: file.name,
                          contentType: 'application/pdf'
                        }
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label htmlFor="document-upload" className="cursor-pointer">
                {formData.document ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <FileText className="w-8 h-8" />
                    <span>{formData.document.filename}</span>
                  </div>
                ) : (
                  <>
                    <FileText className="w-12 h-12 text-[#a3a3a3] mx-auto mb-2" />
                    <p className="text-[#737373]">Cliquez pour sélectionner un PDF</p>
                  </>
                )}
              </label>
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Retour
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(3)}
                disabled={!formData.document}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}

        {/* Étape 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-medium text-[#1a1a1a]">3. Confirmation</h4>

            <Card className="p-4 bg-[#fafafa]">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#737373]">Destinataire</span>
                  <span className="font-medium">{formData.destinataire?.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Adresse</span>
                  <span className="text-right text-sm">
                    {formData.destinataire?.adresse}<br />
                    {formData.destinataire?.code_postal} {formData.destinataire?.ville}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Type d'envoi</span>
                  <span>{AR24_TYPES[formData.typeEnvoi.toUpperCase()]?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Document</span>
                  <span>{formData.document?.filename}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#e5e5e5]">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-semibold text-[#2563EB]">
                    {formatMontant(AR24_TYPES[formData.typeEnvoi.toUpperCase()]?.prix || 4.99)}
                  </span>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Retour
              </Button>
              <Button
                variant="primary"
                icon={Send}
                onClick={handleSubmit}
                loading={loading}
              >
                Envoyer la LRAR
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModalBase>
  );
};

// ============================================================================
// WIDGET COMPACT AR24 POUR AFFAIRES
// ============================================================================

export const AR24Widget = ({ affaire, compact = true }) => {
  const [showPanel, setShowPanel] = useState(false);
  const isConfigured = ar24Service.isConfigured();

  if (compact) {
    return (
      <>
        <Button
          variant="secondary"
          size="sm"
          icon={Mail}
          onClick={() => setShowPanel(true)}
        >
          LRAR AR24
        </Button>

        <ModalBase
          isOpen={showPanel}
          onClose={() => setShowPanel(false)}
          title="Envoi LRAR - AR24"
          size="xl"
        >
          <AR24Panel affaire={affaire} />
        </ModalBase>
      </>
    );
  }

  return <AR24Panel affaire={affaire} />;
};

// ============================================================================
// EXPORT
// ============================================================================

export default AR24Panel;
