// Données initiales EURL TRANSANIS issues du fichier Chauffeurs Data - Feuille 1.csv
// et structure complète pour la tarification par commission, gestion de flotte et utilisateurs.

export const INITIAL_CHAUFFEURS = [
  {
    id: 'ch-1',
    nom: 'Leboukh Kamel',
    telephone: '06.67.05.66.67',
    numPermis: 'ALG-23/048821',
    camionParDefaut: 'TR 1',
    statut: 'actif', // 'actif' | 'en_conge' | 'malade' | 'inactif'
    dateEmbauche: '2021-03-15',
    wilayaResidence: 'Annaba'
  },
  {
    id: 'ch-2',
    nom: 'Leboukh Lotfi',
    telephone: '06.70.46.05.32',
    numPermis: 'ALG-23/051290',
    camionParDefaut: 'TR 2',
    statut: 'actif',
    dateEmbauche: '2021-04-10',
    wilayaResidence: 'Annaba'
  },
  {
    id: 'ch-3',
    nom: 'Fetairia Nadir',
    telephone: '07.97.09.15.58',
    numPermis: 'ALG-23/039401',
    camionParDefaut: 'TR 3',
    statut: 'actif',
    dateEmbauche: '2021-06-01',
    wilayaResidence: 'Annaba'
  },
  {
    id: 'ch-4',
    nom: 'Hamouma Mohamed',
    telephone: '07.91.03.64.39',
    numPermis: 'ALG-23/062145',
    camionParDefaut: 'TR 4',
    statut: 'actif',
    dateEmbauche: '2021-08-15',
    wilayaResidence: 'El Tarf'
  },
  {
    id: 'ch-5',
    nom: 'Manaa Rabeh',
    telephone: '06.57.67.97.23',
    numPermis: 'ALG-23/047112',
    camionParDefaut: 'TR 5',
    statut: 'actif',
    dateEmbauche: '2022-01-10',
    wilayaResidence: 'Guelma'
  },
  {
    id: 'ch-6',
    nom: 'Fetairia Nadir (2)',
    telephone: '06.56.12.51.73',
    numPermis: 'ALG-23/039402',
    camionParDefaut: 'TR 6',
    statut: 'actif',
    dateEmbauche: '2022-02-14',
    wilayaResidence: 'Annaba'
  },
  {
    id: 'ch-7',
    nom: 'Bouklioua Ammar',
    telephone: '06.65.64.77.85',
    numPermis: 'ALG-23/058913',
    camionParDefaut: 'TR 7',
    statut: 'actif',
    dateEmbauche: '2022-04-20',
    wilayaResidence: 'Annaba'
  },
  {
    id: 'ch-8',
    nom: 'Brabri Nacer',
    telephone: '06.66.67.85.10',
    numPermis: 'ALG-23/033871',
    camionParDefaut: 'TR 8',
    statut: 'actif',
    dateEmbauche: '2022-07-05',
    wilayaResidence: 'Skikda'
  },
  {
    id: 'ch-9',
    nom: 'Labidi Rabeh',
    telephone: '06.64.09.52.12',
    numPermis: 'ALG-23/041009',
    camionParDefaut: 'TR 9',
    statut: 'actif',
    dateEmbauche: '2022-10-12',
    wilayaResidence: 'Annaba'
  },
  {
    id: 'ch-10',
    nom: 'Dilmi kamel',
    telephone: '06.66.05.93.28',
    numPermis: 'ALG-23/065431',
    camionParDefaut: 'TR 10',
    statut: 'actif',
    dateEmbauche: '2023-01-18',
    wilayaResidence: 'Constantine'
  },
  // Chauffeurs de réserve supplémentaires pour remplacements ponctuels décidés par l'Admin
  {
    id: 'ch-11',
    nom: 'Zitouni Rabah (Chauffeur Remplacement)',
    telephone: '05.50.12.34.56',
    numPermis: 'ALG-23/078901',
    camionParDefaut: '',
    statut: 'actif',
    dateEmbauche: '2023-05-10',
    wilayaResidence: 'Annaba'
  },
  {
    id: 'ch-12',
    nom: 'Bouchama Samir (Chauffeur Remplacement)',
    telephone: '05.55.98.76.54',
    numPermis: 'ALG-23/081234',
    camionParDefaut: '',
    statut: 'actif',
    dateEmbauche: '2023-08-01',
    wilayaResidence: 'Annaba'
  }
];

