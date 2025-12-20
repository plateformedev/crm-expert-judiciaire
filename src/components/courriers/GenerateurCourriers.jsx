// ============================================================================
// CRM EXPERT JUDICIAIRE - GÉNÉRATEUR DE COURRIERS
// Modèles de courriers juridiques pré-remplis automatiquement
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  FileText, Send, Copy, Download, Printer, Eye, Edit,
  Check, Mail, Building, Scale, Calendar, Euro, Users,
  AlertTriangle, Clock, ChevronRight, Wand2, Save
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// MODÈLES DE COURRIERS
// ============================================================================

export const MODELES_COURRIERS = {
  // Réponse au juge
  acceptation_mission: {
    id: 'acceptation_mission',
    titre: 'Acceptation de mission',
    categorie: 'juge',
    icon: Check,
    description: 'Lettre d\'acceptation de la mission d\'expertise au JCE',
    destinataire: 'juge',
    obligatoire: true
  },
  refus_mission: {
    id: 'refus_mission',
    titre: 'Refus de mission',
    categorie: 'juge',
    icon: AlertTriangle,
    description: 'Lettre de refus motivé de la mission',
    destinataire: 'juge'
  },
  demande_recusation: {
    id: 'demande_recusation',
    titre: 'Demande de récusation',
    categorie: 'juge',
    icon: Scale,
    description: 'Demande de récusation pour conflit d\'intérêts',
    destinataire: 'juge'
  },

  // Convocations
  convocation_r1: {
    id: 'convocation_r1',
    titre: 'Convocation première réunion',
    categorie: 'parties',
    icon: Calendar,
    description: 'Convocation des parties à la première réunion d\'expertise',
    destinataire: 'parties',
    obligatoire: true
  },
  convocation_reunion: {
    id: 'convocation_reunion',
    titre: 'Convocation réunion',
    categorie: 'parties',
    icon: Calendar,
    description: 'Convocation pour une réunion d\'expertise',
    destinataire: 'parties'
  },

  // Provisions et finances
  demande_consignation: {
    id: 'demande_consignation',
    titre: 'Demande de consignation complémentaire',
    categorie: 'juge',
    icon: Euro,
    description: 'Demande de consignation complémentaire au JCE',
    destinataire: 'juge'
  },
  relance_provision: {
    id: 'relance_provision',
    titre: 'Relance provision',
    categorie: 'greffe',
    icon: Euro,
    description: 'Relance au greffe pour provision non reçue',
    destinataire: 'greffe'
  },

  // Procédure
  demande_prorogation: {
    id: 'demande_prorogation',
    titre: 'Demande de prorogation',
    categorie: 'juge',
    icon: Clock,
    description: 'Demande de prorogation de délai au JCE',
    destinataire: 'juge'
  },
  transmission_note_synthese: {
    id: 'transmission_note_synthese',
    titre: 'Transmission note de synthèse',
    categorie: 'parties',
    icon: FileText,
    description: 'Envoi de la note de synthèse aux parties',
    destinataire: 'parties'
  },
  transmission_rapport: {
    id: 'transmission_rapport',
    titre: 'Transmission rapport final',
    categorie: 'juge',
    icon: FileText,
    description: 'Envoi du rapport définitif au tribunal',
    destinataire: 'juge'
  },
  demande_taxation: {
    id: 'demande_taxation',
    titre: 'Demande de taxation',
    categorie: 'juge',
    icon: Euro,
    description: 'Demande de taxation des honoraires',
    destinataire: 'juge'
  },

  // Parties
  demande_pieces: {
    id: 'demande_pieces',
    titre: 'Demande de pièces',
    categorie: 'parties',
    icon: FileText,
    description: 'Demande de communication de pièces aux parties',
    destinataire: 'parties'
  },
  reponse_dire: {
    id: 'reponse_dire',
    titre: 'Réponse au dire',
    categorie: 'parties',
    icon: Mail,
    description: 'Réponse motivée à un dire de partie',
    destinataire: 'partie'
  }
};

// ============================================================================
// GÉNÉRATEURS DE CONTENU
// ============================================================================

