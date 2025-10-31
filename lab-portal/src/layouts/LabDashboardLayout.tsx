import { Outlet } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, History } from 'lucide-react';
import DashboardLayout from '../components/shared/DashboardLayout';
import type { SidebarItem } from '../components/shared/Sidebar';

const PORTAL_COLOR = '#6DD4E7';

const NAV_ITEMS: SidebarItem[] = [
  { id: 'overview', label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { id: 'worklist', label: 'Worklist', path: '/worklist', icon: FlaskConical },
  { id: 'history', label: 'History', path: '/history', icon: History },
];

export default function LabDashboardLayout() {
  return (
    <DashboardLayout
      sidebarItems={NAV_ITEMS}
      portalTitle="Lab Portal"
      portalColor={PORTAL_COLOR}
      userName="Lab Technician"
      userRole="Clinical Laboratory"
    >
      <Outlet />
    </DashboardLayout>
  );
}

