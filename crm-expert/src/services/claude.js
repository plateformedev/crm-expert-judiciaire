// ============================================================================
// CRM EXPERT JUDICIAIRE - SERVICE CLAUDE API (IA EXPERT)
// ============================================================================

// Configuration
const CLAUDE_CONFIG = {
  apiUrl: 'https://api.anthropic.com/v1/messages',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096
};

// ============================================================================
// PROMPTS SYSTÈME SPÉCIALISÉS
// ============================================================================

const SYSTEM_PROMPTS = {
  // Prompt principal expert judiciaire
  expertJudiciaire: `Tu es un assistant expert spécialisé dans l'expertise judiciaire BTP (Bâtiment et Travaux Publics) en France.

DOMAINES DE COMPÉTENCE :
- Code Civil : Articles 1792 et suivants (responsabilité des constructeurs)
- Code de Procédure Civile : Articles 232 à 284 (expertise judiciaire)
- Code des Assurances : Articles L241-1 et L242-1 (DO et RCD)
- DTU (Documents Techniques Unifiés) : Règles de l'art construction
- Jurisprudence : Cour de Cassation (Civ. 3e principalement)

GARANTIES CONSTRUCTION :
- Garantie de Parfait Achèvement (GPA) : 1 an - Art. 1792-6 CC
- Garantie Biennale : 2 ans - Art. 1792-3 CC (éléments d'équipement dissociables)
- Garantie Décennale : 10 ans - Art. 1792 CC (solidité + impropriété destination)

PRINCIPES FONDAMENTAUX EXPERTISE :
- Contradictoire strict (Art. 16 CPC)
- Convocation 8 jours minimum (Art. 160 CPC)
- Compte-rendu (pas procès-verbal) pour les réunions
- Note de synthèse avant rapport final (Art. 276 CPC)
- Délai observations 30 jours minimum sur pré-rapport

STYLE DE RÉPONSE :
- Précis et technique
- Citer les articles de loi et DTU pertinents
- Mentionner la jurisprudence applicable
- Structurer les réponses de manière claire
- Utiliser le vocabulaire juridique et technique approprié`,

  // Prompt qualification désordres
  qualification: `Tu es un assistant spécialisé dans la qualification juridique des désordres de construction.

CRITÈRES DE QUALIFICATION :
1. GARANTIE DÉCENNALE (Art. 1792 CC) :
   - Atteinte à la solidité de l'ouvrage
   - Impropriété à destination
   - Éléments d'équipement indissociables (Art. 1792-2 CC)

2. GARANTIE BIENNALE (Art. 1792-3 CC) :
   - Éléments d'équipement dissociables
   - Dont dépose n'endommage pas l'ouvrage

3. GARANTIE PARFAIT ACHÈVEMENT (Art. 1792-6 CC) :
   - Désordres signalés dans l'année suivant réception
   - Réserves à la réception

4. RESPONSABILITÉ CONTRACTUELLE (Art. 1231-1 CC) :
   - Désordres esthétiques
   - Non-conformités mineures

MÉTHODOLOGIE :
- Analyser la nature du désordre
- Évaluer l'impact sur l'usage
- Déterminer si l'élément est dissociable ou non
- Vérifier les délais de prescription
- Citer la jurisprudence pertinente`,

  // Prompt rédaction
  redaction: `Tu es un assistant spécialisé dans la rédaction de documents d'expertise judiciaire.

PRINCIPES DE RÉDACTION :
- Style neutre et objectif
- Vocabulaire technique précis
- Formulations prudentes ("il apparaît que", "il semble que")
- Pas de jugement de valeur
- Distinguer constatations, analyses et conclusions

TYPES DE DOCUMENTS :
- Compte-rendu de réunion (pas procès-verbal)
- Note de synthèse (pré-rapport)
- Rapport d'expertise judiciaire
- Réponses aux dires
- Convocations

STRUCTURE TYPE PARAGRAPHE CONSTATATION :
"Lors de notre visite du [DATE], nous avons constaté [DESCRIPTION FACTUELLE].
[LOCALISATION PRÉCISE].
[MESURES/RELEVÉS LE CAS ÉCHÉANT].
[DESCRIPTION TECHNIQUE DU DÉSORDRE]."`,

  // Prompt DTU
  dtu: `Tu es un assistant spécialisé dans les DTU (Documents Techniques Unifiés) du bâtiment.

DTU PRINCIPAUX :
- DTU 13.11/13.12 : Fondations
- DTU 20.1 : Maçonnerie petits éléments
- DTU 21 : Exécution travaux béton
- DTU 26.1 : Enduits mortiers
- DTU 36.5 : Menuiseries extérieures
- DTU 40.x : Couvertures
- DTU 43.1 : Étanchéité toitures-terrasses
- DTU 52.1/52.2 : Revêtements de sol
- DTU 60.1 : Plomberie sanitaire

POUR CHAQUE RÉPONSE :
- Citer le numéro exact du DTU
- Mentionner la norme associée (NF P...)
- Préciser les exigences clés
- Indiquer les tolérances si applicable
- Signaler les points de vigilance`,

  // Prompt chiffrage
  chiffrage: `Tu es un assistant spécialisé dans le chiffrage des travaux de réparation BTP.

PRINCIPES :
- Estimation indicative (pas un devis)
- Prix moyens constatés région IDF
- Inclure main d'œuvre et fournitures
- Mentionner les aléas possibles
- Prévoir les travaux induits

STRUCTURE CHIFFRAGE :
1. Lot / Désignation
2. Unité (m², ml, U, forfait)
3. Quantité
4. Prix unitaire HT
5. Total HT

PRÉCAUTIONS :
- "Ce chiffrage est donné à titre indicatif"
- "Les montants définitifs devront être établis par consultation d'entreprises"
- Inclure marge pour aléas (5-10%)
- TVA selon nature travaux (10% ou 20%)`
};

