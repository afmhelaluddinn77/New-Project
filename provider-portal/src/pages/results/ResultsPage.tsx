import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ClipboardCheck,
  Eye,
  FlaskConical,
  Pill,
  Scan,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InvestigationList as NewInvestigationList } from "../../components/investigations/InvestigationList";
import { InvestigationSearch as NewInvestigationSearch } from "../../components/investigations/InvestigationSearch";
import Breadcrumb from "../../components/shared/Breadcrumb";
import Tabs, { Tab } from "../../components/shared/Tabs";
import { useOrdersQuery } from "../../hooks/queries/useOrdersQuery";
import { queryKeys } from "../../lib/queryClient";
import { getWorkflowSocket } from "../../services/socketClient";
import type { UnifiedOrder } from "../../types/workflow";
import "./ResultsPage.css";

const SERVICE_ICON = {
  PHARMACY: (
    <span className="icon-pharmacy">
      <Pill size={16} />
    </span>
  ),
  LAB: (
    <span className="icon-lab">
      <FlaskConical size={16} />
    </span>
  ),
  RADIOLOGY: (
    <span className="icon-radiology">
      <Scan size={16} />
    </span>
  ),
  PROCEDURE: (
    <span className="icon-procedure">
      <ClipboardCheck size={16} />
    </span>
  ),
};

const formatDate = (value: string) => new Date(value).toLocaleString();

export default function ResultsPage() {
  const { data: orders = [], isLoading: loading } = useOrdersQuery();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getWorkflowSocket();
    const handler = (payload: { orderId: string }) => {
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

  const tabs: Tab[] = [
    {
      id: "fulfillment",
      label: "Fulfillment Summary",
      icon: <ClipboardCheck size={18} />,
      content: (
        <FulfillmentSummary
          orders={orders}
          loading={loading}
          navigate={navigate}
        />
      ),
    },
    {
      id: "activity",
      label: "Live Activity Feed",
      icon: <Activity size={18} />,
      content: <LiveActivityFeed timeline={timeline} loading={loading} />,
    },
    {
      id: "enter-results",
      label: "Enter Results",
      icon: <FlaskConical size={18} />,
      content: (
        <div className="results-tab-content">
          <section className="status-summary-card">
            <header>
              <h2>Enter Results (New Components Preview)</h2>
            </header>
            <ResultsPreviewPanel />
          </section>
        </div>
      ),
    },
  ];

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
          <h1>Results Timeline (v2)</h1>
          <p>
            Monitor fulfillment progress across services and surface completed
            results in real time.
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} defaultTab="fulfillment" />
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

interface FulfillmentSummaryProps {
  orders: UnifiedOrder[];
  loading: boolean;
  navigate: ReturnType<typeof useNavigate>;
}

function FulfillmentSummary({
  orders,
  loading,
  navigate,
}: FulfillmentSummaryProps) {
  return (
    <div className="fulfillment-summary-content">
      <table className="results-table">
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
                        navigate(`/lab-results/${labItem.targetServiceOrderId}`)
                      }
                      className="view-details-btn"
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  )}
                  {(() => {
                    const radiologyItem = order.items.find(
                      (i) => i.itemType === "RADIOLOGY"
                    );
                    const isRadiologyCompleted =
                      radiologyItem?.status === "COMPLETED";
                    return (
                      isRadiologyCompleted &&
                      radiologyItem?.targetServiceOrderId && (
                        <button
                          onClick={() =>
                            navigate(
                              `/radiology-results/${radiologyItem.targetServiceOrderId}`
                            )
                          }
                          className="view-details-btn"
                          style={{
                            marginLeft: isLabCompleted ? "8px" : "0",
                          }}
                        >
                          <Eye size={14} />
                          View Report
                        </button>
                      )
                    );
                  })()}
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
    </div>
  );
}

interface LiveActivityFeedProps {
  timeline: any[];
  loading: boolean;
}

function LiveActivityFeed({ timeline, loading }: LiveActivityFeedProps) {
  const [itemsToShow, setItemsToShow] = useState(10);

  const visibleItems = timeline.slice(0, itemsToShow);
  const hasMore = itemsToShow < timeline.length;

  const handleLoadMore = () => {
    setItemsToShow((prev) => prev + 10);
  };

  return (
    <div className="activity-feed-content">
      <ul className="timeline-list">
        {visibleItems.map((event) => (
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
          <li className="muted" style={{ gridColumn: "1 / -1" }}>
            No activity yet.
          </li>
        )}
      </ul>
      {hasMore && (
        <div className="load-more-container">
          <button onClick={handleLoadMore} className="load-more-btn">
            Load More Activities
          </button>
        </div>
      )}
    </div>
  );
}

function ResultsPreviewPanel() {
  return (
    <div
      className="service-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        marginTop: "16px",
      }}
    >
      <div className="span-2">
        <NewInvestigationSearch
          onSelect={() => {
            /* no-op preview */
          }}
        />
      </div>
      <div className="span-2">
        <NewInvestigationList encounterId="" />
      </div>
    </div>
  );
}
