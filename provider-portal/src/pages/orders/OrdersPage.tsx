import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ClipboardList, PlusCircle, Beaker, Pill, Radiation, Activity } from 'lucide-react';
import Breadcrumb from '../../components/shared/Breadcrumb';
import './OrdersPage.css';
import { useOrdersStore } from '../../store/ordersStore';
import type { OrderItemPayload, OrderItemType, OrderItemStatus, UnifiedOrder } from '../../types/workflow';
import { getWorkflowSocket } from '../../services/socketClient';
import { decodeToken } from '../../utils/auth';
import { getAuthToken } from '../../services/httpClient';

const ORDER_PRIORITIES = [
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'STAT', label: 'STAT' },
] as const;

const STUDY_TYPES = ['XRAY', 'CT', 'MRI', 'ULTRASOUND', 'OTHER'] as const;

type OrderPriority = typeof ORDER_PRIORITIES[number]['value'];

interface PharmacyFormState {
  enabled: boolean;
  rxNormId: string;
  drugName: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
}

interface LabFormState {
  enabled: boolean;
  loincCode: string;
  testName: string;
  specimenType: string;
}

interface RadiologyFormState {
  enabled: boolean;
  studyType: typeof STUDY_TYPES[number];
  bodyPart: string;
  clinicalIndication: string;
  contrast: boolean;
}

interface CreateOrderFormState {
  patientId: string;
  providerId: string;
  encounterId: string;
  priority: OrderPriority;
  notes: string;
  pharmacy: PharmacyFormState;
  lab: LabFormState;
  radiology: RadiologyFormState;
}

const initialFormState: CreateOrderFormState = {
  patientId: '',
  providerId: '',
  encounterId: '',
  priority: 'ROUTINE',
  notes: '',
  pharmacy: {
    enabled: true,
    rxNormId: '0000',
    drugName: '',
    dosage: '',
    route: 'Oral',
    frequency: 'BID',
    duration: '7 days',
    quantity: 14,
    instructions: '',
  },
  lab: {
    enabled: true,
    loincCode: '24323-8',
    testName: 'Complete Blood Count',
    specimenType: 'Whole blood',
  },
  radiology: {
    enabled: false,
    studyType: 'XRAY',
    bodyPart: '',
    clinicalIndication: '',
    contrast: false,
  },
};

const formatDate = (iso: string) => new Date(iso).toLocaleString();

const STATUS_BADGE_CLASS: Record<OrderItemStatus, string> = {
  REQUESTED: 'status-badge status-requested',
  IN_PROGRESS: 'status-badge status-progress',
  COMPLETED: 'status-badge status-completed',
  ERROR: 'status-badge status-error',
};

const ITEM_LABEL: Record<OrderItemType, string> = {
  PHARMACY: 'Pharmacy',
  LAB: 'Laboratory',
  RADIOLOGY: 'Radiology',
  PROCEDURE: 'Procedure',
};

