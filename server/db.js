import sqlite3Pkg from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const sqlite3 = sqlite3Pkg.verbose();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DB_PATH = path.join(__dirname, 'database.sqlite');
export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erreur de connexion à SQLite:', err.message);
  } else {
    console.log('✓ Connecté à la base de données SQLite EURL TRANSANIS:', DB_PATH);
  }
});

// Promisification des méthodes SQLite
db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialisation du schéma SQLite
export async function initSchema() {
  await db.runAsync(`PRAGMA foreign_keys = ON;`);

  // 1. Table Utilisateurs (CRUD & Authentification)
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL DEFAULT '123456',
      role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'chauffeur')),
      telephone TEXT,
      chauffeur_id TEXT,
      actif INTEGER DEFAULT 1,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration sécurisée si la colonne password n'existe pas encore
  try {
    const userColumns = await db.allAsync(`PRAGMA table_info(users);`);
    const hasPassword = userColumns.some(c => c.name === 'password');
    if (!hasPassword) {
      await db.runAsync(`ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT '123456';`);
      console.log('✓ Migration: colonne password ajoutée à la table users');
    }
  } catch (migErr) {
    console.error('Erreur migration users:', migErr);
  }

  // 2. Table Chauffeurs (issus du CSV + ajouts)
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS chauffeurs (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      telephone TEXT NOT NULL,
      num_permis TEXT,
      camion_par_defaut TEXT,
      statut TEXT DEFAULT 'actif' CHECK(statut IN ('actif', 'en_conge', 'malade', 'inactif')),
      date_embauche TEXT,
      wilaya_residence TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Table Camions (TR 1 à TR 10 + ajouts)
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS camions (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      matricule_camion TEXT NOT NULL,
      matricule_remorque TEXT NOT NULL,
      chauffeur_titulaire_id TEXT,
      chauffeur_du_jour_id TEXT,
      motif_remplacement TEXT,
      marque TEXT,
      charge_max_tonnes REAL DEFAULT 30,
      statut TEXT DEFAULT 'disponible' CHECK(statut IN ('disponible', 'en_mission', 'maintenance')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chauffeur_titulaire_id) REFERENCES chauffeurs(id) ON DELETE SET NULL,
      FOREIGN KEY (chauffeur_du_jour_id) REFERENCES chauffeurs(id) ON DELETE SET NULL
    );
  `);

  // 4. Table Grille de Tarification & Commissions (définie par l'Admin)
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS pricing_rules (
      id TEXT PRIMARY KEY,
      titre TEXT NOT NULL,
      min_km REAL NOT NULL,
      max_km REAL NOT NULL,
      prix_da REAL NOT NULL,
      mode TEXT DEFAULT 'fixe',
      frais_route_estimes_da REAL DEFAULT 0,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Table Ordres de Mission (Bons de Transport & Facturation)
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY,
      numero_bon TEXT UNIQUE NOT NULL,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_depart TEXT,
      date_arrivee_prevue TEXT,
      origine TEXT NOT NULL,
      destination TEXT NOT NULL,
      distance_km REAL NOT NULL,
      camion_id TEXT,
      camion_code TEXT,
      matricule_camion TEXT,
      matricule_remorque TEXT,
      chauffeur_id TEXT,
      chauffeur_nom TEXT,
      chauffeur_tel TEXT,
      type_marchandise TEXT,
      poids_tonnes REAL,
      client TEXT,
      client_tel TEXT,
      client_adresse TEXT,
      prix_mission_da REAL NOT NULL,
      frais_route_da REAL DEFAULT 0,
      benefice_net_da REAL NOT NULL,
      statut_mission TEXT DEFAULT 'en_route' CHECK(statut_mission IN ('planifie', 'en_route', 'arrive', 'annule')),
      statut_paiement TEXT DEFAULT 'non_paye' CHECK(statut_paiement IN ('non_paye', 'paye', 'facture')),
      num_facture TEXT,
      date_paiement TEXT,
      mode_paiement TEXT,
      cree_par TEXT,
      FOREIGN KEY (camion_id) REFERENCES camions(id) ON DELETE SET NULL,
      FOREIGN KEY (chauffeur_id) REFERENCES chauffeurs(id) ON DELETE SET NULL
    );
  `);

  console.log('✓ Schéma des tables SQLite initialisé avec succès');
}
