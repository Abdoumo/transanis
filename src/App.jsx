import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MissionsList from './components/MissionsList';
import FleetManagement from './components/FleetManagement';
import ChauffeursList from './components/ChauffeursList';
import PricingRules from './components/PricingRules';
import UserManagement from './components/UserManagement';
import Reports from './components/Reports';
import MissionModal from './components/MissionModal';
import PrintDocumentModal from './components/PrintDocumentModal';
import LoginPage from './components/LoginPage';

function MainApp() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState(null);

  // Impression
  const [printModalState, setPrintModalState] = useState({
    isOpen: false,
    mission: null,
    docType: 'bon'
  });

  // Si aucun utilisateur n'est connecté, afficher la page de connexion
  if (!currentUser) {
    return <LoginPage />;
  }

  const handleOpenNewMission = () => {
    setEditingMission(null);
    setIsMissionModalOpen(true);
  };

  const handleEditMission = (mission) => {
    setEditingMission(mission);
    setIsMissionModalOpen(true);
  };

  const handlePrintMission = (mission, docType = 'bon') => {
    setPrintModalState({
      isOpen: true,
      mission,
      docType
    });
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="main-layout">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="content-area">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigateToNewMission={handleOpenNewMission}
              onSelectMissionForPrint={handlePrintMission}
            />
          )}

          {activeTab === 'missions' && (
            <MissionsList
              onOpenNewModal={handleOpenNewMission}
              onEditMission={handleEditMission}
              onPrintMission={handlePrintMission}
            />
          )}

          {activeTab === 'fleet' && <FleetManagement />}

          {activeTab === 'chauffeurs' && <ChauffeursList />}

          {activeTab === 'pricing' && <PricingRules />}

          {activeTab === 'users' && <UserManagement />}

          {activeTab === 'reports' && <Reports />}
        </main>
      </div>

      {/* Modal Création / Édition Mission */}
      {isMissionModalOpen && (
        <MissionModal
          missionToEdit={editingMission}
          isOpen={isMissionModalOpen}
          onClose={() => setIsMissionModalOpen(false)}
        />
      )}

      {/* Modal Impression Bon de Transport / Facture */}
      {printModalState.isOpen && (
        <PrintDocumentModal
          mission={printModalState.mission}
          initialDocType={printModalState.docType}
          isOpen={printModalState.isOpen}
          onClose={() => setPrintModalState(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
