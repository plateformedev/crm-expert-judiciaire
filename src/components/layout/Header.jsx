// ============================================================================
// CRM EXPERT JUDICIAIRE - HEADER Style Google
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Plus, User, ChevronDown,
  Download, Upload, Settings, LogOut, HelpCircle
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
    <header className="h-16 bg-white border-b border-[#dadce0] px-6 flex items-center justify-between gap-4">
      {/* Recherche - Style Google */}
      <div className="flex-1 max-w-2xl">
        <div className={`
          relative flex items-center transition-all duration-200
          ${searchFocused
            ? 'bg-white shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] rounded-3xl'
            : 'bg-[#f1f3f4] hover:bg-[#e8eaed] rounded-3xl'
          }
        `}>
          <Search className="absolute left-4 w-5 h-5 text-[#9aa0a6]" />
          <input
            type="text"
            placeholder="Rechercher une affaire, un contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-12 pr-4 py-3 bg-transparent text-[#202124] placeholder-[#5f6368] text-sm focus:outline-none rounded-3xl"
            data-search
          />
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
            className="p-3 hover:bg-[#f1f3f4] rounded-full transition-colors"
            title="Importer des données"
          >
            <Upload className="w-5 h-5 text-[#5f6368]" />
          </button>
          <button
            onClick={handleExport}
            className="p-3 hover:bg-[#f1f3f4] rounded-full transition-colors"
            title="Exporter les données"
          >
            <Download className="w-5 h-5 text-[#5f6368]" />
          </button>
        </div>

        {/* Aide */}
        <button
          className="p-3 hover:bg-[#f1f3f4] rounded-full transition-colors"
          title="Aide"
        >
          <HelpCircle className="w-5 h-5 text-[#5f6368]" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 hover:bg-[#f1f3f4] rounded-full transition-colors"
          >
            <Bell className="w-5 h-5 text-[#5f6368]" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#ea4335] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Dropdown notifications */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-3xl shadow-[0_4px_8px_3px_rgba(60,64,67,0.15),0_1px_3px_rgba(60,64,67,0.3)] z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#dadce0]">
                <h3 className="font-medium text-[#202124]">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[#5f6368] text-sm">
                    Aucune notification
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif, idx) => (
                    <div
                      key={idx}
                      className={`px-4 py-3 hover:bg-[#f1f3f4] cursor-pointer border-b border-[#e8eaed] last:border-0 ${
                        !notif.lu ? 'bg-[#e8f0fe]' : ''
                      }`}
                    >
                      <p className="text-sm text-[#202124]">{notif.message}</p>
                      <p className="text-xs text-[#5f6368] mt-1">{notif.date}</p>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-[#dadce0]">
                  <button
                    onClick={handleViewAllNotifications}
                    className="w-full text-center text-sm text-[#1967d2] hover:text-[#174ea6] font-medium"
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
            className="flex items-center gap-2 hover:bg-[#f1f3f4] rounded-full p-1.5 transition-colors"
          >
            <div className="w-9 h-9 bg-[#c9a227] rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.nom.charAt(0).toUpperCase()}
              </span>
            </div>
          </button>

          {/* Dropdown profil */}
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-3xl shadow-[0_4px_8px_3px_rgba(60,64,67,0.15),0_1px_3px_rgba(60,64,67,0.3)] z-50 overflow-hidden">
              <div className="p-4 bg-[#f8f9fa] border-b border-[#dadce0]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#c9a227] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {user.nom.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[#202124]">{user.nom}</p>
                    <p className="text-sm text-[#5f6368]">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[#3c4043] hover:bg-[#f1f3f4] transition-colors"
                >
                  <User className="w-5 h-5 text-[#5f6368]" />
                  <span className="text-sm">Mon profil</span>
                </button>
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[#3c4043] hover:bg-[#f1f3f4] transition-colors"
                >
                  <Settings className="w-5 h-5 text-[#5f6368]" />
                  <span className="text-sm">Paramètres</span>
                </button>
              </div>
              <div className="py-2 border-t border-[#dadce0]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[#3c4043] hover:bg-[#f1f3f4] transition-colors"
                >
                  <LogOut className="w-5 h-5 text-[#5f6368]" />
                  <span className="text-sm">Déconnexion</span>
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
