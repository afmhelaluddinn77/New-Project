import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FlaskConical, Activity, AlertTriangle } from 'lucide-react';
import Breadcrumb from '../../components/shared/Breadcrumb';
import './WorklistPage.css';
import { useLabOrdersStore } from '../../store/labOrdersStore';
import type { LabOrder, LabOrderTest, SubmitLabResultInput } from '../../types/lab';
import { getWorkflowSocket } from '../../services/socketClient';

const abnormalFlags = ['NORMAL', 'LOW', 'HIGH', 'CRITICAL'] as const;

export default function WorklistPage() {
  const orders = useLabOrdersStore((state) => state.orders);
  const loading = useLabOrdersStore((state) => state.loading);
  const fetchOrders = useLabOrdersStore((state) => state.fetchOrders);
  const submitResult = useLabOrdersStore((state) => state.submitResult);
  const refreshOrder = useLabOrdersStore((state) => state.updateOrder);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [form, setForm] = useState<SubmitLabResultInput>({
    testId: '',
    value: '',
    unit: '',
    referenceRange: '',
    abnormalFlag: 'NORMAL',
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orders.length === 0 && !loading) {
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

  const selectedTest = useMemo(() => {
    if (!selectedOrder) {
      return null;
    }
    if (!selectedTestId) {
      return selectedOrder.tests[0] ?? null;
    }
    return selectedOrder.tests.find((test) => test.id === selectedTestId) ?? null;
  }, [selectedOrder, selectedTestId]);

  useEffect(() => {
    if (selectedTest) {
      setForm({
        testId: selectedTest.id,
        value: selectedTest.result?.value ?? '',
        unit: selectedTest.result?.unit ?? '',
        referenceRange: selectedTest.result?.referenceRange ?? '',
        abnormalFlag: selectedTest.result?.abnormalFlag ?? 'NORMAL',
        comment: selectedTest.result?.comment ?? '',
      });
    }
  }, [selectedTest]);

  const handleResultSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrder || !selectedTest) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await submitResult(selectedOrder.id, {
        ...form,
        testId: selectedTest.id,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="worklist-page">
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Worklist' }]} />

      <div className="worklist-header">
        <div>
          <h1>Lab Worklist</h1>
          <p>Review active orders, process specimens, and publish verified results.</p>
        </div>
      </div>

      <div className="worklist-layout">
        <section className="orders-panel">
          <header>
            <FlaskConical size={18} /> Orders
          </header>
          <ul>
            {orders.map((order) => (
              <li
                key={order.id}
                className={order.id === selectedOrder?.id ? 'order-row active' : 'order-row'}
                onClick={() => {
                  setSelectedOrderId(order.id);
                  setSelectedTestId(null);
                }}
              >
                <div>
                  <span className="order-number">{order.orderNumber}</span>
                  <span className="order-meta">Patient #{order.patientId}</span>
                </div>
                <span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span>
              </li>
            ))}
            {!loading && orders.length === 0 && <li className="muted">No active orders.</li>}
          </ul>
        </section>

        <section className="tests-panel">
          <header>
            <Activity size={18} /> Tests
          </header>
          {selectedOrder ? (
            <ul>
              {selectedOrder.tests.map((test) => (
                <li
                  key={test.id}
                  className={test.id === selectedTest?.id ? 'test-row active' : 'test-row'}
                  onClick={() => setSelectedTestId(test.id)}
                >
                  <div>
                    <span className="test-name">{test.testName}</span>
                    <span className="test-meta">{test.specimenType ?? 'Specimen not specified'}</span>
                  </div>
                  <span className={`status-pill status-${test.status.toLowerCase()}`}>{test.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Select an order to view tests.</p>
          )}
        </section>

        <section className="result-panel">
          <header>
            <Activity size={18} /> Result Entry
          </header>

          {selectedOrder && selectedTest ? (
            <form onSubmit={handleResultSubmit} className="result-form">
              <div className="form-grid">
                <label>
                  <span>Value</span>
                  <input
                    value={form.value}
                    onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  <span>Unit</span>
                  <input
                    value={form.unit}
                    onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  <span>Reference Range</span>
                  <input
                    value={form.referenceRange}
                    onChange={(e) => setForm((prev) => ({ ...prev, referenceRange: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Abnormal Flag</span>
                  <select
                    value={form.abnormalFlag}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, abnormalFlag: e.target.value as SubmitLabResultInput['abnormalFlag'] }))
                    }
                  >
                    {abnormalFlags.map((flag) => (
                      <option key={flag} value={flag}>
                        {flag}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span>Comments</span>
                <textarea
                  rows={3}
                  value={form.comment}
                  onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Interpretation, follow-up actions, or notes to provider"
                />
              </label>

              {error && (
                <div className="error-banner">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              <button type="submit" className="submit-button" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Verify Result'}
              </button>
            </form>
          ) : (
            <p className="muted">Select a test to enter results.</p>
          )}
        </section>
      </div>
    </div>
  );
}