export const INITIAL_CAMIONS = [
  {
    id: 'cam-1',
    code: 'TR 1',
    matriculeCamion: '500276.525.16 (287)',
    matriculeRemorque: '500052.825.16',
    chauffeurTitulaireId: 'ch-1',
    chauffeurDuJourId: null, // null signifie que c'est le titulaire
    motifRemplacement: '',
    marque: 'Renault Trucks T-Range',
    chargeMaxTonnes: 32,
    statut: 'disponible' // 'disponible' | 'en_mission' | 'maintenance'
  },
  {
    id: 'cam-2',
    code: 'TR 2',
    matriculeCamion: '500282.525.16 (285)',
    matriculeRemorque: '500049.825.16',
    chauffeurTitulaireId: 'ch-2',
    chauffeurDuJourId: null,
    motifRemplacement: '',
    marque: 'Volvo FH 500',
    chargeMaxTonnes: 30,
    statut: 'disponible'
  },
  {
    id: 'cam-3',
    code: 'TR 3',
    matriculeCamion: '500280.525.16 (292)',
    matriculeRemorque: '500051.825.16',
    chauffeurTitulaireId: 'ch-3',
    chauffeurDuJourId: null,
    motifRemplacement: '',
    marque: 'Mercedes-Benz Actros',
    chargeMaxTonnes: 32,
    statut: 'en_mission'
  },
  {
    id: 'cam-4',
    code: 'TR 4',
    matriculeCamion: '500281.525.16 (293)',
    matriculeRemorque: '500056.825.16',
    chauffeurTitulaireId: 'ch-4',
    chauffeurDuJourId: null,
    motifRemplacement: '',
    marque: 'MAN TGX',
    chargeMaxTonnes: 32,
    statut: 'en_mission'
  },
  {
    id: 'cam-5',
    code: 'TR 5',
    matriculeCamion: '500283.525.16 (286)',
    matriculeRemorque: '500038.825.16',
    chauffeurTitulaireId: 'ch-5',
    chauffeurDuJourId: null,
    motifRemplacement: '',
    marque: 'Scania R500',
    chargeMaxTonnes: 35,
    statut: 'disponible'
  },
  {
    id: 'cam-6',
    code: 'TR 6',
    matriculeCamion: '500278.525.16 (290)',
    matriculeRemorque: '500055.825.16',
    chauffeurTitulaireId: 'ch-6',
    chauffeurDuJourId: null,
    motifRemplacement: '',
    marque: 'Renault Trucks T-Range',
    chargeMaxTonnes: 30,
    statut: 'disponible'
  },
  {
    id: 'cam-7',
    code: 'TR 7',
    matriculeCamion: '500275.525.16 (284)',
    matriculeRemorque: '500054.825.16',
    chauffeurTitulaireId: 'ch-7',
    chauffeurDuJourId: null,
    motifRemplacement: '',
    marque: 'Volvo FH 460',
    chargeMaxTonnes: 32,
    statut: 'disponible'
  },
  {
    id: 'cam-8',
    code: 'TR 8',
    matriculeCamion: '500277.525.16 (289)',
    matriculeRemorque: '500050.825.16',
    chauffeurTitulaireId: 'ch-8',
    chauffeurDuJourId: null,
    motifRemplacement: '',
    marque: 'Mercedes-Benz Actros',
    chargeMaxTonnes: 30,
    statut: 'disponible'
  },
  {
    id: 'cam-9',
    code: 'TR 9',
    matriculeCamion: '500284.525.16 (288)',
    matriculeRemorque: '500048.825.16',
    chauffeurTitulaireId: 'ch-9',
    chauffeurDuJourId: null,
    motifRemplacement: '',
    marque: 'MAN TGX',
    chargeMaxTonnes: 32,
    statut: 'disponible'
  },
  {
    id: 'cam-10',
    code: 'TR 10',
    matriculeCamion: '500279.525.16 (291)',
    matriculeRemorque: '500053.825.16',
    chauffeurTitulaireId: 'ch-10',
    chauffeurDuJourId: null,
    motifRemplacement: '',
    marque: 'Renault Trucks T-Range',
    chargeMaxTonnes: 32,
    statut: 'disponible'
  }
];

