import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  TrendingUp,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MapPin,
  ArrowRight,
  Plus
} from 'lucide-react';
import { ALGERIA_HUBS, getEstimatedDistance } from '../data/algeriaDistances';
import { calculatePricingForDistance } from '../data/initialData';

export default function Dashboard({ onNavigateToNewMission, onSelectMissionForPrint }) {
  const { missions, camions, pricingRules, updateMissionDeliveryStatus, updateMissionPaymentStatus } = useApp();

  // Simulateur rapide de commission
  const [simOrigine, setSimOrigine] = useState('Annaba (Siège EURL TRANSANIS)');
  const [simDestination, setSimDestination] = useState('Alger (Zone Industrielle Rouiba)');
  const [simDistance, setSimDistance] = useState(() => getEstimatedDistance('Annaba (Siège EURL TRANSANIS)', 'Alger (Zone Industrielle Rouiba)'));

  const handleOrigineChange = (val) => {
    setSimOrigine(val);
    const dist = getEstimatedDistance(val, simDestination);
    setSimDistance(dist);
  };

  const handleDestinationChange = (val) => {
    setSimDestination(val);
    const dist = getEstimatedDistance(simOrigine, val);
    setSimDistance(dist);
  };

  const simResult = calculatePricingForDistance(simDistance, pricingRules);

  // Calculs financiers globaux
  const totalCA = missions.reduce((sum, m) => sum + (Number(m.prixMissionDA) || 0), 0);
  const totalBenefice = missions.reduce((sum, m) => sum + (Number(m.beneficeNetDA) || 0), 0);

  const missionsEnRoute = missions.filter(m => m.statutMission === 'en_route');
  const missionsArrivees = missions.filter(m => m.statutMission === 'arrive');
  const missionsPlanifiees = missions.filter(m => m.statutMission === 'planifie');

  const montantPaye = missions
    .filter(m => m.statutPaiement === 'paye')
    .reduce((sum, m) => sum + (Number(m.prixMissionDA) || 0), 0);

  const montantFacture = missions
    .filter(m => m.statutPaiement === 'facture')
    .reduce((sum, m) => sum + (Number(m.prixMissionDA) || 0), 0);

  const montantNonPaye = missions
    .filter(m => m.statutPaiement === 'non_paye')
    .reduce((sum, m) => sum + (Number(m.prixMissionDA) || 0), 0);

  const formatDA = (val) => {
    return new Intl.NumberFormat('fr-DZ').format(val) + ' DA';
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <TrendingUp size={28} color="var(--accent-sky)" />
            Tableau de Bord & Activité
          </h2>
          <p className="page-description">
            Vue d'ensemble de la flotte EURL TRANSANIS, des expéditions de stock et des encaissements
          </p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={onNavigateToNewMission}>
            <Plus size={18} />
            Créer un Bon de Transport
          </button>
        </div>
      </div>

      {/* Cartes KPI Principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-title">Chiffre d'Affaires Total</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(2, 132, 199, 0.15)', color: 'var(--accent-sky)' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div className="stat-value">{formatDA(totalCA)}</div>
          <div className="stat-subtext">Sur {missions.length} missions enregistrées</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-title">Bénéfice Net Estimé</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-success)' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#34d399' }}>{formatDA(totalBenefice)}</div>
          <div className="stat-subtext">Marge après déduction des frais de route</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-title">Missions en Transit</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--status-warning)' }}>
              <Clock size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>{missionsEnRoute.length}</div>
          <div className="stat-subtext">
            {missionsArrivees.length} arrivées • {missionsPlanifiees.length} planifiées
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-title">État Flotte Tracteurs</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)' }}>
              <Truck size={22} />
            </div>
          </div>
          <div className="stat-value">
            {camions.filter(c => c.statut === 'disponible').length} / {camions.length}
          </div>
          <div className="stat-subtext">Camions disponibles en base</div>
        </div>
      </div>

      {/* Ventilation des Paiements & Encaissements */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '20px 24px',
        marginBottom: '28px'
      }}>
        <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={18} color="var(--accent-sky)" />
          Répartition des Encaissements & Facturation
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--status-success)', fontWeight: '700', textTransform: 'uppercase' }}>
              ✓ Payé / Encaissé
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
              {formatDA(montantPaye)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {missions.filter(m => m.statutPaiement === 'paye').length} missions réglées
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--status-purple)', fontWeight: '700', textTransform: 'uppercase' }}>
              📄 Facturé (En attente règlement)
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
              {formatDA(montantFacture)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {missions.filter(m => m.statutPaiement === 'facture').length} factures émises
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--status-danger)', fontWeight: '700', textTransform: 'uppercase' }}>
              ⏳ Non payé / Non facturé
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
              {formatDA(montantNonPaye)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {missions.filter(m => m.statutPaiement === 'non_paye').length} missions en attente
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Simulateur Tarifaire & Flotte Rapide */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '28px' }}>
        
        {/* Simulateur Rapide de Tarif par Commission Admin */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="var(--accent-sky)" />
              Simulateur de Tarification Kilométrique
            </h3>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
              Règles EURL TRANSANIS
            </span>
          </div>

          <div className="form-row" style={{ marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">Origine (Départ)</label>
              <select
                className="form-select"
                value={simOrigine}
                onChange={(e) => handleOrigineChange(e.target.value)}
              >
                {ALGERIA_HUBS.map(hub => (
                  <option key={hub.id} value={hub.name}>{hub.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Destination (Arrivée)</label>
              <select
                className="form-select"
                value={simDestination}
                onChange={(e) => handleDestinationChange(e.target.value)}
              >
                {ALGERIA_HUBS.map(hub => (
                  <option key={hub.id} value={hub.name}>{hub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Distance Routière (KM)</span>
              <span style={{ color: 'var(--accent-sky)', fontWeight: '700' }}>{simDistance} KM</span>
            </label>
            <input
              type="number"
              className="form-input"
              value={simDistance}
              min={1}
              onChange={(e) => setSimDistance(Number(e.target.value) || 0)}
            />
          </div>

          {/* Résultat du calcul */}
          <div className="calc-preview-box">
            <div>
              <div className="calc-preview-title">
                {simResult.ruleMatched?.titre || 'Commission calculée'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {simDistance < 20 ? 'Palier minimum garanti (<20km)' : `Tranche : ${simResult.ruleMatched?.minKm || 0} à ${simResult.ruleMatched?.maxKm || 1000} KM`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="calc-preview-amount">{formatDA(simResult.prixDA)}</div>
              <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
                Bénéfice estimé : {formatDA(simResult.beneficeDA)}
              </div>
            </div>
          </div>
        </div>

        {/* Aperçu rapide des camions et chauffeurs */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={20} color="var(--accent-sky)" />
            État Immédiat de la Flotte (10 TR)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '280px' }}>
            {camions.map(c => {
              const isEnMission = c.statut === 'en_mission';
              const hasDayDriver = !!c.chauffeurDuJourId;

              return (
                <div 
                  key={c.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--accent-sky)', width: '45px' }}>{c.code}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {c.matriculeCamion}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {hasDayDriver && (
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }} title={`Remplacement du jour : ${c.motifRemplacement}`}>
                        Remplacement
                      </span>
                    )}
                    <span className={`badge ${isEnMission ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>
                      {isEnMission ? 'En mission' : 'Disponible'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Derniers Ordres de Mission */}
      <div className="table-container">
        <div className="table-header-controls">
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Derniers Ordres de Mission Récents</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Accès rapide au suivi des livraisons et au statut de paiement
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>N° Bon</th>
                <th>Date</th>
                <th>Trajet & Distance</th>
                <th>Camion & Chauffeur</th>
                <th>Marchandise / Client</th>
                <th>Montant</th>
                <th>Statut Mission</th>
                <th>Paiement</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {missions.slice(0, 6).map(m => (
                <tr key={m.id}>
                  <td>
                    <span style={{ fontWeight: '700', color: 'var(--accent-sky)' }}>{m.numeroBon}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {m.dateDepart || m.dateCreation?.split('T')[0]}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{m.origine} → {m.destination}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.distanceKm} KM</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', color: '#fff' }}>{m.camionCode}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.chauffeurNom}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{m.typeMarchandise}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.client}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '800', color: '#fff' }}>{formatDA(m.prixMissionDA)}</div>
                    <div style={{ fontSize: '0.7rem', color: '#34d399' }}>Bénéfice : +{formatDA(m.beneficeNetDA)}</div>
                  </td>
                  <td>
                    {m.statutMission === 'en_route' && (
                      <span className="badge badge-warning">En Route</span>
                    )}
                    {m.statutMission === 'arrive' && (
                      <span className="badge badge-success">Arrivé / Livré</span>
                    )}
                    {m.statutMission === 'planifie' && (
                      <span className="badge badge-info">Planifié</span>
                    )}
                  </td>
                  <td>
                    {m.statutPaiement === 'paye' && (
                      <span className="badge badge-success">Payé</span>
                    )}
                    {m.statutPaiement === 'facture' && (
                      <span className="badge badge-purple">Facturé</span>
                    )}
                    {m.statutPaiement === 'non_paye' && (
                      <span className="badge badge-danger">Non payé</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {m.statutMission === 'en_route' && (
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => updateMissionDeliveryStatus(m.id, 'arrive')}
                          title="Marquer comme arrivé"
                        >
                          Arrivé
                        </button>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectMissionForPrint(m, 'bon')}
                        title="Imprimer le bon de transport officiel"
                      >
                        <FileText size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
