import express from 'express';
import cors from 'cors';
import { db, initSchema } from './db.js';
import { seedDatabase } from './seed.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --------------------------------------------------------------------------
// 1. STATISTIQUES & TABLEAU DE BORD (Requêtes SQL Agrégées)
// --------------------------------------------------------------------------
app.get('/api/stats', async (req, res) => {
  try {
    const caRow = await db.getAsync(`
      SELECT 
        COALESCE(SUM(prix_mission_da), 0) as totalCA,
        COALESCE(SUM(benefice_net_da), 0) as totalBenefice,
        COALESCE(SUM(frais_route_da), 0) as totalFrais,
        COALESCE(SUM(distance_km), 0) as totalKm,
        COUNT(*) as totalMissions
      FROM missions;
    `);

    const paiements = await db.allAsync(`
      SELECT 
        statut_paiement, 
        COUNT(*) as count, 
        COALESCE(SUM(prix_mission_da), 0) as montant
      FROM missions
      GROUP BY statut_paiement;
    `);

    const missionsStatut = await db.allAsync(`
      SELECT 
        statut_mission, 
        COUNT(*) as count
      FROM missions
      GROUP BY statut_mission;
    `);

    const flotte = await db.getAsync(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'disponible' THEN 1 ELSE 0 END) as disponibles,
        SUM(CASE WHEN statut = 'en_mission' THEN 1 ELSE 0 END) as enMission,
        SUM(CASE WHEN chauffeur_du_jour_id IS NOT NULL THEN 1 ELSE 0 END) as remplacementsJour
      FROM camions;
    `);

    res.json({
      success: true,
      summary: caRow,
      paiements,
      missionsStatut,
      flotte
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------------
// 2. GESTION DES CHAUFFEURS (CRUD & Données CSV)
// --------------------------------------------------------------------------
app.get('/api/chauffeurs', async (req, res) => {
  try {
    const chauffeurs = await db.allAsync(`
      SELECT * FROM chauffeurs ORDER BY nom ASC;
    `);
    res.json(chauffeurs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chauffeurs', async (req, res) => {
  try {
    const { nom, telephone, numPermis, wilayaResidence, statut, creerCompte } = req.body;
    const id = `ch-${Date.now()}`;

    await db.runAsync(`
      INSERT INTO chauffeurs (id, nom, telephone, num_permis, camion_par_defaut, statut, date_embauche, wilaya_residence)
      VALUES (?, ?, ?, ?, '', ?, date('now'), ?);
    `, [id, nom, telephone, numPermis || 'Poids lourd Cat. C/E', statut || 'actif', wilayaResidence || 'Annaba']);

    // Création automatique du compte utilisateur si demandé
    if (creerCompte) {
      const email = `${nom.toLowerCase().replace(/[^a-z0-9]/g, '.')}@transanis.dz`;
      await db.runAsync(`
        INSERT OR IGNORE INTO users (id, nom, email, role, telephone, chauffeur_id, actif, avatar)
        VALUES (?, ?, ?, 'chauffeur', ?, ?, 1, ?);
      `, [`usr-${id}`, nom, email, telephone, id, nom.charAt(0).toUpperCase()]);
    }

    const created = await db.getAsync(`SELECT * FROM chauffeurs WHERE id = ?;`, [id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/chauffeurs/:id', async (req, res) => {
  try {
    const { nom, telephone, num_permis, wilaya_residence, statut, camion_par_defaut } = req.body;
    await db.runAsync(`
      UPDATE chauffeurs 
      SET nom = ?, telephone = ?, num_permis = ?, wilaya_residence = ?, statut = ?, camion_par_defaut = ?
      WHERE id = ?;
    `, [nom, telephone, num_permis, wilaya_residence, statut, camion_par_defaut || '', req.params.id]);

    const updated = await db.getAsync(`SELECT * FROM chauffeurs WHERE id = ?;`, [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/chauffeurs/:id', async (req, res) => {
  try {
    await db.runAsync(`DELETE FROM chauffeurs WHERE id = ?;`, [req.params.id]);
    res.json({ success: true, message: 'Chauffeur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------------
// 3. GESTION DES CAMIONS & RÉAFFECTATION DU JOUR (Admin)
// --------------------------------------------------------------------------
app.get('/api/camions', async (req, res) => {
  try {
    const camions = await db.allAsync(`
      SELECT 
        c.*,
        t.nom as titulaire_nom, t.telephone as titulaire_tel,
        j.nom as du_jour_nom, j.telephone as du_jour_tel
      FROM camions c
      LEFT JOIN chauffeurs t ON c.chauffeur_titulaire_id = t.id
      LEFT JOIN chauffeurs j ON c.chauffeur_du_jour_id = j.id
      ORDER BY CAST(SUBSTR(c.code, 4) AS INTEGER) ASC, c.code ASC;
    `);

    // Adaptation au format camelCase attendu par le frontend React
    const formatted = camions.map(c => ({
      id: c.id,
      code: c.code,
      matriculeCamion: c.matricule_camion,
      matriculeRemorque: c.matricule_remorque,
      chauffeurTitulaireId: c.chauffeur_titulaire_id,
      chauffeurDuJourId: c.chauffeur_du_jour_id,
      motifRemplacement: c.motif_remplacement,
      marque: c.marque,
      chargeMaxTonnes: c.charge_max_tonnes,
      statut: c.statut,
      titulaireNom: c.titulaire_nom,
      titulaireTel: c.titulaire_tel,
      duJourNom: c.du_jour_nom,
      duJourTel: c.du_jour_tel
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/camions', async (req, res) => {
  try {
    const { code, matriculeCamion, matriculeRemorque, chauffeurTitulaireId, marque, chargeMaxTonnes } = req.body;
    const id = `cam-${Date.now()}`;

    await db.runAsync(`
      INSERT INTO camions (id, code, matricule_camion, matricule_remorque, chauffeur_titulaire_id, marque, charge_max_tonnes, statut)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'disponible');
    `, [id, code, matriculeCamion, matriculeRemorque, chauffeurTitulaireId, marque || 'Renault Trucks', chargeMaxTonnes || 32]);

    res.status(201).json({ id, code, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/camions/:id', async (req, res) => {
  try {
    const { code, matriculeCamion, matriculeRemorque, chauffeurTitulaireId, marque, chargeMaxTonnes, statut } = req.body;
    await db.runAsync(`
      UPDATE camions 
      SET code = ?, matricule_camion = ?, matricule_remorque = ?, chauffeur_titulaire_id = ?, marque = ?, charge_max_tonnes = ?, statut = COALESCE(?, statut)
      WHERE id = ?;
    `, [code, matriculeCamion, matriculeRemorque, chauffeurTitulaireId, marque, chargeMaxTonnes, statut, req.params.id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Réaffectation de chauffeur (permanent ou pour la journée)
app.patch('/api/camions/:id/reassign-driver', async (req, res) => {
  try {
    const { chauffeurId, isTemporary, motif } = req.body;
    const camionId = req.params.id;

    if (isTemporary) {
      await db.runAsync(`
        UPDATE camions 
        SET chauffeur_du_jour_id = ?, motif_remplacement = ?
        WHERE id = ?;
      `, [chauffeurId, motif || 'Remplacement exceptionnel de la journée', camionId]);
    } else {
      await db.runAsync(`
        UPDATE camions 
        SET chauffeur_titulaire_id = ?, chauffeur_du_jour_id = NULL, motif_remplacement = ''
        WHERE id = ?;
      `, [chauffeurId, camionId]);
    }

    res.json({ success: true, message: 'Chauffeur réaffecté avec succès dans la base de données' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rétablir le titulaire
app.patch('/api/camions/:id/reset-day-driver', async (req, res) => {
  try {
    await db.runAsync(`
      UPDATE camions 
      SET chauffeur_du_jour_id = NULL, motif_remplacement = ''
      WHERE id = ?;
    `, [req.params.id]);

    res.json({ success: true, message: 'Chauffeur titulaire rétabli' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/camions/:id', async (req, res) => {
  try {
    await db.runAsync(`DELETE FROM camions WHERE id = ?;`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------------
// 4. GRILLE TARIFAIRE & COMMISSIONS KILOMÉTRIQUES (Admin CRUD)
// --------------------------------------------------------------------------
app.get('/api/pricing-rules', async (req, res) => {
  try {
    const rules = await db.allAsync(`
      SELECT 
        id, titre, min_km as minKm, max_km as maxKm, prix_da as prixDA,
        mode, frais_route_estimes_da as fraisRouteEstimesDA, description
      FROM pricing_rules 
      ORDER BY min_km ASC;
    `);
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pricing-rules', async (req, res) => {
  try {
    const { titre, minKm, maxKm, prixDA, mode, fraisRouteEstimesDA, description } = req.body;
    const id = `rule-${Date.now()}`;

    await db.runAsync(`
      INSERT INTO pricing_rules (id, titre, min_km, max_km, prix_da, mode, frais_route_estimes_da, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [id, titre, minKm, maxKm, prixDA, mode || 'fixe', fraisRouteEstimesDA || Math.round(prixDA * 0.3), description]);

    res.status(201).json({ id, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pricing-rules/:id', async (req, res) => {
  try {
    const { titre, minKm, maxKm, prixDA, mode, fraisRouteEstimesDA, description } = req.body;
    await db.runAsync(`
      UPDATE pricing_rules 
      SET titre = ?, min_km = ?, max_km = ?, prix_da = ?, mode = ?, frais_route_estimes_da = ?, description = ?
      WHERE id = ?;
    `, [titre, minKm, maxKm, prixDA, mode || 'fixe', fraisRouteEstimesDA, description, req.params.id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pricing-rules/:id', async (req, res) => {
  try {
    await db.runAsync(`DELETE FROM pricing_rules WHERE id = ?;`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Calcul de tarif basé sur la grille SQLite
app.post('/api/pricing-rules/calculate', async (req, res) => {
  try {
    const km = Math.max(0, Number(req.body.distanceKm) || 0);

    const matchedRule = await db.getAsync(`
      SELECT * FROM pricing_rules 
      WHERE ? >= min_km AND ? <= max_km
      LIMIT 1;
    `, [km, km]);

    if (matchedRule) {
      const prix = matchedRule.mode === 'par_km' ? km * matchedRule.prix_da : matchedRule.prix_da;
      const frais = matchedRule.frais_route_estimes_da || Math.round(prix * 0.3);
      return res.json({
        prixDA: prix,
        fraisRouteDA: frais,
        beneficeDA: prix - frais,
        ruleMatched: matchedRule
      });
    }

    if (km < 20) {
      return res.json({
        prixDA: 20000,
        fraisRouteDA: 3000,
        beneficeDA: 17000,
        ruleMatched: { titre: 'Tarif minimum garanti (<20km)' }
      });
    }

    const defaultPrice = Math.round(km * 85);
    const defaultFrais = Math.round(km * 25);
    res.json({
      prixDA: defaultPrice,
      fraisRouteDA: defaultFrais,
      beneficeDA: defaultPrice - defaultFrais,
      ruleMatched: { titre: 'Tarif kilométrique standard' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------------
// 5. ORDRES DE MISSION & BONS DE TRANSPORT (CRUD & Statuts)
// --------------------------------------------------------------------------
app.get('/api/missions', async (req, res) => {
  try {
    const missions = await db.allAsync(`
      SELECT 
        id, numero_bon as numeroBon, date_creation as dateCreation,
        date_depart as dateDepart, date_arrivee_prevue as dateArriveePrevue,
        origine, destination, distance_km as distanceKm,
        camion_id as camionId, camion_code as camionCode,
        matricule_camion as matriculeCamion, matricule_remorque as matriculeRemorque,
        chauffeur_id as chauffeurId, chauffeur_nom as chauffeurNom,
        chauffeur_tel as chauffeurTel, type_marchandise as typeMarchandise,
        poids_tonnes as poidsTonnes, client, client_tel as clientTel,
        client_adresse as clientAdresse, prix_mission_da as prixMissionDA,
        frais_route_da as fraisRouteDA, benefice_net_da as beneficeNetDA,
        statut_mission as statutMission, statut_paiement as statutPaiement,
        num_facture as numFacture, date_paiement as datePaiement,
        mode_paiement as modePaiement, cree_par as creePar
      FROM missions
      ORDER BY date_depart DESC, date_creation DESC;
    `);
    res.json(missions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/missions', async (req, res) => {
  try {
    const m = req.body;
    const id = `ord-${Date.now()}`;

    // Comptage pour numéro de bon BT-2026-XXX
    const countRow = await db.getAsync(`SELECT COUNT(*) as count FROM missions;`);
    const count = (countRow.count || 0) + 1;
    const numeroBon = m.numeroBon || `BT-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

    const prixMissionDA = Number(m.prixMissionDA) || 0;
    const fraisRouteDA = Number(m.fraisRouteDA) || Math.round(prixMissionDA * 0.3);
    const beneficeNetDA = prixMissionDA - fraisRouteDA;

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
      id,
      numeroBon,
      m.dateDepart || new Date().toISOString().split('T')[0],
      m.dateArriveePrevue || m.dateDepart,
      m.origine,
      m.destination,
      m.distanceKm,
      m.camionId,
      m.camionCode,
      m.matriculeCamion,
      m.matriculeRemorque,
      m.chauffeurId,
      m.chauffeurNom,
      m.chauffeurTel,
      m.typeMarchandise,
      m.poidsTonnes,
      m.client,
      m.clientTel,
      m.clientAdresse,
      prixMissionDA,
      fraisRouteDA,
      beneficeNetDA,
      m.statutMission || 'en_route',
      m.statutPaiement || 'non_paye',
      m.numFacture || '',
      m.datePaiement || null,
      m.modePaiement || 'En attente',
      m.creePar || 'Manager Logistique'
    ]);

    // Mettre à jour le camion en 'en_mission' si mission active
    if (m.camionId && (m.statutMission === 'en_route' || m.statutMission === 'planifie')) {
      await db.runAsync(`UPDATE camions SET statut = 'en_mission' WHERE id = ?;`, [m.camionId]);
    }

    const created = await db.getAsync(`SELECT * FROM missions WHERE id = ?;`, [id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/missions/:id', async (req, res) => {
  try {
    const m = req.body;
    const prixMissionDA = Number(m.prixMissionDA) || 0;
    const fraisRouteDA = Number(m.fraisRouteDA) || 0;
    const beneficeNetDA = prixMissionDA - fraisRouteDA;

    await db.runAsync(`
      UPDATE missions SET
        origine = ?, destination = ?, distance_km = ?, camion_id = ?, camion_code = ?,
        matricule_camion = ?, matricule_remorque = ?, chauffeur_id = ?, chauffeur_nom = ?,
        chauffeur_tel = ?, type_marchandise = ?, poids_tonnes = ?, client = ?, client_tel = ?,
        client_adresse = ?, prix_mission_da = ?, frais_route_da = ?, benefice_net_da = ?,
        statut_mission = ?, statut_paiement = ?, date_depart = ?, date_arrivee_prevue = ?,
        mode_paiement = ?
      WHERE id = ?;
    `, [
      m.origine, m.destination, m.distanceKm, m.camionId, m.camionCode,
      m.matriculeCamion, m.matriculeRemorque, m.chauffeurId, m.chauffeurNom,
      m.chauffeurTel, m.typeMarchandise, m.poidsTonnes, m.client, m.clientTel,
      m.clientAdresse, prixMissionDA, fraisRouteDA, beneficeNetDA,
      m.statutMission, m.statutPaiement, m.dateDepart, m.dateArriveePrevue,
      m.modePaiement, req.params.id
    ]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Changement rapide statut de livraison
app.patch('/api/missions/:id/delivery-status', async (req, res) => {
  try {
    const { status } = req.body;
    const mission = await db.getAsync(`SELECT * FROM missions WHERE id = ?;`, [req.params.id]);

    await db.runAsync(`UPDATE missions SET statut_mission = ? WHERE id = ?;`, [status, req.params.id]);

    // Libérer le camion quand la mission arrive
    if (status === 'arrive' && mission && mission.camion_id) {
      await db.runAsync(`UPDATE camions SET statut = 'disponible' WHERE id = ?;`, [mission.camion_id]);
    } else if (status === 'en_route' && mission && mission.camion_id) {
      await db.runAsync(`UPDATE camions SET statut = 'en_mission' WHERE id = ?;`, [mission.camion_id]);
    }

    res.json({ success: true, newStatus: status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Changement rapide statut de paiement
app.patch('/api/missions/:id/payment-status', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    let numFactureUpdate = null;
    let datePaiementUpdate = null;

    if (paymentStatus === 'facture') {
      const randomNum = Math.floor(100 + Math.random() * 900);
      numFactureUpdate = `FACT-${new Date().getFullYear()}-${randomNum}`;
    } else if (paymentStatus === 'paye') {
      datePaiementUpdate = new Date().toISOString().split('T')[0];
    }

    await db.runAsync(`
      UPDATE missions 
      SET 
        statut_paiement = ?,
        num_facture = CASE WHEN ? IS NOT NULL AND (num_facture IS NULL OR num_facture = '') THEN ? ELSE num_facture END,
        date_paiement = COALESCE(?, date_paiement)
      WHERE id = ?;
    `, [paymentStatus, numFactureUpdate, numFactureUpdate, datePaiementUpdate, req.params.id]);

    res.json({ success: true, paymentStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/missions/:id', async (req, res) => {
  try {
    await db.runAsync(`DELETE FROM missions WHERE id = ?;`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------------
// 6. AUTHENTIFICATION & UTILISATEURS (Login / Logout / CRUD)
// --------------------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Veuillez saisir votre email et votre mot de passe.' });
    }

    const user = await db.getAsync(`
      SELECT id, nom, email, password, role, telephone, chauffeur_id as chauffeurId, actif, avatar
      FROM users
      WHERE LOWER(email) = LOWER(?) AND actif = 1;
    `, [email.trim()]);

    if (!user) {
      return res.status(401).json({ error: 'Identifiant invalide ou compte inactif.' });
    }

    if (user.password && user.password !== password) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    const { password: _, ...safeUser } = user;
    const token = `transanis_token_${user.id}_${Date.now()}`;

    res.json({
      success: true,
      user: safeUser,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await db.allAsync(`
      SELECT 
        id, nom, email, role, telephone, chauffeur_id as chauffeurId, 
        actif, avatar, created_at as createdAt 
      FROM users 
      ORDER BY role ASC, nom ASC;
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { nom, email, password, role, telephone, chauffeurId, actif } = req.body;
    const id = `usr-${Date.now()}`;
    const avatar = nom.charAt(0).toUpperCase();

    await db.runAsync(`
      INSERT INTO users (id, nom, email, password, role, telephone, chauffeur_id, actif, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [id, nom, email, password || '123456', role, telephone, chauffeurId || null, actif ? 1 : 0, avatar]);

    res.status(201).json({ id, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { nom, email, password, role, telephone, chauffeurId, actif } = req.body;
    if (password) {
      await db.runAsync(`
        UPDATE users 
        SET nom = ?, email = ?, password = ?, role = ?, telephone = ?, chauffeur_id = ?, actif = ?
        WHERE id = ?;
      `, [nom, email, password, role, telephone, chauffeurId || null, actif ? 1 : 0, req.params.id]);
    } else {
      await db.runAsync(`
        UPDATE users 
        SET nom = ?, email = ?, role = ?, telephone = ?, chauffeur_id = ?, actif = ?
        WHERE id = ?;
      `, [nom, email, role, telephone, chauffeurId || null, actif ? 1 : 0, req.params.id]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.runAsync(`DELETE FROM users WHERE id = ?;`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------------
// 7. RÉINITIALISATION DE LA BASE DE DONNÉES DEPUIS LE FICHIER CSV
// --------------------------------------------------------------------------
app.post('/api/reset-factory', async (req, res) => {
  try {
    await seedDatabase(true);
    res.json({ success: true, message: 'Base de données SQLite réinitialisée avec succès à partir du CSV !' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Démarrage du serveur et initialisation DB
async function startServer() {
  await seedDatabase(false);
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`====================================================`);
    console.log(`🚀 SERVEUR BACKEND EURL TRANSANIS ACTIF`);
    console.log(`📡 URL REST API : http://127.0.0.1:${PORT}`);
    console.log(`💾 BASE DE DONNÉES : SQLite (database.sqlite)`);
    console.log(`====================================================`);
  });
}

startServer();
