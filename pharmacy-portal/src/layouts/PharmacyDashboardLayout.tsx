import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Pill, ClipboardList } from 'lucide-react';
import DashboardLayout from '../components/shared/DashboardLayout';
import type { SidebarItem } from '../components/shared/Sidebar';

const PORTAL_COLOR = '#8FAFF5';

const NAV_ITEMS: SidebarItem[] = [
  { id: 'overview', label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { id: 'queue', label: 'Verification Queue', path: '/queue', icon: Pill },
  { id: 'logs', label: 'Dispense Log', path: '/logs', icon: ClipboardList },
];

export default function PharmacyDashboardLayout() {
  return (
    <DashboardLayout
      sidebarItems={NAV_ITEMS}
      portalTitle="Pharmacy Portal"
      portalColor={PORTAL_COLOR}
      userName="Pharmacist"
      userRole="Medication Safety"
    >
      <Outlet />
    </DashboardLayout>
  );
}

