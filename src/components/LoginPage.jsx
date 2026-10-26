import React, { useState } from 'react';
import { Truck, Lock, Mail, Eye, EyeOff, Shield, Briefcase, ArrowRight, AlertCircle, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { login, dbConnected } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Veuillez saisir votre email et votre mot de passe.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      await login(email, password);
    } catch (err) {
      setErrorMessage(err.message || 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setErrorMessage('');
    try {
      setLoading(true);
      await login(quickEmail, quickPassword);
    } catch (err) {
      setErrorMessage(err.message || 'Erreur lors de la connexion rapide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 20%, #172554 0%, #0a0f1d 75%)',
      position: 'relative'
    }}>
      {/* Glow décoratif en arrière-plan */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '350px',
        background: 'rgba(56, 189, 248, 0.12)',
        filter: 'blur(120px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '460px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* En-tête / Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            color: '#fff',
            boxShadow: '0 8px 25px rgba(2, 132, 199, 0.45)',
            marginBottom: '16px'
          }}>
            <Truck size={34} strokeWidth={2.3} />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            EURL TRANSANIS
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Portail Logistique & Gestion de Flotte Algérie
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.75rem', color: dbConnected ? '#34d399' : '#f87171' }}>
            <Database size={13} />
            <span>{dbConnected ? 'Serveur SQLite Connecté' : 'Connexion au serveur SQLite...'}</span>
          </div>
        </div>

        {/* Carte de Connexion */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-lg), 0 0 35px rgba(2, 132, 199, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
            Connexion à votre espace
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '22px' }}>
            Accédez à vos ordres de mission, tarification et suivi des camions
          </p>

          {/* Message d'erreur */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '18px'
            }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Champ Email */}
            <div className="form-group">
              <label className="form-label">Adresse Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '40px', width: '100%' }}
                  placeholder="nom@transanis.dz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Champ Mot de Passe */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Mot de Passe</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px', width: '100%' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                  title={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Bouton de Soumission */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem', marginTop: '6px' }}
              disabled={loading}
            >
              {loading ? (
                <span>Connexion en cours...</span>
              ) : (
                <>
                  <span>Se Connecter</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Séparateur pour accès direct de démonstration */}
          <div style={{
            position: 'relative',
            textAlign: 'center',
            margin: '26px 0 18px 0',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <span style={{
              position: 'relative',
              top: '-10px',
              background: 'var(--bg-card)',
              padding: '0 12px',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: '700',
              letterSpacing: '0.05em'
            }}>
              Accès Rapide Démo (1 Clic)
            </span>
          </div>

          {/* Boutons d'accès rapide aux rôles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('admin@transanis.dz', 'admin123')}
              style={{ justifyContent: 'space-between', padding: '8px 12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={15} color="var(--status-purple)" />
                <span style={{ fontWeight: '700', color: '#fff' }}>Compte Administrateur</span>
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>admin@transanis.dz</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('brahim.logistique@transanis.dz', 'manager123')}
              style={{ justifyContent: 'space-between', padding: '8px 12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={15} color="var(--accent-sky)" />
                <span style={{ fontWeight: '700', color: '#fff' }}>Compte Manager Logistique</span>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>brahim.logistique@...</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('kamel.leboukh@transanis.dz', 'chauffeur123')}
              style={{ justifyContent: 'space-between', padding: '8px 12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={15} color="var(--status-success)" />
                <span style={{ fontWeight: '700', color: '#fff' }}>Compte Chauffeur (TR 1)</span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>kamel.leboukh@...</span>
            </button>
          </div>
        </div>

        {/* Pied de page */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          EURL TRANSANIS • Siège Social : Annaba, Algérie • Flotte 10 TR
        </div>
      </div>
    </div>
  );
}
