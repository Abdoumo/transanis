import React from 'react';
import { useApp } from '../context/AppContext';
import { Truck, Shield, User, RefreshCw, Database, LogOut } from 'lucide-react';

export default function Navbar() {
  const { currentUser, users, setCurrentUser, logout, resetToFactoryData, dbConnected, loading, reloadFromDB } = useApp();

  const handleUserChange = (e) => {
    const selected = users.find(u => u.id === e.target.value);
    if (selected) {
      setCurrentUser(selected);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge-purple';
      case 'manager': return 'badge-info';
      case 'chauffeur': return 'badge-success';
      default: return 'badge-info';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Manager Logistique';
      case 'chauffeur': return 'Chauffeur';
      default: return role || 'Utilisateur';
    }
  };

  return (
    <header className="navbar no-print">
      <div className="brand-section">
        <div className="brand-logo-badge">
          <Truck size={24} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="brand-title">
            EURL TRANSANIS
            <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              LOGISTIQUE ALGÉRIE
            </span>
          </h1>
          <p className="brand-subtitle">Gestion de Flotte, Commissions & Ordres de Mission</p>
        </div>
      </div>

      <div className="nav-actions">
        {/* Indicateur Base de Données SQLite */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${dbConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            fontSize: '0.78rem'
          }}
          title={dbConnected ? "Base de données SQLite connectée et opérationnelle" : "Connexion à la base de données..."}
        >
          <Database size={15} color={dbConnected ? '#10b981' : '#f87171'} />
          <span style={{ color: dbConnected ? '#34d399' : '#f87171', fontWeight: '700' }}>
            {dbConnected ? 'SQLite DB Connectée' : 'Connexion DB...'}
          </span>
          <span 
            style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: dbConnected ? '#10b981' : '#ef4444',
              boxShadow: dbConnected ? '0 0 8px #10b981' : 'none'
            }} 
          />
        </div>

        {/* Profil de l'utilisateur actif */}
        {currentUser && (
          <div className="role-switcher-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} color="var(--accent-sky)" />
              <span className="role-switcher-label">Compte :</span>
            </div>
            <select 
              className="role-select"
              value={currentUser.id}
              onChange={handleUserChange}
              title="Changer d'utilisateur connecté"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nom} ({getRoleLabel(u.role)})
                </option>
              ))}
            </select>
            <span className={`badge ${getRoleBadgeClass(currentUser.role)}`} style={{ fontSize: '0.7rem' }}>
              {getRoleLabel(currentUser.role)}
            </span>
          </div>
        )}

        {/* Bouton rafraîchir données */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={reloadFromDB}
          title="Recharger toutes les données depuis la base SQLite"
          style={{ padding: '6px 10px' }}
        >
          <RefreshCw size={13} className={loading ? 'spinning' : ''} />
        </button>

        {/* Bouton de réinitialisation usine (Admin) */}
        {currentUser?.role === 'admin' && (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={resetToFactoryData}
            title="Réinitialiser la base SQLite aux valeurs d'origine du fichier CSV"
            style={{ fontSize: '0.75rem' }}
          >
            Reset CSV
          </button>
        )}

        {/* Bouton DÉCONNEXION */}
        <button
          className="btn btn-danger btn-sm"
          onClick={logout}
          title="Se déconnecter de votre compte"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <LogOut size={14} />
          <span>Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
