// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE EXCELLENCE
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Shield, Scale, FileCheck, BookOpen, Gavel, Calculator,
  Target, ShieldCheck, Users, UserCheck, AlertTriangle,
  TrendingUp, FlaskConical, Upload, CheckCircle, XCircle,
  AlertCircle, ChevronRight, Info
} from 'lucide-react';
import { Card, Badge, Button, ProgressBar, Tabs, useToast } from '../ui';
import { 
  CHECKLIST_CONFORMITE, CHECKLIST_PROTECTION, CHECKLIST_ASSURANCES,
  BASE_DTU, JURISPRUDENCE, QUALIFICATION_DESORDRES, TYPES_ASSURANCES,
  CRITERES_IMPUTABILITE, CONCILIATION_ETAPES, OPALEXE_CHECKLIST
} from '../../data';

// ============================================================================
// SOUS-MODULE: Garanties
// ============================================================================

export const GarantiesModule = ({ affaire, onUpdate }) => {
  const echeances = useMemo(() => {
    if (!affaire?.dateReception) return null;
    const dateReception = new Date(affaire.dateReception);
    
    return {
      gpa: { 
        echeance: new Date(dateReception.getTime() + 365 * 24 * 60 * 60 * 1000),
        label: 'Garantie Parfait Achèvement',
        article: 'Art. 1792-6 CC'
      },
      biennale: { 
        echeance: new Date(dateReception.getTime() + 730 * 24 * 60 * 60 * 1000),
        label: 'Garantie Biennale',
        article: 'Art. 1792-3 CC'
      },
      decennale: { 
        echeance: new Date(dateReception.getTime() + 3652 * 24 * 60 * 60 * 1000),
        label: 'Garantie Décennale',
        article: 'Art. 1792 CC'
      }
    };
  }, [affaire?.dateReception]);

  const getStatut = (echeance) => {
    const now = new Date();
    const jours = Math.ceil((echeance - now) / (1000 * 60 * 60 * 24));
    if (jours <= 0) return { label: 'Expirée', color: 'red', icon: XCircle };
    if (jours <= 30) return { label: 'Critique', color: 'red', icon: AlertTriangle };
    if (jours <= 90) return { label: 'Urgent', color: 'amber', icon: AlertCircle };
    return { label: 'Active', color: 'green', icon: CheckCircle };
  };

  if (!echeances) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
          <p className="text-[#737373]">Renseignez la date de réception pour calculer les échéances</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(echeances).map(([key, garantie]) => {
        const statut = getStatut(garantie.echeance);
        const Icon = statut.icon;
        const jours = Math.ceil((garantie.echeance - new Date()) / (1000 * 60 * 60 * 24));
        
        return (
          <Card key={key} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${statut.color}-50`}>
                  <Icon className={`w-5 h-5 text-${statut.color}-500`} />
                </div>
                <div>
                  <p className="font-medium text-[#1a1a1a]">{garantie.label}</p>
                  <p className="text-xs text-[#737373]">{garantie.article}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={statut.color === 'green' ? 'success' : statut.color === 'red' ? 'error' : 'warning'}>
                  {statut.label}
                </Badge>
                <p className="text-sm text-[#737373] mt-1">
                  {jours > 0 ? `${jours} jours restants` : 'Expirée'}
                </p>
                <p className="text-xs text-[#a3a3a3]">
                  {garantie.echeance.toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ============================================================================
// SOUS-MODULE: Conformité CPC
// ============================================================================

export const ConformiteModule = ({ affaire, onUpdate }) => {
  const [activeSection, setActiveSection] = useState('premiereReunion');
  const [verifications, setVerifications] = useState(affaire?.conformite || {});

  const handleCheck = (section, key) => {
    const newVerifications = {
      ...verifications,
      [section]: {
        ...verifications[section],
        [key]: !verifications[section]?.[key]
      }
    };
    setVerifications(newVerifications);
    if (onUpdate) onUpdate({ conformite: newVerifications });
  };

  const calculerScore = (section) => {
    const items = CHECKLIST_CONFORMITE[section]?.items || [];
    const checked = items.filter(i => verifications[section]?.[i.key]).length;
    return Math.round((checked / items.length) * 100);
  };

  const sections = Object.entries(CHECKLIST_CONFORMITE);

  return (
    <div className="space-y-6">
      {/* Navigation sections */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map(([key, section]) => {
          const score = calculerScore(key);
          return (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === key
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-[#f5f5f5] text-[#525252] hover:bg-[#e5e5e5]'
              }`}
            >
              {section.titre}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                score === 100 ? 'bg-green-500 text-white' :
                score >= 50 ? 'bg-amber-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {score}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Checklist active */}
      <Card className="p-6">
        <h3 className="font-medium text-[#1a1a1a] mb-4">
          {CHECKLIST_CONFORMITE[activeSection]?.titre}
        </h3>
        <div className="space-y-3">
          {CHECKLIST_CONFORMITE[activeSection]?.items.map(item => (
            <label 
              key={item.key}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                verifications[activeSection]?.[item.key]
                  ? 'bg-green-50'
                  : item.critique ? 'bg-red-50/50' : 'bg-[#fafafa]'
              }`}
            >
              <input
                type="checkbox"
                checked={verifications[activeSection]?.[item.key] || false}
                onChange={() => handleCheck(activeSection, item.key)}
                className="mt-0.5 w-5 h-5 rounded border-[#d4d4d4] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <div className="flex-1">
                <p className={`text-sm ${verifications[activeSection]?.[item.key] ? 'text-green-700' : 'text-[#1a1a1a]'}`}>
                  {item.label}
                </p>
                {item.article && (
                  <p className="text-xs text-[#a3a3a3] mt-0.5">{item.article}</p>
                )}
              </div>
              {item.critique && !verifications[activeSection]?.[item.key] && (
                <Badge variant="error" size="sm">Critique</Badge>
              )}
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// SOUS-MODULE: Protection Expert
// ============================================================================

export const ProtectionModule = ({ affaire, onUpdate }) => {
  const [verifications, setVerifications] = useState(affaire?.protection || {});

  const handleCheck = (key) => {
    const newVerifications = { ...verifications, [key]: !verifications[key] };
    setVerifications(newVerifications);
    if (onUpdate) onUpdate({ protection: newVerifications });
  };

  const score = useMemo(() => {
    const checked = CHECKLIST_PROTECTION.filter(i => verifications[i.key]).length;
    return Math.round((checked / CHECKLIST_PROTECTION.length) * 100);
  }, [verifications]);

  return (
    <div className="space-y-6">
      {/* Score global */}
      <Card className="p-6 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#2563EB]" />
            <div>
              <h3 className="text-white font-medium">Score de protection</h3>
              <p className="text-[#a3a3a3] text-sm">Niveau de sécurisation de votre mission</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-light ${
              score >= 80 ? 'text-green-400' :
              score >= 50 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {score}%
            </p>
          </div>
        </div>
        <ProgressBar 
          value={score} 
          color={score >= 80 ? 'green' : score >= 50 ? 'amber' : 'red'}
          showLabel={false}
        />
      </Card>

      {/* Checklist */}
      <Card className="p-6">
        <h3 className="font-medium text-[#1a1a1a] mb-4">Points de vigilance</h3>
        <div className="space-y-3">
          {CHECKLIST_PROTECTION.map(item => (
            <label 
              key={item.key}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                verifications[item.key] ? 'bg-green-50' : 'bg-[#fafafa]'
              }`}
            >
              <input
                type="checkbox"
                checked={verifications[item.key] || false}
                onChange={() => handleCheck(item.key)}
                className="mt-0.5 w-5 h-5 rounded border-[#d4d4d4] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <div className="flex-1">
                <p className={`text-sm ${verifications[item.key] ? 'text-green-700' : 'text-[#1a1a1a]'}`}>
                  {item.label}
                </p>
                {item.article && (
                  <p className="text-xs text-[#a3a3a3] mt-0.5">{item.article}</p>
                )}
              </div>
              {item.critique && !verifications[item.key] && (
                <Badge variant="error" size="sm">Critique</Badge>
              )}
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// SOUS-MODULE: Base DTU
// ============================================================================

export const DTUModule = () => {
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('all');

  const categories = [...new Set(BASE_DTU.map(d => d.categorie))];

  const dtuFiltres = useMemo(() => {
    return BASE_DTU.filter(dtu => {
      const matchSearch = search === '' || 
        dtu.numero.includes(search) ||
        dtu.titre.toLowerCase().includes(search.toLowerCase());
      const matchCategorie = categorie === 'all' || dtu.categorie === categorie;
      return matchSearch && matchCategorie;
    });
  }, [search, categorie]);

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Rechercher un DTU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
        />
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className="px-4 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
        >
          <option value="all">Toutes catégories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Liste DTU */}
      <div className="grid gap-4">
        {dtuFiltres.map(dtu => (
          <Card key={dtu.numero} className="p-4 hover:border-[#2563EB] cursor-pointer transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="gold">DTU {dtu.numero}</Badge>
                  <span className="text-xs text-[#737373]">{dtu.norme}</span>
                </div>
                <h4 className="font-medium text-[#1a1a1a]">{dtu.titre}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dtu.points.map((point, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-[#f5f5f5] rounded text-[#525252]">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#a3a3a3]" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SOUS-MODULE: Jurisprudence
// ============================================================================

export const JurisprudenceModule = () => {
  const [search, setSearch] = useState('');

  const jurisprudenceFiltree = useMemo(() => {
    return JURISPRUDENCE.filter(j => 
      search === '' ||
      j.theme.toLowerCase().includes(search.toLowerCase()) ||
      j.resume.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-6">
      <input
        type="text"
        placeholder="Rechercher par thème..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
      />

      <div className="space-y-4">
        {jurisprudenceFiltree.map((juris, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#DBEAFE] rounded-xl flex items-center justify-center flex-shrink-0">
                <Gavel className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="purple">{juris.theme}</Badge>
                  {juris.article && <span className="text-xs text-[#737373]">{juris.article}</span>}
                </div>
                <p className="font-medium text-sm text-[#1a1a1a] mb-1">{juris.ref}</p>
                <p className="text-sm text-[#525252]">{juris.resume}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SOUS-MODULE: Qualification
// ============================================================================

export const QualificationModule = ({ onSelect }) => {
  const [currentQuestion, setCurrentQuestion] = useState('q1');
  const [result, setResult] = useState(null);

  const handleAnswer = (reponse) => {
    const question = QUALIFICATION_DESORDRES.questions.find(q => q.id === currentQuestion);
    const next = reponse ? question.oui : question.non;
    
    if (next.startsWith('q')) {
      setCurrentQuestion(next);
    } else {
      const category = QUALIFICATION_DESORDRES.categories.find(c => c.id === next);
      setResult(category);
    }
  };

  const reset = () => {
    setCurrentQuestion('q1');
    setResult(null);
  };

  if (result) {
    return (
      <Card className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-medium text-[#1a1a1a]">Qualification identifiée</h3>
        </div>
        
        <div className="bg-[#fafafa] rounded-2xl p-6 mb-6">
          <Badge variant="gold" size="lg" className="mb-3">{result.label}</Badge>
          <p className="text-[#525252] mb-4">{result.description}</p>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#2563EB]" />
            <span className="text-sm font-medium text-[#1a1a1a]">
              Garantie : {result.garantie}
            </span>
            <span className="text-sm text-[#737373]">({result.article})</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">Critères</p>
          <div className="flex flex-wrap gap-2">
            {result.criteres.map((c, idx) => (
              <span key={idx} className="px-3 py-1 bg-[#f5f5f5] rounded-full text-sm text-[#525252]">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={reset} className="flex-1">
            Recommencer
          </Button>
          <Button variant="gold" onClick={() => onSelect && onSelect(result)} className="flex-1">
            Appliquer à l'affaire
          </Button>
        </div>
      </Card>
    );
  }

  const question = QUALIFICATION_DESORDRES.questions.find(q => q.id === currentQuestion);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-[#2563EB]" />
        <h3 className="font-medium text-[#1a1a1a]">Assistant de qualification</h3>
      </div>

      <div className="bg-[#fafafa] rounded-2xl p-6 mb-6">
        <p className="text-lg text-[#1a1a1a]">{question.question}</p>
      </div>

      <div className="flex gap-4">
        <Button variant="primary" onClick={() => handleAnswer(true)} className="flex-1">
          Oui
        </Button>
        <Button variant="secondary" onClick={() => handleAnswer(false)} className="flex-1">
          Non
        </Button>
      </div>

      <button onClick={reset} className="w-full mt-4 text-sm text-[#737373] hover:text-[#1a1a1a]">
        Recommencer
      </button>
    </Card>
  );
};

// ============================================================================
// SOUS-MODULE: Imputabilité
// ============================================================================

export const ImputabiliteModule = ({ affaire, onUpdate }) => {
  const [repartition, setRepartition] = useState(affaire?.imputabilite || {});

  const totalPourcentage = Object.values(repartition).reduce((acc, val) => acc + (val || 0), 0);

  const handleChange = (id, value) => {
    const newRepartition = { ...repartition, [id]: parseInt(value) || 0 };
    setRepartition(newRepartition);
    if (onUpdate) onUpdate({ imputabilite: newRepartition });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <span className="text-[#a3a3a3]">Total réparti</span>
          <span className={`text-2xl font-light ${totalPourcentage === 100 ? 'text-green-400' : 'text-amber-400'}`}>
            {totalPourcentage}%
          </span>
        </div>
        <ProgressBar 
          value={totalPourcentage} 
          color={totalPourcentage === 100 ? 'green' : 'amber'}
          showLabel={false}
          className="mt-2"
        />
      </Card>

      <div className="space-y-4">
        {CRITERES_IMPUTABILITE.map(critere => (
          <Card key={critere.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-[#1a1a1a]">{critere.label}</p>
                <p className="text-xs text-[#737373]">
                  {critere.intervenants.join(', ')}
                </p>
              </div>
              <Badge variant={critere.poids === 'Élevé' ? 'error' : critere.poids === 'Moyen' ? 'warning' : 'default'}>
                {critere.poids}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={repartition[critere.id] || 0}
                onChange={(e) => handleChange(critere.id, e.target.value)}
                className="flex-1 accent-[#2563EB]"
              />
              <span className="w-12 text-right font-medium text-[#1a1a1a]">
                {repartition[critere.id] || 0}%
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SOUS-MODULE: OPALEXE
// ============================================================================

export const OpalexeModule = ({ affaire }) => {
  const toast = useToast();
  const [verifications, setVerifications] = useState({});

  const handleCheck = (key) => {
    setVerifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const score = useMemo(() => {
    const checked = OPALEXE_CHECKLIST.filter(i => verifications[i.key]).length;
    return Math.round((checked / OPALEXE_CHECKLIST.length) * 100);
  }, [verifications]);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="flex items-center gap-4">
          <Upload className="w-10 h-10 text-white" />
          <div>
            <h3 className="text-white font-medium text-lg">Dépôt OPALEXE</h3>
            <p className="text-blue-200 text-sm">Plateforme de dépôt dématérialisé</p>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={score} color="gold" />
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-medium text-[#1a1a1a] mb-4">Checklist de conformité</h4>
        <div className="space-y-3">
          {OPALEXE_CHECKLIST.map(item => (
            <label 
              key={item.key}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                verifications[item.key] ? 'bg-green-50' : 'bg-[#fafafa]'
              }`}
            >
              <input
                type="checkbox"
                checked={verifications[item.key] || false}
                onChange={() => handleCheck(item.key)}
                className="mt-0.5 w-5 h-5 rounded border-[#d4d4d4] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span className={`text-sm ${verifications[item.key] ? 'text-green-700' : 'text-[#1a1a1a]'}`}>
                {item.label}
              </span>
              {item.critique && !verifications[item.key] && (
                <Badge variant="error" size="sm">Requis</Badge>
              )}
            </label>
          ))}
        </div>
      </Card>

      <Button
        variant="gold"
        className="w-full"
        disabled={score < 100}
        onClick={() => {
          if (score >= 100) {
            toast.info('Fonctionnalité à venir', 'La préparation du dépôt Opalexe sera bientôt disponible');
          }
        }}
      >
        <Upload className="w-4 h-4 mr-2" />
        Préparer le dépôt
      </Button>
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  GarantiesModule,
  ConformiteModule,
  ProtectionModule,
  DTUModule,
  JurisprudenceModule,
  QualificationModule,
  ImputabiliteModule,
  OpalexeModule
};
