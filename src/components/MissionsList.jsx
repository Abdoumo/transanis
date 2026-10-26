import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Search,
  Filter,
  Plus,
  CheckCircle,
  Clock,
  Printer,
  Edit2,
  Trash2,
  DollarSign,
  Download,
  AlertTriangle
} from 'lucide-react';

export default function MissionsList({ onOpenNewModal, onEditMission, onPrintMission }) {
  const {
    missions,
    deleteMission,
    updateMissionDeliveryStatus,
    updateMissionPaymentStatus,
    currentUser
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [missionStatusFilter, setMissionStatusFilter] = useState('tous');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('tous');

  // Filtrage intelligent
  const filteredMissions = missions.filter(m => {
    // Si l'utilisateur est un chauffeur, il ne voit que ses propres missions
    if (currentUser.role === 'chauffeur' && currentUser.chauffeurId && m.chauffeurId !== currentUser.chauffeurId) {
      return false;
    }

    const matchesSearch = 
      m.numeroBon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.chauffeurNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.camionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.typeMarchandise?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMissionStatus = missionStatusFilter === 'tous' || m.statutMission === missionStatusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'tous' || m.statutPaiement === paymentStatusFilter;

    return matchesSearch && matchesMissionStatus && matchesPaymentStatus;
  });

  const formatDA = (val) => {
    return new Intl.NumberFormat('fr-DZ').format(val || 0) + ' DA';
  };

  // Export CSV des missions
  const handleExportCSV = () => {
    const headers = [
      'N° Bon',
      'Date Départ',
      'Origine',
      'Destination',
      'Distance KM',
      'Camion',
      'Chauffeur',
      'Marchandise',
      'Poids (T)',
      'Client',
      'Prix Mission (DA)',
      'Frais de Route (DA)',
      'Bénéfice Net (DA)',
      'Statut Mission',
      'Statut Paiement'
    ];

    const rows = filteredMissions.map(m => [
      m.numeroBon,
      m.dateDepart,
      `"${m.origine}"`,
      `"${m.destination}"`,
      m.distanceKm,
      m.camionCode,
      `"${m.chauffeurNom}"`,
      `"${m.typeMarchandise}"`,
      m.poidsTonnes,
      `"${m.client}"`,
      m.prixMissionDA,
      m.fraisRouteDA,
      m.beneficeNetDA,
      m.statutMission,
      m.statutPaiement
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EURL_TRANSANIS_Ordres_Mission_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <FileText size={28} color="var(--accent-sky)" />
            Ordres de Mission & Bons de Transport
          </h2>
          <p className="page-description">
            Gestion du transfert de stock, suivi des arrivées de camions et statuts de facturation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} />
            Exporter CSV
          </button>
          {currentUser.role !== 'chauffeur' && (
            <button className="btn btn-primary" onClick={onOpenNewModal}>
              <Plus size={18} />
              Nouveau Bon de Transport
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        
        {/* Filtres & Recherche */}
        <div className="table-header-controls">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="table-search-input"
              placeholder="Rechercher par bon, client, chauffeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtres d'état de mission */}
          <div className="table-filter-pills">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Mission :
            </span>
            {['tous', 'en_route', 'arrive', 'planifie'].map(st => (
              <button
                key={st}
                className={`filter-pill ${missionStatusFilter === st ? 'active' : ''}`}
                onClick={() => setMissionStatusFilter(st)}
              >
                {st === 'tous' && 'Toutes'}
                {st === 'en_route' && 'En Route'}
                {st === 'arrive' && 'Arrivées / Livrées'}
                {st === 'planifie' && 'Planifiées'}
              </button>
            ))}
          </div>

          {/* Filtres d'état de paiement */}
          <div className="table-filter-pills">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Paiement :
            </span>
            {['tous', 'paye', 'facture', 'non_paye'].map(pst => (
              <button
                key={pst}
                className={`filter-pill ${paymentStatusFilter === pst ? 'active' : ''}`}
                onClick={() => setPaymentStatusFilter(pst)}
              >
                {pst === 'tous' && 'Tous'}
                {pst === 'paye' && 'Payé'}
                {pst === 'facture' && 'Facturé'}
                {pst === 'non_paye' && 'Non payé'}
              </button>
            ))}
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>N° Bon</th>
                <th>Départ</th>
                <th>Trajet (KM)</th>
                <th>Camion & Chauffeur</th>
                <th>Marchandise / Poids</th>
                <th>Client</th>
                <th>Tarif (Commission)</th>
                <th>Statut Arrivée</th>
                <th>Paiement / Facture</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMissions.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Aucun ordre de mission ne correspond à vos critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredMissions.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: '800', color: 'var(--accent-sky)' }}>{m.numeroBon}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Par: {m.creePar || 'Manager'}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {m.dateDepart || m.dateCreation?.split('T')[0]}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{m.origine}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>↓ vers</div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{m.destination}</div>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                        {m.distanceKm} KM
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '800', color: '#fff' }}>{m.camionCode}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-sky)' }}>{m.chauffeurNom}</div>
                      {m.chauffeurTel && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.chauffeurTel}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{m.typeMarchandise}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.poidsTonnes} Tonnes</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{m.client}</div>
                      {m.clientTel && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.clientTel}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: '800', color: '#fff' }}>{formatDA(m.prixMissionDA)}</div>
                      <div style={{ fontSize: '0.7rem', color: '#34d399' }}>
                        Net : +{formatDA(m.beneficeNetDA)}
                      </div>
                    </td>

                    {/* Statut Arrivée (avec bouton pour basculer facilement) */}
                    <td>
                      {m.statutMission === 'en_route' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="badge badge-warning">En Route</span>
                          {currentUser.role !== 'chauffeur' && (
                            <button
                              className="btn btn-success btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                              onClick={() => updateMissionDeliveryStatus(m.id, 'arrive')}
                              title="Marquer que le camion est arrivé à destination"
                            >
                              ✓ Marquer Arrivé
                            </button>
                          )}
                        </div>
                      )}
                      {m.statutMission === 'arrive' && (
                        <span className="badge badge-success">✓ Arrivé / Livré</span>
                      )}
                      {m.statutMission === 'planifie' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="badge badge-info">Planifié</span>
                          {currentUser.role !== 'chauffeur' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                              onClick={() => updateMissionDeliveryStatus(m.id, 'en_route')}
                            >
                              Lancer en Route
                            </button>
                          )}
                        </div>
                      )}
                      {m.statutMission === 'annule' && (
                        <span className="badge badge-danger">Annulé</span>
                      )}
                    </td>

                    {/* Statut Paiement (Payé / Non payé / Facturé) */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {m.statutPaiement === 'paye' && (
                          <span className="badge badge-success">✓ Payé</span>
                        )}
                        {m.statutPaiement === 'facture' && (
                          <span className="badge badge-purple">📄 Facturé</span>
                        )}
                        {m.statutPaiement === 'non_paye' && (
                          <span className="badge badge-danger">⏳ Non payé</span>
                        )}

                        {/* Sélecteur de statut paiement pour le manager/admin */}
                        {currentUser.role !== 'chauffeur' && (
                          <select
                            style={{
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-primary)',
                              fontSize: '0.72rem',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                            value={m.statutPaiement}
                            onChange={(e) => updateMissionPaymentStatus(m.id, e.target.value)}
                          >
                            <option value="non_paye">Non payé</option>
                            <option value="paye">Payé</option>
                            <option value="facture">Facturé</option>
                          </select>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {/* Imprimer Bon de transport */}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onPrintMission(m, 'bon')}
                          title="Imprimer le Bon de Transport Officiel"
                        >
                          <Printer size={14} />
                        </button>

                        {/* Imprimer Facture */}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onPrintMission(m, 'facture')}
                          title="Imprimer la Facture de Transport"
                          style={{ color: 'var(--accent-sky)' }}
                        >
                          <FileText size={14} />
                        </button>

                        {currentUser.role !== 'chauffeur' && (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onEditMission(m)}
                              title="Modifier la mission"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                if (window.confirm(`Supprimer l'ordre de mission ${m.numeroBon} ?`)) {
                                  deleteMission(m.id);
                                }
                              }}
                              title="Supprimer la mission"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
