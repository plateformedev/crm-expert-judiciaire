// ============================================================================
// CRM EXPERT JUDICIAIRE - GÉNÉRATEUR DE COMPTE-RENDU AUTOMATIQUE
// ============================================================================
// Génère automatiquement un compte-rendu de réunion à partir des données
// Notes, photos, désordres, présents/absents sont intégrés automatiquement

import React, { useState, useMemo, useCallback } from 'react';
import {
  FileText, Wand2, Download, Send, Eye, Edit,
  CheckCircle, AlertTriangle, Camera, Users, MapPin,
  Calendar, Clock, Building, ArrowRight, Sparkles
} from 'lucide-react';
import { Card, Badge, Button, ModalBase, useToast } from '../ui';
import { EditeurTexteRiche } from './EditeurTexteRiche';
import { MODELES_DEFAUT } from './GestionModeles';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// UTILITAIRE : Remplacer les variables dans le contenu
// ============================================================================

const remplacerVariables = (contenu, donnees) => {
  let resultat = contenu;

  // Remplacer toutes les variables {{xxx}}
  Object.entries(donnees).forEach(([cle, valeur]) => {
    const regex = new RegExp(`\\{\\{${cle}\\}\\}`, 'g');
    resultat = resultat.replace(regex, valeur || '');
  });

  // Nettoyer les variables non remplacées
  resultat = resultat.replace(/\{\{[^}]+\}\}/g, '[À compléter]');

  return resultat;
};

// ============================================================================
// GÉNÉRATEUR DE CONTENU AUTOMATIQUE
// ============================================================================

const genererContenuCompteRendu = (reunion, affaire, expert) => {
  const parties = affaire.parties || [];
  const desordres = affaire.pathologies?.filter(d => d.reunion_numero === reunion.numero) || [];
  const photos = reunion.photos || [];
  const notes = reunion.notes || '';

  // Formater la liste des présents
  const presentsListe = reunion.presents?.length > 0
    ? reunion.presents.map(p => {
        const partie = parties.find(pa => pa.id === p.id || pa.nom === p.nom);
        return `- ${p.nom || p}${partie?.qualite ? ` (${partie.qualite})` : ''}${p.represente_par ? ` représenté(e) par ${p.represente_par}` : ''}`;
      }).join('\n')
    : '<em>Aucun présent enregistré</em>';

  // Formater la liste des absents
  const absentsListe = reunion.absents?.length > 0
    ? reunion.absents.map(a => {
        const partie = parties.find(pa => pa.id === a.id || pa.nom === a.nom);
        return `- ${a.nom || a}${partie?.qualite ? ` (${partie.qualite})` : ''}${a.excuse ? ' (excusé)' : ''}`;
      }).join('\n')
    : '<em>Aucun absent</em>';

  // Formater les désordres
  const desordresListe = desordres.length > 0
    ? desordres.map((d, i) => {
        const photosDesordre = d.photos?.length || 0;
        return `<strong>Désordre n°${i + 1} :</strong> ${d.designation || d.titre}
<br>• Localisation : ${d.localisation || 'Non précisée'}
<br>• Description : ${d.description || 'Voir notes'}
${d.dtu ? `<br>• DTU applicable : ${d.dtu}` : ''}
${photosDesordre > 0 ? `<br>• Photos : ${photosDesordre} photo(s) jointe(s)` : ''}`;
      }).join('<br><br>')
    : '<em>Aucun désordre constaté lors de cette réunion</em>';

  // Formater les notes (convertir les retours à la ligne en <br>)
  const notesFormatees = notes
    ? notes.split('\n').map(ligne => `<p>${ligne}</p>`).join('')
    : '<em>Aucune note enregistrée</em>';

  // Données pour le remplacement de variables
  const donnees = {
    'date.jour': formatDateFr(new Date()),
    'affaire.reference': affaire.reference || '',
    'affaire.rg': affaire.rg || '',
    'affaire.tribunal': affaire.tribunal || '',
    'bien.adresse': affaire.bien_adresse || '',
    'bien.code_postal': affaire.bien_code_postal || '',
    'bien.ville': affaire.bien_ville || '',
    'reunion.numero': reunion.numero?.toString() || '1',
    'reunion.date': reunion.date_reunion ? formatDateFr(reunion.date_reunion) : '[Date]',
    'reunion.heure': reunion.heure_debut || '',
    'reunion.lieu': reunion.lieu || affaire.bien_adresse || '',
    'reunion.presents': presentsListe,
    'reunion.absents': absentsListe,
    'expert.nom': expert?.nom || 'L\'expert judiciaire',
    'expert.ville': expert?.ville || ''
  };

  // Contenu HTML généré
  const contenu = `
<h1 style="text-align: center">COMPTE-RENDU DE RÉUNION D'EXPERTISE</h1>

<p style="text-align: center"><strong>Réunion n°${reunion.numero} du ${donnees['reunion.date']}</strong></p>

<hr>

<h2>1. RAPPEL DE L'AFFAIRE</h2>

<table>
<tr><td><strong>Référence :</strong></td><td>${donnees['affaire.reference']}</td></tr>
<tr><td><strong>RG :</strong></td><td>${donnees['affaire.rg']}</td></tr>
<tr><td><strong>Tribunal :</strong></td><td>${donnees['affaire.tribunal']}</td></tr>
</table>

<p><strong>Bien concerné :</strong><br>
${donnees['bien.adresse']}<br>
${donnees['bien.code_postal']} ${donnees['bien.ville']}</p>

<h2>2. PERSONNES PRÉSENTES</h2>

${presentsListe}

<h2>3. PERSONNES ABSENTES OU EXCUSÉES</h2>

${absentsListe}

<h2>4. DÉROULEMENT DE LA RÉUNION</h2>

<p>La réunion s'est tenue le ${donnees['reunion.date']}${donnees['reunion.heure'] ? ` à ${donnees['reunion.heure']}` : ''} à l'adresse du bien expertisé.</p>

${notes ? `
<h3>Notes prises pendant la réunion :</h3>
${notesFormatees}
` : ''}

<h2>5. CONSTATATIONS</h2>

${photos.length > 0 ? `<p><em>${photos.length} photo(s) prise(s) lors de cette réunion (voir annexes).</em></p>` : ''}

<p><em>[Compléter avec les constatations principales]</em></p>

<h2>6. DÉSORDRES RELEVÉS</h2>

${desordresListe}

<h2>7. OBSERVATIONS DES PARTIES</h2>

<p><em>[Synthèse des observations formulées par les parties présentes]</em></p>

<h2>8. PIÈCES REMISES OU DEMANDÉES</h2>

<p><em>[Lister les documents remis ou demandés]</em></p>

<h2>9. SUITE À DONNER</h2>

<p><em>[Prochaines étapes, éventuellement date de la prochaine réunion]</em></p>

<hr>

<p>Les parties sont invitées à formuler leurs observations éventuelles dans un délai de <strong>21 jours</strong> à compter de la réception du présent compte-rendu.</p>

<p style="text-align: right; margin-top: 2rem">
Fait à ${donnees['expert.ville'] || '[Ville]'}, le ${donnees['date.jour']}<br><br>
<strong>${donnees['expert.nom']}</strong><br>
Expert judiciaire
</p>
`;

  return contenu;
};

