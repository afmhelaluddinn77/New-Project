import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Scan, FileSignature } from 'lucide-react';
import DashboardLayout from '../components/shared/DashboardLayout';
import type { SidebarItem } from '../components/shared/Sidebar';

const PORTAL_COLOR = '#C4A7FF';

const NAV_ITEMS: SidebarItem[] = [
  { id: 'overview', label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { id: 'studies', label: 'Imaging Queue', path: '/queue', icon: Scan },
  { id: 'reports', label: 'Report Archive', path: '/reports', icon: FileSignature },
];

export default function RadiologyDashboardLayout() {
  return (
    <DashboardLayout
      sidebarItems={NAV_ITEMS}
      portalTitle="Radiology Portal"
      portalColor={PORTAL_COLOR}
      userName="Radiologist"
      userRole="Imaging Services"
    >
      <Outlet />
    </DashboardLayout>
  );
}

