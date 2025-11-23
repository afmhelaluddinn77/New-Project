import { InvestigationList as NewInvestigationList } from "@/components/investigations/InvestigationList";
import { InvestigationSearch as NewInvestigationSearch } from "@/components/investigations/InvestigationSearch";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Beaker,
  ClipboardList,
  Filter,
  Pill,
  PlusCircle,
  Radiation,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../components/shared/Breadcrumb";
import { useCreateOrder } from "../../hooks/mutations/useCreateOrder";
import { useOrdersQuery } from "../../hooks/queries/useOrdersQuery";
import { queryKeys } from "../../lib/queryClient";
import { getWorkflowSocket } from "../../services/socketClient";
import { useAuthStore } from "../../store/authStore";
import { useOrdersStore } from "../../store/ordersStore";
import type {
  OrderItemPayload,
  OrderItemType,
  UnifiedOrder,
} from "../../types/workflow";
import "./OrdersPage.css";

const ORDER_PRIORITIES = [
  { value: "ROUTINE", label: "Routine" },
  { value: "URGENT", label: "Urgent" },
  { value: "STAT", label: "STAT" },
] as const;

const STUDY_TYPES = ["XRAY", "CT", "MRI", "ULTRASOUND", "OTHER"] as const;

const MEDICATION_ROUTES = [
  "Oral",
  "Intravenous (IV)",
  "Intramuscular (IM)",
  "Subcutaneous (SC)",
  "Topical",
  "Inhalation",
  "Rectal",
  "Sublingual",
] as const;

const MEDICATION_FREQUENCIES = [
  "Once daily (QD)",
  "Twice daily (BID)",
  "Three times daily (TID)",
  "Four times daily (QID)",
  "Every 4 hours (q4h)",
  "Every 6 hours (q6h)",
  "Every 8 hours (q8h)",
  "Every 12 hours (q12h)",
  "As needed (PRN)",
] as const;

const DIAGNOSIS_CODES = [
  { code: "J01.90", system: "ICD-10", display: "Acute sinusitis, unspecified" },
  {
    code: "E11.9",
    system: "ICD-10",
    display: "Type 2 diabetes mellitus without complications",
  },
  {
    code: "I10",
    system: "ICD-10",
    display: "Essential (primary) hypertension",
  },
  { code: "R05", system: "ICD-10", display: "Cough" },
  { code: "R50.9", system: "ICD-10", display: "Fever, unspecified" },
];

type OrderPriority = (typeof ORDER_PRIORITIES)[number]["value"];

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
  collectionSite: string;
}

interface RadiologyFormState {
  enabled: boolean;
  studyType: (typeof STUDY_TYPES)[number];
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
  diagnosisCode: string;
  providerSignature: string;
  pharmacy: PharmacyFormState;
  lab: LabFormState;
  radiology: RadiologyFormState;
}

const initialFormState: CreateOrderFormState = {
  patientId: "",
  providerId: "",
  encounterId: "",
  priority: "ROUTINE",
  notes: "",
  diagnosisCode: "",
  providerSignature: "",
  pharmacy: {
    enabled: true,
    rxNormId: "0000",
    drugName: "",
    dosage: "",
    route: "Oral",
    frequency: "Twice daily (BID)",
    duration: "7 days",
    quantity: 14,
    instructions: "",
  },
  lab: {
    enabled: true,
    loincCode: "24323-8",
    testName: "Complete Blood Count",
    specimenType: "Whole blood",
    collectionSite: "",
  },
  radiology: {
    enabled: false,
    studyType: "XRAY",
    bodyPart: "",
    clinicalIndication: "",
    contrast: false,
  },
};

const formatDate = (iso: string) => new Date(iso).toLocaleString();

const STATUS_BADGE_CLASS: Record<string, string> = {
  REQUESTED: "status-badge status-requested",
  NEW: "status-badge status-requested",
  IN_PROGRESS: "status-badge status-progress",
  PARTIALLY_FULFILLED: "status-badge status-progress",
  VERIFIED: "status-badge status-verified",
  COMPLETED: "status-badge status-completed",
  ERROR: "status-badge status-error",
  CANCELLED: "status-badge status-error",
};

