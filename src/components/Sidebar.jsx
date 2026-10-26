import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FileText,
  Truck,
  Users,
  Calculator,
  UserCheck,
  BarChart3,
  MapPin
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { currentUser, missions, camions } = useApp();

  const activeMissionsCount = missions.filter(m => m.statutMission === 'en_route').length;
  const trucksInMissionCount = camions.filter(c => c.statut === 'en_mission').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: LayoutDashboard,
      badge: null,
      roles: ['admin', 'manager', 'chauffeur']
    },
    {
      id: 'missions',
      label: 'Ordres de Mission',
      icon: FileText,
      badge: activeMissionsCount > 0 ? `${activeMissionsCount} en route` : null,
      badgeColor: 'var(--status-warning)',
      roles: ['admin', 'manager', 'chauffeur']
    },
    {
      id: 'fleet',
      label: 'Flotte & Camions',
      icon: Truck,
      badge: `${camions.length} TR`,
      roles: ['admin', 'manager']
    },
    {
      id: 'chauffeurs',
      label: 'Chauffeurs (CSV)',
      icon: Users,
      badge: null,
      roles: ['admin', 'manager']
    },
    {
      id: 'pricing',
      label: 'Tarifs & Commission',
      icon: Calculator,
      badge: 'Admin',
      badgeColor: 'var(--accent-sky)',
      roles: ['admin', 'manager']
    },
    {
      id: 'users',
      label: 'Comptes & Utilisateurs',
      icon: UserCheck,
      badge: 'Admin',
      roles: ['admin']
    },
    {
      id: 'reports',
      label: 'Bilan & Bénéfices',
      icon: BarChart3,
      badge: null,
      roles: ['admin', 'manager']
    }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside className="sidebar no-print">
      <div style={{ marginBottom: '14px', paddingLeft: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Menu Principal
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
              {item.badge && (
                <span 
                  className="nav-item-badge" 
                  style={{ color: item.badgeColor || 'var(--text-secondary)' }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mini info card in sidebar footer */}
      <div style={{ 
        marginTop: 'auto', 
        padding: '16px', 
        background: 'var(--bg-card)', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid var(--border-subtle)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <MapPin size={16} color="var(--accent-sky)" />
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>Base Annaba</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Parc actif de 10 camions tracteurs & semi-remorques en rotation nationale.
        </p>
      </div>
    </aside>
  );
}
