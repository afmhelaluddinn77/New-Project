// Consolidated tab components for Patient Portal - All 20 Features
import {
    Activity,
    AlertCircle,
    BookOpen,
    Building2,
    Calendar,
    CheckSquare,
    FileArchive,
    FileText,
    Pill,
    Plus,
    Syringe
} from 'lucide-react';

// Dashboard Tab - Feature #1: Personalized Dashboard
export function DashboardTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="tab-content">
      <h2>Welcome back, John Doe!</h2>
      <p>Your health overview at a glance</p>

      <div className="dashboard-grid">
        <div className="stat-card" onClick={() => onNavigate('appointments')}>
          <Calendar className="card-icon" />
          <h3>Next Appointment</h3>
          <p className="stat-value">Tomorrow, 10:00 AM</p>
          <p className="stat-label">Dr. Sarah Johnson</p>
        </div>

        <div className="stat-card" onClick={() => onNavigate('medications')}>
          <Pill className="card-icon" />
          <h3>Active Medications</h3>
          <p className="stat-value">5</p>
          <p className="stat-label">2 refills needed</p>
        </div>

        <div className="stat-card" onClick={() => onNavigate('lab-results')}>
          <FileText className="card-icon" />
          <h3>Lab Results</h3>
          <p className="stat-value">1 New</p>
          <p className="stat-label">CBC - Jan 15</p>
        </div>

        <div className="stat-card" onClick={() => onNavigate('vitals')}>
          <Activity className="card-icon" />
          <h3>Latest Vitals</h3>
          <p className="stat-value">120/80</p>
          <p className="stat-label">Blood Pressure - Normal</p>
        </div>
      </div>
    </div>
  );
}

// Appointments Tab - Features #2, #3, #4, #20
export function AppointmentsTab() {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Appointments</h2>
        <div className="tab-actions">
          <button className="primary-btn"><Plus /> Schedule New</button>
          <button className="secondary-btn"><CheckSquare /> Check-In</button>
        </div>
      </div>

      <div className="appointments-list">
        <div className="appointment-card upcoming">
          <div className="appointment-date">Jan 20, 2024 - 10:00 AM</div>
          <h3>General Checkup</h3>
          <p>Dr. Sarah Johnson - Main Clinic</p>
          <div className="appointment-actions">
            <button className="link-btn">Reschedule</button>
            <button className="link-btn">Cancel</button>
            <button className="link-btn">Directions</button>
          </div>
        </div>

        <div className="appointment-card upcoming">
          <div className="appointment-date">Jan 25, 2024 - 2:30 PM</div>
          <h3>Cardiology Follow-up</h3>
          <p>Dr. Michael Chen - Heart Center</p>
          <div className="appointment-actions">
            <button className="link-btn">Reschedule</button>
            <button className="link-btn">Cancel</button>
          </div>
        </div>

        <div className="appointment-card past">
          <div className="appointment-date">Jan 10, 2024 - 9:00 AM</div>
          <h3>Annual Physical</h3>
          <p>Dr. Sarah Johnson - Main Clinic</p>
          <div className="badge completed">Completed</div>
        </div>
      </div>
    </div>
  );
}

// Medications Tab - Features #5, #6
export function MedicationsTab() {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Medications</h2>
        <button className="primary-btn"><Plus /> Add Medication</button>
      </div>

      <div className="medications-list">
        <div className="medication-card">
          <Pill className="med-icon" />
          <div className="med-info">
            <h3>Lisinopril 10mg</h3>
            <p>Once daily | 3 refills remaining</p>
            <p className="next-refill">Next refill: Feb 1, 2024</p>
          </div>
          <button className="primary-btn-sm">Request Refill</button>
        </div>

        <div className="medication-card expiring">
          <Pill className="med-icon" />
          <div className="med-info">
            <h3>Metformin 500mg</h3>
            <p>Twice daily | 1 refill remaining</p>
            <p className="next-refill warning">Next refill: Jan 20, 2024</p>
          </div>
          <button className="primary-btn-sm">Request Refill</button>
        </div>

        <div className="medication-card">
          <Pill className="med-icon" />
          <div className="med-info">
            <h3>Vitamin D3 1000 IU</h3>
            <p>Once daily | 5 refills remaining</p>
            <p className="next-refill">Next refill: Mar 1, 2024</p>
          </div>
          <button className="secondary-btn-sm">Details</button>
        </div>
      </div>
    </div>
  );
}