// Grille de tarification par tranche kilométrique définie par l'Admin
// Règle demandée :
// - < 20 km : minimum 20000 DA
// - ~100 km : ~15000 DA
// - entre 600 et 800 km : 60000 DA
export const INITIAL_PRICING_RULES = [
  {
    id: 'rule-min',
    titre: 'Courte distance / Tarif minimum',
    minKm: 0,
    maxKm: 20,
    prixDA: 20000,
    mode: 'fixe', // 'fixe' ou 'par_km'
    fraisRouteEstimesDA: 3000,
    description: 'Distance inférieure à 20 km (minimum garanti pour mobilisation du camion)'
  },
  {
    id: 'rule-100',
    titre: 'Moyenne distance (ex: 20 - 150 km)',
    minKm: 21,
    maxKm: 150,
    prixDA: 25000,
    mode: 'fixe',
    fraisRouteEstimesDA: 6000,
    description: 'Trajets régionaux courts (Skikda, Guelma, Souk Ahras, etc.)'
  },
  {
    id: 'rule-300',
    titre: 'Distance 151 à 350 km',
    minKm: 151,
    maxKm: 350,
    prixDA: 38000,
    mode: 'fixe',
    fraisRouteEstimesDA: 10000,
    description: 'Trajets moyens (Constantine, Batna, Sétif, Biskra, Béjaïa)'
  },
  {
    id: 'rule-600',
    titre: 'Distance 351 à 599 km',
    minKm: 351,
    maxKm: 599,
    prixDA: 52000,
    mode: 'fixe',
    fraisRouteEstimesDA: 14000,
    description: 'Grandes liaisons (Bordj Bou Arréridj, M\'Sila, Bouira, Blida)'
  },
  {
    id: 'rule-800',
    titre: 'Palier 600 à 800 km (Liaison Alger & Sud proche)',
    minKm: 600,
    maxKm: 800,
    prixDA: 60000,
    mode: 'fixe',
    fraisRouteEstimesDA: 18000,
    description: 'Exemple Annaba -> Alger (~600km) ou Hassi Messaoud (~780km) = 60 000 DA'
  },
  {
    id: 'rule-longue',
    titre: 'Très longue distance (> 800 km)',
    minKm: 801,
    maxKm: 2500,
    prixDA: 85000,
    mode: 'fixe',
    fraisRouteEstimesDA: 26000,
    description: 'Trajets ouest et grand sud (Oran ~980km, Tlemcen, Tamanrasset, Illizi)'
  }
];

export const INITIAL_USERS = [
  {
    id: 'usr-admin',
    nom: 'Anis Meziani (Directeur Général)',
    email: 'admin@transanis.dz',
    role: 'admin', // 'admin' | 'manager' | 'chauffeur'
    telephone: '05.50.00.00.01',
    actif: true,
    avatar: 'A'
  },
  {
    id: 'usr-mgr-1',
    nom: 'Brahim Khelifi (Responsable Logistique & Ordres)',
    email: 'brahim.logistique@transanis.dz',
    role: 'manager',
    telephone: '05.50.00.00.02',
    actif: true,
    avatar: 'B'
  },
  {
    id: 'usr-mgr-2',
    nom: 'Yacine Bensalem (Agent Expéditions)',
    email: 'yacine.expeditions@transanis.dz',
    role: 'manager',
    telephone: '05.50.00.00.03',
    actif: true,
    avatar: 'Y'
  },
  {
    id: 'usr-ch-1',
    nom: 'Leboukh Kamel',
    email: 'kamel.leboukh@transanis.dz',
    role: 'chauffeur',
    chauffeurId: 'ch-1',
    telephone: '06.67.05.66.67',
    actif: true,
    avatar: 'K'
  }
];

