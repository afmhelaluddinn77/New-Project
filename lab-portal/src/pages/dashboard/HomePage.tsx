import { useEffect, useMemo } from 'react';
import { FlaskConical, Activity, ClipboardList, CheckCircle } from 'lucide-react';
import Breadcrumb from '../../components/shared/Breadcrumb';
import DashboardCard from '../../components/shared/DashboardCard';
import './HomePage.css';
import { useLabOrdersStore } from '../../store/labOrdersStore';

const formatDate = (iso: string) => new Date(iso).toLocaleString();

export default function LabHomePage() {
  const orders = useLabOrdersStore((state) => state.orders);
  const loading = useLabOrdersStore((state) => state.loading);
  const fetchOrders = useLabOrdersStore((state) => state.fetchOrders);

  useEffect(() => {
    if (!loading && orders.length === 0) {
      void fetchOrders();
    }
  }, [orders.length, loading, fetchOrders]);

  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((order) => order.status !== 'RESULT_READY').length;
    const resultsReady = orders.filter((order) => order.status === 'RESULT_READY').length;
    const critical = orders.flatMap((order) => order.tests).filter((test) => test.status === 'CRITICAL').length;

    return { total, pending, resultsReady, critical };
  }, [orders]);

  const recent = useMemo(() => {
    return orders
      .flatMap((order) => order.tests.map((test) => ({ order, test })))
      .sort((a, b) => {
        const aDate = a.test.performedAt ? new Date(a.test.performedAt).getTime() : 0;
        const bDate = b.test.performedAt ? new Date(b.test.performedAt).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="dashboard-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Dashboard' }]} />

      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Laboratory Command Center</h1>
          <p className="dashboard-subtitle">
            Monitor incoming specimens, manage turnaround time, and collaborate with clinical teams.
          </p>
        </div>
      </div>

      <div className="dashboard-cards-grid">
        <DashboardCard title="Active Orders" subtitle="Awaiting fulfillment" icon={<ClipboardList size={24} />}>
          <div className="card-metric">
            <span className="metric-value">{metrics.pending}</span>
            <span className="metric-trend trend-positive">{metrics.total} total</span>
          </div>
        </DashboardCard>
        <DashboardCard title="Results Ready" subtitle="Last 24 hours" icon={<CheckCircle size={24} />}>
          <div className="card-metric">
            <span className="metric-value">{metrics.resultsReady}</span>
          </div>
        </DashboardCard>
        <DashboardCard title="Critical Alerts" subtitle="Immediate attention" icon={<Activity size={24} />}>
          <div className="card-metric">
            <span className="metric-value">{metrics.critical}</span>
          </div>
        </DashboardCard>
        <DashboardCard title="Specimens" subtitle="Processed today" icon={<FlaskConical size={24} />}>
          <div className="card-metric">
            <span className="metric-value">{orders.reduce((acc, order) => acc + order.tests.length, 0)}</span>
          </div>
        </DashboardCard>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-list">
            {recent.length === 0 && <p className="muted">No specimens processed yet.</p>}
            {recent.map(({ order, test }) => (
              <div key={test.id} className="activity-item">
                <div className="activity-icon">
                  <FlaskConical size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">{test.testName}</p>
                  <p className="activity-time">
                    Order {order.orderNumber} • {test.performedAt ? formatDate(test.performedAt) : 'Awaiting result'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Quick Access</h2>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => (window.location.href = '/worklist')}>
              <FlaskConical size={20} />
              <span>Open Worklist</span>
            </button>
            <button className="quick-action-btn">
              <ClipboardList size={20} />
              <span>Specimen Manifest</span>
            </button>
            <button className="quick-action-btn">
              <Activity size={20} />
              <span>Quality Controls</span>
            </button>
            <button className="quick-action-btn">
              <CheckCircle size={20} />
              <span>Completed Results</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

