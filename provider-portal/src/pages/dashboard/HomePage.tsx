import { useEffect, useMemo } from 'react';
import {
  Users,
  ClipboardList,
  Pill,
  Activity,
  FileText,
  Stethoscope,
} from 'lucide-react';
import Breadcrumb from '../../components/shared/Breadcrumb';
import DashboardCard from '../../components/shared/DashboardCard';
import './HomePage.css';
import { useOrdersStore } from '../../store/ordersStore';
import type { UnifiedOrder } from '../../types/workflow';

const formatDate = (iso: string) => new Date(iso).toLocaleString();

const flattenEvents = (orders: UnifiedOrder[]) =>
  orders
    .flatMap((order) => order.events.map((event) => ({ ...event, orderNumber: order.orderNumber })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export default function DashboardHomePage() {
  const { orders, loading, fetchOrders } = useOrdersStore();

  useEffect(() => {
    if (orders.length === 0) {
      void fetchOrders();
    }
  }, [orders.length, fetchOrders]);

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter((order) => order.status !== 'COMPLETED').length;
    const completedOrders = orders.filter((order) => order.status === 'COMPLETED').length;
    const pharmacyItems = orders.flatMap((order) =>
      order.items.filter((item) => item.itemType === 'PHARMACY'),
    );
    const pendingPrescriptions = pharmacyItems.filter((item) => item.status !== 'COMPLETED').length;

    return {
      totalOrders,
      activeOrders,
      completedOrders,
      pendingPrescriptions,
    };
  }, [orders]);

  const recentEvents = useMemo(() => flattenEvents(orders).slice(0, 5), [orders]);

  return (
    <div className="dashboard-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Dashboard' }]} />

      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Clinical Command Center</h1>
          <p className="dashboard-subtitle">
            Unified view of orders, fulfillment, and results. Monitor activity across all services in real time.
          </p>
        </div>
      </div>

      <div className="dashboard-cards-grid">
        <DashboardCard
          title="Active Orders"
          subtitle="Across all services"
          icon={<ClipboardList size={24} />}
        >
          <div className="card-metric">
            <span className="metric-value">{metrics.activeOrders}</span>
            <span className="metric-trend trend-positive">{metrics.totalOrders} total</span>
          </div>
        </DashboardCard>
        <DashboardCard
          title="Completed Orders"
          subtitle="Last 48 hours"
          icon={<CheckmarkIcon />}
        >
          <div className="card-metric">
            <span className="metric-value">{metrics.completedOrders}</span>
          </div>
        </DashboardCard>
        <DashboardCard
          title="Pending Prescriptions"
          subtitle="Awaiting pharmacist action"
          icon={<Pill size={24} />}
        >
          <div className="card-metric">
            <span className="metric-value">{metrics.pendingPrescriptions}</span>
          </div>
        </DashboardCard>
        <DashboardCard
          title="Patients Impacted"
          subtitle="Orders touching care pathways"
          icon={<Users size={24} />}
        >
          <div className="card-metric">
            <span className="metric-value">{Math.max(metrics.totalOrders, 1)}</span>
            <span className="metric-trend trend-positive">+{metrics.activeOrders} in progress</span>
          </div>
        </DashboardCard>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2 className="section-title">Live Fulfillment Activity</h2>
          <div className="activity-list">
            {loading && <div className="activity-item">Loading activity…</div>}
            {!loading && recentEvents.length === 0 && (
              <div className="activity-item">
                <div className="activity-content">
                  <p className="activity-title">No activity yet</p>
                  <p className="activity-time">Create a unified order to get started.</p>
                </div>
              </div>
            )}
            {recentEvents.map((event) => (
              <div key={event.id} className="activity-item">
                <div className="activity-icon">
                  <Activity size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">{event.eventType.replace(/_/g, ' ')}</p>
                  <p className="activity-time">
                    Order {event.orderNumber} • {formatDate(event.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Command Shortcuts</h2>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => (window.location.href = '/orders')}>
              <ClipboardList size={20} />
              <span>Initiate Unified Order</span>
            </button>
            <button className="quick-action-btn" onClick={() => (window.location.href = '/results')}>
              <FileText size={20} />
              <span>Review Results</span>
            </button>
            <button className="quick-action-btn">
              <Stethoscope size={20} />
              <span>Clinical Pathways</span>
            </button>
            <button className="quick-action-btn">
              <Users size={20} />
              <span>Care Team Roster</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckmarkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

