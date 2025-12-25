// ============================================================================
// CRM EXPERT JUDICIAIRE - SERVICE GÉNÉRATION PDF
// ============================================================================

// ============================================================================
// TEMPLATES HTML POUR PDF
// ============================================================================

const PDF_STYLES = `
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #1a1a1a;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2563EB;
    }
    .header h1 {
      font-size: 18pt;
      font-weight: normal;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    .header .subtitle {
      font-size: 14pt;
      color: #525252;
    }
    .expert-info {
      text-align: right;
      font-size: 10pt;
      color: #737373;
      margin-bottom: 30px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      color: #1a1a1a;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 5px;
      margin-bottom: 15px;
    }
    .field {
      margin-bottom: 10px;
    }
    .field-label {
      font-weight: bold;
      display: inline-block;
      min-width: 150px;
    }
    .field-value {
      display: inline;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      border: 1px solid #d4d4d4;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .signature-block {
      margin-top: 50px;
      text-align: right;
    }
    .signature-line {
      margin-top: 60px;
      border-top: 1px solid #1a1a1a;
      width: 200px;
      margin-left: auto;
    }
    .footer {
      position: fixed;
      bottom: 1cm;
      left: 2cm;
      right: 2cm;
      text-align: center;
      font-size: 9pt;
      color: #a3a3a3;
      border-top: 1px solid #e5e5e5;
      padding-top: 10px;
    }
    .page-break {
      page-break-before: always;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .mt-20 { margin-top: 20px; }
    .mb-20 { margin-bottom: 20px; }
    .highlight {
      background-color: #DBEAFE;
      padding: 2px 5px;
    }
    ul, ol {
      margin-left: 20px;
      margin-bottom: 15px;
    }
    li {
      margin-bottom: 5px;
    }
  </style>
`;

// ============================================================================
// GÉNÉRATEURS DE DOCUMENTS
// ============================================================================