// Lab Results Tab - Feature #7
export function LabResultsTab() {
  return (
    <div className="tab-content">
      <h2>Lab Results</h2>

      <div className="lab-results-list">
        <div className="lab-card new">
          <div className="lab-header">
            <h3>Complete Blood Count (CBC)</h3>
            <span className="badge new">New</span>
          </div>
          <p>Jan 15, 2024</p>
          <div className="lab-summary">
            <span className="status normal">All values normal</span>
          </div>
          <button className="link-btn">View Detailed Results</button>
        </div>

        <div className="lab-card">
          <div className="lab-header">
            <h3>Lipid Panel</h3>
            <span className="badge abnormal">Abnormal</span>
          </div>
          <p>Jan 15, 2024</p>
          <div className="lab-summary">
            <p>Total Cholesterol: 220 mg/dL (High)</p>
            <p className="note">Recommended: <200 mg/dL</p>
          </div>
          <button className="link-btn">View Details</button>
        </div>

        <div className="lab-card">
          <div className="lab-header">
            <h3>Hemoglobin A1c</h3>
            <span className="badge normal">Normal</span>
          </div>
          <p>Jan 10, 2024</p>
          <div className="lab-summary">
            <p>5.8% (Normal)</p>
          </div>
          <button className="link-btn">View Trend Chart</button>
        </div>
      </div>
    </div>
  );
}

// Vitals Tab - Feature #8
export function VitalsTab() {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Vitals Tracking</h2>
        <button className="primary-btn"><Plus /> Add Entry</button>
      </div>

      <div className="vitals-chart-placeholder">
        <h3>Blood Pressure Trend</h3>
        <div className="chart-area" style={{ height: '200px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Line Chart: 120/80, 118/78, 122/82, 119/80 (Last 4 readings)</p>
        </div>
      </div>

      <div className="vitals-list">
        <div className="vital-card">
          <h3>Blood Pressure</h3>
          <p className="vital-value">120/80 mmHg</p>
          <p className="vital-status normal">Normal</p>
          <p className="vital-date">Jan 15, 2024</p>
        </div>

        <div className="vital-card">
          <h3>Heart Rate</h3>
          <p className="vital-value">72 bpm</p>
          <p className="vital-status normal">Normal</p>
          <p className="vital-date">Jan 15, 2024</p>
        </div>

        <div className="vital-card">
          <h3>Blood Sugar</h3>
          <p className="vital-value">95 mg/dL</p>
          <p className="vital-status caution">Slightly elevated</p>
          <p className="vital-date">Jan 15, 2024</p>
        </div>

        <div className="vital-card">
          <h3>Weight</h3>
          <p className="vital-value">180 lbs</p>
          <p className="vital-status normal">Stable</p>
          <p className="vital-date">Jan 15, 2024</p>
        </div>
      </div>
    </div>
  );
}

// Immunizations Tab - Feature #9
export function ImmunizationsTab() {
  return (
    <div className="tab-content">
      <h2>Immunization Record</h2>

      <div className="immunizations-list">
        <div className="immunization-card">
          <Syringe className="immun-icon" />
          <div className="immun-info">
            <h3>COVID-19 Vaccine (Pfizer)</h3>
            <p>Administered: Dec 15, 2023</p>
            <p>Lot: EK9899</p>
            <p>Provider: CVS Pharmacy</p>
          </div>
          <span className="badge current">Current</span>
        </div>

        <div className="immunization-card">
          <Syringe className="immun-icon" />
          <div className="immun-info">
            <h3>Influenza Vaccine</h3>
            <p>Administered: Oct 1, 2023</p>
            <p>Lot: FL7721</p>
            <p>Provider: Main Clinic</p>
          </div>
          <span className="badge current">Current</span>
        </div>

        <div className="immunization-card due">
          <Syringe className="immun-icon" />
          <div className="immun-info">
            <h3>Tetanus Booster (Td/Tdap)</h3>
            <p>Last: Jan 2018</p>
            <p>Due: Jan 2028</p>
          </div>
          <span className="badge upcoming">Upcoming</span>
        </div>
      </div>
    </div>
  );
}

// Allergies & Conditions Tab - Feature #10
export function AllergiesTab() {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Allergies & Conditions</h2>
        <button className="primary-btn"><Plus /> Add New</button>
      </div>

      <div className="section">
        <h3>Allergies</h3>
        <div className="allergy-card critical">
          <AlertCircle className="alert-icon" />
          <div className="allergy-info">
            <h4>Penicillin</h4>
            <p>Severity: Critical</p>
            <p>Reaction: Anaphylaxis</p>
          </div>
        </div>

        <div className="allergy-card moderate">
          <AlertCircle className="alert-icon" />
          <div className="allergy-info">
            <h4>Pollen (Seasonal)</h4>
            <p>Severity: Moderate</p>
            <p>Reaction: Rhinitis, congestion</p>
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Chronic Conditions</h3>
        <div className="condition-card">
          <h4>Type 2 Diabetes Mellitus</h4>
          <p>Onset: 2018</p>
          <p>Status: Controlled</p>
        </div>

        <div className="condition-card">
          <h4>Hypertension</h4>
          <p>Onset: 2015</p>
          <p>Status: Controlled with medication</p>
        </div>
      </div>
    </div>
  );
}

