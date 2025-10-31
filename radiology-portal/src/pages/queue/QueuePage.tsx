import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Scan, FileSignature } from 'lucide-react';
import Breadcrumb from '../../components/shared/Breadcrumb';
import './QueuePage.css';
import { useRadiologyStore } from '../../store/radiologyStore';
import type { RadiologyOrder } from '../../types/radiology';
import { getWorkflowSocket } from '../../services/socketClient';

export default function RadiologyQueuePage() {
  const orders = useRadiologyStore((state) => state.orders);
  const loading = useRadiologyStore((state) => state.loading);
  const fetchOrders = useRadiologyStore((state) => state.fetchOrders);
  const submitReport = useRadiologyStore((state) => state.submitReport);
  const refreshOrder = useRadiologyStore((state) => state.refreshOrder);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [reportText, setReportText] = useState('');
  const [impression, setImpression] = useState('');
  const [critical, setCritical] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && orders.length === 0) {
      void fetchOrders();
    }
  }, [orders.length, loading, fetchOrders]);

  useEffect(() => {
    const socket = getWorkflowSocket();
    const handler = ({ orderId }: { orderId: string }) => {
      void refreshOrder(orderId);
    };
    socket.on('order.updated', handler);
    return () => {
      socket.off('order.updated', handler);
    };
  }, [refreshOrder]);

  const selectedOrder: RadiologyOrder | null = useMemo(() => {
    if (!selectedOrderId) {
      return orders[0] ?? null;
    }
    return orders.find((order) => order.id === selectedOrderId) ?? null;
  }, [orders, selectedOrderId]);

  useEffect(() => {
    if (selectedOrder?.report) {
      setReportText(selectedOrder.report.reportText);
      setImpression(selectedOrder.report.impression ?? '');
      setCritical(selectedOrder.report.criticalFinding);
    } else {
      setReportText('');
      setImpression('');
      setCritical(false);
    }
  }, [selectedOrder]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrder) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitReport(selectedOrder.id, {
        reportText,
        impression,
        criticalFinding: critical,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rad-queue-page">
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Imaging Queue' }]} />

      <div className="queue-header">
        <div>
          <h1>Imaging Queue</h1>
          <p>Read studies, dictate findings, and publish radiology reports in real time.</p>
        </div>
      </div>

      <div className="queue-layout">
        <section className="queue-orders">
          <header>
            <Scan size={18} /> Studies
          </header>
          <ul>
            {orders.map((order) => (
              <li
                key={order.id}
                className={order.id === selectedOrder?.id ? 'order-row active' : 'order-row'}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div>
                  <span className="order-number">{order.orderNumber}</span>
                  <span className="order-meta">{order.studyType} • {order.bodyPart}</span>
                </div>
                <span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span>
              </li>
            ))}
            {!loading && orders.length === 0 && <li className="muted">No studies awaiting interpretation.</li>}
          </ul>
        </section>

        <section className="report-panel">
          {selectedOrder ? (
            <form className="report-form" onSubmit={handleSubmit}>
              <header>
                <div>
                  <h2>{selectedOrder.orderNumber}</h2>
                  <p>Patient #{selectedOrder.patientId} • Priority {selectedOrder.priority}</p>
                </div>
                <span className={`status-pill status-${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span>
              </header>

              <label>
                <span>Report Text</span>
                <textarea
                  rows={6}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  required
                />
              </label>

              <label>
                <span>Impression</span>
                <textarea rows={3} value={impression} onChange={(e) => setImpression(e.target.value)} />
              </label>

              <label className="critical-flag">
                <input type="checkbox" checked={critical} onChange={(e) => setCritical(e.target.checked)} />
                <span>Mark as critical finding</span>
              </label>

              {error && <div className="error-banner">{error}</div>}

              <button type="submit" className="submit-button" disabled={submitting}>
                <FileSignature size={18} /> {submitting ? 'Publishing…' : 'Publish Report'}
              </button>
            </form>
          ) : (
            <p className="muted">Select a study from the queue to begin reporting.</p>
          )}
        </section>
      </div>
    </div>
  );
}

