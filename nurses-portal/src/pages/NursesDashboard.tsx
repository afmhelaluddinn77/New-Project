import {
  AccessTime,
  Assignment,
  LocalHospital,
  Medication,
  MonitorHeart,
  Notifications,
  TrendingUp,
  Warning,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function NursesDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const dashboardCards = [
    {
      title: "Medication Administration",
      icon: <Medication sx={{ fontSize: 48 }} />,
      path: "/medication-administration",
      color: "#10b981",
      stats: { pending: 12, overdue: 3 },
      priority: "high",
    },
    {
      title: "Patient Assignment",
      icon: <Assignment sx={{ fontSize: 48 }} />,
      path: "/patient-assignment",
      color: "#8b5cf6",
      stats: { assigned: 8, acuity: "High" },
    },
    {
      title: "Vitals Documentation",
      icon: <MonitorHeart sx={{ fontSize: 48 }} />,
      path: "/vitals",
      color: "#3b82f6",
      stats: { due: 5, completed: 15 },
    },
    {
      title: "Sepsis Alerts",
      icon: <Warning sx={{ fontSize: 48 }} />,
      path: "/sepsis",
      color: "#ef4444",
      stats: { alerts: 2, critical: 1 },
      priority: "critical",
    },
  ];

  // Mock patient data for demonstration
  const criticalPatients = [
    {
      id: "P001",
      name: "John Smith",
      room: "301A",
      alert: "Sepsis Risk - SIRS Criteria Met",
      severity: "critical",
      time: "5 min ago",
    },
    {
      id: "P002",
      name: "Mary Johnson",
      room: "305B",
      alert: "Medication Overdue - Insulin",
      severity: "high",
      time: "10 min ago",
    },
    {
      id: "P003",
      name: "Robert Davis",
      room: "302C",
      alert: "Abnormal Vitals - BP 180/110",
      severity: "high",
      time: "15 min ago",
    },
  ];

  const upcomingTasks = [
    { time: "08:00", task: "Medication Round", patients: 8 },
    { time: "09:00", task: "Wound Dressing - Room 301A", patients: 1 },
    { time: "10:00", task: "Vitals Check", patients: 8 },
    { time: "11:00", task: "IV Replacement - Room 305B", patients: 1 },
    { time: "12:00", task: "Medication Round", patients: 8 },
  ];

  const shiftMetrics = [
    { label: "Patients Assigned", value: 8, total: 8, color: "primary" },
    { label: "Medications Given", value: 24, total: 36, color: "success" },
    { label: "Assessments Done", value: 6, total: 8, color: "info" },
    { label: "Documentation", value: 18, total: 24, color: "warning" },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Welcome back, {user?.firstName || "Nurse"}!
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={<AccessTime />}
            label="Day Shift: 7:00 AM - 7:00 PM"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<LocalHospital />}
            label="Unit 3B - Medical/Surgical"
            variant="outlined"
          />
          <Chip
            icon={<Notifications />}
            label="5 New Alerts"
            color="error"
            onClick={() => {}}
          />
        </Stack>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {dashboardCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
                <Typography variant="h6" gutterBottom>
                  {card.title}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  {Object.entries(card.stats).map(([key, value]) => (
                    <Typography
                      key={key}
                      variant="caption"
                      color="text.secondary"
                    >
                      {key}: <strong>{value}</strong>
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Critical Alerts Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Warning color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Critical Alerts
              </Typography>
            </Box>
            <List>
              {criticalPatients.map((patient) => (
                <ListItem
                  key={patient.id}
                  sx={{
                    bgcolor:
                      patient.severity === "critical"
                        ? "error.50"
                        : "warning.50",
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor:
                          patient.severity === "critical"
                            ? "error.main"
                            : "warning.main",
                      }}
                    >
                      {patient.room}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={patient.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {patient.alert}
                        </Typography>
                        <br />
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {patient.time}
                        </Typography>
                      </>
                    }
                  />
                  <Chip
                    label={patient.severity.toUpperCase()}
                    size="small"
                    color={
                      patient.severity === "critical" ? "error" : "warning"
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Shift Metrics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TrendingUp color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Shift Progress
              </Typography>
            </Box>
            <Stack spacing={2}>
              {shiftMetrics.map((metric) => (
                <Box key={metric.label}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">{metric.label}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {metric.value}/{metric.total}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(metric.value / metric.total) * 100}
                    color={metric.color as any}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Upcoming Tasks */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <AccessTime color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Upcoming Tasks
              </Typography>
            </Box>
            <List dense>
              {upcomingTasks.map((task, index) => (
                <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {task.time}
                        </Typography>
                        <Chip
                          label={`${task.patients} patient${task.patients > 1 ? "s" : ""}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={task.task}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
