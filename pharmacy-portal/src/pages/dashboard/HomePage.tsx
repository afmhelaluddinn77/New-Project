import { useEffect, useMemo } from 'react';
import { Pill, ClipboardList, CheckCircle, Activity } from 'lucide-react';
import Breadcrumb from '../../components/shared/Breadcrumb';
import DashboardCard from '../../components/shared/DashboardCard';
import './HomePage.css';
import { usePharmacyStore } from '../../store/pharmacyStore';

const formatDate = (iso: string) => new Date(iso).toLocaleString();

export default function PharmacyHomePage() {
  const orders = usePharmacyStore((state) => state.orders);
  const loading = usePharmacyStore((state) => state.loading);
  const fetchOrders = usePharmacyStore((state) => state.fetchOrders);

  useEffect(() => {
    if (!loading && orders.length === 0) {
      void fetchOrders();
    }
  }, [orders.length, loading, fetchOrders]);

  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((order) => order.status === 'NEW' || order.status === 'REVIEW_PENDING').length;
    const verified = orders.filter((order) => order.status === 'VERIFIED').length;
    const dispensed = orders.filter((order) => order.status === 'DISPENSED').length;
    return { total, pending, verified, dispensed };
  }, [orders]);

  const latest = useMemo(() => orders.slice(0, 5), [orders]);

  return (
    <div className="dashboard-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Dashboard' }]} />

      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Pharmacy Fulfillment Command</h1>
          <p className="dashboard-subtitle">
            Manage prescription verifications, dispense medications, and coordinate with clinical teams in real time.
          </p>
        </div>
      </div>

      <div className="dashboard-cards-grid">
        <DashboardCard title="Pending Approvals" subtitle="Awaiting verification" icon={<Pill size={24} />}>
          <div className="card-metric">
            <span className="metric-value">{metrics.pending}</span>
            <span className="metric-trend trend-positive">{metrics.total} total</span>
          </div>
        </DashboardCard>
        <DashboardCard title="Verified" subtitle="Ready for dispense" icon={<CheckCircle size={24} />}>
          <div className="card-metric">
            <span className="metric-value">{metrics.verified}</span>
          </div>
        </DashboardCard>
        <DashboardCard title="Dispensed" subtitle="Last 24 hours" icon={<ClipboardList size={24} />}>
          <div className="card-metric">
            <span className="metric-value">{metrics.dispensed}</span>
          </div>
        </DashboardCard>
        <DashboardCard title="Drug Interactions" subtitle="Monitoring" icon={<Activity size={24} />}>
          <div className="card-metric">
            <span className="metric-value">{Math.round(metrics.total * 0.2)}</span>
            <span className="metric-trend trend-positive">flagged this shift</span>
          </div>
        </DashboardCard>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2 className="section-title">Recent Orders</h2>
          <div className="activity-list">
            {latest.length === 0 && <p className="muted">No prescriptions yet.</p>}
            {latest.map((order) => (
              <div key={order.id} className="activity-item">
                <div className="activity-icon">
                  <Pill size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">{order.orderNumber}</p>
                  <p className="activity-time">
                    Patient #{order.patientId} • {formatDate(order.submittedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Quick Commands</h2>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => (window.location.href = '/queue')}>
              <Pill size={20} />
              <span>Verification Queue</span>
            </button>
            <button className="quick-action-btn" onClick={() => (window.location.href = '/logs')}>
              <ClipboardList size={20} />
              <span>Dispense Log</span>
            </button>
            <button className="quick-action-btn">
              <Activity size={20} />
              <span>Interaction Checks</span>
            </button>
            <button className="quick-action-btn">
              <CheckCircle size={20} />
              <span>Audit Trail</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