const generateurContenu = {
  acceptation_mission: (affaire, expert, options = {}) => {
    return `Monsieur/Madame le Juge chargé(e) du contrôle des expertises,

J'ai l'honneur d'accuser réception de votre ordonnance en date du ${affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : '___'} me désignant en qualité d'expert dans le litige :

RG : ${affaire.rg || '___'}
${affaire.tribunal || '___'}

J'ai l'honneur de vous informer que j'accepte cette mission d'expertise.

Je procéderai aux opérations d'expertise conformément aux termes de votre ordonnance et vous tiendrai régulièrement informé du déroulement de mes travaux.

La provision d'un montant de ${affaire.provision_montant ? parseFloat(affaire.provision_montant).toLocaleString('fr-FR') : '___'} € a bien été notée et je ne manquerai pas de vous aviser dès sa réception.

Je convoquerai les parties à une première réunion d'expertise dans les meilleurs délais, dans le respect du délai de convocation de 8 jours minimum.

Je vous prie d'agréer, Monsieur/Madame le Juge, l'expression de ma haute considération.

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire`;
  },

  refus_mission: (affaire, expert, options = {}) => {
    return `Monsieur/Madame le Juge chargé(e) du contrôle des expertises,

J'ai l'honneur d'accuser réception de votre ordonnance en date du ${affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : '___'} me désignant en qualité d'expert dans le litige :

RG : ${affaire.rg || '___'}
${affaire.tribunal || '___'}

Je suis au regret de vous informer que je ne suis pas en mesure d'accepter cette mission pour le motif suivant :

${options.motif || '[Motif du refus à préciser]'}

Je vous prie de bien vouloir procéder à mon remplacement et vous prie d'agréer, Monsieur/Madame le Juge, l'expression de ma haute considération.

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire`;
  },

  demande_recusation: (affaire, expert, options = {}) => {
    return `Monsieur/Madame le Juge chargé(e) du contrôle des expertises,

J'ai l'honneur d'accuser réception de votre ordonnance en date du ${affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : '___'} me désignant en qualité d'expert dans le litige :

RG : ${affaire.rg || '___'}
${affaire.tribunal || '___'}

Conformément aux articles 234 et suivants du Code de procédure civile, j'ai l'honneur de solliciter ma récusation pour le motif suivant :

${options.motif || '[Motif de la récusation à préciser]'}

Ce motif est de nature à compromettre mon impartialité et la sérénité des opérations d'expertise.

Je vous serais reconnaissant de bien vouloir procéder à mon remplacement et vous prie d'agréer, Monsieur/Madame le Juge, l'expression de ma haute considération.

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire`;
  },

  convocation_r1: (affaire, expert, options = {}) => {
    const reunion = options.reunion || {};
    const partiesListe = (affaire.parties || []).map(p => {
      const nom = p.raison_sociale || `${p.prenom || ''} ${p.nom}`.trim();
      return `- ${nom} (${p.type})${p.avocat_nom ? ` - représenté(e) par Me ${p.avocat_nom}` : ''}`;
    }).join('\n');

    return `Madame, Monsieur,

En ma qualité d'expert judiciaire désigné par ordonnance du ${affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : '___'} de ${affaire.tribunal || '___'} dans le litige RG ${affaire.rg || '___'}, j'ai l'honneur de vous convoquer à la :

PREMIÈRE RÉUNION D'EXPERTISE

Date : ${reunion.date_reunion ? formatDateFr(reunion.date_reunion) : '___'}
Heure : ${reunion.heure || '___'}
Lieu : ${reunion.lieu || affaire.bien_adresse || '___'}

L'ordre du jour de cette première réunion sera le suivant :
- Présentation des parties
- Exposé des faits et du litige
- Visite des lieux et constatations
- Recueil des observations
- Organisation de la suite des opérations

Conformément à l'article 160 du Code de procédure civile, les parties peuvent se faire assister ou représenter par toute personne de leur choix.

Parties convoquées :
${partiesListe || '[Liste des parties]'}

Je vous rappelle que les parties peuvent m'adresser des dires écrits jusqu'à la date que je fixerai.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire`;
  },

  convocation_reunion: (affaire, expert, options = {}) => {
    const reunion = options.reunion || {};
    return `Madame, Monsieur,

Dans le cadre de l'expertise judiciaire ordonnée par ${affaire.tribunal || '___'} (RG ${affaire.rg || '___'}), j'ai l'honneur de vous convoquer à :

RÉUNION D'EXPERTISE N°${reunion.numero || '___'}

Date : ${reunion.date_reunion ? formatDateFr(reunion.date_reunion) : '___'}
Heure : ${reunion.heure || '___'}
Lieu : ${reunion.lieu || affaire.bien_adresse || '___'}

Objet de la réunion :
${reunion.objet || '[Objet à préciser]'}

Les parties peuvent se faire assister ou représenter par toute personne de leur choix.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire`;
  },

  demande_consignation: (affaire, expert, options = {}) => {
    return `Monsieur/Madame le Juge chargé(e) du contrôle des expertises,

Dans le cadre de l'expertise judiciaire qui m'a été confiée par ordonnance du ${affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : '___'} :

RG : ${affaire.rg || '___'}
${affaire.tribunal || '___'}

J'ai l'honneur de solliciter une consignation complémentaire d'un montant de ${options.montant ? parseFloat(options.montant).toLocaleString('fr-FR') : '___'} €.

Cette demande est motivée par les éléments suivants :
${options.motif || `- Complexité technique du dossier nécessitant des investigations supplémentaires
- Nombre important de réunions d'expertise à prévoir
- Recours probable à un sapiteur`}

État des provisions :
- Provision initiale : ${affaire.provision_montant ? parseFloat(affaire.provision_montant).toLocaleString('fr-FR') : '0'} €
- Provision reçue : ${affaire.provision_recue ? 'Oui' : 'Non'}
- Consignation demandée : ${options.montant ? parseFloat(options.montant).toLocaleString('fr-FR') : '___'} €

Je vous remercie de bien vouloir faire droit à cette demande et vous prie d'agréer, Monsieur/Madame le Juge, l'expression de ma haute considération.

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire`;
  },

  relance_provision: (affaire, expert, options = {}) => {
    return `Madame, Monsieur,

Par ordonnance en date du ${affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : '___'}, ${affaire.tribunal || '___'} m'a désigné en qualité d'expert dans le litige RG ${affaire.rg || '___'}.

Cette ordonnance prévoyait une provision de ${affaire.provision_montant ? parseFloat(affaire.provision_montant).toLocaleString('fr-FR') : '___'} € qui devait être consignée au greffe.

À ce jour, je n'ai pas été informé de la réception de cette provision, ce qui retarde le démarrage des opérations d'expertise.

Je vous serais reconnaissant de bien vouloir :
- Me confirmer si cette provision a été versée
- Le cas échéant, procéder au virement sur mon compte CARPA

Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire`;
  },

  demande_prorogation: (affaire, expert, options = {}) => {
    return `Monsieur/Madame le Juge chargé(e) du contrôle des expertises,

Dans le cadre de l'expertise judiciaire qui m'a été confiée par ordonnance du ${affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : '___'} :

RG : ${affaire.rg || '___'}
${affaire.tribunal || '___'}

Le délai de dépôt du rapport était fixé au ${affaire.date_echeance ? formatDateFr(affaire.date_echeance) : '___'}.

J'ai l'honneur de solliciter une prorogation de délai de ${options.duree || '___'} mois, soit jusqu'au ${options.nouvelle_date ? formatDateFr(options.nouvelle_date) : '___'}.

Cette demande est motivée par :
${options.motif || `- Complexité technique du dossier
- Nécessité de réunions d'expertise complémentaires
- Délais de réponse des parties aux dires`}

État d'avancement des opérations :
${options.avancement || '- [Décrire l\'état d\'avancement]'}

Je m'engage à déposer mon rapport dans le nouveau délai sollicité.

Je vous prie d'agréer, Monsieur/Madame le Juge, l'expression de ma haute considération.

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire`;
  },

  transmission_note_synthese: (affaire, expert, options = {}) => {
    return `Madame, Monsieur,

Dans le cadre de l'expertise judiciaire ordonnée par ${affaire.tribunal || '___'} (RG ${affaire.rg || '___'}), j'ai l'honneur de vous transmettre ci-joint ma NOTE DE SYNTHÈSE.

Conformément à l'article 276 du Code de procédure civile, ce document constitue le pré-rapport de l'expert et fixe les termes de ma discussion.

Vous disposez d'un délai de 30 jours à compter de la réception de ce document pour me faire part de vos observations écrites (dires).

Passé ce délai, je finaliserai mon rapport définitif.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire

PJ : Note de synthèse`;
  },

  transmission_rapport: (affaire, expert, options = {}) => {
    return `Monsieur/Madame le Juge chargé(e) du contrôle des expertises,

Dans le cadre de l'expertise judiciaire qui m'a été confiée par ordonnance du ${affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : '___'} :

RG : ${affaire.rg || '___'}
${affaire.tribunal || '___'}

J'ai l'honneur de vous transmettre ci-joint mon RAPPORT D'EXPERTISE définitif.

Ce rapport a été établi contradictoirement après communication aux parties d'une note de synthèse et recueil de leurs observations.

Je joins également :
- L'état de mes frais et honoraires pour taxation
- Les pièces annexes (${options.nb_annexes || '___'} annexes)

Je reste à votre disposition pour tout renseignement complémentaire.

Je vous prie d'agréer, Monsieur/Madame le Juge, l'expression de ma haute considération.

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire

PJ :
- Rapport d'expertise
- État de frais
- Annexes`;
  },

  demande_taxation: (affaire, expert, options = {}) => {
    const totaux = options.totaux || {};
    return `Monsieur/Madame le Juge chargé(e) du contrôle des expertises,

Dans le cadre de l'expertise judiciaire RG ${affaire.rg || '___'} (${affaire.tribunal || '___'}), et suite au dépôt de mon rapport définitif, j'ai l'honneur de solliciter la taxation de mes honoraires.

ÉTAT DES FRAIS ET HONORAIRES

Honoraires HT : ${totaux.totalHonorairesHT ? totaux.totalHonorairesHT.toLocaleString('fr-FR') : '___'} €
Frais HT : ${totaux.totalFraisHT ? totaux.totalFraisHT.toLocaleString('fr-FR') : '___'} €
Total HT : ${totaux.totalHT ? totaux.totalHT.toLocaleString('fr-FR') : '___'} €
TVA (20%) : ${totaux.tva ? totaux.tva.toLocaleString('fr-FR') : '___'} €
TOTAL TTC : ${totaux.totalTTC ? totaux.totalTTC.toLocaleString('fr-FR') : '___'} €

Provisions reçues : ${totaux.provisionsRecues ? totaux.provisionsRecues.toLocaleString('fr-FR') : '___'} €
Solde à percevoir : ${totaux.solde ? totaux.solde.toLocaleString('fr-FR') : '___'} €

Le détail des prestations est joint en annexe.

Je vous prie d'agréer, Monsieur/Madame le Juge, l'expression de ma haute considération.

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire

PJ : État de frais détaillé`;
  },

  demande_pieces: (affaire, expert, options = {}) => {
    return `Madame, Monsieur,

Dans le cadre de l'expertise judiciaire ordonnée par ${affaire.tribunal || '___'} (RG ${affaire.rg || '___'}), j'ai l'honneur de vous demander de bien vouloir me communiquer les pièces suivantes :

${options.pieces || `1. [Pièce demandée]
2. [Pièce demandée]
3. [Pièce demandée]`}

Ces documents sont nécessaires à l'accomplissement de ma mission d'expertise.

Je vous remercie de me faire parvenir ces éléments dans un délai de ${options.delai || '15'} jours.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire`;
  },

  reponse_dire: (affaire, expert, options = {}) => {
    const dire = options.dire || {};
    return `Madame, Monsieur,

En réponse au dire que vous m'avez adressé le ${dire.date ? formatDateFr(dire.date) : '___'} concernant :

"${dire.objet || '[Objet du dire]'}"

J'ai l'honneur de vous faire part de ma réponse :

${options.reponse || '[Réponse motivée de l\'expert]'}

Cette réponse sera intégrée à mon rapport d'expertise.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${expert?.prenom || ''} ${expert?.nom || '[Nom Expert]'}
Expert Judiciaire`;
  }
};

