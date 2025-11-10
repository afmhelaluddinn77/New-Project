import { Outlet } from 'react-router-dom';
import { ClipboardList, Activity, LayoutDashboard, FileText } from 'lucide-react';
import DashboardLayout from '../components/shared/DashboardLayout';
import type { SidebarItem } from '../components/shared/Sidebar';

const PORTAL_COLOR = '#6FD9B8';

const NAV_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Unified Orders', path: '/orders', icon: ClipboardList },
  { id: 'results', label: 'Results Timeline', path: '/results', icon: Activity },
  { id: 'prescription', label: 'Prescription Preview', path: '/prescription/preview', icon: FileText },
];

export default function ProviderDashboardLayout() {
  return (
    <DashboardLayout
      sidebarItems={NAV_ITEMS}
      portalTitle="Provider Portal"
      portalColor={PORTAL_COLOR}
      userName="Dr. Smith"
      userRole="Physician"
    >
      <Outlet />
    </DashboardLayout>
  );
}

