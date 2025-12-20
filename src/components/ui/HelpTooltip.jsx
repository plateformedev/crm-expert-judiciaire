// ============================================================================
// CRM EXPERT JUDICIAIRE - AIDE CONTEXTUELLE ET TOOLTIPS
// Aide contextuelle pour les termes juridiques et techniques
// ============================================================================

import React, { useState } from 'react';
import { HelpCircle, X, ExternalLink, BookOpen } from 'lucide-react';

// ============================================================================
// GLOSSAIRE DES TERMES JURIDIQUES
// ============================================================================

const GLOSSAIRE = {
  // Termes de procédure
  ordonnance: {
    titre: 'Ordonnance de désignation',
    definition: 'Décision du juge qui nomme l\'expert et définit sa mission. Elle précise les questions auxquelles l\'expert doit répondre.',
    exemple: 'L\'ordonnance peut demander de "rechercher les causes des désordres et chiffrer les travaux de réparation".'
  },
  provision: {
    titre: 'Provision / Consignation',
    definition: 'Somme d\'argent versée à l\'avance pour couvrir les honoraires prévisibles de l\'expert. Elle est généralement consignée à la Caisse des Dépôts.',
    exemple: 'Une provision de 3 000€ peut être demandée pour une expertise de sinistre construction.'
  },
  contradictoire: {
    titre: 'Principe du contradictoire',
    definition: 'Principe fondamental garantissant que chaque partie peut prendre connaissance des arguments et pièces adverses et y répondre.',
    exemple: 'Toutes les parties doivent être convoquées aux réunions d\'expertise.'
  },
  dire: {
    titre: 'Dire / Note aux parties',
    definition: 'Observations écrites adressées à l\'expert par une partie. L\'expert doit y répondre dans son rapport.',
    exemple: 'Un dire peut contester une conclusion de pré-rapport ou apporter de nouveaux éléments.'
  },

  // Termes d'expertise
  sapiteur: {
    titre: 'Sapiteur',
    definition: 'Expert technique consulté par l\'expert judiciaire pour un avis spécialisé dans un domaine qu\'il ne maîtrise pas.',
    exemple: 'Un sapiteur géotechnicien peut être consulté pour analyser un problème de fondations.'
  },
  'pre-rapport': {
    titre: 'Pré-rapport / Note de synthèse',
    definition: 'Document provisoire présentant les conclusions de l\'expert avant le rapport final, permettant aux parties de formuler des observations.',
    exemple: 'Le pré-rapport est envoyé aux parties qui ont généralement 4 semaines pour répondre.'
  },
  'rapport-final': {
    titre: 'Rapport final',
    definition: 'Document définitif contenant l\'ensemble des constatations, analyses et conclusions de l\'expert, déposé auprès du tribunal.',
    exemple: 'Le rapport final répond aux questions de la mission et inclut les réponses aux dires.'
  },
  vacation: {
    titre: 'Vacation',
    definition: 'Unité de temps (généralement 1 heure) utilisée pour facturer les interventions de l\'expert. Le tarif horaire varie selon les juridictions.',
    exemple: 'Une réunion de 3 heures correspond à 3 vacations facturées au tarif fixé par l\'ordonnance.'
  },

  // Termes techniques construction
  desordre: {
    titre: 'Désordre',
    definition: 'Défaut, malfaçon ou dommage affectant un ouvrage. L\'expert doit en identifier la cause et évaluer les préjudices.',
    exemple: 'Fissures, infiltrations, affaissements sont des exemples de désordres.'
  },
  imputabilite: {
    titre: 'Imputabilité',
    definition: 'Détermination de la responsabilité des différents intervenants dans l\'apparition d\'un désordre.',
    exemple: 'Un désordre peut être imputé à l\'entreprise, au maître d\'œuvre, ou partagé entre plusieurs parties.'
  },
  dommage: {
    titre: 'Dommage / Préjudice',
    definition: 'Conséquence dommageable d\'un désordre pour le maître d\'ouvrage (coût des réparations, troubles de jouissance, etc.).',
    exemple: 'Le dommage inclut le coût des travaux réparatoires et éventuellement un préjudice de jouissance.'
  },

  // Garanties
  'garantie-decennale': {
    titre: 'Garantie décennale',
    definition: 'Garantie obligatoire couvrant pendant 10 ans les dommages compromettant la solidité de l\'ouvrage ou le rendant impropre à sa destination.',
    exemple: 'Des fissures structurelles mettant en cause la stabilité du bâtiment relèvent de la garantie décennale.'
  },
  'garantie-biennale': {
    titre: 'Garantie biennale',
    definition: 'Garantie de bon fonctionnement couvrant pendant 2 ans les éléments d\'équipement dissociables de l\'ouvrage.',
    exemple: 'Une chaudière, un volet roulant ou une porte de garage sont couverts par la garantie biennale.'
  },
  'garantie-parfait-achevement': {
    titre: 'Garantie de parfait achèvement',
    definition: 'Garantie d\'un an obligeant l\'entrepreneur à réparer tous les désordres signalés par le maître d\'ouvrage à la réception ou pendant l\'année suivante.',
    exemple: 'Un défaut de peinture ou une porte qui ferme mal relèvent de la garantie de parfait achèvement.'
  },
  dommages_ouvrage: {
    titre: 'Assurance Dommages-Ouvrage',
    definition: 'Assurance souscrite par le maître d\'ouvrage permettant un préfinancement rapide des réparations, sans attendre la détermination des responsabilités.',
    exemple: 'La DO permet d\'obtenir rapidement les fonds pour réparer des infiltrations en toiture.'
  },

  // Parties
  demandeur: {
    titre: 'Demandeur',
    definition: 'Partie qui a saisi le tribunal et demandé l\'expertise. Généralement le maître d\'ouvrage ou le propriétaire.',
    exemple: 'Le propriétaire qui constate des malfaçons après construction est généralement le demandeur.'
  },
  defendeur: {
    titre: 'Défendeur',
    definition: 'Partie assignée en justice, contre laquelle l\'expertise est demandée (entreprise, architecte, etc.).',
    exemple: 'L\'entreprise ayant réalisé les travaux défectueux est assignée comme défendeur.'
  },
  intervenant: {
    titre: 'Intervenant / Appelé en cause',
    definition: 'Partie qui rejoint la procédure en cours, soit volontairement, soit sur appel en garantie d\'une autre partie.',
    exemple: 'L\'assureur d\'une entreprise peut intervenir pour défendre les intérêts de son assuré.'
  }
};

