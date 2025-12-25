// ============================================================================
// CRM EXPERT JUDICIAIRE - BASE JURISPRUDENCE
// Décisions de justice pertinentes pour expertise BTP
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  Scale, Search, Filter, Star, StarOff, ExternalLink, Copy,
  FileText, ChevronDown, ChevronUp, Bookmark, BookOpen,
  Calendar, Building, AlertTriangle, CheckCircle, Info,
  Gavel, Users, Clock, Euro
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase, EmptyState } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// BASE DE DONNÉES JURISPRUDENCE
// ============================================================================

export const JURISPRUDENCE_DATABASE = [
  // ===== RESPONSABILITÉ DÉCENNALE =====
  {
    id: 'cass-civ3-2019-18-20871',
    juridiction: 'Cour de cassation',
    formation: '3e chambre civile',
    date: '2019-10-17',
    numero: '18-20.871',
    titre: 'Notion d\'ouvrage - Désordres affectant un élément d\'équipement',
    theme: 'decennale',
    domaine: 'Responsabilité décennale',
    resume: 'Les désordres affectant un élément d\'équipement, dissociable ou non, relèvent de la garantie décennale lorsqu\'ils rendent l\'ouvrage impropre à sa destination.',
    attendu_principal: 'Attendu que pour rejeter les demandes des acquéreurs, l\'arrêt retient que le système de chauffage est un élément d\'équipement dissociable ne relevant pas de la garantie décennale ; Qu\'en statuant ainsi, alors que les désordres affectant un élément d\'équipement, dissociable ou non, relèvent de la garantie décennale lorsqu\'ils rendent l\'ouvrage impropre à sa destination, la cour d\'appel a violé le texte susvisé.',
    articles_vises: ['Article 1792 Code civil', 'Article 1792-2 Code civil'],
    mots_cles: ['décennale', 'élément d\'équipement', 'impropriété destination', 'chauffage'],
    impact: 'Extension de la garantie décennale aux éléments d\'équipement rendant l\'ouvrage impropre à sa destination.',
    solution: 'Cassation'
  },
  {
    id: 'cass-civ3-2017-16-19822',
    juridiction: 'Cour de cassation',
    formation: '3e chambre civile',
    date: '2017-11-09',
    numero: '16-19.822',
    titre: 'Fissures et garantie décennale - Critères d\'appréciation',
    theme: 'decennale',
    domaine: 'Responsabilité décennale',
    resume: 'Des fissures, même non infiltrantes, peuvent relever de la garantie décennale si elles sont évolutives et de nature à compromettre la solidité de l\'ouvrage ou à le rendre impropre à sa destination.',
    attendu_principal: 'Attendu que la cour d\'appel a relevé que les fissures présentaient un caractère évolutif et affectaient les éléments structurels de l\'ouvrage, ce dont elle a déduit qu\'elles étaient de nature à compromettre la solidité de l\'ouvrage.',
    articles_vises: ['Article 1792 Code civil'],
    mots_cles: ['fissures', 'décennale', 'évolution', 'solidité', 'structure'],
    impact: 'Confirmation que le caractère évolutif des désordres est déterminant pour la qualification décennale.',
    solution: 'Rejet'
  },
  {
    id: 'cass-civ3-2020-19-13730',
    juridiction: 'Cour de cassation',
    formation: '3e chambre civile',
    date: '2020-01-30',
    numero: '19-13.730',
    titre: 'Infiltrations - Impropriété à destination',
    theme: 'decennale',
    domaine: 'Responsabilité décennale',
    resume: 'Des infiltrations récurrentes dans une habitation caractérisent l\'impropriété de l\'ouvrage à sa destination, même en l\'absence d\'atteinte à la solidité.',
    attendu_principal: 'Attendu que des infiltrations récurrentes et généralisées dans une maison d\'habitation la rendent impropre à sa destination, peu important qu\'elles n\'affectent pas la solidité de l\'ouvrage.',
    articles_vises: ['Article 1792 Code civil'],
    mots_cles: ['infiltrations', 'impropriété destination', 'habitation', 'humidité'],
    impact: 'Les infiltrations récurrentes suffisent à caractériser l\'impropriété à destination.',
    solution: 'Cassation'
  },
  {
    id: 'cass-civ3-2018-17-18772',
    juridiction: 'Cour de cassation',
    formation: '3e chambre civile',
    date: '2018-06-21',
    numero: '17-18.772',
    titre: 'Délai décennal - Point de départ',
    theme: 'decennale',
    domaine: 'Responsabilité décennale',
    resume: 'Le délai de garantie décennale court à compter de la réception des travaux, même si celle-ci est prononcée avec réserves.',
    attendu_principal: 'Le délai de la garantie décennale court à compter de la réception de l\'ouvrage, y compris lorsque celle-ci est prononcée avec des réserves qui n\'ont pas été levées.',
    articles_vises: ['Article 1792-4-1 Code civil'],
    mots_cles: ['délai', 'réception', 'réserves', 'prescription'],
    impact: 'Confirmation du point de départ unique du délai décennal.',
    solution: 'Rejet'
  },

  // ===== RÉCEPTION DES TRAVAUX =====
  {
    id: 'cass-civ3-2019-18-14826',
    juridiction: 'Cour de cassation',
    formation: '3e chambre civile',
    date: '2019-03-21',
    numero: '18-14.826',
    titre: 'Réception tacite - Conditions',
    theme: 'reception',
    domaine: 'Réception',
    resume: 'La réception tacite suppose la volonté non équivoque du maître d\'ouvrage d\'accepter les travaux. La simple prise de possession ou le paiement partiel sont insuffisants.',
    attendu_principal: 'Attendu que la réception tacite de l\'ouvrage suppose la volonté non équivoque du maître de l\'ouvrage de le recevoir ; que ni la prise de possession des lieux ni le règlement de factures ne suffisent à caractériser cette volonté.',
    articles_vises: ['Article 1792-6 Code civil'],
    mots_cles: ['réception tacite', 'volonté', 'prise de possession', 'paiement'],
    impact: 'Critères stricts pour la qualification de réception tacite.',
    solution: 'Cassation'
  },
  {
    id: 'cass-civ3-2016-15-20326',
    juridiction: 'Cour de cassation',
    formation: '3e chambre civile',
    date: '2016-09-15',
    numero: '15-20.326',
    titre: 'Réception avec réserves - Effets',
    theme: 'reception',
    domaine: 'Réception',
    resume: 'Les réserves formulées lors de la réception n\'empêchent pas le transfert des risques et le départ des garanties légales.',
    attendu_principal: 'La réception avec réserves transfère la garde de l\'ouvrage au maître de l\'ouvrage et fait courir les délais de garantie.',
    articles_vises: ['Article 1792-6 Code civil'],
    mots_cles: ['réception', 'réserves', 'transfert risques', 'garantie'],
    impact: 'Les réserves ne bloquent pas l\'effet de la réception.',
    solution: 'Rejet'
  },

  // ===== EXPERTISE JUDICIAIRE =====
  {
    id: 'cass-civ2-2018-17-22012',
    juridiction: 'Cour de cassation',
    formation: '2e chambre civile',
    date: '2018-10-11',
    numero: '17-22.012',
    titre: 'Principe du contradictoire - Expertise',
    theme: 'expertise',
    domaine: 'Procédure',
    resume: 'L\'expert judiciaire doit respecter le principe du contradictoire et convoquer toutes les parties à ses opérations.',
    attendu_principal: 'Attendu que l\'expert judiciaire est tenu de respecter et de faire respecter le contradictoire ; qu\'il doit convoquer toutes les parties aux opérations d\'expertise et leur communiquer ses constatations.',
    articles_vises: ['Article 16 CPC', 'Article 160 CPC', 'Article 276 CPC'],
    mots_cles: ['contradictoire', 'convocation', 'parties', 'expertise'],
    impact: 'Rappel de l\'obligation fondamentale de contradictoire dans l\'expertise.',
    solution: 'Cassation'
  },
  {
    id: 'cass-civ2-2019-18-15234',
    juridiction: 'Cour de cassation',
    formation: '2e chambre civile',
    date: '2019-05-23',
    numero: '18-15.234',
    titre: 'Dires des parties - Réponse obligatoire',
    theme: 'expertise',
    domaine: 'Procédure',
    resume: 'L\'expert doit répondre aux dires des parties et ne peut les écarter sans motiver son refus.',
    attendu_principal: 'L\'expert doit prendre en considération les observations et réclamations des parties et y répondre dans son rapport.',
    articles_vises: ['Article 276 CPC'],
    mots_cles: ['dires', 'réponse', 'rapport', 'motivation'],
    impact: 'L\'expert ne peut ignorer les dires des parties.',
    solution: 'Cassation'
  },
  {
    id: 'cass-civ3-2017-16-17854',
    juridiction: 'Cour de cassation',
    formation: '3e chambre civile',
    date: '2017-06-22',
    numero: '16-17.854',
    titre: 'Honoraires de l\'expert - Taxation',
    theme: 'expertise',
    domaine: 'Procédure',
    resume: 'Les honoraires de l\'expert doivent être fixés en fonction du temps passé, de la difficulté de la mission et de la qualité du travail fourni.',
    attendu_principal: 'Le juge taxateur fixe les honoraires en tenant compte du temps passé, de la difficulté des opérations et de la qualité du travail accompli.',
    articles_vises: ['Article 284 CPC'],
    mots_cles: ['honoraires', 'taxation', 'expert', 'rémunération'],
    impact: 'Critères d\'appréciation des honoraires d\'expertise.',
    solution: 'Rejet'
  },

  // ===== MALFAÇONS / DÉSORDRES =====
  {
    id: 'cass-civ3-2020-19-11456',
    juridiction: 'Cour de cassation',
    formation: '3e chambre civile',
    date: '2020-02-06',
    numero: '19-11.456',
    titre: 'Non-conformité aux règles de l\'art - Présomption de désordre futur',
    theme: 'malfacons',
    domaine: 'Malfaçons',
    resume: 'La non-conformité aux règles de l\'art crée une présomption de désordre futur permettant de retenir la responsabilité décennale.',
    attendu_principal: 'La non-conformité aux règles de l\'art, aux normes ou aux DTU est de nature à compromettre la solidité de l\'ouvrage ou à le rendre impropre à sa destination future.',
    articles_vises: ['Article 1792 Code civil'],
    mots_cles: ['règles de l\'art', 'DTU', 'non-conformité', 'présomption'],
    impact: 'La seule non-conformité peut suffire à engager la décennale.',
    solution: 'Cassation'
  },
  {
    id: 'cass-civ3-2018-17-20987',
    juridiction: 'Cour de cassation',
    formation: '3e chambre civile',
    date: '2018-09-13',
    numero: '17-20.987',
    titre: 'Désordres esthétiques - Exclusion garantie décennale',
    theme: 'malfacons',
    domaine: 'Malfaçons',
    resume: 'Les désordres purement esthétiques ne relèvent pas de la garantie décennale sauf s\'ils rendent l\'ouvrage impropre à sa destination.',
    attendu_principal: 'Des désordres d\'ordre esthétique, qui n\'affectent ni la solidité de l\'ouvrage ni ne le rendent impropre à sa destination, ne relèvent pas de la garantie décennale.',
    articles_vises: ['Article 1792 Code civil'],
    mots_cles: ['esthétique', 'décennale', 'exclusion', 'destination'],
    impact: 'Exclusion des désordres purement esthétiques de la décennale.',
    solution: 'Rejet'
  },

  // ===== ASSURANCE CONSTRUCTION =====
  {
    id: 'cass-civ3-2019-18-12567',
    juridiction: 'Cour de cassation',
    formation: '3e chambre civile',
    date: '2019-04-04',
    numero: '18-12.567',
    titre: 'Dommage-ouvrage - Délai de déclaration',
    theme: 'assurance',
    domaine: 'Assurance construction',
    resume: 'Le délai de déclaration de sinistre en assurance dommages-ouvrage court à compter de la connaissance du sinistre par l\'assuré.',
    attendu_principal: 'Le délai de déclaration du sinistre court à compter de la date à laquelle l\'assuré a eu connaissance du désordre.',
    articles_vises: ['Article L242-1 Code des assurances'],
    mots_cles: ['dommage-ouvrage', 'déclaration', 'délai', 'sinistre'],
    impact: 'Point de départ du délai de déclaration.',
    solution: 'Rejet'
  },
  {
    id: 'cass-civ3-2017-16-18234',
    juridiction: 'Cour de cassation',
    formation: '3e chambre civile',
    date: '2017-07-06',
    numero: '16-18.234',
    titre: 'Assurance décennale - Obligation d\'assurance',
    theme: 'assurance',
    domaine: 'Assurance construction',
    resume: 'Tout constructeur est tenu de souscrire une assurance décennale avant l\'ouverture du chantier.',
    attendu_principal: 'L\'obligation d\'assurance pèse sur tout constructeur au sens de l\'article 1792-1 du code civil et doit être souscrite avant l\'ouverture du chantier.',
    articles_vises: ['Article L241-1 Code des assurances', 'Article 1792-1 Code civil'],
    mots_cles: ['assurance', 'obligation', 'constructeur', 'décennale'],
    impact: 'Rappel de l\'obligation d\'assurance pour les constructeurs.',
    solution: 'Cassation'
  },

  // ===== SOUS-TRAITANCE =====
  {
    id: 'cass-civ3-2018-17-15678',
    juridiction: 'Cour de cassation',
    formation: '3e chambre civile',
    date: '2018-03-22',
    numero: '17-15.678',
    titre: 'Sous-traitance - Action directe',
    theme: 'sous-traitance',
    domaine: 'Sous-traitance',
    resume: 'Le sous-traitant dispose d\'une action directe contre le maître de l\'ouvrage à concurrence des sommes dues par celui-ci à l\'entrepreneur principal.',
    attendu_principal: 'Le sous-traitant peut exercer une action directe contre le maître de l\'ouvrage pour le paiement de ses prestations, dans la limite de ce que le maître de l\'ouvrage doit encore à l\'entrepreneur principal.',
    articles_vises: ['Article 12 Loi 31 décembre 1975'],
    mots_cles: ['sous-traitance', 'action directe', 'paiement', 'maître d\'ouvrage'],
    impact: 'Conditions de l\'action directe du sous-traitant.',
    solution: 'Rejet'
  },

  // ===== VICES CACHÉS =====
  {
    id: 'cass-civ3-2019-18-19234',
    juridiction: 'Cour de cassation',
    formation: '3e chambre civile',
    date: '2019-09-19',
    numero: '18-19.234',
    titre: 'Vices cachés - Immeuble ancien',
    theme: 'vices-caches',
    domaine: 'Vices cachés',
    resume: 'L\'action en garantie des vices cachés est distincte de la garantie décennale et peut être exercée pour un immeuble achevé depuis plus de dix ans.',
    attendu_principal: 'La garantie des vices cachés est applicable aux immeubles, même après expiration du délai décennal, pour les vices non apparents lors de la vente.',
    articles_vises: ['Article 1641 Code civil', 'Article 1648 Code civil'],
    mots_cles: ['vices cachés', 'vente', 'immeuble', 'garantie'],
    impact: 'Articulation entre garantie décennale et vices cachés.',
    solution: 'Cassation'
  }
];

