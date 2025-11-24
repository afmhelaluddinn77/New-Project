// Consolidated tab components for Patient Portal - All 20 Features
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
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
  Syringe,
} from "lucide-react";

// Dashboard Tab - Feature #1: Personalized Dashboard
export function DashboardTab({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  return (
    <Box sx={{ mt: 1 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          mb: 1,
          fontSize: { xs: "2.2rem", md: "2.4rem" },
        }}
      >
        Welcome back, John Doe!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Your health overview at a glance
      </Typography>

      {/* Health Overview chips (inspired by PatientDashboardClarity vitals summary) */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        <Chip
          label="BP: 120/80 mmHg (Normal)"
          color="success"
          variant="outlined"
        />
        <Chip label="HR: 72 bpm" color="primary" variant="outlined" />
        <Chip
          label="Blood Sugar: 95 mg/dL"
          color="warning"
          variant="outlined"
        />
        <Chip label="Next visit in 5 days" color="info" variant="outlined" />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              backgroundColor: "background.paper",
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <CardActionArea onClick={() => onNavigate("appointments")}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Calendar className="card-icon" />
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    Next Appointment
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Tomorrow, 10:00 AM
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dr. Sarah Johnson
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardActionArea onClick={() => onNavigate("medications")}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Pill className="card-icon" />
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    Active Medications
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  5
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  2 refills needed
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardActionArea onClick={() => onNavigate("lab-results")}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <FileText className="card-icon" />
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    Lab Results
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  1 New
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  CBC - Jan 15
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardActionArea onClick={() => onNavigate("vitals")}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Activity className="card-icon" />
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    Latest Vitals
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  120/80
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Blood Pressure - Normal
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// Appointments Tab - Features #2, #3, #4, #20
export function AppointmentsTab() {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Appointments</h2>
        <div className="tab-actions">
          <button className="primary-btn">
            <Plus /> Schedule New
          </button>
          <button className="secondary-btn">
            <CheckSquare /> Check-In
          </button>
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
        <button className="primary-btn">
          <Plus /> Add Medication
        </button>
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
    <Box sx={{ mt: 1 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          mb: 1,
          fontSize: { xs: "2.2rem", md: "2.4rem" },
        }}
      >
        Lab Results
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3, fontSize: { xs: "1.1rem", md: "1.2rem" } }}
      >
        Review your recent lab results and trends
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={2}
            sx={{
              backgroundColor: "background.paper",
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "1.4rem", md: "1.5rem" } }}
                >
                  Complete Blood Count (CBC)
                </Typography>
                <Chip label="New" color="info" size="small" />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontSize: { xs: "1rem", md: "1.1rem" } }}
              >
                Jan 15, 2024
              </Typography>
              <Typography
                variant="body2"
                color="success.main"
                sx={{ mb: 2, fontSize: { xs: "1rem", md: "1.1rem" } }}
              >
                All values normal
              </Typography>
              <Typography
                variant="button"
                color="primary"
                sx={{ cursor: "pointer" }}
              >
                View Detailed Results
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "1.4rem", md: "1.5rem" } }}
                >
                  Lipid Panel
                </Typography>
                <Chip label="Abnormal" color="warning" size="small" />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontSize: { xs: "1rem", md: "1.1rem" } }}
              >
                Jan 15, 2024
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}
                >
                  Total Cholesterol: 220 mg/dL (High)
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}
                >
                  Recommended: &lt;200 mg/dL
                </Typography>
              </Box>
              <Typography
                variant="button"
                color="primary"
                sx={{ cursor: "pointer" }}
              >
                View Details
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "1.4rem", md: "1.5rem" } }}
                >
                  Hemoglobin A1c
                </Typography>
                <Chip label="Normal" color="success" size="small" />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontSize: { xs: "1rem", md: "1.1rem" } }}
              >
                Jan 10, 2024
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 2, fontSize: { xs: "1rem", md: "1.1rem" } }}
              >
                5.8% (Normal)
              </Typography>
              <Typography
                variant="button"
                color="primary"
                sx={{ cursor: "pointer" }}
              >
                View Trend Chart
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
// Vitals Tab - Feature #8
export function VitalsTab() {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              fontSize: { xs: "2.2rem", md: "2.4rem" },
            }}
          >
            Vitals Tracking
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "1.1rem", md: "1.2rem" } }}
          >
            Monitor your key health measurements over time
          </Typography>
        </Box>
        <Chip
          label="Add Entry"
          color="primary"
          variant="filled"
          icon={<Plus size={16} />}
          sx={{ borderRadius: 999, fontWeight: 500 }}
        />
      </Box>

      {/* Chart placeholder with light background */}
      <Card
        elevation={1}
        sx={{
          mb: 3,
          backgroundColor: "background.paper",
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{ mb: 1, fontSize: { xs: "1.4rem", md: "1.5rem" } }}
          >
            Blood Pressure Trend
          </Typography>
          <Box
            sx={{
              height: 200,
              bgcolor: "background.default",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}
            >
              Line Chart: 120/80, 118/78, 122/82, 119/80 (Last 4 readings)
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{
              backgroundColor: "background.paper",
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Activity size={24} color={theme.palette.success.main} />
                <Typography
                  variant="subtitle2"
                  sx={{ ml: 1, fontSize: { xs: "1.1rem", md: "1.2rem" } }}
                >
                  Blood Pressure
                </Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.6rem", md: "1.7rem" },
                }}
              >
                120/80 mmHg
              </Typography>
              <Chip
                label="Normal"
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: theme.palette.success.light,
                  color: theme.palette.success.dark,
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, fontSize: { xs: "1rem", md: "1.1rem" } }}
              >
                Jan 15, 2024
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{
              backgroundColor: "background.paper",
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Activity size={24} color={theme.palette.info.main} />
                <Typography
                  variant="subtitle2"
                  sx={{ ml: 1, fontSize: { xs: "1.1rem", md: "1.2rem" } }}
                >
                  Heart Rate
                </Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.6rem", md: "1.7rem" },
                }}
              >
                72 bpm
              </Typography>
              <Chip
                label="Normal"
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: theme.palette.info.light,
                  color: theme.palette.info.dark,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Jan 15, 2024
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{
              backgroundColor: "background.paper",
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Activity size={24} color={theme.palette.warning.main} />
                <Typography
                  variant="subtitle2"
                  sx={{ ml: 1, fontSize: { xs: "1.1rem", md: "1.2rem" } }}
                >
                  Blood Sugar
                </Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.6rem", md: "1.7rem" },
                }}
              >
                95 mg/dL
              </Typography>
              <Chip
                label="Slightly elevated"
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: theme.palette.warning.light,
                  color: theme.palette.warning.dark,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Jan 15, 2024
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{
              backgroundColor: "background.paper",
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Activity size={24} color={theme.palette.success.main} />
                <Typography
                  variant="subtitle2"
                  sx={{ ml: 1, fontSize: { xs: "1.1rem", md: "1.2rem" } }}
                >
                  Weight
                </Typography>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.6rem", md: "1.7rem" },
                }}
              >
                180 lbs
              </Typography>
              <Chip
                label="Stable"
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: theme.palette.success.light,
                  color: theme.palette.success.dark,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Jan 15, 2024
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// Immunizations Tab - Feature #9
export function ImmunizationsTab() {
  const theme = useTheme();
  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
        Immunization Record
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Keep track of your vaccination history and upcoming doses
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card elevation={1} sx={{ backgroundColor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Syringe
                  className="immun-icon"
                  color={theme.palette.success.main}
                />
                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                  COVID-19 Vaccine (Pfizer)
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Administered: Dec 15, 2023
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lot: EK9899
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Provider: CVS Pharmacy
              </Typography>
              <Chip
                label="Current"
                size="small"
                color="success"
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={1} sx={{ backgroundColor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Syringe
                  className="immun-icon"
                  color={theme.palette.info.main}
                />
                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                  Influenza Vaccine
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Administered: Oct 1, 2023
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lot: FL7721
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Provider: Main Clinic
              </Typography>
              <Chip
                label="Current"
                size="small"
                color="info"
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={1} sx={{ backgroundColor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Syringe
                  className="immun-icon"
                  color={theme.palette.warning.main}
                />
                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                  Tetanus Booster (Td/Tdap)
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Last: Jan 2018
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Due: Jan 2028
              </Typography>
              <Chip
                label="Upcoming"
                size="small"
                color="warning"
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// Allergies & Conditions Tab - Feature #10
export function AllergiesTab() {
  const theme = useTheme();
  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
            Allergies & Conditions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review your critical allergies and chronic conditions
          </Typography>
        </Box>
        <Chip
          label="Add New"
          color="primary"
          variant="filled"
          icon={<Plus size={16} />}
          sx={{ borderRadius: 999, fontWeight: 500 }}
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ backgroundColor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <AlertCircle color={theme.palette.error.main} />
                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                  Penicillin
                </Typography>
              </Box>
              <Typography variant="body2">Severity: Critical</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Reaction: Anaphylaxis
              </Typography>
              <Chip
                label="Critical Allergy"
                size="small"
                color="error"
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ backgroundColor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <AlertCircle color={theme.palette.warning.main} />
                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                  Pollen (Seasonal)
                </Typography>
              </Box>
              <Typography variant="body2">Severity: Moderate</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Reaction: Rhinitis, congestion
              </Typography>
              <Chip
                label="Moderate Allergy"
                size="small"
                color="warning"
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Chronic Conditions
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ backgroundColor: "background.paper" }}>
            <CardContent>
              <Typography variant="subtitle1">
                Type 2 Diabetes Mellitus
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Onset: 2018
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: Controlled
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={1} sx={{ backgroundColor: "background.paper" }}>
            <CardContent>
              <Typography variant="subtitle1">Hypertension</Typography>
              <Typography variant="body2" color="text.secondary">
                Onset: 2015
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: Controlled with medication
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// Messaging Tab - Feature #11
export function MessagingTab() {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Secure Messages</h2>
        <button className="primary-btn">
          <Plus /> New Message
        </button>
      </div>

      <div className="messages-list">
        <div className="message-card unread">
          <div className="message-header">
            <h3>Dr. Sarah Johnson</h3>
            <span className="message-date">Jan 16, 2024</span>
          </div>
          <p className="message-subject">Re: Lab Results Follow-up</p>
          <p className="message-preview">
            Your recent cholesterol levels are slightly elevated...
          </p>
          <span className="badge unread">Unread</span>
        </div>

        <div className="message-card">
          <div className="message-header">
            <h3>Appointment Reminders</h3>
            <span className="message-date">Jan 15, 2024</span>
          </div>
          <p className="message-subject">Upcoming appointment reminder</p>
          <p className="message-preview">
            This is a reminder for your appointment on Jan 20...
          </p>
        </div>

        <div className="message-card">
          <div className="message-header">
            <h3>Billing Department</h3>
            <span className="message-date">Jan 10, 2024</span>
          </div>
          <p className="message-subject">Invoice #INV-2024-001</p>
          <p className="message-preview">
            Your invoice for the recent visit is now available...
          </p>
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
            <textarea
              readOnly
              value="123 Main St&#10;Anytown, ST 12345"
            />
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
            <p>
              Learn about diet, exercise, and medication management for diabetes
              control.
            </p>
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
            <p>
              What your cholesterol numbers mean and how to maintain healthy
              levels.
            </p>
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
            <p>
              Tips for creating a balanced diet that supports your health goals.
            </p>
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
        <button className="primary-btn">
          <Plus /> Upload Document
        </button>
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
