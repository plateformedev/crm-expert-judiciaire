// ============================================================================
// CRM EXPERT JUDICIAIRE - HEADER Style Samsung One UI
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Plus, User, ChevronDown,
  Download, Upload, Settings, LogOut, HelpCircle, X
} from 'lucide-react';
import { Button, useToast } from '../ui';

const Header = ({
  searchQuery = '',
  setSearchQuery = () => {},
  setShowModal = null,
  onNewAffaire = null,
  notifications = [],
  user = { nom: 'Expert', email: 'expert@example.com' }
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleNewAffaire = () => {
    if (onNewAffaire) {
      onNewAffaire();
    } else if (setShowModal) {
      setShowModal('nouvelle-affaire');
    } else {
      navigate('/affaires/nouveau');
    }
  };

  const handleImport = () => {
    toast.info('Import de données', 'L\'import de données sera bientôt disponible.');
  };

  const handleExport = () => {
    toast.success('Export lancé', 'Vos données sont en cours d\'export.');
    try {
      const affaires = JSON.parse(localStorage.getItem('crm_affaires') || '[]');
      const dataStr = JSON.stringify(affaires, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_affaires_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erreur', 'Impossible d\'exporter les données');
    }
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    navigate('/alertes');
  };

  const handleProfile = () => {
    setShowProfile(false);
    navigate('/parametres');
  };

  const handleSettings = () => {
    setShowProfile(false);
    navigate('/parametres');
  };

  const handleLogout = () => {
    setShowProfile(false);
    toast.info('Déconnexion', 'En mode démonstration, la déconnexion n\'est pas nécessaire.');
  };

  const unreadNotifications = notifications.filter(n => !n.lu).length;

  return (
    <header className="h-16 bg-white border-b border-[#e0e0e0] px-6 flex items-center justify-between gap-4">
      {/* Recherche - Style Samsung */}
      <div className="flex-1 max-w-xl">
        <div className={`
          relative flex items-center transition-all duration-200
          ${searchFocused
            ? 'bg-white border-2 border-[#0381fe]'
            : 'bg-[#f7f7f7] border-2 border-transparent hover:bg-[#f0f0f0]'
          }
          rounded-2xl
        `}>
          <Search className={`absolute left-4 w-5 h-5 ${searchFocused ? 'text-[#0381fe]' : 'text-[#757575]'}`} />
          <input
            type="text"
            placeholder="Rechercher une affaire, un contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-12 pr-4 py-3 bg-transparent text-[#1f1f1f] placeholder-[#757575] text-[15px] focus:outline-none rounded-2xl"
            data-search
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 hover:bg-[#e4e4e4] rounded-full"
            >
              <X className="w-4 h-4 text-[#757575]" />
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Bouton nouvelle affaire */}
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleNewAffaire}
        >
          Nouvelle affaire
        </Button>

        {/* Import/Export */}
        <div className="flex">
          <button
            onClick={handleImport}
            className="w-11 h-11 flex items-center justify-center hover:bg-[#f0f0f0] active:bg-[#e4e4e4] rounded-xl transition-colors"
            title="Importer des données"
          >
            <Upload className="w-5 h-5 text-[#555555]" />
          </button>
          <button
            onClick={handleExport}
            className="w-11 h-11 flex items-center justify-center hover:bg-[#f0f0f0] active:bg-[#e4e4e4] rounded-xl transition-colors"
            title="Exporter les données"
          >
            <Download className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* Aide */}
        <button
          className="w-11 h-11 flex items-center justify-center hover:bg-[#f0f0f0] active:bg-[#e4e4e4] rounded-xl transition-colors"
          title="Aide"
        >
          <HelpCircle className="w-5 h-5 text-[#555555]" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-11 h-11 flex items-center justify-center hover:bg-[#f0f0f0] active:bg-[#e4e4e4] rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5 text-[#555555]" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#ff3b30] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Dropdown notifications */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[#e0e0e0] z-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0f0f0]">
                <h3 className="font-semibold text-[16px] text-[#1f1f1f]">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#757575] text-[14px]">
                    Aucune notification
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif, idx) => (
                    <div
                      key={idx}
                      className={`px-5 py-4 hover:bg-[#f7f7f7] cursor-pointer border-b border-[#f0f0f0] last:border-0 ${
                        !notif.lu ? 'bg-[#e5f3ff]' : ''
                      }`}
                    >
                      <p className="text-[14px] text-[#1f1f1f] font-medium">{notif.message}</p>
                      <p className="text-[12px] text-[#757575] mt-1">{notif.date}</p>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-[#f0f0f0]">
                  <button
                    onClick={handleViewAllNotifications}
                    className="w-full py-2.5 text-center text-[14px] text-[#0381fe] hover:bg-[#e5f3ff] font-semibold rounded-xl transition-colors"
                  >
                    Voir toutes les notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profil */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 hover:bg-[#f0f0f0] active:bg-[#e4e4e4] rounded-xl p-1.5 transition-colors"
          >
            <div className="w-10 h-10 bg-[#c9a227] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-[15px]">
                {user.nom.charAt(0).toUpperCase()}
              </span>
            </div>
          </button>

          {/* Dropdown profil */}
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-[#e0e0e0] z-50 overflow-hidden">
              <div className="p-5 bg-[#f7f7f7] border-b border-[#e0e0e0]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#c9a227] rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {user.nom.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[16px] text-[#1f1f1f]">{user.nom}</p>
                    <p className="text-[13px] text-[#757575]">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-[#1f1f1f] hover:bg-[#f7f7f7] active:bg-[#f0f0f0] transition-colors"
                >
                  <div className="w-9 h-9 bg-[#f0f0f0] rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-[#555555]" />
                  </div>
                  <span className="text-[15px] font-medium">Mon profil</span>
                </button>
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-[#1f1f1f] hover:bg-[#f7f7f7] active:bg-[#f0f0f0] transition-colors"
                >
                  <div className="w-9 h-9 bg-[#f0f0f0] rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-[#555555]" />
                  </div>
                  <span className="text-[15px] font-medium">Paramètres</span>
                </button>
              </div>
              <div className="py-2 border-t border-[#e0e0e0]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-[#ff3b30] hover:bg-[#ffebea] active:bg-[#ffd5d3] transition-colors"
                >
                  <div className="w-9 h-9 bg-[#ffebea] rounded-xl flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-[#ff3b30]" />
                  </div>
                  <span className="text-[15px] font-medium">Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
