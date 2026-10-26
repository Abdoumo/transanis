import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Search,
  Plus,
  Phone,
  Truck,
  Edit2,
  Trash2,
  CheckCircle,
  FileCheck,
  UserPlus
} from 'lucide-react';

export default function ChauffeursList() {
  const { chauffeurs, camions, addChauffeur, updateChauffeur, deleteChauffeur, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChauffeur, setEditingChauffeur] = useState(null);

  // Form states
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [numPermis, setNumPermis] = useState('');
  const [wilayaResidence, setWilayaResidence] = useState('Annaba');
  const [statut, setStatut] = useState('actif');
  const [creerCompte, setCreerCompte] = useState(true);

  const openAddModal = () => {
    setEditingChauffeur(null);
    setNom('');
    setTelephone('');
    setNumPermis(`ALG-23/${Math.floor(100000 + Math.random() * 900000)}`);
    setWilayaResidence('Annaba');
    setStatut('actif');
    setCreerCompte(true);
    setIsModalOpen(true);
  };

  const openEditModal = (ch) => {
    setEditingChauffeur(ch);
    setNom(ch.nom);
    setTelephone(ch.telephone);
    setNumPermis(ch.numPermis || '');
    setWilayaResidence(ch.wilayaResidence || 'Annaba');
    setStatut(ch.statut || 'actif');
    setCreerCompte(false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      nom,
      telephone,
      numPermis,
      wilayaResidence,
      statut,
      creerCompte
    };

    if (editingChauffeur) {
      updateChauffeur(editingChauffeur.id, payload);
    } else {
      addChauffeur(payload);
    }

    setIsModalOpen(false);
  };

  const filteredChauffeurs = chauffeurs.filter(ch =>
    ch.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ch.telephone?.includes(searchTerm) ||
    ch.camionParDefaut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ch.wilayaResidence?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = currentUser.role === 'admin';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Users size={28} color="var(--accent-sky)" />
            Répertoire des Chauffeurs & Conducteurs
          </h2>
          <p className="page-description">
            Gestion du personnel roulant EURL TRANSANIS, coordonnées téléphoniques et affectations de véhicules
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Ajouter un Chauffeur
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="table-header-controls">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="table-search-input"
              placeholder="Rechercher par nom, téléphone, TR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Effectif total : <strong style={{ color: '#fff' }}>{chauffeurs.length} chauffeurs</strong>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Nom & Prénom</th>
                <th>N° Téléphone</th>
                <th>Permis de Conduire</th>
                <th>Camion Titulaire</th>
                <th>Résidence</th>
                <th>Statut</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredChauffeurs.map(ch => {
                // Trouver le camion auquel il est actuellement assigné
                const assignedCamion = camions.find(c => c.chauffeurTitulaireId === ch.id || c.chauffeurDuJourId === ch.id);
                const isTempAssigned = camions.find(c => c.chauffeurDuJourId === ch.id);

                return (
                  <tr key={ch.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>{ch.nom}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {ch.id}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-sky)', fontWeight: '600' }}>
                        <Phone size={14} />
                        {ch.telephone}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {ch.numPermis || 'Poids lourd Cat. C/E'}
                    </td>
                    <td>
                      {assignedCamion ? (
                        <div>
                          <span style={{ fontWeight: '800', color: '#fff' }}>{assignedCamion.code}</span>
                          {isTempAssigned && (
                            <span className="badge badge-warning" style={{ fontSize: '0.65rem', marginLeft: '6px' }}>
                              Du Jour
                            </span>
                          )}
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {assignedCamion.matriculeCamion}
                          </div>
                        </div>
                      ) : (
                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                          Chauffeur de réserve
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {ch.wilayaResidence || 'Annaba'}
                    </td>
                    <td>
                      <span className={`badge ${ch.statut === 'actif' ? 'badge-success' : 'badge-danger'}`}>
                        {ch.statut === 'actif' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditModal(ch)}
                            title="Modifier ce chauffeur"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              if (window.confirm(`Supprimer le chauffeur ${ch.nom} ?`)) {
                                deleteChauffeur(ch.id);
                              }
                            }}
                            title="Supprimer ce chauffeur"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout / Modification Chauffeur */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingChauffeur ? `Modifier Chauffeur (${editingChauffeur.nom})` : 'Ajouter un Chauffeur'}
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nom & Prénom</label>
                  <input
                    type="text"
                    className="form-input"
                    value={nom}
                    placeholder="Ex: Leboukh Kamel"
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Numéro de Téléphone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={telephone}
                    placeholder="Ex: 06.67.05.66.67"
                    onChange={(e) => setTelephone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">N° Permis de Conduire</label>
                    <input
                      type="text"
                      className="form-input"
                      value={numPermis}
                      placeholder="Ex: ALG-23/048821"
                      onChange={(e) => setNumPermis(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Wilaya de Résidence</label>
                    <input
                      type="text"
                      className="form-input"
                      value={wilayaResidence}
                      onChange={(e) => setWilayaResidence(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Statut</label>
                  <select
                    className="form-select"
                    value={statut}
                    onChange={(e) => setStatut(e.target.value)}
                  >
                    <option value="actif">Actif (Disponible pour missions)</option>
                    <option value="en_conge">En Congé</option>
                    <option value="malade">Arrêt Maladie</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>

                {!editingChauffeur && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 'var(--radius-md)' }}>
                    <input
                      type="checkbox"
                      id="createAccountCheck"
                      checked={creerCompte}
                      onChange={(e) => setCreerCompte(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="createAccountCheck" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Créer automatiquement un compte utilisateur avec rôle "Chauffeur"
                    </label>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingChauffeur ? 'Enregistrer Modifications' : 'Ajouter le Chauffeur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