export const INITIAL_MISSIONS = [
  {
    id: 'ord-2026-001',
    numeroBon: 'BT-2026-001',
    dateCreation: '2026-10-24T08:30:00',
    dateDepart: '2026-10-24',
    dateArriveePrevue: '2026-10-25',
    origine: 'Annaba (Siège EURL TRANSANIS)',
    destination: 'Alger (Zone Industrielle Rouiba)',
    distanceKm: 600,
    camionId: 'cam-1',
    camionCode: 'TR 1',
    matriculeCamion: '500276.525.16 (287)',
    matriculeRemorque: '500052.825.16',
    chauffeurId: 'ch-1',
    chauffeurNom: 'Leboukh Kamel',
    chauffeurTel: '06.67.05.66.67',
    typeMarchandise: 'Ronds à béton & Profilés Acier',
    poidsTonnes: 28,
    client: 'SARL METALLURGIE CENTRALE ROUIBA',
    clientTel: '023.85.12.30',
    clientAdresse: 'Zone Industrielle Voie C, Rouiba, Alger',
    prixMissionDA: 60000, // entre 600 et 800km = 60000 DA
    fraisRouteDA: 18000,
    beneficeNetDA: 42000,
    statutMission: 'arrive', // 'en_route' | 'arrive' | 'planifie' | 'annule'
    statutPaiement: 'paye', // 'paye' | 'non_paye' | 'facture'
    numFacture: 'FACT-2026-014',
    datePaiement: '2026-10-25',
    modePaiement: 'Virement bancaire',
    creePar: 'Brahim Khelifi'
  },
  {
    id: 'ord-2026-002',
    numeroBon: 'BT-2026-002',
    dateCreation: '2026-10-25T09:15:00',
    dateDepart: '2026-10-25',
    dateArriveePrevue: '2026-10-25',
    origine: 'Annaba (Siège EURL TRANSANIS)',
    destination: 'Constantine (Le Khroub / Didouche)',
    distanceKm: 155,
    camionId: 'cam-3',
    camionCode: 'TR 3',
    matriculeCamion: '500280.525.16 (292)',
    matriculeRemorque: '500051.825.16',
    chauffeurId: 'ch-3',
    chauffeurNom: 'Fetairia Nadir',
    chauffeurTel: '07.97.09.15.58',
    typeMarchandise: 'Palettes Matériaux de Construction',
    poidsTonnes: 26,
    client: 'EURL CONSTANTINE DISTRIBUTION',
    clientTel: '031.66.45.10',
    clientAdresse: 'Zone d\'Activité Le Khroub, Constantine',
    prixMissionDA: 38000,
    fraisRouteDA: 10000,
    beneficeNetDA: 28000,
    statutMission: 'en_route',
    statutPaiement: 'non_paye',
    numFacture: '',
    datePaiement: null,
    modePaiement: 'En attente',
    creePar: 'Brahim Khelifi'
  },
  {
    id: 'ord-2026-003',
    numeroBon: 'BT-2026-003',
    dateCreation: '2026-10-25T14:00:00',
    dateDepart: '2026-10-26',
    dateArriveePrevue: '2026-10-27',
    origine: 'Annaba (Siège EURL TRANSANIS)',
    destination: 'Sétif (Zone Industrielle)',
    distanceKm: 285,
    camionId: 'cam-4',
    camionCode: 'TR 4',
    matriculeCamion: '500281.525.16 (293)',
    matriculeRemorque: '500056.825.16',
    chauffeurId: 'ch-4',
    chauffeurNom: 'Hamouma Mohamed',
    chauffeurTel: '07.91.03.64.39',
    typeMarchandise: 'Carreaux Céramique & Faïence',
    poidsTonnes: 29,
    client: 'COMPTOIR DES MATÉRIAUX DES HAUTS PLATEAUX',
    clientTel: '036.92.11.04',
    clientAdresse: 'Route de Batna, Sétif',
    prixMissionDA: 38000,
    fraisRouteDA: 10000,
    beneficeNetDA: 28000,
    statutMission: 'en_route',
    statutPaiement: 'facture',
    numFacture: 'FACT-2026-015',
    datePaiement: null,
    modePaiement: 'Chèque à échéance 30j',
    creePar: 'Yacine Bensalem'
  },
  {
    id: 'ord-2026-004',
    numeroBon: 'BT-2026-004',
    dateCreation: '2026-10-26T08:00:00',
    dateDepart: '2026-10-26',
    dateArriveePrevue: '2026-10-26',
    origine: 'Annaba (Siège EURL TRANSANIS)',
    destination: 'Annaba intra-muros (< 20 km)',
    distanceKm: 15,
    camionId: 'cam-2',
    camionCode: 'TR 2',
    matriculeCamion: '500282.525.16 (285)',
    matriculeRemorque: '500049.825.16',
    chauffeurId: 'ch-2',
    chauffeurNom: 'Leboukh Lotfi',
    chauffeurTel: '06.70.46.05.32',
    typeMarchandise: 'Transfert Stock Dépôt vers Port d\'Annaba',
    poidsTonnes: 30,
    client: 'ENTREPRISE PORTUAIRE D\'ANNABA (EPAN)',
    clientTel: '038.86.32.14',
    clientAdresse: 'Quai Nord, Port d\'Annaba',
    prixMissionDA: 20000, // Règle min < 20km = 20000 DA
    fraisRouteDA: 3000,
    beneficeNetDA: 17000,
    statutMission: 'arrive',
    statutPaiement: 'paye',
    numFacture: 'FACT-2026-016',
    datePaiement: '2026-10-26',
    modePaiement: 'Espèces',
    creePar: 'Brahim Khelifi'
  },
  {
    id: 'ord-2026-005',
    numeroBon: 'BT-2026-005',
    dateCreation: '2026-10-26T10:00:00',
    dateDepart: '2026-10-27',
    dateArriveePrevue: '2026-10-28',
    origine: 'Annaba (Siège EURL TRANSANIS)',
    destination: 'Oran (Port / Hassi Ameur)',
    distanceKm: 980,
    camionId: 'cam-8',
    camionCode: 'TR 8',
    matriculeCamion: '500277.525.16 (289)',
    matriculeRemorque: '500050.825.16',
    chauffeurId: 'ch-8',
    chauffeurNom: 'Brabri Nacer',
    chauffeurTel: '06.66.67.85.10',
    typeMarchandise: 'Tuyauterie Industrielle & Raccords',
    poidsTonnes: 27,
    client: 'ORAN LOGISTICS & INDUSTRY HUB',
    clientTel: '041.53.88.99',
    clientAdresse: 'Zone Industrielle Hassi Ameur, Oran',
    prixMissionDA: 85000,
    fraisRouteDA: 26000,
    beneficeNetDA: 59000,
    statutMission: 'planifie',
    statutPaiement: 'non_paye',
    numFacture: '',
    datePaiement: null,
    modePaiement: 'En attente',
    creePar: 'Yacine Bensalem'
  }
];

