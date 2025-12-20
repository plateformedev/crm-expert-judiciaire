// ============================================================================
// CRM EXPERT JUDICIAIRE - HEADER
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Plus, User, ChevronDown,
  Download, Upload, Settings, LogOut, FileDown, FileUp
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
    toast.info('Import de données', 'L\'import de données sera bientôt disponible. Vous pourrez importer vos affaires depuis un fichier CSV ou Excel.');
  };

  const handleExport = () => {
    // Simuler un export
    toast.success('Export lancé', 'Vos données sont en cours d\'export. Le fichier sera téléchargé automatiquement.');
    // En mode démo, on crée un fichier JSON des affaires
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
    <header className="h-20 bg-white border-b border-[#e5e5e5] px-8 flex items-center justify-between">
      {/* Recherche */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
          <input
            type="text"
            placeholder="Rechercher une affaire, un contact, un document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#e5e5e5] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Bouton nouvelle affaire */}
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleNewAffaire}
        >
          Nouvelle affaire
        </Button>

        {/* Import/Export */}
        <div className="flex gap-1">
          <button
            onClick={handleImport}
            className="p-2.5 hover:bg-[#f5f5f5] rounded-xl transition-colors"
            title="Importer des données"
          >
            <Upload className="w-5 h-5 text-[#737373]" />
          </button>
          <button
            onClick={handleExport}
            className="p-2.5 hover:bg-[#f5f5f5] rounded-xl transition-colors"
            title="Exporter les données"
          >
            <Download className="w-5 h-5 text-[#737373]" />
          </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 hover:bg-[#f5f5f5] rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5 text-[#737373]" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Dropdown notifications */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e5e5e5] z-50">
              <div className="p-4 border-b border-[#e5e5e5]">
                <h3 className="font-medium text-[#1a1a1a]">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-[#737373] text-sm">
                    Aucune notification
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 border-b border-[#f5f5f5] hover:bg-[#fafafa] cursor-pointer ${
                        !notif.lu ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <p className="text-sm text-[#1a1a1a]">{notif.message}</p>
                      <p className="text-xs text-[#a3a3a3] mt-1">{notif.date}</p>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-[#e5e5e5]">
                  <button
                    onClick={handleViewAllNotifications}
                    className="w-full text-center text-sm text-[#c9a227] hover:underline"
                  >
                    Voir toutes les notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div className="w-px h-8 bg-[#e5e5e5]" />

        {/* Profil */}
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 hover:bg-[#f5f5f5] rounded-xl p-2 pr-3 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#8b7019] rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium text-[#1a1a1a]">{user.nom}</p>
              <p className="text-xs text-[#a3a3a3]">Expert judiciaire</p>
            </div>
            <ChevronDown className="w-4 h-4 text-[#a3a3a3] hidden lg:block" />
          </button>

          {/* Dropdown profil */}
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#e5e5e5] z-50">
              <div className="p-4 border-b border-[#e5e5e5]">
                <p className="font-medium text-[#1a1a1a]">{user.nom}</p>
                <p className="text-sm text-[#737373]">{user.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[#525252] hover:bg-[#f5f5f5] rounded-xl transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Mon profil</span>
                </button>
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[#525252] hover:bg-[#f5f5f5] rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Paramètres</span>
                </button>
              </div>
              <div className="p-2 border-t border-[#e5e5e5]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
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
