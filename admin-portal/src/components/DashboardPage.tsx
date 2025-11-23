import {
  Activity,
  BarChart,
  Calendar,
  Database,
  FileText,
  Home,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AuditLog, getAuditLogs } from "../services/auditService";
import "./DashboardPage.css";
import Breadcrumb from "./shared/Breadcrumb";
import DashboardCard from "./shared/DashboardCard";
import DashboardLayout from "./shared/DashboardLayout";

const PORTAL_COLOR = "#B19EED";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: Home },
  { id: "users", label: "User Management", path: "/users", icon: Users },
  {
    id: "settings",
    label: "System Settings",
    path: "/settings",
    icon: Settings,
  },
  { id: "audit", label: "Audit Logs", path: "/audit", icon: FileText },
  { id: "reports", label: "Reports", path: "/reports", icon: BarChart },
  { id: "security", label: "Security", path: "/security", icon: Shield },
];

interface DashboardPageProps {
  portalType: string;
}

export default function DashboardPage({ portalType }: DashboardPageProps) {
  const [filters, setFilters] = useState({
    user: "",
    action: "ALL",
    date: "",
  });

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await getAuditLogs(filters);
        setLogs(data);
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchLogs();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  return (
    <DashboardLayout
      sidebarItems={NAV_ITEMS}
      portalTitle="{portalType} Portal"
      portalColor={PORTAL_COLOR}
      userName="Admin User"
      userRole="System Administrator"
    >
      <div className="dashboard-page">
        <Breadcrumb
          items={[
            { label: "Home", path: "/dashboard" },
            { label: "Dashboard" },
          ]}
        />

        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome back, Admin User</h1>
            <p className="dashboard-subtitle">
              Here's what's happening with your admin portal today.
            </p>
          </div>
        </div>

        <div className="dashboard-cards-grid">
          <DashboardCard
            title="Active Users"
            subtitle="12 online now"
            icon={<Users size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">248</span>
              <span className="metric-trend trend-positive">+5</span>
            </div>
          </DashboardCard>
          <DashboardCard
            title="System Health"
            subtitle="All systems operational"
            icon={<Activity size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">98%</span>
              <span className="metric-trend trend-positive">0</span>
            </div>
          </DashboardCard>
          <DashboardCard
            title="Security Alerts"
            subtitle="Requires attention"
            icon={<Shield size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">2</span>
              <span className="metric-trend trend-positive">+2</span>
            </div>
          </DashboardCard>
          <DashboardCard
            title="Data Backup"
            subtitle="Last: 2 hours ago"
            icon={<Database size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">100%</span>
              <span className="metric-trend trend-positive">0</span>
            </div>
          </DashboardCard>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 className="section-title" style={{ margin: 0 }}>
                Audit Log
              </h2>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ position: "relative" }}>
                  <Search
                    size={14}
                    style={{
                      position: "absolute",
                      left: 8,
                      top: 9,
                      color: "#94A3B8",
                    }}
                  />
                  <input
                    placeholder="Filter User..."
                    value={filters.user}
                    onChange={(e) =>
                      setFilters({ ...filters, user: e.target.value })
                    }
                    style={{
                      paddingLeft: 28,
                      paddingRight: 8,
                      height: 32,
                      border: "1px solid #E2E8F0",
                      borderRadius: 4,
                      fontSize: 13,
                    }}
                  />
                </div>
                <select
                  value={filters.action}
                  onChange={(e) =>
                    setFilters({ ...filters, action: e.target.value })
                  }
                  style={{
                    padding: "0 8px",
                    height: 32,
                    border: "1px solid #E2E8F0",
                    borderRadius: 4,
                    fontSize: 13,
                  }}
                >
                  <option value="ALL">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="READ">Read</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="LOGIN">Login</option>
                  <option value="EXPORT">Export</option>
                </select>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters({ ...filters, date: e.target.value })
                  }
                  style={{
                    padding: "0 8px",
                    height: 32,
                    border: "1px solid #E2E8F0",
                    borderRadius: 4,
                    fontSize: 13,
                  }}
                />
              </div>
            </div>

            <div className="activity-list">
              {loading ? (
                <p
                  style={{
                    padding: 16,
                    color: "#64748B",
                    textAlign: "center",
                  }}
                >
                  Loading logs...
                </p>
              ) : logs.length === 0 ? (
                <p
                  style={{
                    padding: 16,
                    color: "#64748B",
                    textAlign: "center",
                  }}
                >
                  No logs found matching filters.
                </p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="activity-item">
                    <div className="activity-icon">
                      <FileText size={16} />
                    </div>
                    <div className="activity-content">
                      <p className="activity-title">
                        <span style={{ fontWeight: 600 }}>
                          User #{log.userId.substring(0, 6)}...
                        </span>{" "}
                        performed {log.action} on {log.resourceType} #
                        {log.resourceId.substring(0, 6)}...
                      </p>
                      <p className="activity-time">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions">
              <button className="quick-action-btn">
                <Calendar size={20} />
                <span>Schedule</span>
              </button>
              <button className="quick-action-btn">
                <FileText size={20} />
                <span>New Record</span>
              </button>
              <button className="quick-action-btn">
                <MessageSquare size={20} />
                <span>Messages</span>
              </button>
              <button className="quick-action-btn">
                <Settings size={20} />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