// Calculateur automatique de commission selon les règles de distance
export function calculatePricingForDistance(distanceKm, pricingRules) {
  const km = Math.max(0, Number(distanceKm) || 0);

  // Recherche de la règle correspondante
  const matchedRule = pricingRules.find(r => km >= r.minKm && km <= r.maxKm);

  if (matchedRule) {
    const prix = matchedRule.mode === 'par_km' ? km * matchedRule.prixDA : matchedRule.prixDA;
    const frais = matchedRule.fraisRouteEstimesDA || Math.round(prix * 0.3);
    return {
      prixDA: prix,
      fraisRouteDA: frais,
      beneficeDA: prix - frais,
      ruleMatched: matchedRule
    };
  }

  // Fallback si hors grille : si < 20 km = 20000, sinon estimation linéaire
  if (km < 20) {
    return {
      prixDA: 20000,
      fraisRouteDA: 3000,
      beneficeDA: 17000,
      ruleMatched: { titre: 'Tarif minimum garanti (<20km)' }
    };
  }

  const defaultPrice = Math.round(km * 85);
  const defaultFrais = Math.round(km * 25);
  return {
    prixDA: defaultPrice,
    fraisRouteDA: defaultFrais,
    beneficeDA: defaultPrice - defaultFrais,
    ruleMatched: { titre: 'Tarif kilométrique standard' }
  };
}
