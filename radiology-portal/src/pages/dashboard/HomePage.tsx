import { useEffect, useMemo } from 'react';
import { Scan, Activity, ClipboardCheck, AlertTriangle } from 'lucide-react';
import Breadcrumb from '../../components/shared/Breadcrumb';
import DashboardCard from '../../components/shared/DashboardCard';
import './HomePage.css';
import { useRadiologyStore } from '../../store/radiologyStore';

const formatDate = (iso: string) => new Date(iso).toLocaleString();

export default function RadiologyHomePage() {
  const orders = useRadiologyStore((state) => state.orders);
  const loading = useRadiologyStore((state) => state.loading);
  const fetchOrders = useRadiologyStore((state) => state.fetchOrders);

  useEffect(() => {
    if (!loading && orders.length === 0) {
      void fetchOrders();
    }
  }, [orders.length, loading, fetchOrders]);

  const metrics = useMemo(() => {
    const total = orders.length;
    const scheduled = orders.filter((order) => order.status === 'SCHEDULED').length;
    const inProgress = orders.filter((order) => order.status === 'IN_PROGRESS').length;
    const reported = orders.filter((order) => order.status === 'REPORTED').length;
    const critical = orders.filter((order) => order.report?.criticalFinding).length;
    return { total, scheduled, inProgress, reported, critical };
  }, [orders]);

  return (
    <div className="dashboard-page">
      <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Dashboard' }]} />

      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Imaging Operations Center</h1>
          <p className="dashboard-subtitle">
            Oversee modality throughput, monitor reporting turnaround time, and track critical findings.
          </p>
        </div>
      </div>

      <div className="dashboard-cards-grid">
        <DashboardCard title="Scheduled Studies" subtitle="Awaiting imaging" icon={<ClipboardCheck size={24} />}>
          <div className="card-metric">
            <span className="metric-value">{metrics.scheduled}</span>
            <span className="metric-trend trend-positive">{metrics.total} total</span>
          </div>
        </DashboardCard>
        <DashboardCard title="In Progress" subtitle="Currently scanning" icon={<Scan size={24} />}>
          <div className="card-metric">
            <span className="metric-value">{metrics.inProgress}</span>
          </div>
        </DashboardCard>
        <DashboardCard title="Reported" subtitle="Finalized results" icon={<Activity size={24} />}>
          <div className="card-metric">
            <span className="metric-value">{metrics.reported}</span>
          </div>
        </DashboardCard>
        <DashboardCard title="Critical Findings" subtitle="Requires outreach" icon={<AlertTriangle size={24} />}>
          <div className="card-metric">
            <span className="metric-value">{metrics.critical}</span>
          </div>
        </DashboardCard>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2 className="section-title">Live Queue</h2>
          <div className="activity-list">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="activity-item">
                <div className="activity-icon">
                  <Scan size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">{order.studyType} • {order.bodyPart}</p>
                  <p className="activity-time">
                    Order {order.orderNumber} • {formatDate(order.orderedAt)}
                  </p>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="muted">No imaging studies pending.</p>}
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Quick Links</h2>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => (window.location.href = '/queue')}>
              <Scan size={20} />
              <span>Imaging Queue</span>
            </button>
            <button className="quick-action-btn" onClick={() => (window.location.href = '/reports')}>
              <Activity size={20} />
              <span>Report Archive</span>
            </button>
            <button className="quick-action-btn">
              <ClipboardCheck size={20} />
              <span>Protocol Library</span>
            </button>
            <button className="quick-action-btn">
              <AlertTriangle size={20} />
              <span>Critical Callback Log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

