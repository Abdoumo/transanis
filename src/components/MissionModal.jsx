import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calculator, Truck, MapPin, Package, Calendar, Check } from 'lucide-react';
import { ALGERIA_HUBS, getEstimatedDistance } from '../data/algeriaDistances';
import { calculatePricingForDistance } from '../data/initialData';

export default function MissionModal({ missionToEdit, isOpen, onClose }) {
  const { camions, chauffeurs, pricingRules, addMission, updateMission, getEffectiveChauffeurForCamion } = useApp();

  const [origine, setOrigine] = useState('Annaba (Siège EURL TRANSANIS)');
  const [destination, setDestination] = useState('Alger (Zone Industrielle Rouiba)');
  const [distanceKm, setDistanceKm] = useState(600);
  const [camionId, setCamionId] = useState('');
  const [chauffeurId, setChauffeurId] = useState('');
  const [typeMarchandise, setTypeMarchandise] = useState('Ronds à béton & Profilés Acier');
  const [poidsTonnes, setPoidsTonnes] = useState(28);
  const [client, setClient] = useState('');
  const [clientTel, setClientTel] = useState('');
  const [clientAdresse, setClientAdresse] = useState('');
  const [dateDepart, setDateDepart] = useState(new Date().toISOString().split('T')[0]);
  const [dateArriveePrevue, setDateArriveePrevue] = useState(new Date().toISOString().split('T')[0]);
  const [statutMission, setStatutMission] = useState('en_route');
  const [statutPaiement, setStatutPaiement] = useState('non_paye');
  const [modePaiement, setModePaiement] = useState('En attente');
  const [customPrixDA, setCustomPrixDA] = useState('');
  const [customFraisDA, setCustomFraisDA] = useState('');

  // Initialisation ou chargement si édition
  useEffect(() => {
    if (missionToEdit) {
      setOrigine(missionToEdit.origine || 'Annaba (Siège EURL TRANSANIS)');
      setDestination(missionToEdit.destination || 'Alger (Zone Industrielle Rouiba)');
      setDistanceKm(missionToEdit.distanceKm || 600);
      setCamionId(missionToEdit.camionId || '');
      setChauffeurId(missionToEdit.chauffeurId || '');
      setTypeMarchandise(missionToEdit.typeMarchandise || '');
      setPoidsTonnes(missionToEdit.poidsTonnes || 25);
      setClient(missionToEdit.client || '');
      setClientTel(missionToEdit.clientTel || '');
      setClientAdresse(missionToEdit.clientAdresse || '');
      setDateDepart(missionToEdit.dateDepart || new Date().toISOString().split('T')[0]);
      setDateArriveePrevue(missionToEdit.dateArriveePrevue || new Date().toISOString().split('T')[0]);
      setStatutMission(missionToEdit.statutMission || 'en_route');
      setStatutPaiement(missionToEdit.statutPaiement || 'non_paye');
      setModePaiement(missionToEdit.modePaiement || 'En attente');
      setCustomPrixDA(missionToEdit.prixMissionDA || '');
      setCustomFraisDA(missionToEdit.fraisRouteDA || '');
    } else {
      // Nouveau bon : sélectionner le premier camion disponible
      const dispo = camions.find(c => c.statut === 'disponible') || camions[0];
      if (dispo) {
        setCamionId(dispo.id);
        const driver = getEffectiveChauffeurForCamion(dispo);
        if (driver) setChauffeurId(driver.id);
      }
      setDistanceKm(getEstimatedDistance('Annaba (Siège EURL TRANSANIS)', 'Alger (Zone Industrielle Rouiba)'));
    }
  }, [missionToEdit, isOpen]);

  // Quand le camion change, mettre à jour automatiquement le chauffeur affecté
  const handleCamionChange = (newCamId) => {
    setCamionId(newCamId);
    const selectedCam = camions.find(c => c.id === newCamId);
    if (selectedCam) {
      const driver = getEffectiveChauffeurForCamion(selectedCam);
      if (driver) {
        setChauffeurId(driver.id);
      }
    }
  };

  // Quand les villes changent, recalculer la distance estimée
  const handleOrigineSelect = (val) => {
    setOrigine(val);
    const d = getEstimatedDistance(val, destination);
    setDistanceKm(d);
  };

  const handleDestinationSelect = (val) => {
    setDestination(val);
    const d = getEstimatedDistance(origine, val);
    setDistanceKm(d);
  };

  // Calcul du tarif automatique basé sur la grille admin
  const pricingAuto = calculatePricingForDistance(distanceKm, pricingRules);

  const finalPrixDA = customPrixDA !== '' ? Number(customPrixDA) : pricingAuto.prixDA;
  const finalFraisDA = customFraisDA !== '' ? Number(customFraisDA) : pricingAuto.fraisRouteDA;
  const finalBeneficeDA = finalPrixDA - finalFraisDA;

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedCam = camions.find(c => c.id === camionId);
    const selectedChauffeur = chauffeurs.find(ch => ch.id === chauffeurId);

    const missionPayload = {
      origine,
      destination,
      distanceKm: Number(distanceKm) || 0,
      camionId,
      camionCode: selectedCam ? selectedCam.code : 'TR',
      matriculeCamion: selectedCam ? selectedCam.matriculeCamion : '',
      matriculeRemorque: selectedCam ? selectedCam.matriculeRemorque : '',
      chauffeurId,
      chauffeurNom: selectedChauffeur ? selectedChauffeur.nom : 'Non assigné',
      chauffeurTel: selectedChauffeur ? selectedChauffeur.telephone : '',
      typeMarchandise,
      poidsTonnes: Number(poidsTonnes) || 0,
      client: client || 'Client Divers',
      clientTel,
      clientAdresse,
      dateDepart,
      dateArriveePrevue,
      statutMission,
      statutPaiement,
      modePaiement,
      prixMissionDA: finalPrixDA,
      fraisRouteDA: finalFraisDA,
      beneficeNetDA: finalBeneficeDA
    };

    if (missionToEdit) {
      updateMission(missionToEdit.id, missionPayload);
    } else {
      addMission(missionPayload);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '750px' }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={22} color="var(--accent-sky)" />
            {missionToEdit ? `Modifier Ordre de Mission (${missionToEdit.numeroBon})` : 'Créer un Ordre de Mission (Bon de Transport)'}
          </h3>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Origine & Destination */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Origine (Départ du Stock)</label>
                <select 
                  className="form-select"
                  value={origine}
                  onChange={(e) => handleOrigineSelect(e.target.value)}
                  required
                >
                  {ALGERIA_HUBS.map(h => (
                    <option key={`orig-${h.id}`} value={h.name}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Destination (Lieu de Livraison)</label>
                <select 
                  className="form-select"
                  value={destination}
                  onChange={(e) => handleDestinationSelect(e.target.value)}
                  required
                >
                  {ALGERIA_HUBS.map(h => (
                    <option key={`dest-${h.id}`} value={h.name}>{h.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Distance & Calcul de Commission automatique */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Distance Kilométrique Calculée (KM)</span>
                <span style={{ color: 'var(--accent-sky)', fontWeight: '700' }}>{distanceKm} KM</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={distanceKm}
                min={1}
                onChange={(e) => setDistanceKm(Number(e.target.value) || 0)}
                required
              />
            </div>

            {/* Encadré dynamique de la Commission Admin */}
            <div className="calc-preview-box">
              <div>
                <div className="calc-preview-title">
                  Tarification Automatique EURL TRANSANIS
                </div>
                <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '2px', fontWeight: '600' }}>
                  {pricingAuto.ruleMatched?.titre || 'Règle kilométrique appliquée'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {distanceKm < 20 ? 'Règle spéciale : Moins de 20 km = 20 000 DA minimum' : `Tranche : ${pricingAuto.ruleMatched?.minKm || 0} à ${pricingAuto.ruleMatched?.maxKm || 1000} km`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="calc-preview-amount">
                  {new Intl.NumberFormat('fr-DZ').format(finalPrixDA)} DA
                </div>
                <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '600' }}>
                  Bénéfice estimé : +{new Intl.NumberFormat('fr-DZ').format(finalBeneficeDA)} DA
                </div>
              </div>
            </div>

            {/* Camion & Chauffeur */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sélection du Camion Tracteur</label>
                <select 
                  className="form-select"
                  value={camionId}
                  onChange={(e) => handleCamionChange(e.target.value)}
                  required
                >
                  <option value="">-- Choisir un camion --</option>
                  {camions.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.matriculeCamion} ({c.statut === 'disponible' ? 'Disponible' : 'En mission'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Chauffeur Affecté à la Mission</label>
                <select 
                  className="form-select"
                  value={chauffeurId}
                  onChange={(e) => setChauffeurId(e.target.value)}
                  required
                >
                  <option value="">-- Choisir un chauffeur --</option>
                  {chauffeurs.map(ch => (
                    <option key={ch.id} value={ch.id}>
                      {ch.nom} (Tél: {ch.telephone}) {ch.camionParDefaut ? `[${ch.camionParDefaut}]` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Marchandise & Client */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nature du Stock / Marchandise</label>
                <input
                  type="text"
                  className="form-input"
                  value={typeMarchandise}
                  placeholder="Ex: Ronds à béton, Palettes agroalimentaires, Ciment..."
                  onChange={(e) => setTypeMarchandise(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Poids Chargé (Tonnes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={poidsTonnes}
                  min={1}
                  max={45}
                  onChange={(e) => setPoidsTonnes(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Client / Entreprise Destinataire</label>
                <input
                  type="text"
                  className="form-input"
                  value={client}
                  placeholder="Ex: SARL METALLURGIE ROUIBA"
                  onChange={(e) => setClient(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Téléphone Contact Client</label>
                <input
                  type="text"
                  className="form-input"
                  value={clientTel}
                  placeholder="Ex: 023.85.12.30"
                  onChange={(e) => setClientTel(e.target.value)}
                />
              </div>
            </div>

            {/* Dates & Statuts */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date de Départ</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateDepart}
                  onChange={(e) => setDateDepart(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Statut de la Mission</label>
                <select
                  className="form-select"
                  value={statutMission}
                  onChange={(e) => setStatutMission(e.target.value)}
                >
                  <option value="en_route">En route (En transit)</option>
                  <option value="arrive">Arrivé / Livré</option>
                  <option value="planifie">Planifié</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>
            </div>

            {/* Statut Paiement / Facturation */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Statut Paiement / Facturation</label>
                <select
                  className="form-select"
                  value={statutPaiement}
                  onChange={(e) => setStatutPaiement(e.target.value)}
                  style={{
                    fontWeight: '700',
                    color: statutPaiement === 'paye' ? '#10b981' : statutPaiement === 'facture' ? '#8b5cf6' : '#ef4444'
                  }}
                >
                  <option value="non_paye">⏳ Non payé (En attente)</option>
                  <option value="paye">✓ Payé (Encaissé)</option>
                  <option value="facture">📄 Facturé (Facture émise)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Mode de Règlement</label>
                <select
                  className="form-select"
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value)}
                >
                  <option value="En attente">En attente</option>
                  <option value="Virement bancaire">Virement bancaire</option>
                  <option value="Chèque de banque">Chèque de banque</option>
                  <option value="Espèces">Espèces (Contre reçu)</option>
                  <option value="Traite commerciale">Traite commerciale (30j)</option>
                </select>
              </div>
            </div>

            {/* Dérogation Prix si accord spécifique */}
            <div style={{ marginTop: '6px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Ajustement manuel du montant (facultatif si dérogation accordée par la Direction) :
              </div>
              <div className="form-row">
                <input
                  type="number"
                  className="form-input"
                  placeholder={`Prix mission DA (Par défaut: ${pricingAuto.prixDA})`}
                  value={customPrixDA}
                  onChange={(e) => setCustomPrixDA(e.target.value)}
                />
                <input
                  type="number"
                  className="form-input"
                  placeholder={`Frais de route DA (Par défaut: ${pricingAuto.fraisRouteDA})`}
                  value={customFraisDA}
                  onChange={(e) => setCustomFraisDA(e.target.value)}
                />
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={18} />
              {missionToEdit ? 'Enregistrer Modifications' : 'Valider & Émettre l\'Ordre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
