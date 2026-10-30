import { db, initSchema } from './db.js';

// Script CLI pour créer ou mettre à jour un utilisateur dans la base SQLite EURL TRANSANIS
// Usage: node server/create_user.js <email> <password> <role: admin|manager|chauffeur> [nom] [telephone]
// Exemple: node server/create_user.js admin@transanis.dz admin123 admin "Anis Meziani" 0550000001

async function createOrUpdateUser() {
  await initSchema();

  const args = process.argv.slice(2);
  const email = (args[0] || 'admin@transanis.dz').trim().toLowerCase();
  const password = args[1] || 'admin123';
  const role = (args[2] || 'admin').toLowerCase();
  const nom = args[3] || 'Administrateur Principal';
  const telephone = args[4] || '05.50.00.00.01';

  try {
    const existing = await db.getAsync(`SELECT * FROM users WHERE LOWER(email) = LOWER(?);`, [email]);

    if (existing) {
      await db.runAsync(`
        UPDATE users 
        SET password = ?, role = ?, nom = ?, telephone = ?, actif = 1
        WHERE id = ?;
      `, [password, role, nom, telephone, existing.id]);
      console.log(`✅ Utilisateur mis à jour avec succès :`);
    } else {
      const id = `usr-${Date.now()}`;
      const avatar = nom.charAt(0).toUpperCase();
      await db.runAsync(`
        INSERT INTO users (id, nom, email, password, role, telephone, actif, avatar)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?);
      `, [id, nom, email, password, role, telephone, avatar]);
      console.log(`✅ Nouvel utilisateur créé avec succès :`);
    }

    console.log(`   - Nom : ${nom}`);
    console.log(`   - Email : ${email}`);
    console.log(`   - Mot de passe : ${password}`);
    console.log(`   - Rôle : ${role}`);
    console.log(`   - Téléphone : ${telephone}`);
    console.log(`   - Statut : Actif`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur création utilisateur :', err.message);
    process.exit(1);
  }
}

createOrUpdateUser();