const ITEM_LABEL: Record<OrderItemType, string> = {
  PHARMACY: "Pharmacy",
  LAB: "Laboratory",
  RADIOLOGY: "Radiology",
  PROCEDURE: "Procedure",
};

export default function OrdersPage() {
  // React Query hooks (server state)
  const {
    data: orders = [],
    isLoading: loading,
    error: queryError,
  } = useOrdersQuery();
  const createOrderMutation = useCreateOrder();
  const queryClient = useQueryClient();

  // Zustand hooks (UI state only)
  const selectOrder = useOrdersStore((state) => state.selectOrder);
  const selectedOrderId = useOrdersStore((state) => state.selectedOrderId);

  // Get user from authStore instead of decoding token from localStorage
  const user = useAuthStore((state) => state.user);

  const [formState, setFormState] = useState<CreateOrderFormState>(() => {
    return {
      ...initialFormState,
      providerId: user?.id ?? "",
    };
  });

  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [providerFilter, setProviderFilter] = useState<string>("");

  // Removed: useEffect to fetch orders - React Query handles this automatically

  useEffect(() => {
    const socket = getWorkflowSocket();
    const handler = (payload: { orderId: string }) => {
      // Invalidate queries to refetch updated order
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(payload.orderId),
      });
    };
    socket.on("order.updated", handler);
    return () => {
      socket.off("order.updated", handler);
    };
  }, [queryClient]);

  const selectedOrder = useMemo(
    () =>
      orders.find((order) => order.id === selectedOrderId) ?? orders[0] ?? null,
    [orders, selectedOrderId]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const statusMatch = statusFilter === "ALL" || o.status === statusFilter;
      const providerMatch =
        !providerFilter ||
        o.providerId.toLowerCase().includes(providerFilter.toLowerCase());
      return statusMatch && providerMatch;
    });
  }, [orders, statusFilter, providerFilter]);

  const handleSelectOrder = (orderId: string) => {
    selectOrder(orderId);
  };

  const handleToggleService = (service: "pharmacy" | "lab" | "radiology") => {
    setFormState((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        enabled: !prev[service].enabled,
      },
    }));
  };

  const handleInputChange = (
    field: keyof CreateOrderFormState,
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePharmacyChange = <K extends keyof PharmacyFormState>(
    field: K,
    value: PharmacyFormState[K]
  ) => {
    setFormState((prev) => ({
      ...prev,
      pharmacy: {
        ...prev.pharmacy,
        [field]: value,
      },
    }));
  };

  const handleLabChange = <K extends keyof LabFormState>(
    field: K,
    value: LabFormState[K]
  ) => {
    setFormState((prev) => ({
      ...prev,
      lab: {
        ...prev.lab,
        [field]: value,
      },
    }));
  };

  const handleRadiologyChange = <K extends keyof RadiologyFormState>(
    field: K,
    value: RadiologyFormState[K]
  ) => {
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
        type: "PHARMACY",
        payload: {
          patientId,
          providerId,
          encounterId,
          orderType: "OPD",
          priority,
          notes,
          items: [
            {
              rxNormId: formState.pharmacy.rxNormId || "0000",
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
        type: "LAB",
        payload: {
          patientId,
          providerId,
          encounterId,
          priority,
          clinicalNotes: notes,
          collectionSite: formState.lab.collectionSite,
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
        type: "RADIOLOGY",
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

    if (
      !formState.patientId ||
      !formState.providerId ||
      !formState.encounterId
    ) {
      setSubmissionError(
        "Patient, provider, and encounter identifiers are required."
      );
      return;
    }

    const items = buildOrderItems();
    if (items.length === 0) {
      setSubmissionError(
        "Select at least one fulfillment service for the unified order."
      );
      return;
    }

    setSubmitting(true);
    createOrderMutation.mutate(
      {
        patientId: formState.patientId,
        providerId: formState.providerId,
        encounterId: formState.encounterId,
        priority: formState.priority,
        notes: formState.notes,
        items,
      },
      {
        onSuccess: (createdOrder) => {
          // Select the newly created order
          selectOrder(createdOrder.id);
          // Reset form
          setFormState((prev) => ({
            ...initialFormState,
            providerId: prev.providerId,
          }));
          setSubmitting(false);
        },
        onError: (error) => {
          setSubmissionError(error.message);
          setSubmitting(false);
        },
      }
    );
  };

  return (
    <div className="orders-page">
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Unified Orders" },
        ]}
      />
      <div className="orders-header">
        <div>
          <h1>Unified Orders</h1>
          <p>
            Create, track, and orchestrate pharmacy, laboratory, and radiology
            fulfillment from a single cockpit.
          </p>
        </div>
      </div>

      <div className="orders-content">
        <div className="orders-left">
          <section className="orders-list-card">
            <header className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ClipboardList size={20} />
                <h2>Worklist</h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  placeholder="Ordered By..."
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="text-sm border rounded p-1 bg-white"
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    width: "120px",
                  }}
                />
                <Filter size={16} className="text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm border rounded p-1 bg-white"
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    padding: "2px 6px",
                  }}
                >
                  <option value="ALL">All Status</option>
                  <option value="NEW">New / Requested</option>
                  <option value="PARTIALLY_FULFILLED">In Progress</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </header>
            {loading && <p className="muted">Loading orders…</p>}
            {queryError && <p className="error">{queryError.message}</p>}
            <ul>
              {filteredOrders.map((order) => (
                <li
                  key={order.id}
                  className={
                    order.id === selectedOrder?.id
                      ? "order-item active"
                      : "order-item"
                  }
                  onClick={() => handleSelectOrder(order.id)}
                >
                  <div>
                    <span className="order-number">{order.orderNumber}</span>
                    <span className="order-patient">
                      Patient #{order.patientId}
                    </span>
                  </div>
                  <span
                    className={`status-pill status-${order.status.toLowerCase()}`}
                  >
                    {order.status}
                  </span>
                </li>
              ))}
              {!loading && filteredOrders.length === 0 && (
                <li className="muted">No orders found.</li>
              )}
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
                    onChange={(e) =>
                      handleInputChange("patientId", e.target.value)
                    }
                    required
                  />
                </label>
                <label>
                  <span>Provider ID</span>
                  <input
                    value={formState.providerId}
                    onChange={(e) =>
                      handleInputChange("providerId", e.target.value)
                    }
                    required
                  />
                </label>
                <label>
                  <span>Encounter ID</span>
                  <input
                    value={formState.encounterId}
                    onChange={(e) =>
                      handleInputChange("encounterId", e.target.value)
                    }
                    required
                  />
                </label>
                <label>
                  <span>Priority</span>
                  <select
                    value={formState.priority}
                    onChange={(e) =>
                      handleInputChange(
                        "priority",
                        e.target.value as OrderPriority
                      )
                    }
                  >
                    {ORDER_PRIORITIES.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Diagnosis Code</span>
                  <select
                    value={formState.diagnosisCode}
                    onChange={(e) =>
                      handleInputChange("diagnosisCode", e.target.value)
                    }
                  >
                    <option value="">Select Diagnosis</option>
                    {DIAGNOSIS_CODES.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.code} - {d.display}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="span-2">
                  <span>Ordering Provider Signature</span>
                  <input
                    value={formState.providerSignature}
                    onChange={(e) =>
                      handleInputChange("providerSignature", e.target.value)
                    }
                    placeholder="Type full name to sign"
                    style={{ fontFamily: "monospace" }}
                  />
                </label>
              </div>

              <label>
                <span>Clinical Notes</span>
                <textarea
                  rows={3}
                  value={formState.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Brief clinical context for fulfillment teams"
                />
              </label>

              <ServiceAccordion
                id="pharmacy"
                icon={<Pill size={18} />}
                title="Pharmacy"
                description="Send prescription data to the pharmacy workbench"
                enabled={formState.pharmacy.enabled}
                onToggle={() => handleToggleService("pharmacy")}
              >
                <div className="service-grid">
                  <label>
                    <span>RxNorm ID</span>
                    <input
                      value={formState.pharmacy.rxNormId}
                      onChange={(e) =>
                        handlePharmacyChange("rxNormId", e.target.value)
                      }
                      required={formState.pharmacy.enabled}
                    />
                  </label>
                  <label>
                    <span>Medication</span>
                    <input
                      value={formState.pharmacy.drugName}
                      onChange={(e) =>
                        handlePharmacyChange("drugName", e.target.value)
                      }
                      required={formState.pharmacy.enabled}
                    />
                  </label>
                  <label>
                    <span>Dosage</span>
                    <input
                      value={formState.pharmacy.dosage}
                      onChange={(e) =>
                        handlePharmacyChange("dosage", e.target.value)
                      }
                      required={formState.pharmacy.enabled}
                      placeholder="e.g. 500mg"
                    />
                  </label>
                  <label>
                    <span>Route</span>
                    <select
                      value={formState.pharmacy.route}
                      onChange={(e) =>
                        handlePharmacyChange("route", e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {MEDICATION_ROUTES.map((route) => (
                        <option key={route} value={route}>
                          {route}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Frequency</span>
                    <select
                      value={formState.pharmacy.frequency}
                      onChange={(e) =>
                        handlePharmacyChange("frequency", e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {MEDICATION_FREQUENCIES.map((freq) => (
                        <option key={freq} value={freq}>
                          {freq}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Duration</span>
                    <input
                      value={formState.pharmacy.duration}
                      onChange={(e) =>
                        handlePharmacyChange("duration", e.target.value)
                      }
                      placeholder="e.g. 7 days"
                    />
                  </label>
                  <label>
                    <span>Quantity</span>
                    <input
                      type="number"
                      min={1}
                      value={formState.pharmacy.quantity}
                      onChange={(e) =>
                        handlePharmacyChange("quantity", Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="span-2">
                    <span>Instructions</span>
                    <input
                      value={formState.pharmacy.instructions}
                      onChange={(e) =>
                        handlePharmacyChange("instructions", e.target.value)
                      }
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
                onToggle={() => handleToggleService("lab")}
              >
                <div className="service-grid">
                  <label>
                    <span>LOINC Code</span>
                    <input
                      value={formState.lab.loincCode}
                      onChange={(e) =>
                        handleLabChange("loincCode", e.target.value)
                      }
                      required={formState.lab.enabled}
                    />
                  </label>
                  <label>
                    <span>Test Name</span>
                    <input
                      value={formState.lab.testName}
                      onChange={(e) =>
                        handleLabChange("testName", e.target.value)
                      }
                      required={formState.lab.enabled}
                    />
                  </label>
                  <label className="span-2">
                    <span>Specimen Type</span>
                    <input
                      value={formState.lab.specimenType}
                      onChange={(e) =>
                        handleLabChange("specimenType", e.target.value)
                      }
                    />
                  </label>
                  <label className="span-2">
                    <span>Collection Site</span>
                    <input
                      value={formState.lab.collectionSite}
                      onChange={(e) =>
                        handleLabChange("collectionSite", e.target.value)
                      }
                      placeholder="e.g. Left Arm, Central Line"
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
                onToggle={() => handleToggleService("radiology")}
              >
                <div className="service-grid">
                  <label>
                    <span>Study Type</span>
                    <select
                      value={formState.radiology.studyType}
                      onChange={(e) =>
                        handleRadiologyChange(
                          "studyType",
                          e.target.value as (typeof STUDY_TYPES)[number]
                        )
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
                      onChange={(e) =>
                        handleRadiologyChange("bodyPart", e.target.value)
                      }
                      required={formState.radiology.enabled}
                    />
                  </label>
                  <label className="span-2">
                    <span>Clinical Indication</span>
                    <input
                      value={formState.radiology.clinicalIndication}
                      onChange={(e) =>
                        handleRadiologyChange(
                          "clinicalIndication",
                          e.target.value
                        )
                      }
                      required={formState.radiology.enabled}
                    />
                  </label>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={formState.radiology.contrast}
                      onChange={(e) =>
                        handleRadiologyChange("contrast", e.target.checked)
                      }
                    />
                    <span>Requires contrast</span>
                  </label>
                </div>
              </ServiceAccordion>

              {submissionError && <p className="error">{submissionError}</p>}

              <button
                className="submit-button"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Launch Unified Order"}
              </button>
            </form>
          </section>
        </div>

        <div className="orders-detail">
          {selectedOrder ? (
            <OrderDetailPanel order={selectedOrder} />
          ) : (
            <p>Select an order to view detail.</p>
          )}
        </div>
      </div>

      {/* New Components Preview (Non-invasive) */}
      <div style={{ marginTop: 24 }}>
        <section className="create-order-card">
          <header>
            <Beaker size={20} />
            <h2>Investigations (New Components Preview)</h2>
          </header>
          <div className="service-grid">
            <div className="span-2">
              <NewInvestigationSearch
                onSelect={() => {
                  /* no-op preview */
                }}
              />
            </div>
            <div className="span-2">
              <NewInvestigationList encounterId={formState.encounterId || ""} />
            </div>
          </div>
        </section>
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

function ServiceAccordion({
  icon,
  title,
  description,
  enabled,
  onToggle,
  children,
  id,
}: ServiceAccordionProps) {
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
  const steps = ["NEW", "PARTIALLY_FULFILLED", "VERIFIED", "COMPLETED"];
  // Default to 0 if status not found
  const currentStepIndex = Math.max(0, steps.indexOf(order.status));
  // Check items for error since order status doesn't have ERROR
  const isError = order.items.some((i) => i.status === "ERROR");

  return (
    <div className="order-detail-card">
      <header>
        <div>
          <h2>{order.orderNumber}</h2>
          <p>
            Patient #{order.patientId} • Encounter #{order.encounterId}
          </p>
        </div>
        <span className={`status-pill status-${order.status.toLowerCase()}`}>
          {order.status}
        </span>
      </header>

      {/* Visual Stepper */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "24px",
          marginTop: "12px",
          position: "relative",
        }}
      >
        {/* Line behind steps */}
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "0",
            right: "0",
            height: "2px",
            background: "#E2E8F0",
            zIndex: 0,
          }}
        />
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          let color = isCompleted ? "#2563EB" : "#CBD5E1"; // Blue or Gray
          let bg = isCompleted ? "#EFF6FF" : "#F8FAFC";
          if (isError && isCurrent) {
            color = "#DC2626"; // Red
            bg = "#FEF2F2";
          }

          // Map status to label
          const label = {
            NEW: "Requested",
            PARTIALLY_FULFILLED: "In Progress",
            VERIFIED: "Verified",
            COMPLETED: "Completed",
          }[step];

          return (
            <div
              key={step}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 1,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: bg,
                  border: `2px solid ${color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  color: color,
                  marginBottom: "8px",
                  transition: "all 0.3s ease",
                }}
              >
                {idx + 1}
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: isCompleted ? "#1E293B" : "#94A3B8",
                  textTransform: "capitalize",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <section>
        {(order.status === "COMPLETED" || order.status === "VERIFIED") && (
          <div style={{ marginBottom: "16px", textAlign: "right" }}>
            <button
              onClick={() =>
                alert(
                  `Notes from order #${order.orderNumber} appended to Patient History.`
                )
              }
              style={{
                background: "#fff",
                border: "1px solid #CBD5E1",
                padding: "6px 12px",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer",
                color: "#475569",
                fontWeight: 500,
              }}
            >
              Append Notes to History
            </button>
          </div>
        )}
        {order.diagnosisCodes && order.diagnosisCodes.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h3>Diagnosis</h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {order.diagnosisCodes.map((code) => (
                <span
                  key={code}
                  style={{
                    background: "#F1F5F9",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}

        <h3>Fulfillment Items</h3>
        <ul className="items-list">
          {order.items.map((item) => (
            <li key={item.id}>
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <div>
                    <span className="item-title">
                      {ITEM_LABEL[item.itemType]}
                    </span>
                    <span className="item-subtitle">
                      Target #{item.targetServiceOrderId}
                    </span>
                  </div>
                  <span className={STATUS_BADGE_CLASS[item.status]}>
                    {item.status}
                  </span>
                </div>
                {/* Expanded Details */}
                {item.metadata && (
                  <div
                    style={{
                      marginTop: "8px",
                      paddingTop: "8px",
                      borderTop: "1px dashed #E2E8F0",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "4px",
                      fontSize: "11px",
                      color: "#64748B",
                    }}
                  >
                    {Object.entries(item.metadata).map(([k, v]) => (
                      <div key={k}>
                        <span style={{ fontWeight: 600, marginRight: "4px" }}>
                          {k}:
                        </span>
                        {String(v)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Activity Timeline</h3>
        <ul className="timeline">
          {order.events
            .slice()
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((event) => (
              <li key={event.id}>
                <Activity size={16} />
                <div>
                  <span className="timeline-title">
                    {event.eventType.replace(/_/g, " ")}
                  </span>
                  <span className="timeline-time">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
