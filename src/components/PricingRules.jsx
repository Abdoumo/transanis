import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calculator,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  HelpCircle,
  Info,
  DollarSign,
  MapPin,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { calculatePricingForDistance } from '../data/initialData';

export default function PricingRules() {
  const { pricingRules, addPricingRule, updatePricingRule, deletePricingRule, currentUser } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Form states
  const [titre, setTitre] = useState('');
  const [minKm, setMinKm] = useState(0);
  const [maxKm, setMaxKm] = useState(100);
  const [prixDA, setPrixDA] = useState(25000);
  const [fraisRouteEstimesDA, setFraisRouteEstimesDA] = useState(6000);
  const [description, setDescription] = useState('');

  // Simulateur de distance interactif
  const [testKm, setTestKm] = useState(650);

  const openAddModal = () => {
    setEditingRule(null);
    setTitre('');
    setMinKm(0);
    setMaxKm(100);
    setPrixDA(25000);
    setFraisRouteEstimesDA(7000);
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setTitre(rule.titre);
    setMinKm(rule.minKm);
    setMaxKm(rule.maxKm);
    setPrixDA(rule.prixDA);
    setFraisRouteEstimesDA(rule.fraisRouteEstimesDA || Math.round(rule.prixDA * 0.3));
    setDescription(rule.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      titre: titre || `Palier de ${minKm} à ${maxKm} KM`,
      minKm: Number(minKm),
      maxKm: Number(maxKm),
      prixDA: Number(prixDA),
      mode: 'fixe',
      fraisRouteEstimesDA: Number(fraisRouteEstimesDA) || Math.round(Number(prixDA) * 0.3),
      description
    };

    if (editingRule) {
      updatePricingRule(editingRule.id, payload);
    } else {
      addPricingRule(payload);
    }

    setIsModalOpen(false);
  };

  const formatDA = (val) => {
    return new Intl.NumberFormat('fr-DZ').format(val || 0) + ' DA';
  };

  const simulatedResult = calculatePricingForDistance(testKm, pricingRules);
  const isAdmin = currentUser.role === 'admin';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Calculator size={28} color="var(--accent-sky)" />
            Grille Tarifaire & Commission Kilométrique (Admin)
          </h2>
          <p className="page-description">
            Configuration des paliers kilométriques : calcul automatique du prix de transfert de stock et des commissions
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Ajouter un Palier Kilométrique
          </button>
        )}
      </div>

      {/* Explication concrète des règles de l'entreprise */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '20px 24px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: 'var(--accent-sky)',
            padding: '10px',
            borderRadius: 'var(--radius-md)'
          }}>
            <Info size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '6px' }}>
              Comment fonctionne la tarification EURL TRANSANIS ?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              L'administrateur définit les fourchettes kilométriques et le montant applicable. Lorsqu'un manager crée un ordre de mission (ex: <strong>Annaba vers Alger = ~600 km</strong>), le système sélectionne automatiquement la règle correspondante (<strong>entre 600 et 800 km = 60 000 DA</strong>).
              Pour tout trajet court de <strong>moins de 20 km</strong>, le tarif minimum garanti de <strong>20 000 DA</strong> s'applique automatiquement pour amortir le déplacement du camion.
            </p>
          </div>
        </div>
      </div>

      {/* Simulateur en direct */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(20, 30, 51, 0.9) 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={20} color="var(--accent-sky)" />
          Testeur & Simulateur en Temps Réel
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'center' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Entrez une distance à tester (KM) :
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                className="form-input"
                style={{ fontSize: '1.2rem', fontWeight: '700' }}
                value={testKm}
                min={0}
                onChange={(e) => setTestKm(Number(e.target.value) || 0)}
              />
              <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>KM</span>
            </div>
            
            {/* Raccourcis de distances courantes */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setTestKm(15)}
                style={{ fontSize: '0.7rem', padding: '3px 8px' }}
              >
                Local (&lt;20km)
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setTestKm(105)}
                style={{ fontSize: '0.7rem', padding: '3px 8px' }}
              >
                Skikda (105km)
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setTestKm(600)}
                style={{ fontSize: '0.7rem', padding: '3px 8px' }}
              >
                Alger (600km)
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setTestKm(980)}
                style={{ fontSize: '0.7rem', padding: '3px 8px' }}
              >
                Oran (980km)
              </button>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '18px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Règle Déclenchée
              </span>
              <div style={{ fontWeight: '700', color: 'var(--accent-sky)', fontSize: '0.95rem', marginTop: '2px' }}>
                {simulatedResult.ruleMatched?.titre || 'Règle par défaut'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Pour {testKm} kilomètres
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Prix de Mission (Total)
              </span>
              <div style={{ fontWeight: '800', color: '#fff', fontSize: '1.4rem', fontFamily: 'var(--font-heading)' }}>
                {formatDA(simulatedResult.prixDA)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Facturé au client
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                Bénéfice Net Estimé
              </span>
              <div style={{ fontWeight: '800', color: '#34d399', fontSize: '1.4rem', fontFamily: 'var(--font-heading)' }}>
                +{formatDA(simulatedResult.beneficeDA)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Frais route: {formatDA(simulatedResult.fraisRouteDA)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des Paliers & Règles de l'Admin */}
      <div className="table-container">
        <div className="table-header-controls">
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Grille Officielle des Paliers de Distance</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {pricingRules.length} tranches actives dans le barème de transport EURL TRANSANIS
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Intitulé du Palier</th>
                <th>Distance Min (KM)</th>
                <th>Distance Max (KM)</th>
                <th>Prix Mission (Commission DA)</th>
                <th>Frais de Route Estimés</th>
                <th>Marge Nette Estimée</th>
                <th>Remarques & Exemples</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {pricingRules.map((rule, idx) => {
                const benefice = rule.prixDA - (rule.fraisRouteEstimesDA || Math.round(rule.prixDA * 0.3));

                return (
                  <tr key={rule.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#fff' }}>{rule.titre}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {rule.id}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{rule.minKm} KM</span>
                    </td>
                    <td>
                      <span className="badge badge-info">{rule.maxKm} KM</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--accent-sky)' }}>
                        {formatDA(rule.prixDA)}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {formatDA(rule.fraisRouteEstimesDA || Math.round(rule.prixDA * 0.3))}
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: '#34d399' }}>
                        +{formatDA(benefice)}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                      {rule.description || 'Barème régulier'}
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditModal(rule)}
                            title="Modifier ce palier"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              if (window.confirm(`Supprimer le palier "${rule.titre}" ?`)) {
                                deletePricingRule(rule.id);
                              }
                            }}
                            title="Supprimer ce palier"
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

      {/* Modal Ajout / Modification Règle */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingRule ? `Modifier Palier (${editingRule.titre})` : 'Ajouter un Palier Kilométrique'}
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Titre / Intitulé du Palier</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Entre 600 et 800 km (Liaison Alger)"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Distance Minimale (KM)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={minKm}
                      min={0}
                      onChange={(e) => setMinKm(Number(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Distance Maximale (KM)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={maxKm}
                      min={1}
                      onChange={(e) => setMaxKm(Number(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prix de la Mission / Commission (DA)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Ex: 60000"
                      value={prixDA}
                      min={1000}
                      onChange={(e) => setPrixDA(Number(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Frais de Route Estimés (DA)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Ex: 18000"
                      value={fraisRouteEstimesDA}
                      min={0}
                      onChange={(e) => setFraisRouteEstimesDA(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description ou Exemples de Trajets</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Ex: Annaba vers Alger (~600km) ou Hassi Messaoud (~780km)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRule ? 'Enregistrer Modifications' : 'Ajouter le Palier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