export default function OrdersPage() {
  const orders = useOrdersStore((state) => state.orders);
  const loading = useOrdersStore((state) => state.loading);
  const error = useOrdersStore((state) => state.error);
  const fetchOrders = useOrdersStore((state) => state.fetchOrders);
  const selectOrder = useOrdersStore((state) => state.selectOrder);
  const selectedOrderId = useOrdersStore((state) => state.selectedOrderId);
  const refreshOrder = useOrdersStore((state) => state.refreshOrder);
  const createOrder = useOrdersStore((state) => state.createOrder);

  const [formState, setFormState] = useState<CreateOrderFormState>(() => {
    const token = getAuthToken();
    const payload = decodeToken(token);
    return {
      ...initialFormState,
      providerId: payload?.sub ?? '',
    };
  });

  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (orders.length === 0 && !loading) {
      void fetchOrders();
    }
  }, [orders.length, loading, fetchOrders]);

  useEffect(() => {
    const socket = getWorkflowSocket();
    const handler = (payload: { orderId: string }) => {
      void refreshOrder(payload.orderId);
    };
    socket.on('order.updated', handler);
    return () => {
      socket.off('order.updated', handler);
    };
  }, [refreshOrder]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? orders[0] ?? null,
    [orders, selectedOrderId],
  );

  const handleSelectOrder = (orderId: string) => {
    selectOrder(orderId);
  };

  const handleToggleService = (service: 'pharmacy' | 'lab' | 'radiology') => {
    setFormState((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        enabled: !prev[service].enabled,
      },
    }));
  };

  const handleInputChange = (field: keyof CreateOrderFormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePharmacyChange = <K extends keyof PharmacyFormState>(field: K, value: PharmacyFormState[K]) => {
    setFormState((prev) => ({
      ...prev,
      pharmacy: {
        ...prev.pharmacy,
        [field]: value,
      },
    }));
  };

  const handleLabChange = <K extends keyof LabFormState>(field: K, value: LabFormState[K]) => {
    setFormState((prev) => ({
      ...prev,
      lab: {
        ...prev.lab,
        [field]: value,
      },
    }));
  };

  const handleRadiologyChange = <K extends keyof RadiologyFormState>(field: K, value: RadiologyFormState[K]) => {
    setFormState((prev) => ({
      ...prev,
      radiology: {
        ...prev.radiology,
        [field]: value,
      },
    }));
  };

  const buildOrderItems = (): OrderItemPayload[] => {
    const items: OrderItemPayload[] = [];
    const { patientId, providerId, encounterId, priority, notes } = formState;

    if (formState.pharmacy.enabled) {
      items.push({
        type: 'PHARMACY',
        payload: {
          patientId,
          providerId,
          encounterId,
          orderType: 'OPD',
          priority,
          notes,
          items: [
            {
              rxNormId: formState.pharmacy.rxNormId || '0000',
              drugName: formState.pharmacy.drugName,
              dosage: formState.pharmacy.dosage,
              route: formState.pharmacy.route,
              frequency: formState.pharmacy.frequency,
              duration: formState.pharmacy.duration,
              quantity: Number(formState.pharmacy.quantity) || 1,
              instructions: formState.pharmacy.instructions,
            },
          ],
        },
      });
    }

    if (formState.lab.enabled) {
      items.push({
        type: 'LAB',
        payload: {
          patientId,
          providerId,
          encounterId,
          priority,
          clinicalNotes: notes,
          tests: [
            {
              loincCode: formState.lab.loincCode,
              testName: formState.lab.testName,
              specimenType: formState.lab.specimenType,
            },
          ],
        },
      });
    }

    if (formState.radiology.enabled) {
      items.push({
        type: 'RADIOLOGY',
        payload: {
          patientId,
          providerId,
          encounterId,
          priority,
          studyType: formState.radiology.studyType,
          bodyPart: formState.radiology.bodyPart,
          contrast: formState.radiology.contrast,
          clinicalIndication: formState.radiology.clinicalIndication,
        },
      });
    }

    return items;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionError(null);

    if (!formState.patientId || !formState.providerId || !formState.encounterId) {
      setSubmissionError('Patient, provider, and encounter identifiers are required.');
      return;
    }

    const items = buildOrderItems();
    if (items.length === 0) {
      setSubmissionError('Select at least one fulfillment service for the unified order.');
      return;
    }

    setSubmitting(true);
    try {
      await createOrder({
        patientId: formState.patientId,
        providerId: formState.providerId,
        encounterId: formState.encounterId,
        priority: formState.priority,
        notes: formState.notes,
        items,
      });
      setFormState((prev) => ({
        ...initialFormState,
        providerId: prev.providerId,
      }));
    } catch (error) {
      setSubmissionError((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="orders-page">
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Unified Orders' }]} />
      <div className="orders-header">
        <div>
          <h1>Unified Orders</h1>
          <p>Create, track, and orchestrate pharmacy, laboratory, and radiology fulfillment from a single cockpit.</p>
        </div>
      </div>

      <div className="orders-content">
        <div className="orders-left">
          <section className="orders-list-card">
            <header>
              <ClipboardList size={20} />
              <h2>Worklist</h2>
            </header>
            {loading && <p className="muted">Loading orders…</p>}
            {error && <p className="error">{error}</p>}
            <ul>
              {orders.map((order) => (
                <li
                  key={order.id}
                  className={order.id === selectedOrder?.id ? 'order-item active' : 'order-item'}
                  onClick={() => handleSelectOrder(order.id)}
                >
                  <div>
                    <span className="order-number">{order.orderNumber}</span>
                    <span className="order-patient">Patient #{order.patientId}</span>
                  </div>
                  <span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span>
                </li>
              ))}
              {!loading && orders.length === 0 && <li className="muted">No unified orders yet.</li>}
            </ul>
          </section>

          <section className="create-order-card">
            <header>
              <PlusCircle size={20} />
              <h2>New Unified Order</h2>
            </header>
            <form onSubmit={handleSubmit} className="create-order-form">
              <div className="form-grid">
                <label>
                  <span>Patient ID</span>
                  <input
                    value={formState.patientId}
                    onChange={(e) => handleInputChange('patientId', e.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Provider ID</span>
                  <input
                    value={formState.providerId}
                    onChange={(e) => handleInputChange('providerId', e.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Encounter ID</span>
                  <input
                    value={formState.encounterId}
                    onChange={(e) => handleInputChange('encounterId', e.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Priority</span>
                  <select
                    value={formState.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value as OrderPriority)}
                  >
                    {ORDER_PRIORITIES.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span>Clinical Notes</span>
                <textarea
                  rows={3}
                  value={formState.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Brief clinical context for fulfillment teams"
                />
              </label>

              <ServiceAccordion
                id="pharmacy"
                icon={<Pill size={18} />}
                title="Pharmacy"
                description="Send prescription data to the pharmacy workbench"
                enabled={formState.pharmacy.enabled}
                onToggle={() => handleToggleService('pharmacy')}
              >
                <div className="service-grid">
                  <label>
                    <span>RxNorm ID</span>
                    <input
                    value={formState.pharmacy.rxNormId}
                    onChange={(e) => handlePharmacyChange('rxNormId', e.target.value)}
                      required={formState.pharmacy.enabled}
                    />
                  </label>
                  <label>
                    <span>Medication</span>
                    <input
                    value={formState.pharmacy.drugName}
                    onChange={(e) => handlePharmacyChange('drugName', e.target.value)}
                      required={formState.pharmacy.enabled}
                    />
                  </label>
                  <label>
                    <span>Dosage</span>
                    <input
                    value={formState.pharmacy.dosage}
                    onChange={(e) => handlePharmacyChange('dosage', e.target.value)}
                      required={formState.pharmacy.enabled}
                    />
                  </label>
                  <label>
                    <span>Route</span>
                    <input
                    value={formState.pharmacy.route}
                    onChange={(e) => handlePharmacyChange('route', e.target.value)}
                    />
                  </label>
                  <label>
                    <span>Frequency</span>
                    <input
                    value={formState.pharmacy.frequency}
                    onChange={(e) => handlePharmacyChange('frequency', e.target.value)}
                    />
                  </label>
                  <label>
                    <span>Duration</span>
                    <input
                    value={formState.pharmacy.duration}
                    onChange={(e) => handlePharmacyChange('duration', e.target.value)}
                    />
                  </label>
                  <label>
                    <span>Quantity</span>
                    <input
                      type="number"
                      min={1}
                      value={formState.pharmacy.quantity}
                      onChange={(e) => handlePharmacyChange('quantity', Number(e.target.value))}
                    />
                  </label>
                  <label className="span-2">
                    <span>Instructions</span>
                    <input
                      value={formState.pharmacy.instructions}
                      onChange={(e) => handlePharmacyChange('instructions', e.target.value)}
                      placeholder="Take with meals, monitor blood pressure, etc."
                    />
                  </label>
                </div>
              </ServiceAccordion>

              <ServiceAccordion
                id="lab"
                icon={<Beaker size={18} />}
                title="Laboratory"
                description="Route specimens to the lab fulfillment bench"
                enabled={formState.lab.enabled}
                onToggle={() => handleToggleService('lab')}
              >
                <div className="service-grid">
                  <label>
                    <span>LOINC Code</span>
                    <input
                    value={formState.lab.loincCode}
                    onChange={(e) => handleLabChange('loincCode', e.target.value)}
                      required={formState.lab.enabled}
                    />
                  </label>
                  <label>
                    <span>Test Name</span>
                    <input
                    value={formState.lab.testName}
                    onChange={(e) => handleLabChange('testName', e.target.value)}
                      required={formState.lab.enabled}
                    />
                  </label>
                  <label className="span-2">
                    <span>Specimen Type</span>
                    <input
                    value={formState.lab.specimenType}
                    onChange={(e) => handleLabChange('specimenType', e.target.value)}
                    />
                  </label>
                </div>
              </ServiceAccordion>

              <ServiceAccordion
                id="radiology"
                icon={<Radiation size={18} />}
                title="Radiology"
                description="Coordinate imaging orders with radiology"
                enabled={formState.radiology.enabled}
                onToggle={() => handleToggleService('radiology')}
              >
                <div className="service-grid">
                  <label>
                    <span>Study Type</span>
                    <select
                      value={formState.radiology.studyType}
                      onChange={(e) =>
                        handleRadiologyChange('studyType', e.target.value as typeof STUDY_TYPES[number])
                      }
                    >
                      {STUDY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Body Part</span>
                    <input
                    value={formState.radiology.bodyPart}
                    onChange={(e) => handleRadiologyChange('bodyPart', e.target.value)}
                      required={formState.radiology.enabled}
                    />
                  </label>
                  <label className="span-2">
                    <span>Clinical Indication</span>
                    <input
                    value={formState.radiology.clinicalIndication}
                    onChange={(e) => handleRadiologyChange('clinicalIndication', e.target.value)}
                      required={formState.radiology.enabled}
                    />
                  </label>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={formState.radiology.contrast}
                      onChange={(e) => handleRadiologyChange('contrast', e.target.checked)}
                    />
                    <span>Requires contrast</span>
                  </label>
                </div>
              </ServiceAccordion>

              {submissionError && <p className="error">{submissionError}</p>}

              <button className="submit-button" type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Launch Unified Order'}
              </button>
            </form>
          </section>
        </div>

        <div className="orders-detail">
          {selectedOrder ? <OrderDetailPanel order={selectedOrder} /> : <p>Select an order to view detail.</p>}
        </div>
      </div>
    </div>
  );
}

interface ServiceAccordionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  id: string;
}

function ServiceAccordion({ icon, title, description, enabled, onToggle, children, id }: ServiceAccordionProps) {
  const inputId = `${id}-toggle`;
  return (
    <div className="service-accordion">
      <header>
        <div className="service-title">
          <div className="service-icon">{icon}</div>
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>
        <label className="switch" htmlFor={inputId}>
          <input
            id={inputId}
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            aria-label={`Toggle ${title}`}
            title={`Toggle ${title}`}
          />
          <span className="slider" />
        </label>
      </header>
      {enabled && <div className="service-content">{children}</div>}
    </div>
  );
}

interface OrderDetailPanelProps {
  order: UnifiedOrder;
}

function OrderDetailPanel({ order }: OrderDetailPanelProps) {
  return (
    <div className="order-detail-card">
      <header>
        <div>
          <h2>{order.orderNumber}</h2>
          <p>Patient #{order.patientId} • Encounter #{order.encounterId}</p>
        </div>
        <span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span>
      </header>

      <section>
        <h3>Fulfillment Items</h3>
        <ul className="items-list">
          {order.items.map((item) => (
            <li key={item.id}>
              <div>
                <span className="item-title">{ITEM_LABEL[item.itemType]}</span>
                <span className="item-subtitle">Target #{item.targetServiceOrderId}</span>
              </div>
              <span className={STATUS_BADGE_CLASS[item.status]}>{item.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Activity Timeline</h3>
        <ul className="timeline">
          {order.events
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((event) => (
              <li key={event.id}>
                <Activity size={16} />
                <div>
                  <span className="timeline-title">{event.eventType.replace(/_/g, ' ')}</span>
                  <span className="timeline-time">{formatDate(event.createdAt)}</span>
                </div>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}