const pdfGenerators = {
  // ============================================================================
  // CONVOCATION
  // ============================================================================
  convocation: (data) => {
    const { expert, affaire, reunion, destinataire, dateConvocation } = data;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Convocation - ${affaire.reference}</title>
  ${PDF_STYLES}
</head>
<body>
  <div class="expert-info">
    <strong>${expert.nom} ${expert.prenom || ''}</strong><br>
    Expert Judiciaire près la Cour d'Appel de ${expert.cour_appel || 'Paris'}<br>
    ${expert.adresse || ''}<br>
    ${expert.telephone || ''}<br>
    ${expert.email || ''}
  </div>

  <div class="header">
    <h1>Convocation à Réunion d'Expertise</h1>
    <div class="subtitle">Affaire ${affaire.reference}</div>
  </div>

  <div class="section">
    <p><strong>À l'attention de :</strong></p>
    <p>${destinataire.nom} ${destinataire.prenom || ''}</p>
    ${destinataire.avocat_nom ? `<p>Représenté par Maître ${destinataire.avocat_nom}</p>` : ''}
    <p>${destinataire.adresse || ''}</p>
    <p>${destinataire.code_postal || ''} ${destinataire.ville || ''}</p>
  </div>

  <div class="section">
    <p>Fait à ${expert.ville || 'Paris'}, le ${new Date(dateConvocation).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <p><strong>Objet :</strong> Convocation à réunion d'expertise judiciaire</p>
    <p><strong>Références :</strong></p>
    <ul>
      <li>RG : ${affaire.rg || 'N/C'}</li>
      <li>Tribunal : ${affaire.tribunal}</li>
      <li>Ordonnance du : ${affaire.date_ordonnance ? new Date(affaire.date_ordonnance).toLocaleDateString('fr-FR') : 'N/C'}</li>
    </ul>
  </div>

  <div class="section">
    <p>Madame, Monsieur,</p>
    <p class="mt-20">
      Désigné en qualité d'expert judiciaire par ordonnance de référé susvisée, 
      j'ai l'honneur de vous convoquer à une réunion d'expertise qui se tiendra :
    </p>
  </div>

  <div class="section" style="background-color: #fafafa; padding: 20px; border-radius: 5px;">
    <p><strong>Date :</strong> ${new Date(reunion.date_reunion).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p><strong>Heure :</strong> ${new Date(reunion.date_reunion).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
    <p><strong>Lieu :</strong> ${reunion.lieu || affaire.bien_adresse || 'À préciser'}</p>
    <p><strong>Adresse :</strong> ${reunion.adresse || `${affaire.bien_adresse}, ${affaire.bien_code_postal} ${affaire.bien_ville}`}</p>
  </div>

  <div class="section mt-20">
    <p><strong>Ordre du jour :</strong></p>
    <ol>
      ${reunion.numero === 1 ? `
        <li>Présentation de l'expert et causes éventuelles de récusation</li>
        <li>Tour de table des parties et de leurs conseils</li>
        <li>Lecture de la mission</li>
        <li>Visite des lieux et constatations</li>
        <li>Échanges contradictoires</li>
        <li>Définition du calendrier des opérations</li>
      ` : `
        <li>Rappel des opérations précédentes</li>
        <li>Examen des pièces communiquées</li>
        <li>Constatations complémentaires</li>
        <li>Échanges contradictoires</li>
        <li>Suite des opérations</li>
      `}
    </ol>
  </div>

  <div class="section mt-20">
    <p><strong>Documents à apporter :</strong></p>
    <ul>
      <li>Pièce d'identité</li>
      <li>Pouvoir de représentation le cas échéant</li>
      <li>Tous documents utiles à l'expertise</li>
      <li>Attestations d'assurance</li>
    </ul>
  </div>

  <div class="section mt-20">
    <p>
      Conformément aux dispositions de l'article 160 du Code de Procédure Civile, 
      cette convocation vous est adressée par lettre recommandée avec accusé de réception.
    </p>
    <p class="mt-20">
      En cas d'empêchement, je vous prie de bien vouloir m'en informer dans les meilleurs délais.
    </p>
  </div>

  <div class="signature-block">
    <p>L'Expert Judiciaire,</p>
    <div class="signature-line"></div>
    <p>${expert.nom} ${expert.prenom || ''}</p>
  </div>

  <div class="footer">
    ${expert.nom} - Expert Judiciaire inscrit sur la liste de la Cour d'Appel de ${expert.cour_appel || 'Paris'}
  </div>
</body>
</html>
    `;
  },

  // ============================================================================
  // COMPTE-RENDU DE RÉUNION
  // ============================================================================
  compteRendu: (data) => {
    const { expert, affaire, reunion, presences, observations } = data;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Compte-rendu - ${affaire.reference}</title>
  ${PDF_STYLES}
</head>
<body>
  <div class="expert-info">
    <strong>${expert.nom} ${expert.prenom || ''}</strong><br>
    Expert Judiciaire près la Cour d'Appel de ${expert.cour_appel || 'Paris'}
  </div>

  <div class="header">
    <h1>Compte-Rendu de Réunion d'Expertise</h1>
    <div class="subtitle">Réunion n°${reunion.numero} - Affaire ${affaire.reference}</div>
  </div>

  <div class="section">
    <div class="section-title">1. Informations générales</div>
    <div class="field">
      <span class="field-label">Affaire :</span>
      <span class="field-value">${affaire.reference} - RG ${affaire.rg || 'N/C'}</span>
    </div>
    <div class="field">
      <span class="field-label">Tribunal :</span>
      <span class="field-value">${affaire.tribunal}</span>
    </div>
    <div class="field">
      <span class="field-label">Date de réunion :</span>
      <span class="field-value">${new Date(reunion.date_reunion).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
    <div class="field">
      <span class="field-label">Lieu :</span>
      <span class="field-value">${reunion.lieu || affaire.bien_adresse || 'N/C'}</span>
    </div>
    <div class="field">
      <span class="field-label">Durée :</span>
      <span class="field-value">${reunion.duree_reelle ? `${Math.floor(reunion.duree_reelle / 60)}h${reunion.duree_reelle % 60}` : 'N/C'}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">2. Personnes présentes</div>
    <table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Qualité</th>
          <th>Représentant</th>
          <th>Présent</th>
        </tr>
      </thead>
      <tbody>
        ${(presences || []).map(p => `
          <tr>
            <td>${p.nom}</td>
            <td>${p.qualite || '-'}</td>
            <td>${p.representant || '-'}</td>
            <td>${p.present ? 'Oui' : 'Non'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">3. Rappel de la mission</div>
    <p>${affaire.mission || 'Mission non renseignée'}</p>
  </div>

  <div class="section">
    <div class="section-title">4. Déroulement de la réunion</div>
    <p>${reunion.compte_rendu || 'Compte-rendu à rédiger'}</p>
  </div>

  ${observations ? `
  <div class="section">
    <div class="section-title">5. Observations des parties</div>
    <p>${observations}</p>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">${observations ? '6' : '5'}. Suites à donner</div>
    <ul>
      <li>Communication de pièces complémentaires par les parties</li>
      <li>Prochaine réunion : à planifier</li>
    </ul>
  </div>

  <div class="signature-block mt-20">
    <p>Fait à ${expert.ville || 'Paris'}, le ${new Date().toLocaleDateString('fr-FR')}</p>
    <p>L'Expert Judiciaire,</p>
    <div class="signature-line"></div>
    <p>${expert.nom} ${expert.prenom || ''}</p>
  </div>

  <div class="footer">
    Compte-rendu n°${reunion.numero} - ${affaire.reference} - Page 1
  </div>
</body>
</html>
    `;
  },

  // ============================================================================
  // ÉTAT DE FRAIS ET HONORAIRES
  // ============================================================================
  etatFrais: (data) => {
    const { expert, affaire, vacations, frais, provision } = data;
    
    const totalVacations = (vacations || []).reduce((acc, v) => acc + (parseFloat(v.montant) || 0), 0);
    const totalFrais = (frais || []).reduce((acc, f) => acc + (parseFloat(f.montant) || 0), 0);
    const totalHT = totalVacations + totalFrais;
    const tva = totalHT * 0.20;
    const totalTTC = totalHT + tva;
    const solde = totalTTC - (provision || 0);
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>État de frais - ${affaire.reference}</title>
  ${PDF_STYLES}
</head>
<body>
  <div class="expert-info">
    <strong>${expert.nom} ${expert.prenom || ''}</strong><br>
    Expert Judiciaire<br>
    SIRET : ${expert.siret || 'N/C'}<br>
    N° TVA : ${expert.tva || 'N/C'}
  </div>

  <div class="header">
    <h1>État de Frais et Honoraires</h1>
    <div class="subtitle">Affaire ${affaire.reference}</div>
  </div>

  <div class="section">
    <div class="section-title">Références de l'affaire</div>
    <div class="field">
      <span class="field-label">RG :</span>
      <span class="field-value">${affaire.rg || 'N/C'}</span>
    </div>
    <div class="field">
      <span class="field-label">Tribunal :</span>
      <span class="field-value">${affaire.tribunal}</span>
    </div>
    <div class="field">
      <span class="field-label">Parties :</span>
      <span class="field-value">${affaire.parties || 'N/C'}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Vacations</div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Nature</th>
          <th>Durée (h)</th>
          <th>Taux (€/h)</th>
          <th>Montant (€)</th>
        </tr>
      </thead>
      <tbody>
        ${(vacations || []).map(v => `
          <tr>
            <td>${v.date_vacation ? new Date(v.date_vacation).toLocaleDateString('fr-FR') : '-'}</td>
            <td>${v.description || v.type}</td>
            <td class="text-right">${parseFloat(v.duree_heures).toFixed(2)}</td>
            <td class="text-right">${parseFloat(v.taux_horaire).toFixed(2)}</td>
            <td class="text-right">${parseFloat(v.montant).toFixed(2)}</td>
          </tr>
        `).join('')}
        <tr style="font-weight: bold; background-color: #f5f5f5;">
          <td colspan="4">Sous-total Vacations HT</td>
          <td class="text-right">${totalVacations.toFixed(2)} €</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Frais et débours</div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Nature</th>
          <th>Quantité</th>
          <th>P.U. (€)</th>
          <th>Montant (€)</th>
        </tr>
      </thead>
      <tbody>
        ${(frais || []).map(f => `
          <tr>
            <td>${f.date_frais ? new Date(f.date_frais).toLocaleDateString('fr-FR') : '-'}</td>
            <td>${f.description || f.type}</td>
            <td class="text-right">${f.quantite || 1}</td>
            <td class="text-right">${parseFloat(f.prix_unitaire).toFixed(2)}</td>
            <td class="text-right">${parseFloat(f.montant).toFixed(2)}</td>
          </tr>
        `).join('')}
        <tr style="font-weight: bold; background-color: #f5f5f5;">
          <td colspan="4">Sous-total Frais HT</td>
          <td class="text-right">${totalFrais.toFixed(2)} €</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Récapitulatif</div>
    <table>
      <tbody>
        <tr>
          <td>Total Vacations HT</td>
          <td class="text-right">${totalVacations.toFixed(2)} €</td>
        </tr>
        <tr>
          <td>Total Frais HT</td>
          <td class="text-right">${totalFrais.toFixed(2)} €</td>
        </tr>
        <tr style="font-weight: bold;">
          <td>TOTAL HT</td>
          <td class="text-right">${totalHT.toFixed(2)} €</td>
        </tr>
        <tr>
          <td>TVA 20%</td>
          <td class="text-right">${tva.toFixed(2)} €</td>
        </tr>
        <tr style="font-weight: bold; font-size: 14pt;">
          <td>TOTAL TTC</td>
          <td class="text-right">${totalTTC.toFixed(2)} €</td>
        </tr>
        <tr>
          <td>Provision versée</td>
          <td class="text-right">- ${(provision || 0).toFixed(2)} €</td>
        </tr>
        <tr style="font-weight: bold; ${solde > 0 ? 'color: #2563EB;' : 'color: green;'}">
          <td>${solde > 0 ? 'SOLDE À PERCEVOIR' : 'TROP-PERÇU À REMBOURSER'}</td>
          <td class="text-right">${Math.abs(solde).toFixed(2)} €</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section mt-20">
    <p><strong>Modalités de règlement :</strong></p>
    <p>Par virement bancaire :</p>
    <ul>
      <li>IBAN : ${expert.iban || 'N/C'}</li>
      <li>BIC : ${expert.bic || 'N/C'}</li>
    </ul>
  </div>

  <div class="signature-block">
    <p>Fait à ${expert.ville || 'Paris'}, le ${new Date().toLocaleDateString('fr-FR')}</p>
    <p>L'Expert Judiciaire,</p>
    <div class="signature-line"></div>
    <p>${expert.nom} ${expert.prenom || ''}</p>
  </div>

  <div class="footer">
    État de frais - ${affaire.reference}
  </div>
</body>
</html>
    `;
  },

  // ============================================================================
  // NOTE DE SYNTHÈSE (PRÉ-RAPPORT)
  // ============================================================================
  noteSynthese: (data) => {
    const { expert, affaire, pathologies, analyses, conclusions } = data;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Note de synthèse - ${affaire.reference}</title>
  ${PDF_STYLES}
</head>
<body>
  <div class="header">
    <h1>Note de Synthèse</h1>
    <div class="subtitle">(Pré-rapport - Article 276 CPC)</div>
    <div class="subtitle">Affaire ${affaire.reference}</div>
  </div>

  <div class="section">
    <div class="section-title">1. Désignation et mission</div>
    <p>
      Par ordonnance de référé en date du ${affaire.date_ordonnance ? new Date(affaire.date_ordonnance).toLocaleDateString('fr-FR') : 'N/C'}, 
      Madame/Monsieur le Président du ${affaire.tribunal} nous a désigné en qualité d'expert judiciaire 
      avec la mission suivante :
    </p>
    <div style="margin: 20px; padding: 15px; background-color: #fafafa; border-left: 3px solid #2563EB;">
      ${affaire.mission || 'Mission non renseignée'}
    </div>
  </div>

  <div class="section">
    <div class="section-title">2. Désordres constatés</div>
    ${(pathologies || []).map((p, i) => `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e5e5; border-radius: 5px;">
        <p><strong>Désordre n°${p.numero || i + 1} : ${p.intitule}</strong></p>
        <p><em>Localisation :</em> ${p.localisation}</p>
        <p><em>Description :</em> ${p.description}</p>
        <p><em>Qualification :</em> <span class="highlight">${p.garantie || 'À déterminer'}</span></p>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <div class="section-title">3. Analyse technique</div>
    <p>${analyses || 'Analyse en cours de rédaction'}</p>
  </div>

  <div class="section">
    <div class="section-title">4. Conclusions provisoires</div>
    <p>${conclusions || 'Conclusions en cours de rédaction'}</p>
  </div>

  <div class="section" style="background-color: #DBEAFE; padding: 20px; border-radius: 5px;">
    <p><strong>IMPORTANT</strong></p>
    <p>
      Conformément aux dispositions de l'article 276 du Code de Procédure Civile, 
      les parties disposent d'un délai d'<strong>un mois</strong> à compter de la réception 
      de la présente note pour faire valoir leurs observations.
    </p>
    <p class="mt-20">
      Les observations devront être adressées par écrit à l'expert et communiquées 
      simultanément à l'ensemble des parties.
    </p>
  </div>

  <div class="signature-block mt-20">
    <p>Fait à ${expert.ville || 'Paris'}, le ${new Date().toLocaleDateString('fr-FR')}</p>
    <p>L'Expert Judiciaire,</p>
    <div class="signature-line"></div>
    <p>${expert.nom} ${expert.prenom || ''}</p>
  </div>

  <div class="footer">
    Note de synthèse - ${affaire.reference} - Document soumis au secret de l'expertise
  </div>
</body>
</html>
    `;
  }
};

// ============================================================================
// SERVICE PRINCIPAL
// ============================================================================

class PDFService {
  constructor() {
    this.generators = pdfGenerators;
  }

  // Générer le HTML d'un document
  generateHTML(type, data) {
    const generator = this.generators[type];
    if (!generator) {
      throw new Error(`Type de document non supporté: ${type}`);
    }
    return generator(data);
  }

  // Générer et télécharger un PDF (via impression navigateur)
  async downloadPDF(type, data, filename) {
    const html = this.generateHTML(type, data);
    
    // Créer une fenêtre popup pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Popup bloquée. Autorisez les popups pour télécharger le PDF.');
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Attendre le chargement complet
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // printWindow.close(); // Optionnel : fermer après impression
    };

    return { success: true, filename };
  }

  // Générer un blob PDF (nécessite une lib comme jsPDF ou html2pdf)
  async generateBlob(type, data) {
    const html = this.generateHTML(type, data);
    
    // Si html2pdf est disponible
    if (window.html2pdf) {
      const element = document.createElement('div');
      element.innerHTML = html;
      document.body.appendChild(element);

      const blob = await window.html2pdf()
        .set({
          margin: 0,
          filename: `${type}-${Date.now()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .outputPdf('blob');

      document.body.removeChild(element);
      return blob;
    }

    // Fallback: retourner le HTML
    return new Blob([html], { type: 'text/html' });
  }

  // Prévisualiser un document
  preview(type, data) {
    const html = this.generateHTML(type, data);
    
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(html);
      previewWindow.document.close();
    }
    
    return html;
  }

  // Liste des types de documents disponibles
  getAvailableTypes() {
    return [
      { id: 'convocation', label: 'Convocation à réunion', icon: 'Mail' },
      { id: 'compteRendu', label: 'Compte-rendu de réunion', icon: 'FileText' },
      { id: 'etatFrais', label: 'État de frais et honoraires', icon: 'Receipt' },
      { id: 'noteSynthese', label: 'Note de synthèse (pré-rapport)', icon: 'FileSearch' }
    ];
  }
}

// ============================================================================
// INSTANCE SINGLETON
// ============================================================================

export const pdfService = new PDFService();

// ============================================================================
// EXPORT
// ============================================================================

export default pdfService;
export { pdfGenerators, PDF_STYLES };