// ============================================================================
// CORPUS RAG (Connaissances embarquées)
// ============================================================================

const RAG_CORPUS = {
  garanties: [
    {
      code: 'GPA',
      nom: 'Garantie de Parfait Achèvement',
      duree: '1 an',
      article: 'Art. 1792-6 CC',
      description: 'Couvre tous les désordres signalés par le maître d\'ouvrage dans l\'année suivant la réception',
      jurisprudence: ['Cass. Civ. 3e, 27/01/2021', 'Cass. Civ. 3e, 04/02/2021']
    },
    {
      code: 'GB',
      nom: 'Garantie Biennale',
      duree: '2 ans',
      article: 'Art. 1792-3 CC',
      description: 'Couvre les éléments d\'équipement dissociables de l\'ouvrage',
      criteres: ['Dépose possible sans endommager l\'ouvrage', 'Fonction déterminée'],
      jurisprudence: ['Cass. Civ. 3e, 10/01/2019', 'Cass. Civ. 3e, 21/11/2019']
    },
    {
      code: 'GD',
      nom: 'Garantie Décennale',
      duree: '10 ans',
      article: 'Art. 1792 CC',
      description: 'Couvre les dommages compromettant la solidité ou rendant l\'ouvrage impropre à sa destination',
      criteres: ['Atteinte solidité', 'Impropriété destination', 'Équipements indissociables'],
      jurisprudence: ['Cass. Civ. 3e, 26/02/2020', 'Cass. Civ. 3e, 08/07/2021', 'Cass. Civ. 3e, 21/03/2024 (PAC)']
    }
  ],
  
  procedure: [
    {
      etape: 'Convocation',
      delai: '8 jours minimum',
      article: 'Art. 160 CPC',
      details: 'LRAR pour parties non représentées, courrier simple pour avocats'
    },
    {
      etape: 'Contradictoire',
      article: 'Art. 16 CPC',
      details: 'Toutes pièces communiquées à toutes les parties, réponses aux dires'
    },
    {
      etape: 'Pré-rapport',
      delai: '30 jours observations',
      article: 'Art. 276 CPC',
      details: 'Note de synthèse envoyée aux parties avant rapport final'
    },
    {
      etape: 'Dépôt rapport',
      article: 'Art. 282 CPC',
      details: 'Dépôt au greffe, envoi LRAR aux parties'
    }
  ],
  
  dtuResumes: {
    '13.11': { titre: 'Fondations superficielles', points: ['Profondeur hors gel', 'Dimensionnement', 'Ferraillage'] },
    '20.1': { titre: 'Maçonnerie petits éléments', points: ['Chaînages', 'Joints dilatation', 'Épaisseur min'] },
    '26.1': { titre: 'Enduits mortiers', points: ['3 couches', 'Épaisseur 20-25mm', 'Délais séchage'] },
    '36.5': { titre: 'Menuiseries', points: ['Calfeutrement', 'Fixation', 'AEV'] },
    '43.1': { titre: 'Étanchéité terrasses', points: ['Pente min 1%', 'Relevés 15cm', 'Protection'] },
    '52.2': { titre: 'Carrelage collé', points: ['Planéité', 'Double encollage', 'Joints périph.'] },
    '60.1': { titre: 'Plomberie', points: ['Diamètres', 'Pentes 1-3%', 'Ventilation'] }
  }
};

// ============================================================================
// CLASSE SERVICE CLAUDE
// ============================================================================

class ClaudeService {
  constructor() {
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    this.conversationHistory = [];
  }

  // Vérifier si l'API est configurée
  isConfigured() {
    return !!this.apiKey && this.apiKey !== 'sk-ant-api03-...';
  }

