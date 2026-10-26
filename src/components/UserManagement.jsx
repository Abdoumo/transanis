import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Briefcase,
  Truck,
  Mail,
  Phone,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function UserManagement() {
  const { users, addUser, updateUser, deleteUser, chauffeurs, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState('manager');
  const [telephone, setTelephone] = useState('');
  const [chauffeurId, setChauffeurId] = useState('');
  const [actif, setActif] = useState(true);

  const openAddModal = () => {
    setEditingUser(null);
    setNom('');
    setEmail('');
    setPassword('123456');
    setRole('manager');
    setTelephone('');
    setChauffeurId('');
    setActif(true);
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setNom(u.nom);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setTelephone(u.telephone || '');
    setChauffeurId(u.chauffeurId || '');
    setActif(u.actif !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      nom,
      email,
      password: password || undefined,
      role,
      telephone,
      chauffeurId: role === 'chauffeur' ? chauffeurId : null,
      actif
    };

    if (editingUser) {
      updateUser(editingUser.id, payload);
    } else {
      addUser(payload);
    }

    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(u =>
    u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.telephone?.includes(searchTerm)
  );

  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case 'admin': return <Shield size={16} color="var(--status-purple)" />;
      case 'manager': return <Briefcase size={16} color="var(--accent-sky)" />;
      case 'chauffeur': return <Truck size={16} color="var(--status-success)" />;
      default: return <UserCheck size={16} />;
    }
  };

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'admin': return <span className="badge badge-purple">Administrateur</span>;
      case 'manager': return <span className="badge badge-info">Manager Logistique</span>;
      case 'chauffeur': return <span className="badge badge-success">Chauffeur</span>;
      default: return <span className="badge badge-info">{roleName}</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <UserCheck size={28} color="var(--accent-sky)" />
            Comptes Utilisateurs & Droits d'Accès (CRUD)
          </h2>
          <p className="page-description">
            Gestion complète des accès pour Administrateurs, Managers d'expéditions et Chauffeurs
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Créer un Utilisateur
        </button>
      </div>

      {/* Description des Rôles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Shield size={18} color="var(--status-purple)" />
            <strong style={{ color: '#fff' }}>Rôle Administrateur</strong>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Définition de la grille de commission par distance (ex: 600-800km = 60000DA), réaffectation des chauffeurs (du jour ou permanents), création de comptes et contrôle financier.
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Briefcase size={18} color="var(--accent-sky)" />
            <strong style={{ color: '#fff' }}>Rôle Manager Logistique</strong>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Émission des ordres de mission (D'où vers où va le camion), suivi de l'avancement, pointage des camions arrivés et mise à jour des paiements (Payé / Non payé / Facturé).
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Truck size={18} color="var(--status-success)" />
            <strong style={{ color: '#fff' }}>Rôle Chauffeur</strong>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Consultation de la feuille de route, des détails du camion tracteur affecté, des adresses de livraison du stock et confirmation d'arrivée.
          </p>
        </div>
      </div>

      {/* Table des Utilisateurs */}
      <div className="table-container">
        <div className="table-header-controls">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="table-search-input"
              placeholder="Rechercher utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Total comptes : <strong style={{ color: '#fff' }}>{users.length}</strong>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle Attribué</th>
                <th>Profil Chauffeur Lié</th>
                <th>État du Compte</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const linkedChauffeur = u.chauffeurId ? chauffeurs.find(ch => ch.id === u.chauffeurId) : null;
                const isCurrent = u.id === currentUser.id;

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: 'var(--accent-sky)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800'
                        }}>
                          {u.avatar || u.nom.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#fff' }}>
                            {u.nom} {isCurrent && <span style={{ fontSize: '0.7rem', color: 'var(--accent-sky)' }}>(Vous)</span>}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <Mail size={14} color="var(--text-muted)" />
                        {u.email}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {u.telephone ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} color="var(--accent-sky)" />
                          {u.telephone}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getRoleIcon(u.role)}
                        {getRoleBadge(u.role)}
                      </div>
                    </td>
                    <td>
                      {linkedChauffeur ? (
                        <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600' }}>
                          {linkedChauffeur.nom} ({linkedChauffeur.camionParDefaut || 'Réserve'})
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Non applicable</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${u.actif !== false ? 'badge-success' : 'badge-danger'}`}>
                        {u.actif !== false ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(u)}
                          title="Modifier utilisateur"
                        >
                          <Edit2 size={14} />
                        </button>
                        {!isCurrent && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              if (window.confirm(`Supprimer le compte de ${u.nom} ?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            title="Supprimer utilisateur"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout / Modification Utilisateur */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingUser ? `Modifier Utilisateur (${editingUser.nom})` : 'Créer un Compte Utilisateur'}
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nom Complet</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Anis Meziani"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse Email Professionnelle</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Ex: manager@transanis.dz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {editingUser ? 'Nouveau Mot de Passe (laisser vide pour ne pas changer)' : 'Mot de Passe Initial'}
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder={editingUser ? '••••••••' : 'Par défaut: 123456'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Rôle & Droits</label>
                    <select
                      className="form-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="manager">Manager (Création ordres & expéditions)</option>
                      <option value="admin">Administrateur (Contrôle total & commissions)</option>
                      <option value="chauffeur">Chauffeur (Accès feuille de route)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: 05.50.12.34.56"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                    />
                  </div>
                </div>

                {role === 'chauffeur' && (
                  <div className="form-group">
                    <label className="form-label">Associer à une fiche Chauffeur existante</label>
                    <select
                      className="form-select"
                      value={chauffeurId}
                      onChange={(e) => setChauffeurId(e.target.value)}
                      required
                    >
                      <option value="">-- Sélectionner chauffeur --</option>
                      {chauffeurs.map(ch => (
                        <option key={ch.id} value={ch.id}>
                          {ch.nom} (Tél: {ch.telephone})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Statut du Compte</label>
                  <select
                    className="form-select"
                    value={actif ? 'true' : 'false'}
                    onChange={(e) => setActif(e.target.value === 'true')}
                  >
                    <option value="true">Actif (Accès autorisé)</option>
                    <option value="false">Désactivé</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Enregistrer Modifications' : 'Créer l\'Accès'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
