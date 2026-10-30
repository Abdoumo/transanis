// Service de communication avec l'API Backend Express & Base de données SQLite

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur serveur HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Authentification (Login / Logout)
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),

  // Health Check
  getHealth: () => request('/health'),

  // Statistiques SQL
  getStats: () => request('/stats'),

  // Camions
  getCamions: () => request('/camions'),
  addCamion: (camion) => request('/camions', { method: 'POST', body: camion }),
  updateCamion: (id, camion) => request(`/camions/${id}`, { method: 'PUT', body: camion }),
  reassignDriver: (id, chauffeurId, isTemporary, motif) => 
    request(`/camions/${id}/reassign-driver`, { method: 'PATCH', body: { chauffeurId, isTemporary, motif } }),
  resetDayDriver: (id) => request(`/camions/${id}/reset-day-driver`, { method: 'PATCH' }),
  deleteCamion: (id) => request(`/camions/${id}`, { method: 'DELETE' }),

  // Chauffeurs
  getChauffeurs: () => request('/chauffeurs'),
  addChauffeur: (chauffeur) => request('/chauffeurs', { method: 'POST', body: chauffeur }),
  updateChauffeur: (id, chauffeur) => request(`/chauffeurs/${id}`, { method: 'PUT', body: chauffeur }),
  deleteChauffeur: (id) => request(`/chauffeurs/${id}`, { method: 'DELETE' }),

  // Grille Tarifaire & Commission
  getPricingRules: () => request('/pricing-rules'),
  addPricingRule: (rule) => request('/pricing-rules', { method: 'POST', body: rule }),
  updatePricingRule: (id, rule) => request(`/pricing-rules/${id}`, { method: 'PUT', body: rule }),
  deletePricingRule: (id) => request(`/pricing-rules/${id}`, { method: 'DELETE' }),
  calculatePricing: (distanceKm) => request('/pricing-rules/calculate', { method: 'POST', body: { distanceKm } }),

  // Missions & Bons de Transport
  getMissions: () => request('/missions'),
  addMission: (mission) => request('/missions', { method: 'POST', body: mission }),
  updateMission: (id, mission) => request(`/missions/${id}`, { method: 'PUT', body: mission }),
  updateDeliveryStatus: (id, status) => 
    request(`/missions/${id}/delivery-status`, { method: 'PATCH', body: { status } }),
  updatePaymentStatus: (id, paymentStatus) => 
    request(`/missions/${id}/payment-status`, { method: 'PATCH', body: { paymentStatus } }),
  deleteMission: (id) => request(`/missions/${id}`, { method: 'DELETE' }),

  // Utilisateurs (CRUD)
  getUsers: () => request('/users'),
  addUser: (user) => request('/users', { method: 'POST', body: user }),
  updateUser: (id, user) => request(`/users/${id}`, { method: 'PUT', body: user }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // Réinitialisation de la DB depuis le CSV
  resetFactory: () => request('/reset-factory', { method: 'POST' })
};
