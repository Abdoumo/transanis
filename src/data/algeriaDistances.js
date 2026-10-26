// Répertoire des Wilayas et Villes industrielles d'Algérie avec matrice de distances routières (km)

export const ALGERIA_HUBS = [
  { id: 'annaba', name: 'Annaba (Siège EURL TRANSANIS)', wilaya: '23 - Annaba', isHQ: true },
  { id: 'alger', name: 'Alger (Centre / Port)', wilaya: '16 - Alger' },
  { id: 'rouiba', name: 'Alger (Zone Industrielle Rouiba)', wilaya: '16 - Alger' },
  { id: 'baraki', name: 'Alger (Baraki / Oued Smar)', wilaya: '16 - Alger' },
  { id: 'oran', name: 'Oran (Port / Hassi Ameur)', wilaya: '31 - Oran' },
  { id: 'constantine', name: 'Constantine (Le Khroub / Didouche)', wilaya: '25 - Constantine' },
  { id: 'setif', name: 'Sétif (Zone Industrielle)', wilaya: '19 - Sétif' },
  { id: 'skikda', name: 'Skikda (Zone Pétrochimique / Port)', wilaya: '21 - Skikda' },
  { id: 'batna', name: 'Batna (Zone Industrielle)', wilaya: '05 - Batna' },
  { id: 'bejaia', name: 'Béjaïa (Port / Akbou)', wilaya: '06 - Béjaïa' },
  { id: 'blida', name: 'Blida (Beni Mered / Boufarik)', wilaya: '09 - Blida' },
  { id: 'biskra', name: 'Biskra', wilaya: '07 - Biskra' },
  { id: 'bba', name: 'Bordj Bou Arréridj', wilaya: '34 - Bordj Bou Arréridj' },
  { id: 'chlef', name: 'Chlef', wilaya: '02 - Chlef' },
  { id: 'djelfa', name: 'Djelfa', wilaya: '17 - Djelfa' },
  { id: 'mostaganem', name: 'Mostaganem', wilaya: '27 - Mostaganem' },
  { id: 'ouargla', name: 'Ouargla', wilaya: '30 - Ouargla' },
  { id: 'hassi_messaoud', name: 'Hassi Messaoud (Bases Sud)', wilaya: '30 - Ouargla' },
  { id: 'tlemcen', name: 'Tlemcen', wilaya: '13 - Tlemcen' },
  { id: 'tebessa', name: 'Tébessa', wilaya: '12 - Tébessa' },
  { id: 'guelma', name: 'Guelma', wilaya: '24 - Guelma' },
  { id: 'souk_ahras', name: 'Souk Ahras', wilaya: '41 - Souk Ahras' },
  { id: 'el_tarf', name: 'El Tarf', wilaya: '36 - El Tarf' },
  { id: 'local_annaba', name: 'Annaba intra-muros (< 20 km)', wilaya: '23 - Annaba' }
];

// Matrice symétrique des distances routières les plus courantes (en KM)
const DISTANCE_MATRIX = {
  'annaba-alger': 600,
  'annaba-rouiba': 585,
  'annaba-baraki': 595,
  'annaba-oran': 980,
  'annaba-constantine': 155,
  'annaba-setif': 285,
  'annaba-skikda': 105,
  'annaba-batna': 210,
  'annaba-bejaia': 320,
  'annaba-blida': 640,
  'annaba-biskra': 330,
  'annaba-bba': 345,
  'annaba-ouargla': 690,
  'annaba-hassi_messaoud': 780,
  'annaba-tebessa': 190,
  'annaba-guelma': 65,
  'annaba-souk_ahras': 95,
  'annaba-el_tarf': 70,
  'annaba-local_annaba': 15,

  'alger-oran': 420,
  'alger-constantine': 400,
  'alger-setif': 300,
  'alger-skikda': 500,
  'alger-blida': 45,
  'alger-bejaia': 250,
  'alger-bba': 230,
  'alger-chlef': 210,
  'alger-djelfa': 300,
  'alger-ouargla': 800,
  'alger-hassi_messaoud': 880,
  'alger-rouiba': 25,
  'alger-baraki': 18,

  'oran-constantine': 820,
  'oran-setif': 720,
  'oran-mostaganem': 85,
  'oran-tlemcen': 140,
  'oran-chlef': 210,

  'constantine-skikda': 85,
  'constantine-setif': 130,
  'constantine-batna': 120,
  'constantine-guelma': 110,
  'constantine-biskra': 230,
  'constantine-ouargla': 580
};

export function getEstimatedDistance(fromNameOrId, toNameOrId) {
  if (!fromNameOrId || !toNameOrId) return 0;
  if (fromNameOrId === toNameOrId) return 15; // trajet local court

  // Normalisation des clés
  const normalize = (str) => {
    const found = ALGERIA_HUBS.find(h => h.id === str || h.name.toLowerCase().includes(str.toLowerCase()));
    return found ? found.id : str.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const id1 = normalize(fromNameOrId);
  const id2 = normalize(toNameOrId);

  if (id1 === id2) return 15;

  const key1 = `${id1}-${id2}`;
  const key2 = `${id2}-${id1}`;

  if (DISTANCE_MATRIX[key1]) return DISTANCE_MATRIX[key1];
  if (DISTANCE_MATRIX[key2]) return DISTANCE_MATRIX[key2];

  // Estimation si pas dans la matrice : si Annaba vers autre ville moyenne
  return 350; // distance moyenne par défaut
}