// Messaging Tab - Feature #11
export function MessagingTab() {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Secure Messages</h2>
        <button className="primary-btn"><Plus /> New Message</button>
      </div>

      <div className="messages-list">
        <div className="message-card unread">
          <div className="message-header">
            <h3>Dr. Sarah Johnson</h3>
            <span className="message-date">Jan 16, 2024</span>
          </div>
          <p className="message-subject">Re: Lab Results Follow-up</p>
          <p className="message-preview">Your recent cholesterol levels are slightly elevated...</p>
          <span className="badge unread">Unread</span>
        </div>

        <div className="message-card">
          <div className="message-header">
            <h3>Appointment Reminders</h3>
            <span className="message-date">Jan 15, 2024</span>
          </div>
          <p className="message-subject">Upcoming appointment reminder</p>
          <p className="message-preview">This is a reminder for your appointment on Jan 20...</p>
        </div>

        <div className="message-card">
          <div className="message-header">
            <h3>Billing Department</h3>
            <span className="message-date">Jan 10, 2024</span>
          </div>
          <p className="message-subject">Invoice #INV-2024-001</p>
          <p className="message-preview">Your invoice for the recent visit is now available...</p>
        </div>
      </div>
    </div>
  );
}

// Billing Tab - Features #12, #13
export function BillingTab() {
  return (
    <div className="tab-content">
      <h2>Billing & Payments</h2>

      <div className="billing-summary">
        <div className="balance-card">
          <h3>Current Balance</h3>
          <p className="balance-amount">$350.00</p>
          <button className="primary-btn">Pay Now</button>
        </div>
      </div>

      <div className="invoices-list">
        <h3>Recent Invoices</h3>

        <div className="invoice-card outstanding">
          <div className="invoice-header">
            <h4>Invoice #INV-2024-001</h4>
            <span className="badge outstanding">Outstanding</span>
          </div>
          <p>Date: Jan 10, 2024</p>
          <p>Service: Annual Physical Exam</p>
          <p className="invoice-amount">Amount: $250.00</p>
          <p>Due: Jan 25, 2024</p>
          <div className="invoice-actions">
            <button className="primary-btn-sm">Pay Now</button>
            <button className="link-btn">View Details</button>
            <button className="link-btn">Download PDF</button>
          </div>
        </div>

        <div className="invoice-card paid">
          <div className="invoice-header">
            <h4>Invoice #INV-2023-125</h4>
            <span className="badge paid">Paid</span>
          </div>
          <p>Date: Dec 5, 2023</p>
          <p>Service: Lab Work</p>
          <p className="invoice-amount">Amount: $100.00</p>
          <p>Paid: Dec 10, 2023</p>
          <button className="link-btn">View Receipt</button>
        </div>
      </div>
    </div>
  );
}

// Profile Tab - Features #14, #17
export function ProfileTab() {
  return (
    <div className="tab-content">
      <h2>My Profile</h2>

      <div className="profile-section">
        <h3>Personal Information</h3>
        <div className="profile-form">
          <div className="form-row">
            <label>Full Name</label>
            <input type="text" value="John Doe" readOnly />
            <button className="link-btn">Edit</button>
          </div>

          <div className="form-row">
            <label>Date of Birth</label>
            <input type="text" value="Jan 1, 1980" readOnly />
          </div>

          <div className="form-row">
            <label>Email</label>
            <input type="email" value="john.doe@email.com" readOnly />
            <button className="link-btn">Edit</button>
          </div>

          <div className="form-row">
            <label>Phone</label>
            <input type="tel" value="(555) 123-4567" readOnly />
            <button className="link-btn">Edit</button>
          </div>

          <div className="form-row">
            <label>Address</label>
            <textarea readOnly value="123 Main St&#10;Anytown, ST 12345" />
            <button className="link-btn">Edit</button>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3>Emergency Contact</h3>
        <div className="profile-form">
          <div className="form-row">
            <label>Name</label>
            <input type="text" value="Jane Doe" readOnly />
            <button className="link-btn">Edit</button>
          </div>

          <div className="form-row">
            <label>Relationship</label>
            <input type="text" value="Spouse" readOnly />
          </div>

          <div className="form-row">
            <label>Phone</label>
            <input type="tel" value="(555) 987-6543" readOnly />
            <button className="link-btn">Edit</button>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3>Preferred Pharmacy</h3>
        <div className="pharmacy-card">
          <Building2 className="pharmacy-icon" />
          <div className="pharmacy-info">
            <h4>CVS Pharmacy #1234</h4>
            <p>456 Oak Street, Anytown, ST 12345</p>
            <p>Phone: (555) 456-7890</p>
          </div>
          <button className="link-btn">Change</button>
        </div>
      </div>

      <div className="profile-section">
        <h3>Insurance Information</h3>
        <div className="insurance-card">
          <h4>Blue Cross Blue Shield</h4>
          <p>Member ID: BC123456789</p>
          <p>Group #: GRP987654</p>
          <button className="link-btn">Update Insurance</button>
        </div>
      </div>
    </div>
  );
}