// ============================================================================
// COMPOSANT: Icône d'aide avec tooltip
// ============================================================================

export const HelpTooltip = ({
  termKey,
  children,
  position = 'top',
  size = 'sm'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const term = GLOSSAIRE[termKey];

  if (!term) {
    console.warn(`HelpTooltip: terme "${termKey}" non trouvé dans le glossaire`);
    return children || null;
  }

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className="relative inline-flex items-center">
      {children}
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        className="ml-1 text-[#a3a3a3] hover:text-[#c9a227] transition-colors cursor-help"
        aria-label={`Aide: ${term.titre}`}
      >
        <HelpCircle className={sizes[size]} />
      </button>

      {showTooltip && (
        <div
          className={`absolute ${positions[position]} z-50 w-72 p-3 bg-white border border-[#e5e5e5] rounded-xl shadow-xl`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <h4 className="font-medium text-sm text-[#1a1a1a] mb-1">{term.titre}</h4>
          <p className="text-xs text-[#525252] mb-2">{term.definition}</p>
          {term.exemple && (
            <p className="text-xs text-[#737373] italic border-l-2 border-[#c9a227] pl-2">
              {term.exemple}
            </p>
          )}
        </div>
      )}
    </span>
  );
};

// ============================================================================
// COMPOSANT: Panneau d'aide complet
// ============================================================================

export const HelpPanel = ({ isOpen, onClose, initialTerm }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(initialTerm || null);

  if (!isOpen) return null;

  const filteredTerms = Object.entries(GLOSSAIRE).filter(([key, term]) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      term.titre.toLowerCase().includes(query) ||
      term.definition.toLowerCase().includes(query)
    );
  });

  return (
    <div className="fixed inset-0 z-[150] flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5e5]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#c9a227]" />
            <h2 className="font-medium text-lg">Glossaire juridique</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recherche */}
        <div className="p-4 border-b border-[#e5e5e5]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un terme..."
            className="w-full px-4 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
          />
        </div>

        {/* Liste des termes */}
        <div className="flex-1 overflow-y-auto">
          {selectedTerm && GLOSSAIRE[selectedTerm] ? (
            <div className="p-4">
              <button
                onClick={() => setSelectedTerm(null)}
                className="text-sm text-[#c9a227] hover:underline mb-4"
              >
                ← Retour à la liste
              </button>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-[#1a1a1a]">
                  {GLOSSAIRE[selectedTerm].titre}
                </h3>
                <p className="text-[#525252] leading-relaxed">
                  {GLOSSAIRE[selectedTerm].definition}
                </p>
                {GLOSSAIRE[selectedTerm].exemple && (
                  <div className="p-4 bg-[#faf8f3] rounded-xl border-l-4 border-[#c9a227]">
                    <p className="text-sm font-medium text-[#737373] mb-1">Exemple</p>
                    <p className="text-[#525252]">{GLOSSAIRE[selectedTerm].exemple}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e5e5]">
              {filteredTerms.map(([key, term]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTerm(key)}
                  className="w-full text-left p-4 hover:bg-[#faf8f3] transition-colors"
                >
                  <h4 className="font-medium text-[#1a1a1a] mb-1">{term.titre}</h4>
                  <p className="text-sm text-[#737373] line-clamp-2">{term.definition}</p>
                </button>
              ))}

              {filteredTerms.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-[#737373]">Aucun terme trouvé</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e5e5] bg-[#faf8f3]">
          <p className="text-xs text-[#737373] text-center">
            Ce glossaire est fourni à titre indicatif. Pour toute question juridique,
            consultez un professionnel du droit.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT: Bouton d'aide global
// ============================================================================

export const HelpButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 left-4 w-12 h-12 bg-[#c9a227] text-white rounded-full shadow-lg hover:bg-[#d4af37] transition-colors flex items-center justify-center z-40"
      aria-label="Ouvrir l'aide"
    >
      <HelpCircle className="w-6 h-6" />
    </button>
  );
};

// ============================================================================
// HOOK: Gestion de l'aide
// ============================================================================

export const useHelp = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [initialTerm, setInitialTerm] = useState(null);

  const openHelp = (term = null) => {
    setInitialTerm(term);
    setIsHelpOpen(true);
  };

  const closeHelp = () => {
    setIsHelpOpen(false);
    setInitialTerm(null);
  };

  return {
    isHelpOpen,
    initialTerm,
    openHelp,
    closeHelp
  };
};

export default HelpTooltip;