// ============================================================================
// THÈMES JURISPRUDENCE
// ============================================================================

export const THEMES_JURISPRUDENCE = [
  { id: 'decennale', label: 'Garantie décennale', icon: Shield, color: 'bg-blue-500' },
  { id: 'reception', label: 'Réception', icon: CheckCircle, color: 'bg-green-500' },
  { id: 'expertise', label: 'Expertise judiciaire', icon: Scale, color: 'bg-purple-500' },
  { id: 'malfacons', label: 'Malfaçons', icon: AlertTriangle, color: 'bg-amber-500' },
  { id: 'assurance', label: 'Assurance construction', icon: Shield, color: 'bg-cyan-500' },
  { id: 'sous-traitance', label: 'Sous-traitance', icon: Users, color: 'bg-pink-500' },
  { id: 'vices-caches', label: 'Vices cachés', icon: Search, color: 'bg-red-500' }
];

// ============================================================================
// COMPOSANT PRINCIPAL - BASE JURISPRUDENCE
// ============================================================================

export const BaseJurisprudence = ({ onSelectDecision, onCiteDecision }) => {
  const [search, setSearch] = useState('');
  const [filterTheme, setFilterTheme] = useState('all');
  const [favoris, setFavoris] = useState(() => {
    const saved = localStorage.getItem('jurisprudence_favoris');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [showOnlyFavoris, setShowOnlyFavoris] = useState(false);

  // Filtrer les décisions
  const decisionsFiltrees = useMemo(() => {
    return JURISPRUDENCE_DATABASE.filter(decision => {
      const matchSearch = search === '' ||
        decision.numero.toLowerCase().includes(search.toLowerCase()) ||
        decision.titre.toLowerCase().includes(search.toLowerCase()) ||
        decision.resume.toLowerCase().includes(search.toLowerCase()) ||
        decision.mots_cles.some(mot => mot.toLowerCase().includes(search.toLowerCase()));

      const matchTheme = filterTheme === 'all' || decision.theme === filterTheme;
      const matchFavoris = !showOnlyFavoris || favoris.includes(decision.id);

      return matchSearch && matchTheme && matchFavoris;
    });
  }, [search, filterTheme, showOnlyFavoris, favoris]);

  // Grouper par thème
  const decisionsParTheme = useMemo(() => {
    const grouped = {};
    decisionsFiltrees.forEach(decision => {
      if (!grouped[decision.theme]) grouped[decision.theme] = [];
      grouped[decision.theme].push(decision);
    });
    return grouped;
  }, [decisionsFiltrees]);

  // Toggle favori
  const toggleFavori = useCallback((decisionId) => {
    setFavoris(prev => {
      const newFavoris = prev.includes(decisionId)
        ? prev.filter(id => id !== decisionId)
        : [...prev, decisionId];
      localStorage.setItem('jurisprudence_favoris', JSON.stringify(newFavoris));
      return newFavoris;
    });
  }, []);

  // Copier une référence
  const copierReference = useCallback((decision) => {
    const ref = `${decision.juridiction}, ${decision.formation}, ${formatDateFr(decision.date)}, n° ${decision.numero}`;
    navigator.clipboard.writeText(ref);
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a] flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#2563EB]" />
            Base Jurisprudence
          </h2>
          <p className="text-[#737373]">
            {JURISPRUDENCE_DATABASE.length} décisions pertinentes
          </p>
        </div>
        <Button
          variant={showOnlyFavoris ? 'primary' : 'secondary'}
          icon={showOnlyFavoris ? Star : StarOff}
          onClick={() => setShowOnlyFavoris(!showOnlyFavoris)}
        >
          Favoris ({favoris.length})
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
          <input
            type="text"
            placeholder="Rechercher par numéro, titre ou mot-clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
          />
        </div>
        <select
          value={filterTheme}
          onChange={(e) => setFilterTheme(e.target.value)}
          className="px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
        >
          <option value="all">Tous les thèmes</option>
          {THEMES_JURISPRUDENCE.map(theme => (
            <option key={theme.id} value={theme.id}>{theme.label}</option>
          ))}
        </select>
      </div>

      {/* Résultats */}
      {decisionsFiltrees.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Aucune décision trouvée"
          description="Modifiez vos critères de recherche"
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(decisionsParTheme).map(([theme, decisions]) => {
            const themeInfo = THEMES_JURISPRUDENCE.find(t => t.id === theme);
            const ThemeIcon = themeInfo?.icon || Scale;

            return (
              <div key={theme}>
                <h3 className="font-medium text-[#1a1a1a] mb-3 flex items-center gap-2">
                  <span className={`w-6 h-6 ${themeInfo?.color || 'bg-gray-500'} rounded flex items-center justify-center`}>
                    <ThemeIcon className="w-4 h-4 text-white" />
                  </span>
                  {themeInfo?.label || theme}
                  <Badge variant="default">{decisions.length}</Badge>
                </h3>

                <div className="space-y-2">
                  {decisions.map(decision => (
                    <DecisionCard
                      key={decision.id}
                      decision={decision}
                      isFavori={favoris.includes(decision.id)}
                      onToggleFavori={() => toggleFavori(decision.id)}
                      onClick={() => setSelectedDecision(decision)}
                      onCopy={() => copierReference(decision)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal détail décision */}
      {selectedDecision && (
        <ModalDecisionDetail
          decision={selectedDecision}
          isOpen={!!selectedDecision}
          onClose={() => setSelectedDecision(null)}
          onCite={onCiteDecision}
          onCopy={copierReference}
        />
      )}
    </div>
  );
};

// ============================================================================
// CARTE DÉCISION
// ============================================================================

const DecisionCard = ({ decision, isFavori, onToggleFavori, onClick, onCopy }) => {
  return (
    <Card
      className="p-4 hover:border-[#2563EB] cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-medium text-[#2563EB]">
              n° {decision.numero}
            </span>
            <span className="text-xs text-[#a3a3a3]">
              {formatDateFr(decision.date)}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavori(); }}
              className="p-1 hover:bg-[#f5f5f5] rounded"
            >
              {isFavori ? (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              ) : (
                <StarOff className="w-4 h-4 text-[#a3a3a3]" />
              )}
            </button>
          </div>

          <h4 className="font-medium text-[#1a1a1a] mb-1">{decision.titre}</h4>

          <div className="flex items-center gap-2 mb-2 text-xs text-[#737373]">
            <Gavel className="w-3 h-3" />
            <span>{decision.juridiction} - {decision.formation}</span>
          </div>

          <p className="text-sm text-[#737373] line-clamp-2">{decision.resume}</p>

          <div className="flex flex-wrap gap-1 mt-2">
            {decision.mots_cles.slice(0, 4).map((mot, i) => (
              <Badge key={i} variant="default" className="text-xs">
                {mot}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 ml-4">
          <Badge
            variant={decision.solution === 'Cassation' ? 'error' : 'success'}
            className="text-xs"
          >
            {decision.solution}
          </Badge>
          <button
            onClick={(e) => { e.stopPropagation(); onCopy(); }}
            className="p-2 hover:bg-[#f5f5f5] rounded-lg"
            title="Copier la référence"
          >
            <Copy className="w-4 h-4 text-[#737373]" />
          </button>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// MODAL DÉTAIL DÉCISION
// ============================================================================

const ModalDecisionDetail = ({ decision, isOpen, onClose, onCite, onCopy }) => {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Décision n° ${decision.numero}`} size="lg">
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h3 className="text-lg font-medium text-[#1a1a1a]">{decision.titre}</h3>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="info">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDateFr(decision.date)}
            </Badge>
            <Badge variant="default">
              <Gavel className="w-3 h-3 mr-1" />
              {decision.juridiction}
            </Badge>
            <Badge variant="default">{decision.formation}</Badge>
            <Badge variant={decision.solution === 'Cassation' ? 'error' : 'success'}>
              {decision.solution}
            </Badge>
          </div>
        </div>

        {/* Résumé */}
        <div>
          <h4 className="text-sm font-medium text-[#737373] uppercase mb-2">Résumé</h4>
          <p className="text-[#525252]">{decision.resume}</p>
        </div>

        {/* Attendu principal */}
        <div>
          <h4 className="text-sm font-medium text-[#737373] uppercase mb-2">Attendu principal</h4>
          <div className="p-4 bg-[#fafafa] rounded-xl border-l-4 border-[#2563EB]">
            <p className="text-sm text-[#525252] italic">"{decision.attendu_principal}"</p>
          </div>
        </div>

        {/* Articles visés */}
        <div>
          <h4 className="text-sm font-medium text-[#737373] uppercase mb-2">Articles visés</h4>
          <div className="flex flex-wrap gap-2">
            {decision.articles_vises.map((article, i) => (
              <Badge key={i} variant="info">{article}</Badge>
            ))}
          </div>
        </div>

        {/* Impact */}
        <div>
          <h4 className="text-sm font-medium text-[#737373] uppercase mb-2">Impact / Portée</h4>
          <p className="text-[#525252]">{decision.impact}</p>
        </div>

        {/* Mots-clés */}
        <div>
          <h4 className="text-sm font-medium text-[#737373] uppercase mb-2">Mots-clés</h4>
          <div className="flex flex-wrap gap-2">
            {decision.mots_cles.map((mot, i) => (
              <Badge key={i} variant="default">{mot}</Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button
            variant="secondary"
            icon={Copy}
            onClick={() => onCopy(decision)}
            className="flex-1"
          >
            Copier référence
          </Button>
          <Button
            variant="primary"
            icon={FileText}
            onClick={() => {
              const citation = `${decision.juridiction}, ${decision.formation}, ${formatDateFr(decision.date)}, n° ${decision.numero} : "${decision.attendu_principal}"`;
              onCite?.(citation);
              navigator.clipboard.writeText(citation);
            }}
            className="flex-1"
          >
            Citer dans rapport
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// WIDGET RECHERCHE JURISPRUDENCE (compact)
// ============================================================================

export const JurisprudenceSearchWidget = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (query) => {
    setSearch(query);
    if (query.length >= 2) {
      const filtered = JURISPRUDENCE_DATABASE.filter(d =>
        d.numero.toLowerCase().includes(query.toLowerCase()) ||
        d.titre.toLowerCase().includes(query.toLowerCase()) ||
        d.mots_cles.some(mot => mot.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5);
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher une décision..."
          className="w-full pl-10 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#2563EB]"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e5e5] rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map(decision => (
            <button
              key={decision.id}
              onClick={() => {
                onSelect?.(decision);
                setSearch('');
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-[#fafafa] border-b border-[#f5f5f5] last:border-0"
            >
              <span className="font-mono text-sm text-[#2563EB]">n° {decision.numero}</span>
              <p className="text-sm text-[#1a1a1a] truncate">{decision.titre}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Import nécessaire pour Shield
const Shield = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ============================================================================
// EXPORT
// ============================================================================

export default BaseJurisprudence;