// ============================================================================
// COMPOSANT PRÉVISUALISATION
// ============================================================================

const PreviewCompteRendu = ({ reunion, affaire, desordres, photos }) => {
  const presentsCount = reunion.presents?.length || 0;
  const absentsCount = reunion.absents?.length || 0;
  const desordresCount = desordres?.length || 0;
  const photosCount = photos?.length || 0;
  const hasNotes = !!reunion.notes;

  return (
    <Card className="p-4 bg-[#fafafa] border-dashed">
      <h4 className="font-medium text-[#1a1a1a] mb-3 flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#2563EB]" />
        Données disponibles pour R{reunion.numero}
      </h4>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-green-600" />
          <span>{presentsCount} présent{presentsCount > 1 ? 's' : ''}</span>
          {presentsCount === 0 && (
            <Badge variant="warning" size="sm">À compléter</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-red-400" />
          <span>{absentsCount} absent{absentsCount > 1 ? 's' : ''}</span>
        </div>

        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-blue-600" />
          <span>{photosCount} photo{photosCount > 1 ? 's' : ''}</span>
        </div>

        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-amber-600" />
          <span>{desordresCount} désordre{desordresCount > 1 ? 's' : ''}</span>
        </div>

        <div className="flex items-center gap-2 col-span-2">
          {hasNotes ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700">Notes de réunion disponibles</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-amber-600">Pas de notes enregistrées</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const GenerateurCompteRendu = ({
  reunion,
  affaire,
  expert,
  onSave,
  onSend,
  onClose
}) => {
  const { addToast } = useToast();
  const [step, setStep] = useState('preview'); // 'preview' | 'edit' | 'confirm'
  const [contenu, setContenu] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Désordres liés à cette réunion
  const desordres = useMemo(() =>
    affaire.pathologies?.filter(d => d.reunion_numero === reunion.numero) || [],
    [affaire.pathologies, reunion.numero]
  );

  // Générer le compte-rendu
  const handleGenerate = useCallback(() => {
    setIsGenerating(true);

    // Simuler un court délai pour l'effet "génération"
    setTimeout(() => {
      const contenuGenere = genererContenuCompteRendu(reunion, affaire, expert);
      setContenu(contenuGenere);
      setStep('edit');
      setIsGenerating(false);
      addToast('Compte-rendu généré avec succès !', 'success');
    }, 500);
  }, [reunion, affaire, expert, addToast]);

  // Sauvegarder le compte-rendu
  const handleSave = useCallback(() => {
    onSave?.(contenu);
    addToast('Compte-rendu enregistré', 'success');
    setStep('confirm');
  }, [contenu, onSave, addToast]);

  // Envoyer aux parties
  const handleSend = useCallback(() => {
    onSend?.(contenu);
    addToast('Envoi en cours...', 'info');
  }, [contenu, onSend, addToast]);

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title={`Compte-rendu R${reunion.numero}`}
      size="xl"
    >
      {/* Étape 1: Prévisualisation des données */}
      {step === 'preview' && (
        <div className="space-y-6">
          {/* Récapitulatif de la réunion */}
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#2563EB] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                R{reunion.numero}
              </div>
              <div>
                <h3 className="font-medium text-[#1a1a1a]">
                  Réunion n°{reunion.numero}
                </h3>
                <p className="text-sm text-[#737373]">
                  {reunion.date_reunion ? formatDateFr(reunion.date_reunion) : 'Date non définie'}
                  {reunion.lieu && ` • ${reunion.lieu}`}
                </p>
              </div>
            </div>
          </Card>

          {/* Données disponibles */}
          <PreviewCompteRendu
            reunion={reunion}
            affaire={affaire}
            desordres={desordres}
            photos={reunion.photos}
          />

          {/* Explication */}
          <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Génération automatique</p>
                <p className="mt-1">
                  Le compte-rendu sera pré-rempli avec les données disponibles :
                  présents, absents, notes, désordres et photos. Vous pourrez
                  ensuite le compléter et le modifier librement.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="primary"
              icon={Wand2}
              onClick={handleGenerate}
              loading={isGenerating}
            >
              Générer le compte-rendu
            </Button>
          </div>
        </div>
      )}

      {/* Étape 2: Édition */}
      {step === 'edit' && (
        <div className="space-y-4">
          <EditeurTexteRiche
            content={contenu}
            onChange={setContenu}
            placeholder="Rédigez votre compte-rendu..."
            minHeight={400}
            showVariables={false}
          />

          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={() => setStep('preview')}
            >
              Retour
            </Button>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                icon={Eye}
                onClick={() => {
                  // TODO: Prévisualisation PDF
                  addToast('Prévisualisation (à venir)', 'info');
                }}
              >
                Aperçu
              </Button>
              <Button
                variant="primary"
                icon={CheckCircle}
                onClick={handleSave}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Étape 3: Confirmation et envoi */}
      {step === 'confirm' && (
        <div className="space-y-6">
          <div className="p-6 bg-green-50 rounded-xl text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-green-800">
              Compte-rendu enregistré !
            </h3>
            <p className="text-sm text-green-600 mt-1">
              Le compte-rendu de la réunion R{reunion.numero} a été sauvegardé.
            </p>
          </div>

          <Card className="p-4">
            <h4 className="font-medium text-[#1a1a1a] mb-3">Prochaines étapes</h4>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-lg cursor-pointer hover:bg-[#f0f0f0]">
                <input type="checkbox" className="w-4 h-4 text-[#2563EB]" />
                <span>Envoyer aux parties par email / AR24</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-lg cursor-pointer hover:bg-[#f0f0f0]">
                <input type="checkbox" className="w-4 h-4 text-[#2563EB]" />
                <span>Joindre les photos en annexe</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-lg cursor-pointer hover:bg-[#f0f0f0]">
                <input type="checkbox" className="w-4 h-4 text-[#2563EB]" />
                <span>Archiver dans le dossier</span>
              </label>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="secondary"
              icon={Edit}
              onClick={() => setStep('edit')}
            >
              Modifier
            </Button>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                icon={Download}
                onClick={() => addToast('Export PDF (à venir)', 'info')}
              >
                Exporter PDF
              </Button>
              <Button
                variant="primary"
                icon={Send}
                onClick={handleSend}
              >
                Envoyer aux parties
              </Button>
            </div>
          </div>
        </div>
      )}
    </ModalBase>
  );
};

export default GenerateurCompteRendu;
