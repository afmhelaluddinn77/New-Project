import { useEffect, useMemo, useState } from 'react';
import { Pill, CheckCircle, XCircle, PackageCheck } from 'lucide-react';
import Breadcrumb from '../../components/shared/Breadcrumb';
import './QueuePage.css';
import { usePharmacyStore } from '../../store/pharmacyStore';
import type { PrescriptionOrder, VerificationPayload } from '../../types/pharmacy';
import { getWorkflowSocket } from '../../services/socketClient';

const STATUS_CLASSES: Record<string, string> = {
  NEW: 'status-pill status-new',
  REVIEW_PENDING: 'status-pill status-review',
  VERIFIED: 'status-pill status-verified',
  DISPENSED: 'status-pill status-dispensed',
  CANCELLED: 'status-pill status-cancelled',
};

export default function QueuePage() {
  const orders = usePharmacyStore((state) => state.orders);
  const loading = usePharmacyStore((state) => state.loading);
  const fetchOrders = usePharmacyStore((state) => state.fetchOrders);
  const verify = usePharmacyStore((state) => state.verify);
  const refreshOrder = usePharmacyStore((state) => state.updateOrder);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
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

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) {
      return orders[0] ?? null;
    }
    return orders.find((order) => order.id === selectedOrderId) ?? null;
  }, [orders, selectedOrderId]);

  const handleAction = async (action: VerificationPayload['action']) => {
    if (!selectedOrder) return;
    setSubmitting(true);
    setError(null);
    try {
      await verify(selectedOrder.id, { action, notes });
      setNotes('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="queue-page">
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Verification Queue' }]} />

      <div className="queue-header">
        <div>
          <h1>Verification Queue</h1>
          <p>Review pending prescriptions, address interaction alerts, and approve dispensing.</p>
        </div>
      </div>

      <div className="queue-layout">
        <section className="queue-orders">
          <header>
            <Pill size={18} /> Pending Orders
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
                  <span className="order-meta">Patient #{order.patientId}</span>
                </div>
                <span className={STATUS_CLASSES[order.status] ?? 'status-pill'}>{order.status}</span>
              </li>
            ))}
            {!loading && orders.length === 0 && <li className="muted">No pending prescriptions.</li>}
          </ul>
        </section>

        <section className="queue-details">
          {selectedOrder ? (
            <div className="prescription-card">
              <header>
                <div>
                  <h2>{selectedOrder.orderNumber}</h2>
                  <p>Provider #{selectedOrder.providerId} • Encounter {selectedOrder.encounterId}</p>
                </div>
                <span className={STATUS_CLASSES[selectedOrder.status] ?? 'status-pill'}>{selectedOrder.status}</span>
              </header>

              <section>
                <h3>Medications</h3>
                <ul className="medications">
                  {selectedOrder.items.map((item) => (
                    <li key={item.id}>
                      <div>
                        <span className="med-name">{item.drugName}</span>
                        <span className="med-info">{item.dosage} • {item.route} • {item.frequency}</span>
                      </div>
                      <span className="med-qty">Qty {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3>Pharmacist Notes</h3>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Document clarifications, interaction assessments, or dispense notes"
                />
              </section>

              {error && <div className="error-banner">{error}</div>}

              <div className="action-buttons">
                <button
                  type="button"
                  className="btn btn-verify"
                  disabled={submitting}
                  onClick={() => handleAction('VERIFY')}
                >
                  <CheckCircle size={18} /> Verify
                </button>
                <button
                  type="button"
                  className="btn btn-dispense"
                  disabled={submitting || selectedOrder.status !== 'VERIFIED'}
                  onClick={() => handleAction('DISPENSE')}
                >
                  <PackageCheck size={18} /> Dispense
                </button>
                <button
                  type="button"
                  className="btn btn-reject"
                  disabled={submitting}
                  onClick={() => handleAction('REJECT')}
                >
                  <XCircle size={18} /> Reject
                </button>
              </div>
            </div>
          ) : (
            <p className="muted">Select an order to view details.</p>
          )}
        </section>
      </div>
    </div>
  );
}

