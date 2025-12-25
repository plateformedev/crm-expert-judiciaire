// ============================================================================
// CRM EXPERT JUDICIAIRE - COMPOSANTS AUTHENTIFICATION
// ============================================================================

import React, { useState } from 'react';
import { Scale, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// PAGE DE CONNEXION
// ============================================================================

export const LoginPage = ({ onSwitchToRegister }) => {
  const { signIn, signInWithMagicLink, resetPassword, loading, error, clearError } = useAuth();
  
  const [mode, setMode] = useState('password'); // 'password' | 'magic-link' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setMessage('');

    if (mode === 'password') {
      const result = await signIn(email, password);
      if (!result.success) {
        // L'erreur est gérée par le contexte
      }
    } else if (mode === 'magic-link') {
      const result = await signInWithMagicLink(email);
      if (result.success) {
        setMessage(result.message);
      }
    } else if (mode === 'reset') {
      const result = await resetPassword(email);
      if (result.success) {
        setMessage(result.message);
        setMode('password');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-[#2563EB]" />
          </div>
          <h1 className="text-2xl font-light text-[#1a1a1a]">
            Expert<span className="text-[#2563EB]">.</span>CRM
          </h1>
          <p className="text-[#737373] mt-2">Connexion à votre espace</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#e5e5e5] p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setMode('password'); clearError(); setMessage(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'password' 
                  ? 'bg-[#1a1a1a] text-white' 
                  : 'bg-[#f5f5f5] text-[#525252] hover:bg-[#e5e5e5]'
              }`}
            >
              Mot de passe
            </button>
            <button
              onClick={() => { setMode('magic-link'); clearError(); setMessage(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'magic-link' 
                  ? 'bg-[#1a1a1a] text-white' 
                  : 'bg-[#f5f5f5] text-[#525252] hover:bg-[#e5e5e5]'
              }`}
            >
              Lien magique
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
              {message}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="expert@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            {/* Mot de passe (si mode password) */}
            {mode === 'password' && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#525252]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1a1a1a] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#0d0d0d] disabled:bg-[#a3a3a3] transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'password' && 'Se connecter'}
                  {mode === 'magic-link' && 'Envoyer le lien'}
                  {mode === 'reset' && 'Réinitialiser'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Mot de passe oublié */}
          {mode === 'password' && (
            <button
              onClick={() => { setMode('reset'); clearError(); setMessage(''); }}
              className="w-full mt-4 text-sm text-[#737373] hover:text-[#2563EB] transition-colors"
            >
              Mot de passe oublié ?
            </button>
          )}

          {mode === 'reset' && (
            <button
              onClick={() => { setMode('password'); clearError(); setMessage(''); }}
              className="w-full mt-4 text-sm text-[#737373] hover:text-[#2563EB] transition-colors"
            >
              Retour à la connexion
            </button>
          )}
        </div>

        {/* Inscription */}
        <p className="text-center mt-6 text-[#737373]">
          Pas encore de compte ?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-[#2563EB] hover:underline font-medium"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// PAGE D'INSCRIPTION
// ============================================================================

export const RegisterPage = ({ onSwitchToLogin }) => {
  const { signUp, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setMessage('');
    setLocalError('');

    // Validation
    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    const result = await signUp(email, password, { nom, prenom });
    
    if (result.success) {
      if (result.needsConfirmation) {
        setMessage(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-[#2563EB]" />
          </div>
          <h1 className="text-2xl font-light text-[#1a1a1a]">
            Expert<span className="text-[#2563EB]">.</span>CRM
          </h1>
          <p className="text-[#737373] mt-2">Créer votre compte expert</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#e5e5e5] p-8">
          {/* Messages */}
          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error || localError}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
              {message}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom / Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Dupont"
                  required
                  className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Jean"
                  className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="expert@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-12 pr-12 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#525252]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-[#a3a3a3] mt-1">Minimum 8 caractères</p>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2563EB] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#d4af37] disabled:bg-[#a3a3a3] transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Connexion */}
        <p className="text-center mt-6 text-[#737373]">
          Déjà un compte ?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-[#2563EB] hover:underline font-medium"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// PAGE CONTENEUR AUTH
// ============================================================================

export const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  if (mode === 'register') {
    return <RegisterPage onSwitchToLogin={() => setMode('login')} />;
  }

  return <LoginPage onSwitchToRegister={() => setMode('register')} />;
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default AuthPage;