  // Appel API Claude
  async callAPI(messages, systemPrompt = SYSTEM_PROMPTS.expertJudiciaire) {
    if (!this.isConfigured()) {
      throw new Error('API Claude non configurée. Ajoutez VITE_CLAUDE_API_KEY dans .env.local');
    }

    try {
      const response = await fetch(CLAUDE_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: CLAUDE_CONFIG.model,
          max_tokens: CLAUDE_CONFIG.maxTokens,
          system: systemPrompt,
          messages: messages
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur API Claude');
      }

      const data = await response.json();
      return {
        content: data.content[0].text,
        usage: data.usage,
        stopReason: data.stop_reason
      };
    } catch (error) {
      console.error('Erreur Claude API:', error);
      throw error;
    }
  }

  // Chat avec contexte
  async chat(userMessage, context = {}) {
    // Enrichir avec le contexte RAG
    let enrichedMessage = userMessage;
    
    // Ajouter contexte affaire si disponible
    if (context.affaire) {
      enrichedMessage = `[Contexte affaire: ${context.affaire.reference}, Tribunal: ${context.affaire.tribunal}]\n\n${userMessage}`;
    }

    // Ajouter à l'historique
    this.conversationHistory.push({
      role: 'user',
      content: enrichedMessage
    });

    // Limiter l'historique à 10 messages
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    try {
      const response = await this.callAPI(this.conversationHistory);
      
      // Ajouter la réponse à l'historique
      this.conversationHistory.push({
        role: 'assistant',
        content: response.content
      });

      return {
        content: response.content,
        usage: response.usage
      };
    } catch (error) {
      // En cas d'erreur, retirer le message utilisateur de l'historique
      this.conversationHistory.pop();
      throw error;
    }
  }

  // Qualifier un désordre
  async qualifierDesordre(description, options = {}) {
    const prompt = `Qualifie juridiquement ce désordre de construction :

DESCRIPTION DU DÉSORDRE :
${description}

${options.dateReception ? `DATE DE RÉCEPTION : ${options.dateReception}` : ''}
${options.dateApparition ? `DATE D'APPARITION : ${options.dateApparition}` : ''}

Réponds en structurant ainsi :
1. QUALIFICATION : (GPA/Biennale/Décennale/Contractuelle)
2. ARTICLE APPLICABLE : 
3. JUSTIFICATION :
4. JURISPRUDENCE PERTINENTE :
5. POINTS DE VIGILANCE :`;

    const response = await this.callAPI(
      [{ role: 'user', content: prompt }],
      SYSTEM_PROMPTS.qualification
    );

    // Parser la réponse pour extraire la qualification
    const content = response.content;
    let qualification = 'indetermine';
    
    if (content.toLowerCase().includes('décennale')) qualification = 'decennale';
    else if (content.toLowerCase().includes('biennale')) qualification = 'biennale';
    else if (content.toLowerCase().includes('parfait achèvement') || content.toLowerCase().includes('gpa')) qualification = 'gpa';
    else if (content.toLowerCase().includes('contractuelle')) qualification = 'contractuelle';

    return {
      content: content,
      qualification,
      usage: response.usage
    };
  }

  // Rédiger un paragraphe
  async rediger(type, params = {}) {
    let prompt = '';

    switch (type) {
      case 'constatation':
        prompt = `Rédige un paragraphe de constatation pour un rapport d'expertise :
DÉSORDRE : ${params.desordre || 'À préciser'}
LOCALISATION : ${params.localisation || 'À préciser'}
MESURES : ${params.mesures || 'Non spécifiées'}
DATE VISITE : ${params.dateVisite || 'À préciser'}`;
        break;

      case 'conclusion':
        prompt = `Rédige une conclusion d'expertise :
DÉSORDRES CONSTATÉS : ${params.desordres || 'À préciser'}
GARANTIE APPLICABLE : ${params.garantie || 'À déterminer'}
MONTANT TRAVAUX : ${params.montant || 'À chiffrer'}`;
        break;

      case 'reponse-dire':
        prompt = `Rédige une réponse à ce dire :
DIRE DE LA PARTIE : ${params.dire || 'À préciser'}
POSITION DE L'EXPERT : ${params.position || 'À préciser'}`;
        break;

      default:
        prompt = `Rédige le texte suivant pour un rapport d'expertise :
${params.instruction || 'À préciser'}`;
    }

    const response = await this.callAPI(
      [{ role: 'user', content: prompt }],
      SYSTEM_PROMPTS.redaction
    );