// Health Education Tab - Feature #15
export function EducationTab() {
  return (
    <div className="tab-content">
      <h2>Health Education Resources</h2>

      <div className="education-categories">
        <button className="category-btn active">All</button>
        <button className="category-btn">Diabetes</button>
        <button className="category-btn">Heart Health</button>
        <button className="category-btn">Nutrition</button>
        <button className="category-btn">Exercise</button>
      </div>

      <div className="resources-list">
        <div className="resource-card">
          <BookOpen className="resource-icon" />
          <div className="resource-info">
            <h3>Managing Type 2 Diabetes</h3>
            <p>Learn about diet, exercise, and medication management for diabetes control.</p>
            <div className="resource-meta">
              <span>Article</span>
              <span>•</span>
              <span>5 min read</span>
            </div>
          </div>
          <button className="link-btn">Read More</button>
        </div>

        <div className="resource-card">
          <BookOpen className="resource-icon" />
          <div className="resource-info">
            <h3>Understanding Cholesterol</h3>
            <p>What your cholesterol numbers mean and how to maintain healthy levels.</p>
            <div className="resource-meta">
              <span>Video</span>
              <span>•</span>
              <span>10 min</span>
            </div>
          </div>
          <button className="link-btn">Watch Now</button>
        </div>

        <div className="resource-card">
          <BookOpen className="resource-icon" />
          <div className="resource-info">
            <h3>Healthy Eating Guide</h3>
            <p>Tips for creating a balanced diet that supports your health goals.</p>
            <div className="resource-meta">
              <span>PDF Guide</span>
              <span>•</span>
              <span>Download</span>
            </div>
          </div>
          <button className="link-btn">Download</button>
        </div>
      </div>
    </div>
  );
}

// Documents Tab - Features #16, #19
export function DocumentsTab() {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Medical Documents</h2>
        <button className="primary-btn"><Plus /> Upload Document</button>
      </div>

      <div className="documents-list">
        <div className="document-card">
          <FileArchive className="doc-icon" />
          <div className="doc-info">
            <h3>Annual Physical - Clinical Summary</h3>
            <p>Jan 10, 2024 | Dr. Sarah Johnson</p>
            <p className="doc-type">Clinical Summary</p>
          </div>
          <div className="doc-actions">
            <button className="link-btn">View</button>
            <button className="link-btn">Download</button>
          </div>
        </div>

        <div className="document-card">
          <FileArchive className="doc-icon" />
          <div className="doc-info">
            <h3>Cardiology Consultation Notes</h3>
            <p>Dec 15, 2023 | Dr. Michael Chen</p>
            <p className="doc-type">Consultation Notes</p>
          </div>
          <div className="doc-actions">
            <button className="link-btn">View</button>
            <button className="link-btn">Download</button>
          </div>
        </div>

        <div className="document-card">
          <FileArchive className="doc-icon" />
          <div className="doc-info">
            <h3>Insurance Card</h3>
            <p>Uploaded: Nov 1, 2023</p>
            <p className="doc-type">Insurance</p>
          </div>
          <div className="doc-actions">
            <button className="link-btn">View</button>
            <button className="link-btn">Replace</button>
          </div>
        </div>

        <div className="document-card">
          <FileArchive className="doc-icon" />
          <div className="doc-info">
            <h3>Advance Directive</h3>
            <p>Uploaded: Jun 15, 2023</p>
            <p className="doc-type">Legal Document</p>
          </div>
          <div className="doc-actions">
            <button className="link-btn">View</button>
            <button className="link-btn">Update</button>
          </div>
        </div>
      </div>
    </div>
  );
}
