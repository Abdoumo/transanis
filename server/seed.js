import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, initSchema } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.join(__dirname, '..', 'Chauffeurs Data - Feuille 1.csv');

export async function seedDatabase(force = false) {
  await initSchema();

  // Vérifier si la base contient déjà des données
  const chauffeursCount = await db.getAsync(`SELECT COUNT(*) as count FROM chauffeurs;`);
  if (chauffeursCount.count > 0 && !force) {
    console.log(`ℹ Base SQLite déjà initialisée (${chauffeursCount.count} chauffeurs). Saut du seed.`);
    return;
  }

  console.log('⚡ Initialisation & Seeding de la base de données SQLite EURL TRANSANIS...');

  // Nettoyage si force = true
  if (force) {
    await db.runAsync(`DELETE FROM missions;`);
    await db.runAsync(`DELETE FROM camions;`);
    await db.runAsync(`DELETE FROM chauffeurs;`);
    await db.runAsync(`DELETE FROM pricing_rules;`);
    await db.runAsync(`DELETE FROM users;`);
  }

  // 1. Lecture et Importation du fichier CSV
  let csvRows = [];
  if (fs.existsSync(CSV_PATH)) {
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    // Ignorer la ligne d'en-tête (N°,I/ camion,I/ Remorque,chauffeurs,N° Tél)
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length >= 5) {
        csvRows.push({
          num: parts[0],             // Ex: TR 1
          immatCamion: parts[1],     // Ex: 500276.525.16 (287)
          immatRemorque: parts[2],   // Ex: 500052.825.16
          chauffeurNom: parts[3],    // Ex: Leboukh Kamel
          telephone: parts[4]        // Ex: 06.67.05.66.67
        });
      }
    }
  }

  console.log(`✓ ${csvRows.length} lignes de camions/chauffeurs extraites du CSV.`);

  // 2. Insertion des Chauffeurs
  let chauffeurMap = {};
  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i];
    const chId = `ch-${i + 1}`;
    chauffeurMap[row.num] = chId;

    await db.runAsync(`
      INSERT INTO chauffeurs (id, nom, telephone, num_permis, camion_par_defaut, statut, date_embauche, wilaya_residence)
      VALUES (?, ?, ?, ?, ?, 'actif', '2021-04-10', 'Annaba');
    `, [
      chId,
      row.chauffeurNom,
      row.telephone,
      `ALG-23/04${8000 + i}`,
      row.num
    ]);
  }

  // Chauffeurs de réserve
  await db.runAsync(`
    INSERT INTO chauffeurs (id, nom, telephone, num_permis, camion_par_defaut, statut, date_embauche, wilaya_residence)
    VALUES 
      ('ch-11', 'Zitouni Rabah (Remplacement)', '05.50.12.34.56', 'ALG-23/078901', '', 'actif', '2023-05-10', 'Annaba'),
      ('ch-12', 'Bouchama Samir (Remplacement)', '05.55.98.76.54', 'ALG-23/081234', '', 'actif', '2023-08-01', 'Annaba');
  `);

  // 3. Insertion des Camions (TR 1 à TR 10)
  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i];
    const camId = `cam-${i + 1}`;
    const chId = chauffeurMap[row.num];

    await db.runAsync(`
      INSERT INTO camions (id, code, matricule_camion, matricule_remorque, chauffeur_titulaire_id, chauffeur_du_jour_id, motif_remplacement, marque, charge_max_tonnes, statut)
      VALUES (?, ?, ?, ?, ?, NULL, '', 'Renault Trucks T-Range', 32, 'disponible');
    `, [
      camId,
      row.num,
      row.immatCamion,
      row.immatRemorque,
      chId
    ]);
  }

  // 4. Insertion de la Grille de Tarification & Commission Admin
  const pricingRules = [
    {
      id: 'rule-min',
      titre: 'Courte distance / Tarif minimum',
      min_km: 0,
      max_km: 20,
      prix_da: 20000,
      mode: 'fixe',
      frais_route_estimes_da: 3000,
      description: 'Distance inférieure à 20 km (minimum garanti pour mobilisation du camion)'
    },
    {
      id: 'rule-100',
      titre: 'Moyenne distance (ex: 20 - 150 km)',
      min_km: 21,
      max_km: 150,
      prix_da: 25000,
      mode: 'fixe',
      frais_route_estimes_da: 6000,
      description: 'Trajets régionaux courts (Skikda, Guelma, Souk Ahras, etc.)'
    },
    {
      id: 'rule-300',
      titre: 'Distance 151 à 350 km',
      min_km: 151,
      max_km: 350,
      prix_da: 38000,
      mode: 'fixe',
      frais_route_estimes_da: 10000,
      description: 'Trajets moyens (Constantine, Batna, Sétif, Biskra, Béjaïa)'
    },
    {
      id: 'rule-600',
      titre: 'Distance 351 à 599 km',
      min_km: 351,
      max_km: 599,
      prix_da: 52000,
      mode: 'fixe',
      frais_route_estimes_da: 14000,
      description: 'Grandes liaisons (Bordj Bou Arréridj, M\'Sila, Bouira, Blida)'
    },
    {
      id: 'rule-800',
      titre: 'Palier 600 à 800 km (Liaison Alger & Sud proche)',
      min_km: 600,
      max_km: 800,
      prix_da: 60000,
      mode: 'fixe',
      frais_route_estimes_da: 18000,
      description: 'Exemple Annaba -> Alger (~600km) ou Hassi Messaoud (~780km) = 60 000 DA'
    },
    {
      id: 'rule-longue',
      titre: 'Très longue distance (> 800 km)',
      min_km: 801,
      max_km: 2500,
      prix_da: 85000,
      mode: 'fixe',
      frais_route_estimes_da: 26000,
      description: 'Trajets ouest et grand sud (Oran ~980km, Tlemcen, Illizi)'
    }
  ];

  for (const r of pricingRules) {
    await db.runAsync(`
      INSERT INTO pricing_rules (id, titre, min_km, max_km, prix_da, mode, frais_route_estimes_da, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [r.id, r.titre, r.min_km, r.max_km, r.prix_da, r.mode, r.frais_route_estimes_da, r.description]);
  }

  // 5. Insertion des Utilisateurs avec mot de passe
  const users = [
    {
      id: 'usr-admin',
      nom: 'Anis Meziani (Directeur Général)',
      email: 'admin@transanis.dz',
      password: 'admin123',
      role: 'admin',
      telephone: '05.50.00.00.01',
      avatar: 'A'
    },
    {
      id: 'usr-mgr-1',
      nom: 'Brahim Khelifi (Responsable Logistique & Ordres)',
      email: 'brahim.logistique@transanis.dz',
      password: 'manager123',
      role: 'manager',
      telephone: '05.50.00.00.02',
      avatar: 'B'
    },
    {
      id: 'usr-mgr-2',
      nom: 'Yacine Bensalem (Agent Expéditions)',
      email: 'yacine.expeditions@transanis.dz',
      password: 'manager123',
      role: 'manager',
      telephone: '05.50.00.00.03',
      avatar: 'Y'
    },
    {
      id: 'usr-ch-1',
      nom: 'Leboukh Kamel',
      email: 'kamel.leboukh@transanis.dz',
      password: 'chauffeur123',
      role: 'chauffeur',
      chauffeur_id: 'ch-1',
      telephone: '06.67.05.66.67',
      avatar: 'K'
    }
  ];

  for (const u of users) {
    await db.runAsync(`
      INSERT INTO users (id, nom, email, password, role, telephone, chauffeur_id, actif, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?);
    `, [u.id, u.nom, u.email, u.password || '123456', u.role, u.telephone, u.chauffeur_id || null, u.avatar]);
  }

  // 6. Insertion des Ordres de Mission Récents
  const initialMissions = [
    {
      id: 'ord-2026-001',
      numero_bon: 'BT-2026-001',
      date_depart: '2026-10-24',
      date_arrivee_prevue: '2026-10-25',
      origine: 'Annaba (Siège EURL TRANSANIS)',
      destination: 'Alger (Zone Industrielle Rouiba)',
      distance_km: 600,
      camion_id: 'cam-1',
      camion_code: 'TR 1',
      matricule_camion: '500276.525.16 (287)',
      matricule_remorque: '500052.825.16',
      chauffeur_id: 'ch-1',
      chauffeur_nom: 'Leboukh Kamel',
      chauffeur_tel: '06.67.05.66.67',
      type_marchandise: 'Ronds à béton & Profilés Acier',
      poids_tonnes: 28,
      client: 'SARL METALLURGIE CENTRALE ROUIBA',
      client_tel: '023.85.12.30',
      client_adresse: 'Zone Industrielle Voie C, Rouiba, Alger',
      prix_mission_da: 60000,
      frais_route_da: 18000,
      benefice_net_da: 42000,
      statut_mission: 'arrive',
      statut_paiement: 'paye',
      num_facture: 'FACT-2026-014',
      date_paiement: '2026-10-25',
      mode_paiement: 'Virement bancaire',
      cree_par: 'Brahim Khelifi'
    },
    {
      id: 'ord-2026-002',
      numero_bon: 'BT-2026-002',
      date_depart: '2026-10-25',
      date_arrivee_prevue: '2026-10-25',
      origine: 'Annaba (Siège EURL TRANSANIS)',
      destination: 'Constantine (Le Khroub / Didouche)',
      distance_km: 155,
      camion_id: 'cam-3',
      camion_code: 'TR 3',
      matricule_camion: '500280.525.16 (292)',
      matricule_remorque: '500051.825.16',
      chauffeur_id: 'ch-3',
      chauffeur_nom: 'Fetairia Nadir',
      chauffeur_tel: '07.97.09.15.58',
      type_marchandise: 'Palettes Matériaux de Construction',
      poids_tonnes: 26,
      client: 'EURL CONSTANTINE DISTRIBUTION',
      client_tel: '031.66.45.10',
      client_adresse: 'Zone d\'Activité Le Khroub, Constantine',
      prix_mission_da: 38000,
      frais_route_da: 10000,
      benefice_net_da: 28000,
      statut_mission: 'en_route',
      statut_paiement: 'non_paye',
      num_facture: '',
      date_paiement: null,
      mode_paiement: 'En attente',
      cree_par: 'Brahim Khelifi'
    },
    {
      id: 'ord-2026-003',
      numero_bon: 'BT-2026-003',
      date_depart: '2026-10-26',
      date_arrivee_prevue: '2026-10-27',
      origine: 'Annaba (Siège EURL TRANSANIS)',
      destination: 'Sétif (Zone Industrielle)',
      distance_km: 285,
      camion_id: 'cam-4',
      camion_code: 'TR 4',
      matricule_camion: '500281.525.16 (293)',
      matricule_remorque: '500056.825.16',
      chauffeur_id: 'ch-4',
      chauffeur_nom: 'Hamouma Mohamed',
      chauffeur_tel: '07.91.03.64.39',
      type_marchandise: 'Carreaux Céramique & Faïence',
      poids_tonnes: 29,
      client: 'COMPTOIR DES MATÉRIAUX DES HAUTS PLATEAUX',
      client_tel: '036.92.11.04',
      client_adresse: 'Route de Batna, Sétif',
      prix_mission_da: 38000,
      frais_route_da: 10000,
      benefice_net_da: 28000,
      statut_mission: 'en_route',
      statut_paiement: 'facture',
      num_facture: 'FACT-2026-015',
      date_paiement: null,
      mode_paiement: 'Chèque à échéance 30j',
      cree_par: 'Yacine Bensalem'
    },
    {
      id: 'ord-2026-004',
      numero_bon: 'BT-2026-004',
      date_depart: '2026-10-26',
      date_arrivee_prevue: '2026-10-26',
      origine: 'Annaba (Siège EURL TRANSANIS)',
      destination: 'Annaba intra-muros (< 20 km)',
      distance_km: 15,
      camion_id: 'cam-2',
      camion_code: 'TR 2',
      matricule_camion: '500282.525.16 (285)',
      matricule_remorque: '500049.825.16',
      chauffeur_id: 'ch-2',
      chauffeur_nom: 'Leboukh Lotfi',
      chauffeur_tel: '06.70.46.05.32',
      type_marchandise: 'Transfert Stock Dépôt vers Port d\'Annaba',
      poids_tonnes: 30,
      client: 'ENTREPRISE PORTUAIRE D\'ANNABA (EPAN)',
      client_tel: '038.86.32.14',
      client_adresse: 'Quai Nord, Port d\'Annaba',
      prix_mission_da: 20000,
      frais_route_da: 3000,
      benefice_net_da: 17000,
      statut_mission: 'arrive',
      statut_paiement: 'paye',
      num_facture: 'FACT-2026-016',
      date_paiement: '2026-10-26',
      mode_paiement: 'Espèces',
      cree_par: 'Brahim Khelifi'
    }
  ];

  for (const m of initialMissions) {
    await db.runAsync(`
      INSERT INTO missions (
        id, numero_bon, date_depart, date_arrivee_prevue, origine, destination,
        distance_km, camion_id, camion_code, matricule_camion, matricule_remorque,
        chauffeur_id, chauffeur_nom, chauffeur_tel, type_marchandise, poids_tonnes,
        client, client_tel, client_adresse, prix_mission_da, frais_route_da,
        benefice_net_da, statut_mission, statut_paiement, num_facture, date_paiement,
        mode_paiement, cree_par
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      m.id, m.numero_bon, m.date_depart, m.date_arrivee_prevue, m.origine, m.destination,
      m.distance_km, m.camion_id, m.camion_code, m.matricule_camion, m.matricule_remorque,
      m.chauffeur_id, m.chauffeur_nom, m.chauffeur_tel, m.type_marchandise, m.poids_tonnes,
      m.client, m.client_tel, m.client_adresse, m.prix_mission_da, m.frais_route_da,
      m.benefice_net_da, m.statut_mission, m.statut_paiement, m.num_facture, m.date_paiement,
      m.mode_paiement, m.cree_par
    ]);
  }

  console.log('✓ Base de données SQLite EURL TRANSANIS alimentée avec succès depuis le CSV !');
}