    return {
      content: response.content,
      usage: response.usage
    };
  }

  // Rechercher DTU
  async rechercherDTU(query) {
    const prompt = `Recherche dans les DTU pour répondre à cette question :
${query}

Précise :
- Le(s) DTU applicable(s)
- Les exigences pertinentes
- Les tolérances si applicable
- Les points de contrôle`;

    const response = await this.callAPI(
      [{ role: 'user', content: prompt }],
      SYSTEM_PROMPTS.dtu
    );

    return {
      content: response.content,
      corpus: RAG_CORPUS.dtuResumes,
      usage: response.usage
    };
  }

  // Estimer un chiffrage
  async estimer(description, quantites = {}) {
    const prompt = `Estime le coût des travaux de réparation suivants :

TRAVAUX À RÉALISER :
${description}

${Object.keys(quantites).length > 0 ? `QUANTITÉS ESTIMÉES :
${Object.entries(quantites).map(([k, v]) => `- ${k}: ${v}`).join('\n')}` : ''}

Fournis un chiffrage détaillé par poste avec :
- Désignation
- Unité
- Quantité
- Prix unitaire HT
- Total HT

Puis le total général HT et TTC.`;

    const response = await this.callAPI(
      [{ role: 'user', content: prompt }],
      SYSTEM_PROMPTS.chiffrage
    );

    return {
      content: response.content,
      usage: response.usage
    };
  }

  // Rechercher jurisprudence
  async rechercherJurisprudence(theme) {
    const prompt = `Recherche la jurisprudence pertinente sur le thème suivant :
${theme}

Pour chaque arrêt, précise :
- Référence (Cass. Civ. 3e, date, n° pourvoi)
- Faits résumés
- Solution retenue
- Portée pour l'expertise`;

    const response = await this.callAPI(
      [{ role: 'user', content: prompt }],
      SYSTEM_PROMPTS.expertJudiciaire
    );

    return {
      content: response.content,
      corpus: RAG_CORPUS.garanties,
      usage: response.usage
    };
  }

  // Réinitialiser l'historique
  resetConversation() {
    this.conversationHistory = [];
  }

  // Mode fallback (simulation) si API non configurée
  simulateResponse(message) {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('fissure')) {
      return {
        content: `**Analyse des fissures :**

Les fissures décrites peuvent relever de plusieurs qualifications selon leur nature :

**Si fissures structurelles (>0.3mm, traversantes) :**
→ **Garantie décennale** (Art. 1792 CC)
- Atteinte potentielle à la solidité ou impropriété à destination
- Jurisprudence : Cass. Civ. 3e, 18/12/2001

**DTU applicable :** DTU 20.1 - Maçonnerie
- Vérifier : chaînages, joints de dilatation, liaison fondation/élévation

**Investigations recommandées :**
1. Pose de témoins/jauges pour suivi évolutif
2. Sondages en pied de mur
3. Vérification étude de sol initiale`,
        simulated: true
      };
    }

    if (lowerMsg.includes('infiltration') || lowerMsg.includes('étanchéité')) {
      return {
        content: `**Analyse des infiltrations :**

**Qualification probable :** Garantie décennale (Art. 1792 CC)
- Impropriété à destination si habitabilité compromise

**DTU applicables :**
- DTU 43.1 : Étanchéité toitures-terrasses (pente min 1%, relevés 15cm)
- DTU 40.x : Couverture selon type

**Points de contrôle :**
- État de l'étanchéité / couverture
- Points singuliers (relevés, évacuations, joints)
- Ventilation sous couverture`,
        simulated: true
      };
    }

    if (lowerMsg.includes('dtu')) {
      return {
        content: `**DTU fréquemment utilisés en expertise :**

**Gros œuvre :**
- DTU 13.11/13.12 : Fondations
- DTU 20.1 : Maçonnerie petits éléments
- DTU 21 : Béton

**Étanchéité / Couverture :**
- DTU 43.1 : Toitures-terrasses
- DTU 40.11 : Ardoises
- DTU 40.21 : Tuiles terre cuite

**Second œuvre :**
- DTU 36.5 : Menuiseries
- DTU 52.1/52.2 : Revêtements sols
- DTU 60.1 : Plomberie

Quel DTU souhaitez-vous consulter en détail ?`,
        simulated: true
      };
    }

    return {
      content: `Je comprends votre question sur "${message}".

Pour une réponse précise, pourriez-vous préciser :
- Le type de désordre constaté
- La date de réception de l'ouvrage
- Les intervenants concernés

Je peux vous aider à :
- **Qualifier** un désordre (garantie applicable)
- **Rechercher** un DTU ou une norme
- **Rédiger** un paragraphe type
- **Calculer** des délais ou des coûts

*Note : Mode simulation - Configurez VITE_CLAUDE_API_KEY pour l'IA complète.*`,
      simulated: true
    };
  }
}

// ============================================================================
// INSTANCE SINGLETON
// ============================================================================

export const claudeService = new ClaudeService();

// ============================================================================
// EXPORT
// ============================================================================

export default claudeService;
export { SYSTEM_PROMPTS, RAG_CORPUS };