// ============================================================================
// COMPOSANT: Carte modèle de courrier
// ============================================================================

const ModeleCourrierCard = ({ modele, onSelect, selected }) => {
  const Icon = modele.icon || FileText;

  return (
    <button
      onClick={() => onSelect(modele)}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-[#c9a227] bg-[#faf8f3]'
          : 'border-[#e5e5e5] hover:border-[#c9a227] bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          selected ? 'bg-[#c9a227] text-white' : 'bg-[#f5f5f5] text-[#737373]'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-[#1a1a1a]">{modele.titre}</h4>
            {modele.obligatoire && (
              <Badge variant="warning" className="text-xs">Requis</Badge>
            )}
          </div>
          <p className="text-xs text-[#737373] mt-1">{modele.description}</p>
        </div>
        <ChevronRight className={`w-4 h-4 ${selected ? 'text-[#c9a227]' : 'text-[#a3a3a3]'}`} />
      </div>
    </button>
  );
};

// ============================================================================
// COMPOSANT: Générateur de courriers
// ============================================================================

export const GenerateurCourriers = ({ affaire, expert, onSave }) => {
  const [selectedModele, setSelectedModele] = useState(null);
  const [contenu, setContenu] = useState('');
  const [options, setOptions] = useState({});
  const [previewMode, setPreviewMode] = useState(false);

  // Grouper les modèles par catégorie
  const modelesParCategorie = useMemo(() => {
    const categories = {
      juge: { label: 'Courriers au Juge', modeles: [] },
      parties: { label: 'Courriers aux Parties', modeles: [] },
      greffe: { label: 'Courriers au Greffe', modeles: [] }
    };

    Object.values(MODELES_COURRIERS).forEach(modele => {
      if (categories[modele.categorie]) {
        categories[modele.categorie].modeles.push(modele);
      }
    });

    return categories;
  }, []);

  // Générer le contenu du courrier
  const genererContenu = (modele) => {
    if (!modele) return '';

    const generateur = generateurContenu[modele.id];
    if (generateur) {
      return generateur(affaire, expert, options);
    }
    return `[Modèle "${modele.titre}" - Contenu à générer]`;
  };

  // Sélectionner un modèle
  const handleSelectModele = (modele) => {
    setSelectedModele(modele);
    setOptions({});
    const nouveauContenu = genererContenu(modele);
    setContenu(nouveauContenu);
  };

  // Régénérer avec nouvelles options
  const handleRegenerer = () => {
    if (selectedModele) {
      const nouveauContenu = genererContenu(selectedModele);
      setContenu(nouveauContenu);
    }
  };

  // Copier le contenu
  const handleCopier = () => {
    navigator.clipboard.writeText(contenu);
  };

  // Sauvegarder comme document
  const handleSauvegarder = () => {
    if (onSave && selectedModele) {
      onSave({
        type: selectedModele.id,
        titre: selectedModele.titre,
        contenu: contenu,
        date: new Date().toISOString(),
        destinataire: selectedModele.destinataire
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a]">Générateur de courriers</h2>
          <p className="text-sm text-[#737373]">
            Modèles pré-remplis pour l'affaire {affaire?.reference}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Colonne 1: Liste des modèles */}
        <div className="space-y-6">
          {Object.entries(modelesParCategorie).map(([key, categorie]) => (
            categorie.modeles.length > 0 && (
              <Card key={key} className="p-4">
                <h3 className="font-medium text-[#1a1a1a] mb-3 flex items-center gap-2">
                  {key === 'juge' && <Scale className="w-4 h-4 text-[#c9a227]" />}
                  {key === 'parties' && <Users className="w-4 h-4 text-[#c9a227]" />}
                  {key === 'greffe' && <Building className="w-4 h-4 text-[#c9a227]" />}
                  {categorie.label}
                </h3>
                <div className="space-y-2">
                  {categorie.modeles.map(modele => (
                    <ModeleCourrierCard
                      key={modele.id}
                      modele={modele}
                      selected={selectedModele?.id === modele.id}
                      onSelect={handleSelectModele}
                    />
                  ))}
                </div>
              </Card>
            )
          ))}
        </div>

        {/* Colonnes 2-3: Éditeur */}
        <div className="col-span-2">
          {!selectedModele ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-[#e5e5e5] mx-auto mb-4" />
              <p className="text-[#737373]">
                Sélectionnez un modèle de courrier pour commencer
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              {/* Barre d'outils */}
              <div className="p-4 bg-[#faf8f3] border-b border-[#e5e5e5] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <selectedModele.icon className="w-5 h-5 text-[#c9a227]" />
                  <div>
                    <h3 className="font-medium text-[#1a1a1a]">{selectedModele.titre}</h3>
                    <p className="text-xs text-[#737373]">
                      Destinataire : {selectedModele.destinataire}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Wand2}
                    onClick={handleRegenerer}
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
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Copy}
                    onClick={handleCopier}
                  >
                    Copier
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Printer}
                  >
                    Imprimer
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Save}
                    onClick={handleSauvegarder}
                  >
                    Enregistrer
                  </Button>
                </div>
              </div>

              {/* Options spécifiques au modèle */}
              {['demande_consignation', 'demande_prorogation', 'refus_mission', 'demande_recusation'].includes(selectedModele.id) && (
                <div className="p-4 bg-blue-50 border-b border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-3">Options du courrier</p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedModele.id === 'demande_consignation' && (
                      <Input
                        label="Montant demandé (€)"
                        type="number"
                        value={options.montant || ''}
                        onChange={(e) => setOptions({ ...options, montant: e.target.value })}
                        placeholder="Ex: 3000"
                      />
                    )}
                    {selectedModele.id === 'demande_prorogation' && (
                      <>
                        <Input
                          label="Durée (mois)"
                          type="number"
                          value={options.duree || ''}
                          onChange={(e) => setOptions({ ...options, duree: e.target.value })}
                          placeholder="Ex: 3"
                        />
                        <Input
                          label="Nouvelle date"
                          type="date"
                          value={options.nouvelle_date || ''}
                          onChange={(e) => setOptions({ ...options, nouvelle_date: e.target.value })}
                        />
                      </>
                    )}
                    {(selectedModele.id === 'refus_mission' || selectedModele.id === 'demande_recusation') && (
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-[#737373] uppercase block mb-2">
                          Motif
                        </label>
                        <textarea
                          value={options.motif || ''}
                          onChange={(e) => setOptions({ ...options, motif: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] text-sm"
                          placeholder="Précisez le motif..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Zone de texte */}
              <div className="p-4">
                {previewMode ? (
                  <div className="p-6 bg-white border border-[#e5e5e5] rounded-xl min-h-[500px]">
                    <pre className="whitespace-pre-wrap font-serif text-sm text-[#1a1a1a] leading-relaxed">
                      {contenu}
                    </pre>
                  </div>
                ) : (
                  <textarea
                    value={contenu}
                    onChange={(e) => setContenu(e.target.value)}
                    rows={25}
                    className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] font-mono text-sm leading-relaxed"
                    placeholder="Le contenu du courrier apparaîtra ici..."
                  />
                )}
              </div>

              {/* Pied de page */}
              <div className="p-4 bg-[#f5f5f5] border-t border-[#e5e5e5]">
                <div className="flex items-center justify-between text-xs text-[#737373]">
                  <span>
                    {contenu.split(/\s+/).filter(w => w).length} mots
                  </span>
                  <span>
                    Affaire : {affaire?.reference} • {affaire?.tribunal}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateurCourriers;
