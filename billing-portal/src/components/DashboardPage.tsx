import {
  AlertTriangle,
  BarChart,
  Calendar,
  CreditCard,
  FileText,
  Home,
  MessageSquare,
  Receipt,
  Settings,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import "./DashboardPage.css";
import Breadcrumb from "./shared/Breadcrumb";
import DashboardCard from "./shared/DashboardCard";
import DashboardLayout from "./shared/DashboardLayout";

const PORTAL_COLOR = "#7B9FE5";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: Home },
  { id: "claims", label: "Claims", path: "/claims", icon: FileText },
  { id: "payments", label: "Payments", path: "/payments", icon: CreditCard },
  { id: "insurance", label: "Insurance", path: "/insurance", icon: Shield },
  {
    id: "reports",
    label: "Financial Reports",
    path: "/reports",
    icon: BarChart,
  },
  { id: "invoices", label: "Invoices", path: "/invoices", icon: Receipt },
];

interface DashboardPageProps {
  portalType: string;
}

export default function DashboardPage({ portalType }: DashboardPageProps) {
  return (
    <DashboardLayout
      sidebarItems={NAV_ITEMS}
      portalTitle="{portalType} Portal"
      portalColor={PORTAL_COLOR}
      userName="Billing Admin"
      userRole="Billing Specialist"
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
            <h1 className="dashboard-title">Welcome back, Billing Admin</h1>
            <p className="dashboard-subtitle">
              Here's what's happening with your billing portal today.
            </p>
          </div>
        </div>

        <div className="dashboard-cards-grid">
          <DashboardCard
            title="Pending Claims"
            subtitle="$125,000"
            icon={<FileText size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">45</span>
              <span className="metric-trend trend-positive">+12</span>
            </div>
          </DashboardCard>
          <DashboardCard
            title="Payments Due"
            subtitle="30 days"
            icon={<CreditCard size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">$85,000</span>
              <span className="metric-trend trend-positive">+5000</span>
            </div>
          </DashboardCard>
          <DashboardCard
            title="Denials"
            subtitle="This month"
            icon={<AlertTriangle size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">8</span>
              <span className="metric-trend trend-positive">+3</span>
            </div>
          </DashboardCard>
          <DashboardCard
            title="Revenue"
            subtitle="This month"
            icon={<TrendingUp size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">$450k</span>
              <span className="metric-trend trend-positive">+15%</span>
            </div>
          </DashboardCard>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h2 className="section-title">Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <FileText size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">New record added</p>
                  <p className="activity-time">2 hours ago</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <Users size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">User session started</p>
                  <p className="activity-time">4 hours ago</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <Shield size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Security check completed</p>
                  <p className="activity-time">6 hours ago</p>
                </div>
              </div>
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
              <button
                className="quick-action-btn"
                onClick={() => alert("Exporting invoice data to CSV...")}
              >
                <Download size={20} />
                <span>Export Invoices</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
