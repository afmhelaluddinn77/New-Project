import {
  Activity,
  AlertCircle,
  Bell,
  BookOpen,
  Calendar,
  CreditCard,
  FileArchive,
  FileText,
  Heart,
  Home,
  LogOut,
  MessageSquare,
  Pill,
  Search,
  Syringe,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "../components/DarkModeToggle";
import "../styles/EnhancedPatientPortal.css";
import {
  AllergiesTab,
  AppointmentsTab,
  BillingTab,
  DashboardTab,
  DocumentsTab,
  EducationTab,
  ImmunizationsTab,
  LabResultsTab,
  MedicationsTab,
  MessagingTab,
  ProfileTab,
  VitalsTab,
} from "./tabs";

type TabId =
  | "dashboard"
  | "appointments"
  | "medications"
  | "lab-results"
  | "vitals"
  | "immunizations"
  | "allergies"
  | "messages"
  | "billing"
  | "profile"
  | "education"
  | "documents";

const TABS = [
  { id: "dashboard" as TabId, label: "Dashboard", icon: Home },
  { id: "appointments" as TabId, label: "Appointments", icon: Calendar },
  { id: "medications" as TabId, label: "Medications", icon: Pill },
  { id: "lab-results" as TabId, label: "Lab Results", icon: FileText },
  { id: "vitals" as TabId, label: "Vitals", icon: Activity },
  { id: "immunizations" as TabId, label: "Immunizations", icon: Syringe },
  {
    id: "allergies" as TabId,
    label: "Allergies & Conditions",
    icon: AlertCircle,
  },
  { id: "messages" as TabId, label: "Messages", icon: MessageSquare },
  { id: "billing" as TabId, label: "Billing", icon: CreditCard },
  { id: "profile" as TabId, label: "Profile", icon: User },
  { id: "education" as TabId, label: "Health Education", icon: BookOpen },
  { id: "documents" as TabId, label: "Documents", icon: FileArchive },
];

export default function EnhancedPatientPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab onNavigate={setActiveTab} />;
      case "appointments":
        return <AppointmentsTab />;
      case "medications":
        return <MedicationsTab />;
      case "lab-results":
        return <LabResultsTab />;
      case "vitals":
        return <VitalsTab />;
      case "immunizations":
        return <ImmunizationsTab />;
      case "allergies":
        return <AllergiesTab />;
      case "messages":
        return <MessagingTab />;
      case "billing":
        return <BillingTab />;
      case "profile":
        return <ProfileTab />;
      case "education":
        return <EducationTab />;
      case "documents":
        return <DocumentsTab />;
      default:
        return <DashboardTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="enhanced-patient-portal">
      {/* Top Navigation */}
      <header className="portal-header">
        <div className="portal-header-left">
          <Heart className="portal-logo-icon" />
          <h1 className="portal-title">Patient Portal</h1>
        </div>
        <div className="portal-header-center">
          <div className="portal-search">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search appointments, medications, results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="portal-header-right">
          <button className="header-button">
            <Bell />
            <span className="notification-badge">5</span>
          </button>
          <DarkModeToggle size="sm" />
          <button
            className="header-button"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut />
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="portal-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`portal-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="tab-icon" />
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab Content */}
      <main className="portal-content">{renderTabContent()}</main>
    </div>
  );
}
