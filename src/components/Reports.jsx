import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Truck,
  Users,
  Award,
  Calendar,
  CheckCircle2,
  Download
} from 'lucide-react';

export default function Reports() {
  const { missions, camions, chauffeurs } = useApp();

  const totalCA = missions.reduce((sum, m) => sum + (Number(m.prixMissionDA) || 0), 0);
  const totalFrais = missions.reduce((sum, m) => sum + (Number(m.fraisRouteDA) || 0), 0);
  const totalBenefice = missions.reduce((sum, m) => sum + (Number(m.beneficeNetDA) || 0), 0);
  const totalKm = missions.reduce((sum, m) => sum + (Number(m.distanceKm) || 0), 0);

  const margeMoyennePct = totalCA > 0 ? Math.round((totalBenefice / totalCA) * 100) : 0;

  const formatDA = (val) => {
    return new Intl.NumberFormat('fr-DZ').format(val || 0) + ' DA';
  };

  // Agrégation des performances par camion
  const camionsStats = camions.map(c => {
    const camMissions = missions.filter(m => m.camionId === c.id || m.camionCode === c.code);
    const ca = camMissions.reduce((sum, m) => sum + (Number(m.prixMissionDA) || 0), 0);
    const benefice = camMissions.reduce((sum, m) => sum + (Number(m.beneficeNetDA) || 0), 0);
    const km = camMissions.reduce((sum, m) => sum + (Number(m.distanceKm) || 0), 0);

    return {
      camion: c,
      totalMissions: camMissions.length,
      ca,
      benefice,
      km,
      titulaireNom: chauffeurs.find(ch => ch.id === c.chauffeurTitulaireId)?.nom || 'N/A'
    };
  }).sort((a, b) => b.ca - a.ca);

  // Agrégation par statut de paiement
  const statsPaiement = {
    paye: missions.filter(m => m.statutPaiement === 'paye'),
    facture: missions.filter(m => m.statutPaiement === 'facture'),
    non_paye: missions.filter(m => m.statutPaiement === 'non_paye')
  };

  const caPaye = statsPaiement.paye.reduce((sum, m) => sum + (Number(m.prixMissionDA) || 0), 0);
  const caFacture = statsPaiement.facture.reduce((sum, m) => sum + (Number(m.prixMissionDA) || 0), 0);
  const caNonPaye = statsPaiement.non_paye.reduce((sum, m) => sum + (Number(m.prixMissionDA) || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <BarChart3 size={28} color="var(--accent-sky)" />
            Bilan Financier & Analyse de Rentabilité
          </h2>
          <p className="page-description">
            Rapport global du chiffre d'affaires, marges bénéficiaires sur le transfert de stock et rentabilité par tracteur
          </p>
        </div>
      </div>

      {/* Cartes Métriques Clés */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-title">Total Chiffre d'Affaires</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(2, 132, 199, 0.15)', color: 'var(--accent-sky)' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div className="stat-value">{formatDA(totalCA)}</div>
          <div className="stat-subtext">Total des transferts de stock facturés</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-title">Total Bénéfice Net</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-success)' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#34d399' }}>{formatDA(totalBenefice)}</div>
          <div className="stat-subtext">Marge nette globale : {margeMoyennePct}% du CA</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-title">Total Frais de Route</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--status-danger)' }}>
              <Truck size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#f87171' }}>{formatDA(totalFrais)}</div>
          <div className="stat-subtext">Carburant, péages & frais de déplacement</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-title">Kilométrage Cumulé</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)' }}>
              <Award size={22} />
            </div>
          </div>
          <div className="stat-value">{new Intl.NumberFormat('fr-DZ').format(totalKm)} KM</div>
          <div className="stat-subtext">Distance totale parcourue par la flotte</div>
        </div>
      </div>

      {/* Barre d'état de recouvrement des factures */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '14px' }}>
          Taux de Recouvrement des Créances Clients
        </h3>

        {/* Visual Progress Bar */}
        <div style={{
          height: '18px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          marginBottom: '16px'
        }}>
          <div
            style={{
              width: `${totalCA > 0 ? (caPaye / totalCA) * 100 : 0}%`,
              background: '#10b981',
              transition: 'width 0.5s'
            }}
            title={`Payé: ${formatDA(caPaye)}`}
          />
          <div
            style={{
              width: `${totalCA > 0 ? (caFacture / totalCA) * 100 : 0}%`,
              background: '#8b5cf6',
              transition: 'width 0.5s'
            }}
            title={`Facturé: ${formatDA(caFacture)}`}
          />
          <div
            style={{
              width: `${totalCA > 0 ? (caNonPaye / totalCA) * 100 : 0}%`,
              background: '#ef4444',
              transition: 'width 0.5s'
            }}
            title={`Non payé: ${formatDA(caNonPaye)}`}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payé / Encaissé</div>
              <div style={{ fontWeight: '800', color: '#fff' }}>{formatDA(caPaye)} ({totalCA > 0 ? Math.round((caPaye/totalCA)*100) : 0}%)</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8b5cf6' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Facturé (À encaisser)</div>
              <div style={{ fontWeight: '800', color: '#fff' }}>{formatDA(caFacture)} ({totalCA > 0 ? Math.round((caFacture/totalCA)*100) : 0}%)</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Non payé / En attente</div>
              <div style={{ fontWeight: '800', color: '#fff' }}>{formatDA(caNonPaye)} ({totalCA > 0 ? Math.round((caNonPaye/totalCA)*100) : 0}%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Classement & Rentabilité par Camion Tracteur (TR 1 à TR 10) */}
      <div className="table-container">
        <div className="table-header-controls">
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Rentabilité par Tracteur (Flotte TR 1 à TR 10)</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Chiffre d'affaires et bénéfice net généré par chaque ensemble routier
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Code Tracteur</th>
                <th>Immatriculation Camion</th>
                <th>Chauffeur Titulaire</th>
                <th>Missions Réalisées</th>
                <th>Kilomètres Parcourus</th>
                <th>CA Généré (DA)</th>
                <th>Bénéfice Net (DA)</th>
                <th>Rendement / KM</th>
              </tr>
            </thead>
            <tbody>
              {camionsStats.map(stat => {
                const rendementKm = stat.km > 0 ? Math.round(stat.ca / stat.km) : 0;

                return (
                  <tr key={stat.camion.id}>
                    <td>
                      <span style={{ fontWeight: '800', color: 'var(--accent-sky)', fontSize: '1rem' }}>
                        {stat.camion.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{stat.camion.matriculeCamion}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stat.camion.matriculeRemorque}</div>
                    </td>
                    <td style={{ fontSize: '0.9rem', color: '#fff' }}>
                      {stat.titulaireNom}
                    </td>
                    <td>
                      <span className="badge badge-info">{stat.totalMissions} missions</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600' }}>{stat.km} KM</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '800', color: '#fff' }}>{formatDA(stat.ca)}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '800', color: '#34d399' }}>+{formatDA(stat.benefice)}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {rendementKm > 0 ? `${rendementKm} DA / KM` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
