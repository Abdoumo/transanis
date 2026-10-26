import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('transanis_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [chauffeurs, setChauffeurs] = useState([]);
  const [camions, setCamions] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [missions, setMissions] = useState([]);
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [error, setError] = useState(null);

  // Chargement de l'ensemble des données depuis la base SQLite
  const loadAllDataFromDB = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersData, chauffeursData, camionsData, pricingData, missionsData, statsData] = await Promise.all([
        api.getUsers(),
        api.getChauffeurs(),
        api.getCamions(),
        api.getPricingRules(),
        api.getMissions(),
        api.getStats().catch(() => null)
      ]);

      setUsers(usersData);
      setChauffeurs(chauffeursData);
      setCamions(camionsData);
      setPricingRules(pricingData);
      setMissions(missionsData);
      setDbStats(statsData);
      setDbConnected(true);

      // Si un utilisateur était connecté, actualiser ses infos
      const savedUserStr = localStorage.getItem('transanis_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        const updated = usersData.find(u => u.id === parsed.id);
        if (updated) {
          setCurrentUser(updated);
          localStorage.setItem('transanis_user', JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.error('Erreur chargement base de données SQLite:', err);
      setError(err.message);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllDataFromDB();
  }, [loadAllDataFromDB]);

  // Authentification (Login & Logout)
  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res && res.user) {
      setCurrentUser(res.user);
      localStorage.setItem('transanis_user', JSON.stringify(res.user));
      if (res.token) {
        localStorage.setItem('transanis_token', res.token);
      }
      return res.user;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('transanis_user');
    localStorage.removeItem('transanis_token');
    localStorage.removeItem('transanis_active_user_id');
  };

  // Bascule rapide de session (si admin ou pour tests)
  const switchUser = (user) => {
    setCurrentUser(user);
    if (user && user.id) {
      localStorage.setItem('transanis_user', JSON.stringify(user));
    }
  };

  // Helper Chauffeur
  const getChauffeurById = (chauffeurId) => {
    return chauffeurs.find(c => c.id === chauffeurId) || null;
  };

  const getEffectiveChauffeurForCamion = (camion) => {
    if (!camion) return null;
    const targetId = camion.chauffeurDuJourId || camion.chauffeurTitulaireId;
    return getChauffeurById(targetId);
  };

  // -------------------------------------------------------------------------
  // Opérations Camions dans SQLite
  // -------------------------------------------------------------------------
  const reassignChauffeur = async (camionId, chauffeurId, isTemporary = false, motif = '') => {
    try {
      await api.reassignDriver(camionId, chauffeurId, isTemporary, motif);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur réaffectation : ${err.message}`);
    }
  };

  const resetChauffeurDuJour = async (camionId) => {
    try {
      await api.resetDayDriver(camionId);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur rétablissement titulaire : ${err.message}`);
    }
  };

  const addCamion = async (newCamion) => {
    try {
      await api.addCamion(newCamion);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur ajout camion : ${err.message}`);
    }
  };

  const updateCamion = async (id, updatedFields) => {
    try {
      await api.updateCamion(id, updatedFields);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur modification camion : ${err.message}`);
    }
  };

  const deleteCamion = async (id) => {
    try {
      await api.deleteCamion(id);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur suppression camion : ${err.message}`);
    }
  };

  // -------------------------------------------------------------------------
  // Opérations Chauffeurs dans SQLite
  // -------------------------------------------------------------------------
  const addChauffeur = async (chauffeurData) => {
    try {
      await api.addChauffeur(chauffeurData);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur ajout chauffeur : ${err.message}`);
    }
  };

  const updateChauffeur = async (id, updatedFields) => {
    try {
      await api.updateChauffeur(id, updatedFields);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur mise à jour chauffeur : ${err.message}`);
    }
  };

  const deleteChauffeur = async (id) => {
    try {
      await api.deleteChauffeur(id);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur suppression chauffeur : ${err.message}`);
    }
  };

  // -------------------------------------------------------------------------
  // Opérations Utilisateurs dans SQLite (CRUD)
  // -------------------------------------------------------------------------
  const addUser = async (userData) => {
    try {
      await api.addUser(userData);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur création utilisateur : ${err.message}`);
    }
  };

  const updateUser = async (id, updatedFields) => {
    try {
      await api.updateUser(id, updatedFields);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur modification utilisateur : ${err.message}`);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.deleteUser(id);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur suppression utilisateur : ${err.message}`);
    }
  };

  // -------------------------------------------------------------------------
  // Opérations Grille Tarifaire dans SQLite
  // -------------------------------------------------------------------------
  const addPricingRule = async (ruleData) => {
    try {
      await api.addPricingRule(ruleData);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur ajout règle de prix : ${err.message}`);
    }
  };

  const updatePricingRule = async (id, updatedFields) => {
    try {
      await api.updatePricingRule(id, updatedFields);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur modification règle : ${err.message}`);
    }
  };

  const deletePricingRule = async (id) => {
    try {
      await api.deletePricingRule(id);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur suppression règle : ${err.message}`);
    }
  };

  // -------------------------------------------------------------------------
  // Opérations Ordres de Mission dans SQLite
  // -------------------------------------------------------------------------
  const addMission = async (missionData) => {
    try {
      const created = await api.addMission(missionData);
      await loadAllDataFromDB();
      return created;
    } catch (err) {
      alert(`Erreur émission ordre de mission : ${err.message}`);
    }
  };

  const updateMission = async (id, updatedFields) => {
    try {
      await api.updateMission(id, updatedFields);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur modification mission : ${err.message}`);
    }
  };

  const updateMissionDeliveryStatus = async (id, newStatus) => {
    try {
      await api.updateDeliveryStatus(id, newStatus);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur statut livraison : ${err.message}`);
    }
  };

  const updateMissionPaymentStatus = async (id, newPaymentStatus) => {
    try {
      await api.updatePaymentStatus(id, newPaymentStatus);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur statut paiement : ${err.message}`);
    }
  };

  const deleteMission = async (id) => {
    try {
      await api.deleteMission(id);
      await loadAllDataFromDB();
    } catch (err) {
      alert(`Erreur suppression ordre : ${err.message}`);
    }
  };

  // Réinitialiser la base de données depuis le CSV
  const resetToFactoryData = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser la base de données SQLite à partir du fichier CSV ?")) {
      try {
        await api.resetFactory();
        await loadAllDataFromDB();
        alert("✓ Base de données SQLite réinitialisée avec succès !");
      } catch (err) {
        alert(`Erreur réinitialisation : ${err.message}`);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: switchUser,
        login,
        logout,
        users,
        addUser,
        updateUser,
        deleteUser,

        camions,
        addCamion,
        updateCamion,
        deleteCamion,
        reassignChauffeur,
        resetChauffeurDuJour,
        getEffectiveChauffeurForCamion,

        chauffeurs,
        addChauffeur,
        updateChauffeur,
        deleteChauffeur,
        getChauffeurById,

        pricingRules,
        addPricingRule,
        updatePricingRule,
        deletePricingRule,

        missions,
        addMission,
        updateMission,
        deleteMission,
        updateMissionDeliveryStatus,
        updateMissionPaymentStatus,

        dbStats,
        loading,
        dbConnected,
        reloadFromDB: loadAllDataFromDB,
        resetToFactoryData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
