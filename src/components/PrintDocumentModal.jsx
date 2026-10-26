import React, { useState } from 'react';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

export default function PrintDocumentModal({ mission, initialDocType = 'bon', isOpen, onClose }) {
  const [docType, setDocType] = useState(initialDocType);

  if (!isOpen || !mission) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDA = (val) => {
    return new Intl.NumberFormat('fr-DZ').format(val || 0) + ' DA';
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '850px', 
          background: '#fff', 
          color: '#111827',
          padding: '0'
        }}
      >
        {/* Barre d'action supérieure (non imprimable) */}
        <div 
          className="no-print" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '14px 20px', 
            background: 'var(--bg-secondary)', 
            borderBottom: '1px solid var(--border-subtle)',
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${docType === 'bon' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDocType('bon')}
            >
              <FileText size={14} />
              Bon de Transport
            </button>
            <button
              className={`btn btn-sm ${docType === 'facture' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDocType('facture')}
            >
              <FileText size={14} />
              Facture Officielle
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              Imprimer / Télécharger PDF
            </button>
            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Zone de Document Imprimable (Fond blanc, typographie corporate) */}
        <div 
          className="printable-document" 
          style={{ 
            padding: '36px 42px', 
            background: '#ffffff', 
            color: '#0f172a',
            fontFamily: 'Arial, sans-serif',
            fontSize: '10pt',
            lineHeight: 1.4
          }}
        >
          {/* En-tête EURL TRANSANIS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0284c7', paddingBottom: '18px', marginBottom: '22px' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0284c7', margin: 0, letterSpacing: '0.02em' }}>
                EURL TRANSANIS
              </h1>
              <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#475569', marginTop: '2px' }}>
                TRANSPORT ROUTIER DE MARCHANDISES & PRESTATIONS LOGISTIQUES
              </div>
              <div style={{ fontSize: '8pt', color: '#64748b', marginTop: '4px' }}>
                Siège Social : Zone Industrielle & Dépôts, Annaba, Algérie<br />
                NIF : 002123019842512 | NIS : 09202301004812 | RC : 23/00-1094821B21<br />
                Tél : +213 (0)38 86 00 12 / +213 (0)667 05 66 67 | Email : contact@transanis.dz
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                border: '1px solid #0284c7', 
                background: '#f0f9ff', 
                padding: '8px 14px', 
                borderRadius: '6px',
                display: 'inline-block' 
              }}>
                <div style={{ fontSize: '8pt', color: '#0369a1', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {docType === 'bon' ? 'ORDRE DE MISSION ROUTIER' : 'FACTURE DE TRANSPORT'}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>
                  {docType === 'bon' ? mission.numeroBon : (mission.numFacture || `FACT-${new Date().getFullYear()}-001`)}
                </div>
              </div>
              <div style={{ fontSize: '8pt', color: '#64748b', marginTop: '6px' }}>
                Date d'émission : {mission.dateDepart || new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>

          {/* Section 1 : Informations Trajet & Client */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', background: '#f8fafc' }}>
              <div style={{ fontSize: '8pt', fontWeight: 'bold', color: '#0284c7', textTransform: 'uppercase', marginBottom: '6px' }}>
                1. DÉTAILS DE L'EXPÉDITION (TRANSFERT DE STOCK)
              </div>
              <div><strong>Lieu de chargement (Origine) :</strong> {mission.origine}</div>
              <div><strong>Lieu de livraison (Destination) :</strong> {mission.destination}</div>
              <div><strong>Distance routière :</strong> {mission.distanceKm} KM</div>
              <div><strong>Date de départ :</strong> {mission.dateDepart}</div>
              <div><strong>Date prévue livraison :</strong> {mission.dateArriveePrevue || mission.dateDepart}</div>
            </div>

            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', background: '#f8fafc' }}>
              <div style={{ fontSize: '8pt', fontWeight: 'bold', color: '#0284c7', textTransform: 'uppercase', marginBottom: '6px' }}>
                2. DONNÉES DU DESTINATAIRE / CLIENT
              </div>
              <div><strong>Client :</strong> {mission.client}</div>
              <div><strong>Contact téléphonique :</strong> {mission.clientTel || 'Non précisé'}</div>
              <div><strong>Adresse de livraison :</strong> {mission.clientAdresse || mission.destination}</div>
              <div><strong>Émis par :</strong> {mission.creePar || 'Manager Exploitation'}</div>
            </div>
          </div>

          {/* Section 2 : Véhicule et Chauffeur Conducteur */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', marginBottom: '20px', background: '#fff' }}>
            <div style={{ fontSize: '8pt', fontWeight: 'bold', color: '#0284c7', textTransform: 'uppercase', marginBottom: '8px' }}>
              3. MATÉRIEL ROULANT & CONDUCTEUR AFFECTÉ (EURL TRANSANIS)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px', width: '25%', color: '#64748b' }}>Code Tracteur :</td>
                  <td style={{ padding: '6px', fontWeight: 'bold', width: '25%' }}>{mission.camionCode}</td>
                  <td style={{ padding: '6px', width: '25%', color: '#64748b' }}>Conducteur :</td>
                  <td style={{ padding: '6px', fontWeight: 'bold', width: '25%' }}>{mission.chauffeurNom}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px', color: '#64748b' }}>Immat. Camion :</td>
                  <td style={{ padding: '6px', fontWeight: 'bold' }}>{mission.matriculeCamion}</td>
                  <td style={{ padding: '6px', color: '#64748b' }}>Téléphone :</td>
                  <td style={{ padding: '6px', fontWeight: 'bold' }}>{mission.chauffeurTel}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px', color: '#64748b' }}>Immat. Remorque :</td>
                  <td style={{ padding: '6px', fontWeight: 'bold' }}>{mission.matriculeRemorque}</td>
                  <td style={{ padding: '6px', color: '#64748b' }}>Permis Cat. :</td>
                  <td style={{ padding: '6px', fontWeight: 'bold' }}>Poids lourd Semi C/E</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3 : Marchandise & Tarification */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', marginBottom: '22px' }}>
            <div style={{ fontSize: '8pt', fontWeight: 'bold', color: '#0284c7', textTransform: 'uppercase', marginBottom: '8px' }}>
              4. DÉSIGNATION DU STOCK & CONDITIONS FINANCIÈRES
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '9pt' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', color: '#334155' }}>Désignation Marchandise</th>
                  <th style={{ padding: '8px', color: '#334155' }}>Poids / Volume</th>
                  <th style={{ padding: '8px', color: '#334155' }}>Tranche Distance</th>
                  <th style={{ padding: '8px', textAlign: 'right', color: '#334155' }}>Prix Convenu (DA)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 8px', fontWeight: '600' }}>
                    {mission.typeMarchandise}<br />
                    <span style={{ fontSize: '8pt', color: '#64748b' }}>
                      Prestation de transport routier de lots complets
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px' }}>{mission.poidsTonnes} Tonnes</td>
                  <td style={{ padding: '10px 8px' }}>{mission.distanceKm} KM ({mission.origine} → {mission.destination})</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold', fontSize: '11pt' }}>
                    {formatDA(mission.prixMissionDA)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Totaux & Règlement */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
              <div>
                <div><strong>Statut de Règlement :</strong> 
                  <span style={{ 
                    marginLeft: '6px', 
                    fontWeight: 'bold', 
                    color: mission.statutPaiement === 'paye' ? '#059669' : mission.statutPaiement === 'facture' ? '#7c3aed' : '#dc2626' 
                  }}>
                    {mission.statutPaiement === 'paye' ? 'ACQUITTÉ / PAYÉ' : mission.statutPaiement === 'facture' ? 'FACTURE ÉMISE (À ÉCHÉANCE)' : 'NON PAYÉ (EN ATTENTE)'}
                  </span>
                </div>
                <div style={{ fontSize: '8pt', color: '#64748b' }}>
                  Mode de paiement : {mission.modePaiement || 'Virement bancaire / Chèque'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '9pt', color: '#475569' }}>Total Net à Payer :</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0284c7' }}>
                  {formatDA(mission.prixMissionDA)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 : Signatures et Cachets Officiels */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '12px', 
            marginTop: '28px',
            pageBreakInside: 'avoid'
          }}>
            <div style={{ border: '1px solid #94a3b8', borderRadius: '4px', height: '110px', padding: '8px', fontSize: '8pt' }}>
              <strong>Expéditeur (EURL TRANSANIS) :</strong>
              <div style={{ height: '55px' }}></div>
              <div style={{ color: '#94a3b8', textAlign: 'center' }}>Cachet & Signature Direction</div>
            </div>

            <div style={{ border: '1px solid #94a3b8', borderRadius: '4px', height: '110px', padding: '8px', fontSize: '8pt' }}>
              <strong>Chauffeur Conducteur :</strong>
              <div style={{ height: '55px' }}></div>
              <div style={{ color: '#94a3b8', textAlign: 'center' }}>{mission.chauffeurNom}</div>
            </div>

            <div style={{ border: '1px solid #94a3b8', borderRadius: '4px', height: '110px', padding: '8px', fontSize: '8pt' }}>
              <strong>Destinataire / Réceptionnaire :</strong>
              <div style={{ height: '55px' }}></div>
              <div style={{ color: '#94a3b8', textAlign: 'center' }}>Date, Cachet & Signature</div>
            </div>
          </div>

          {/* Pied de page */}
          <div style={{ textAlign: 'center', fontSize: '7.5pt', color: '#94a3b8', marginTop: '24px' }}>
            Document officiel généré par le système informatique de gestion de flotte EURL TRANSANIS • Annaba, Algérie
          </div>
        </div>
      </div>
    </div>
  );
}
