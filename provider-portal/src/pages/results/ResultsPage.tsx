import { ResultsEntry } from "@/components/investigations/ResultsEntry";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ClipboardCheck,
  FlaskConical,
  Pill,
  Scan,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/shared/Breadcrumb";
import { useOrdersQuery } from "../../hooks/queries/useOrdersQuery";
import { queryKeys } from "../../lib/queryClient";
import { getWorkflowSocket } from "../../services/socketClient";
import type { UnifiedOrder } from "../../types/workflow";
import "./ResultsPage.css";

const SERVICE_ICON = {
  PHARMACY: <Pill size={16} />,
  LAB: <FlaskConical size={16} />,
  RADIOLOGY: <Scan size={16} />,
  PROCEDURE: <ClipboardCheck size={16} />,
};

const formatDate = (value: string) => new Date(value).toLocaleString();

export default function ResultsPage() {
  const { data: orders = [], isLoading: loading } = useOrdersQuery();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Removed fetchOrders useEffect - React Query handles this automatically

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

  const timeline = useMemo(() => buildTimeline(orders), [orders]);

  return (
    <div className="results-page">
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Results Timeline" },
        ]}
      />

      <div className="results-header">
        <div>
          <h1>Results Timeline</h1>
          <p>
            Monitor fulfillment progress across services and surface completed
            results in real time.
          </p>
        </div>
      </div>

      <div className="results-grid">
        <section className="status-summary-card">
          <header>
            <ClipboardCheck size={20} />
            <h2>Fulfillment Summary</h2>
          </header>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Pharmacy</th>
                <th>Laboratory</th>
                <th>Radiology</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const labItem = order.items.find((i) => i.itemType === "LAB");
                const isLabCompleted = labItem?.status === "COMPLETED";

                return (
                  <tr key={order.id}>
                    <td>
                      <span className="order-number">{order.orderNumber}</span>
                      <span
                        className={`status-pill status-${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    {["PHARMACY", "LAB", "RADIOLOGY"].map((type) => {
                      const item = order.items.find((i) => i.itemType === type);
                      return (
                        <td key={type}>
                          {item ? (
                            <span
                              className={`item-status status-${item.status.toLowerCase()}`}
                            >
                              {SERVICE_ICON[type as keyof typeof SERVICE_ICON]}
                              {item.status}
                            </span>
                          ) : (
                            <span className="item-status muted">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td>
                      {isLabCompleted && labItem?.targetServiceOrderId && (
                        <button
                          onClick={() =>
                            navigate(
                              `/lab-results/${labItem.targetServiceOrderId}`
                            )
                          }
                          className="view-details-btn"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            fontSize: "13px",
                            fontWeight: "500",
                            color: "#059669",
                            background: "#d1fae5",
                            border: "1px solid #6ee7b7",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = "#a7f3d0";
                            e.currentTarget.style.borderColor = "#34d399";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "#d1fae5";
                            e.currentTarget.style.borderColor = "#6ee7b7";
                          }}
                        >
                          <Eye size={14} />
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">
                    No orders yet. Create one from the Unified Orders page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="timeline-card">
          <header>
            <Activity size={20} />
            <h2>Live Activity Feed</h2>
          </header>
          <ul className="timeline-list">
            {timeline.map((event) => (
              <li key={`${event.orderId}-${event.id}`}>
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <div className="timeline-title">
                    {event.eventType.replace(/_/g, " ")}
                  </div>
                  <div className="timeline-meta">
                    <span>Order {event.orderNumber}</span>
                    <span>•</span>
                    <span>{formatDate(event.createdAt)}</span>
                  </div>
                </div>
              </li>
            ))}
            {!loading && timeline.length === 0 && (
              <li className="muted">No activity yet.</li>
            )}
          </ul>
        </section>
      </div>

      {/* New Components Preview (Non-invasive) */}
      <div style={{ marginTop: 24 }}>
        <section className="status-summary-card">
          <header>
            <h2>Enter Results (New Components Preview)</h2>
          </header>
          <ResultsPreviewPanel />
        </section>
      </div>
    </div>
  );
}

function buildTimeline(orders: UnifiedOrder[]) {
  return orders
    .flatMap((order) =>
      order.events.map((event) => ({
        ...event,
        orderNumber: order.orderNumber,
        orderId: order.id,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 25);
}

function ResultsPreviewPanel() {
  const [investigationId, setInvestigationId] = useState("");
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            color: "#6b7280",
            marginBottom: 6,
          }}
        >
          Investigation ID
        </label>
        <input
          value={investigationId}
          onChange={(e) => setInvestigationId(e.target.value)}
          placeholder="Enter investigationId to submit results"
        />
      </div>
      {investigationId ? (
        <ResultsEntry
          investigationId={investigationId}
          onSubmit={async () => {
            /* preview only */
          }}
        />
      ) : (
        <p className="muted">
          Provide an investigation ID to preview the ResultsEntry form.
        </p>
      )}
    </div>
  );
}
