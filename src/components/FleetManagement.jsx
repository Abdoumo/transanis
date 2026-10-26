import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  UserCheck,
  RotateCcw,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Phone,
  Edit2,
  Trash2,
  ShieldAlert
} from 'lucide-react';

export default function FleetManagement() {
  const {
    camions,
    chauffeurs,
    reassignChauffeur,
    resetChauffeurDuJour,
    getEffectiveChauffeurForCamion,
    addCamion,
    updateCamion,
    deleteCamion,
    currentUser
  } = useApp();

  const [selectedCamionForSwap, setSelectedCamionForSwap] = useState(null);
  const [swapType, setSwapType] = useState('temporary'); // 'temporary' | 'permanent'
  const [targetChauffeurId, setTargetChauffeurId] = useState('');
  const [swapMotif, setSwapMotif] = useState('');

  // Modal Ajout/Édition de Camion
  const [isCamionModalOpen, setIsCamionModalOpen] = useState(false);
  const [editingCamion, setEditingCamion] = useState(null);
  const [camionCode, setCamionCode] = useState('');
  const [matriculeCamion, setMatriculeCamion] = useState('');
  const [matriculeRemorque, setMatriculeRemorque] = useState('');
  const [chauffeurTitulaireId, setChauffeurTitulaireId] = useState('');
  const [marque, setMarque] = useState('Renault Trucks T-Range');
  const [chargeMaxTonnes, setChargeMaxTonnes] = useState(32);

  const openSwapModal = (camion, type = 'temporary') => {
    setSelectedCamionForSwap(camion);
    setSwapType(type);
    setTargetChauffeurId(type === 'temporary' ? (camion.chauffeurDuJourId || '') : camion.chauffeurTitulaireId);
    setSwapMotif(camion.motifRemplacement || '');
  };

  const handleSaveSwap = (e) => {
    e.preventDefault();
    if (!selectedCamionForSwap || !targetChauffeurId) return;

    const isTemporary = swapType === 'temporary';
    reassignChauffeur(
      selectedCamionForSwap.id,
      targetChauffeurId,
      isTemporary,
      swapMotif || (isTemporary ? 'Remplacement exceptionnel de la journée' : '')
    );

    setSelectedCamionForSwap(null);
  };

  const openAddCamionModal = () => {
    setEditingCamion(null);
    setCamionCode(`TR ${camions.length + 1}`);
    setMatriculeCamion('');
    setMatriculeRemorque('');
    setChauffeurTitulaireId(chauffeurs[0]?.id || '');
    setMarque('Renault Trucks T-Range');
    setChargeMaxTonnes(32);
    setIsCamionModalOpen(true);
  };

  const openEditCamionModal = (cam) => {
    setEditingCamion(cam);
    setCamionCode(cam.code);
    setMatriculeCamion(cam.matriculeCamion);
    setMatriculeRemorque(cam.matriculeRemorque);
    setChauffeurTitulaireId(cam.chauffeurTitulaireId);
    setMarque(cam.marque || 'Renault Trucks');
    setChargeMaxTonnes(cam.chargeMaxTonnes || 32);
    setIsCamionModalOpen(true);
  };

  const handleSaveCamion = (e) => {
    e.preventDefault();
    const payload = {
      code: camionCode,
      matriculeCamion,
      matriculeRemorque,
      chauffeurTitulaireId,
      marque,
      chargeMaxTonnes: Number(chargeMaxTonnes) || 30
    };

    if (editingCamion) {
      updateCamion(editingCamion.id, payload);
    } else {
      addCamion({
        ...payload,
        chauffeurDuJourId: null,
        motifRemplacement: ''
      });
    }

    setIsCamionModalOpen(false);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Truck size={28} color="var(--accent-sky)" />
            Parc & Flotte de Camions (EURL TRANSANIS)
          </h2>
          <p className="page-description">
            Association camions/chauffeurs, réaffectations de la journée et données d'immatriculation issues du CSV
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={openAddCamionModal}>
            <Plus size={18} />
            Ajouter un Camion
          </button>
        )}
      </div>

      {/* Bannière d'information Admin */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(2, 132, 199, 0.12) 0%, rgba(6, 182, 212, 0.05) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={22} color="var(--accent-sky)" />
          <div>
            <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>
              Gestion des Affectations Chauffeurs / Camions
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              En tant qu'administrateur, vous pouvez changer le chauffeur titulaire ou assigner un remplaçant temporaire pour la journée en cas d'imprévu.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>Total Flotte : <strong style={{ color: '#fff' }}>{camions.length} Tracteurs</strong></span>
          <span>•</span>
          <span>Disponibles : <strong style={{ color: '#34d399' }}>{camions.filter(c => c.statut === 'disponible').length}</strong></span>
          <span>•</span>
          <span>En Mission : <strong style={{ color: '#fbbf24' }}>{camions.filter(c => c.statut === 'en_mission').length}</strong></span>
        </div>
      </div>

      {/* Grid des Camions */}
      <div className="fleet-grid">
        {camions.map(cam => {
          const titulaire = chauffeurs.find(ch => ch.id === cam.chauffeurTitulaireId);
          const duJour = cam.chauffeurDuJourId ? chauffeurs.find(ch => ch.id === cam.chauffeurDuJourId) : null;
          const effectiveDriver = duJour || titulaire;
          const isEnMission = cam.statut === 'en_mission';

          return (
            <div key={cam.id} className="truck-card">
              {/* Carte Header */}
              <div className="truck-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    background: 'rgba(2, 132, 199, 0.15)',
                    color: 'var(--accent-sky)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '800',
                    fontSize: '1.2rem',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {cam.code}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cam.marque}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Charge max: {cam.chargeMaxTonnes}T</div>
                  </div>
                </div>

                <span className={`badge ${isEnMission ? 'badge-warning' : 'badge-success'}`}>
                  {isEnMission ? 'En Mission' : 'Disponible'}
                </span>
              </div>

              {/* Immatriculations Camion & Remorque issues du CSV */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Immat. Camion :</span>
                  <span style={{ fontWeight: '700', color: '#fff' }}>{cam.matriculeCamion}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Immat. Remorque :</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{cam.matriculeRemorque}</span>
                </div>
              </div>

              {/* Section Chauffeur Affecté */}
              <div className="truck-driver-section">
                {duJour ? (
                  // Remplacement temporaire du jour actif
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                        ⚠️ Remplacement du Jour
                      </span>
                      {isAdmin && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                          onClick={() => resetChauffeurDuJour(cam.id)}
                          title="Rétablir le chauffeur titulaire"
                        >
                          <RotateCcw size={12} />
                          Rétablir
                        </button>
                      )}
                    </div>
                    <div style={{ fontWeight: '800', color: '#fff', fontSize: '0.95rem' }}>
                      {duJour.nom}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-sky)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Phone size={12} /> {duJour.telephone}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                      Motif: {cam.motifRemplacement || 'Remplacement ponctuel'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      (Titulaire habituel : {titulaire?.nom})
                    </div>
                  </div>
                ) : (
                  // Chauffeur Titulaire Standard
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>
                      Chauffeur Titulaire Attitré
                    </div>
                    <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>
                      {titulaire ? titulaire.nom : 'Aucun chauffeur assigné'}
                    </div>
                    {titulaire && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-sky)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Phone size={12} /> {titulaire.telephone}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Admin pour ce camion */}
              {isAdmin && (
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '0.75rem' }}
                    onClick={() => openSwapModal(cam, 'temporary')}
                    title="Changer le chauffeur pour la journée"
                  >
                    <Calendar size={13} />
                    Changer pour la journée
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => openSwapModal(cam, 'permanent')}
                    title="Changer définitivement le chauffeur titulaire"
                  >
                    <UserCheck size={13} />
                    Titulaire
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditCamionModal(cam)}
                    title="Modifier données camion"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Changement Chauffeur (Journée ou Titulaire) */}
      {selectedCamionForSwap && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {swapType === 'temporary' 
                  ? `Changer le chauffeur du jour - ${selectedCamionForSwap.code}`
                  : `Modifier le chauffeur titulaire - ${selectedCamionForSwap.code}`}
              </h3>
            </div>

            <form onSubmit={handleSaveSwap}>
              <div className="modal-body">
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Camion : <strong style={{ color: '#fff' }}>{selectedCamionForSwap.code} ({selectedCamionForSwap.matriculeCamion})</strong>
                </div>

                <div className="form-group">
                  <label className="form-label">Type d'affectation</label>
                  <select
                    className="form-select"
                    value={swapType}
                    onChange={(e) => setSwapType(e.target.value)}
                  >
                    <option value="temporary">Remplacement Temporaire (Pour la journée / Mission)</option>
                    <option value="permanent">Changement Permanent (Nouveau Chauffeur Titulaire)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sélectionnez le Chauffeur</label>
                  <select
                    className="form-select"
                    value={targetChauffeurId}
                    onChange={(e) => setTargetChauffeurId(e.target.value)}
                    required
                  >
                    <option value="">-- Choisir un chauffeur --</option>
                    {chauffeurs.map(ch => (
                      <option key={ch.id} value={ch.id}>
                        {ch.nom} (Tél: {ch.telephone}) {ch.camionParDefaut ? `[Affecté à ${ch.camionParDefaut}]` : '[Chauffeur de Réserve]'}
                      </option>
                    ))}
                  </select>
                </div>

                {swapType === 'temporary' && (
                  <div className="form-group">
                    <label className="form-label">Motif du Remplacement du Jour</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Chauffeur habituel en congé maladie, mission urgente..."
                      value={swapMotif}
                      onChange={(e) => setSwapMotif(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedCamionForSwap(null)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmer Affectation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajout / Modification Camion */}
      {isCamionModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCamion ? `Modifier le Camion ${editingCamion.code}` : 'Ajouter un Nouveau Camion'}
              </h3>
            </div>

            <form onSubmit={handleSaveCamion}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Code Camion</label>
                    <input
                      type="text"
                      className="form-input"
                      value={camionCode}
                      onChange={(e) => setCamionCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Marque & Modèle</label>
                    <input
                      type="text"
                      className="form-input"
                      value={marque}
                      onChange={(e) => setMarque(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Immatriculation Camion</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: 500276.525.16 (287)"
                      value={matriculeCamion}
                      onChange={(e) => setMatriculeCamion(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Immatriculation Remorque</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: 500052.825.16"
                      value={matriculeRemorque}
                      onChange={(e) => setMatriculeRemorque(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Chauffeur Titulaire</label>
                    <select
                      className="form-select"
                      value={chauffeurTitulaireId}
                      onChange={(e) => setChauffeurTitulaireId(e.target.value)}
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

                  <div className="form-group">
                    <label className="form-label">Charge Max (Tonnes)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={chargeMaxTonnes}
                      onChange={(e) => setChargeMaxTonnes(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCamionModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Enregistrer Camion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
