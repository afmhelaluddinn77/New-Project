import {
  Air,
  Assessment,
  Assignment,
  BloodtypeOutlined,
  CheckCircle,
  Error as ErrorIcon,
  FavoriteOutlined,
  Groups,
  NotificationsActive,
  PhoneInTalk,
  Science,
  Thermostat,
  Timeline,
  Timer,
  TrendingUp,
  Warning,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

// Epic-style Sepsis Detection Algorithm
interface SepsisScore {
  patientId: string;
  patientName: string;
  room: string;
  age: number;

  // SIRS Criteria (Systemic Inflammatory Response Syndrome)
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  wbc: number;
  sirsScore: number;

  // qSOFA Score (Quick Sequential Organ Failure Assessment)
  alteredMentalStatus: boolean;
  systolicBP: number;
  qsofaScore: number;

  // SOFA Score Components
  pao2Fio2Ratio?: number;
  platelets?: number;
  bilirubin?: number;
  mapOrVasopressors?: number;
  glasgowComaScale?: number;
  creatinine?: number;
  urineOutput?: number;
  sofaScore?: number;

  // Additional Risk Factors
  lactate?: number;
  procalcitonin?: number;
  crp?: number;
  bandemia?: boolean;

  // Risk Assessment
  riskLevel: "low" | "moderate" | "high" | "critical";
  probabilityOfSepsis: number;
  timeToAntibiotics?: number;
  lastAssessment: Date;
  trend: "improving" | "stable" | "worsening";
}

interface SepsisAlert {
  id: string;
  patientId: string;
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

export default function SepsisDetection() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState<SepsisScore | null>(
    null
  );
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [protocolDialog, setProtocolDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock real-time sepsis monitoring data
  const [patients] = useState<SepsisScore[]>([
    {
      patientId: "P001",
      patientName: "John Smith",
      room: "204A",
      age: 65,
      temperature: 38.5,
      heartRate: 110,
      respiratoryRate: 24,
      wbc: 14000,
      sirsScore: 3,
      alteredMentalStatus: false,
      systolicBP: 95,
      qsofaScore: 2,
      lactate: 3.2,
      procalcitonin: 2.5,
      crp: 150,
      sofaScore: 8,
      riskLevel: "high",
      probabilityOfSepsis: 78,
      lastAssessment: new Date(),
      trend: "worsening",
      pao2Fio2Ratio: 250,
      platelets: 120000,
      bilirubin: 2.1,
      glasgowComaScale: 13,
      creatinine: 1.8,
    },
    {
      patientId: "P002",
      patientName: "Mary Johnson",
      room: "205B",
      age: 72,
      temperature: 35.8,
      heartRate: 95,
      respiratoryRate: 22,
      wbc: 3500,
      sirsScore: 2,
      alteredMentalStatus: true,
      systolicBP: 88,
      qsofaScore: 3,
      lactate: 4.1,
      procalcitonin: 5.2,
      sofaScore: 11,
      riskLevel: "critical",
      probabilityOfSepsis: 92,
      timeToAntibiotics: 15,
      lastAssessment: new Date(),
      trend: "worsening",
    },
    {
      patientId: "P003",
      patientName: "Robert Davis",
      room: "206C",
      age: 58,
      temperature: 37.8,
      heartRate: 88,
      respiratoryRate: 18,
      wbc: 8500,
      sirsScore: 0,
      alteredMentalStatus: false,
      systolicBP: 118,
      qsofaScore: 0,
      lactate: 1.2,
      riskLevel: "low",
      probabilityOfSepsis: 12,
      lastAssessment: new Date(),
      trend: "stable",
    },
  ]);

  const [alerts] = useState<SepsisAlert[]>([
    {
      id: "1",
      patientId: "P002",
      severity: "critical",
      message: "Critical sepsis alert - qSOFA score 3, lactate 4.1",
      timestamp: new Date(),
      acknowledged: false,
    },
    {
      id: "2",
      patientId: "P001",
      severity: "warning",
      message: "Sepsis warning - SIRS criteria met, lactate elevated",
      timestamp: new Date(Date.now() - 15 * 60000),
      acknowledged: true,
      acknowledgedBy: "Dr. Williams",
    },
  ]);

  // Calculate SIRS score
  const calculateSIRS = (patient: SepsisScore): number => {
    let score = 0;
    if (patient.temperature > 38 || patient.temperature < 36) score++;
    if (patient.heartRate > 90) score++;
    if (patient.respiratoryRate > 20) score++;
    if (patient.wbc > 12000 || patient.wbc < 4000) score++;
    return score;
  };

  // Calculate qSOFA score
  const calculateQSOFA = (patient: SepsisScore): number => {
    let score = 0;
    if (patient.alteredMentalStatus) score++;
    if (patient.systolicBP <= 100) score++;
    if (patient.respiratoryRate >= 22) score++;
    return score;
  };

  // Trend data for selected patient
  const getTrendData = () => {
    if (!selectedPatient) return [];

    return [
      { time: "00:00", lactate: 2.1, heartRate: 92, map: 78 },
      { time: "04:00", lactate: 2.3, heartRate: 95, map: 75 },
      { time: "08:00", lactate: 2.8, heartRate: 102, map: 72 },
      { time: "12:00", lactate: 3.2, heartRate: 108, map: 68 },
      { time: "16:00", lactate: 3.5, heartRate: 110, map: 65 },
      { time: "20:00", lactate: 3.8, heartRate: 115, map: 62 },
    ];
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return theme.palette.error.main;
      case "high":
        return theme.palette.warning.main;
      case "moderate":
        return theme.palette.info.main;
      case "low":
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const criticalCount = patients.filter(
    (p) => p.riskLevel === "critical"
  ).length;
  const highRiskCount = patients.filter((p) => p.riskLevel === "high").length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Sepsis Early Warning System (SEWS)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Epic-style sepsis detection with machine learning prediction
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Badge badgeContent={criticalCount} color="error">
            <Button
              variant="contained"
              color="error"
              startIcon={<NotificationsActive />}
            >
              Critical Alerts
            </Button>
          </Badge>
          <Button
            variant="outlined"
            onClick={() => setProtocolDialog(true)}
            startIcon={<Assignment />}
          >
            Sepsis Bundle
          </Button>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            disabled={refreshing}
            startIcon={
              refreshing ? <CircularProgress size={20} /> : <Timeline />
            }
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Alert Banner */}
      {criticalCount > 0 && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" startIcon={<Groups />}>
              Activate Rapid Response
            </Button>
          }
        >
          <strong>
            {criticalCount} patients with critical sepsis indicators.
          </strong>{" "}
          Immediate intervention required.
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Critical Risk
                  </Typography>
                  <Typography variant="h3">{criticalCount}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Immediate action
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    High Risk
                  </Typography>
                  <Typography variant="h3">{highRiskCount}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Close monitoring
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg Time to Antibiotics
                  </Typography>
                  <Typography variant="h3" color="success.main">
                    28 min
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Goal: &lt;60 min
                  </Typography>
                </Box>
                <Timer sx={{ fontSize: 48, color: "success.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Bundle Compliance
                  </Typography>
                  <Typography variant="h3" color="info.main">
                    94%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    3-hour bundle
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, color: "info.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab
            label="Active Monitoring"
            icon={<Assessment />}
            iconPosition="start"
          />
          <Tab label="Risk Trends" icon={<Timeline />} iconPosition="start" />
          <Tab
            label="Sepsis Protocol"
            icon={<Assignment />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Active Monitoring Tab */}
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>SIRS</TableCell>
                <TableCell>qSOFA</TableCell>
                <TableCell>SOFA</TableCell>
                <TableCell>Lactate</TableCell>
                <TableCell>Risk Score</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow
                  key={patient.patientId}
                  sx={{
                    backgroundColor:
                      patient.riskLevel === "critical"
                        ? "error.light"
                        : patient.riskLevel === "high"
                          ? "warning.light"
                          : "inherit",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: getRiskColor(patient.riskLevel),
                          width: 36,
                          height: 36,
                        }}
                      >
                        {patient.patientName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {patient.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Room {patient.room} | Age {patient.age}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${patient.sirsScore}/4`}
                      color={patient.sirsScore >= 2 ? "warning" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${patient.qsofaScore}/3`}
                      color={patient.qsofaScore >= 2 ? "error" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {patient.sofaScore ? (
                      <Chip
                        label={patient.sofaScore}
                        color={patient.sofaScore >= 6 ? "error" : "warning"}
                        size="small"
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {patient.lactate ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Typography
                          variant="body2"
                          color={patient.lactate > 2 ? "error.main" : "inherit"}
                        >
                          {patient.lactate}
                        </Typography>
                        {patient.lactate > 4 && (
                          <ErrorIcon fontSize="small" color="error" />
                        )}
                      </Box>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <LinearProgress
                        variant="determinate"
                        value={patient.probabilityOfSepsis}
                        color={
                          patient.riskLevel === "critical"
                            ? "error"
                            : patient.riskLevel === "high"
                              ? "warning"
                              : "success"
                        }
                        sx={{ mb: 0.5, height: 8, borderRadius: 1 }}
                      />
                      <Typography variant="caption">
                        {patient.probabilityOfSepsis}% probability
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Chip
                        label={patient.riskLevel.toUpperCase()}
                        color={
                          patient.riskLevel === "critical"
                            ? "error"
                            : patient.riskLevel === "high"
                              ? "warning"
                              : patient.riskLevel === "moderate"
                                ? "info"
                                : "success"
                        }
                        size="small"
                      />
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {patient.trend === "worsening" ? (
                          <TrendingUp fontSize="small" color="error" />
                        ) : patient.trend === "improving" ? (
                          <TrendingUp
                            fontSize="small"
                            color="success"
                            sx={{ transform: "rotate(180deg)" }}
                          />
                        ) : null}
                        <Typography variant="caption" color="text.secondary">
                          {patient.trend}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setDetailsDialog(true);
                          }}
                        >
                          <Assessment />
                        </IconButton>
                      </Tooltip>
                      {patient.riskLevel === "critical" && (
                        <Tooltip title="Call Rapid Response">
                          <IconButton size="small" color="error">
                            <PhoneInTalk />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Patient Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">
              Sepsis Assessment - {selectedPatient?.patientName}
            </Typography>
            <Chip
              label={selectedPatient?.riskLevel.toUpperCase()}
              color={
                selectedPatient?.riskLevel === "critical"
                  ? "error"
                  : selectedPatient?.riskLevel === "high"
                    ? "warning"
                    : "info"
              }
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <Grid container spacing={3}>
              {/* Vital Signs */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                    Vital Signs & Labs
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Thermostat
                          color={
                            selectedPatient.temperature > 38 ||
                            selectedPatient.temperature < 36
                              ? "error"
                              : "inherit"
                          }
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="Temperature"
                        secondary={`${selectedPatient.temperature}°C`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FavoriteOutlined
                          color={
                            selectedPatient.heartRate > 90
                              ? "warning"
                              : "inherit"
                          }
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="Heart Rate"
                        secondary={`${selectedPatient.heartRate} bpm`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Air
                          color={
                            selectedPatient.respiratoryRate > 20
                              ? "warning"
                              : "inherit"
                          }
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="Respiratory Rate"
                        secondary={`${selectedPatient.respiratoryRate} /min`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BloodtypeOutlined
                          color={
                            selectedPatient.systolicBP <= 100
                              ? "error"
                              : "inherit"
                          }
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="Blood Pressure"
                        secondary={`${selectedPatient.systolicBP}/65 mmHg`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Science
                          color={
                            selectedPatient.lactate &&
                            selectedPatient.lactate > 2
                              ? "error"
                              : "inherit"
                          }
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary="Lactate"
                        secondary={`${selectedPatient.lactate || "-"} mmol/L`}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              {/* Trend Chart */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                    24-Hour Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={getTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <RechartsTooltip />
                      <ReferenceLine
                        y={2}
                        stroke="red"
                        strokeDasharray="5 5"
                        label="Lactate threshold"
                      />
                      <Line
                        type="monotone"
                        dataKey="lactate"
                        stroke="#f44336"
                        strokeWidth={2}
                        name="Lactate"
                      />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        stroke="#ff9800"
                        strokeWidth={2}
                        name="Heart Rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Recommended Actions */}
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <strong>Recommended Actions (SEP-1 Bundle):</strong>
                  <List dense>
                    <ListItem>
                      • Obtain blood cultures prior to antibiotics
                    </ListItem>
                    <ListItem>
                      • Administer broad-spectrum antibiotics within 1 hour
                    </ListItem>
                    <ListItem>
                      • Measure lactate level (repeat if &gt;2 mmol/L)
                    </ListItem>
                    <ListItem>
                      • Administer 30 mL/kg crystalloid for hypotension or
                      lactate ≥4
                    </ListItem>
                    <ListItem>
                      • Apply vasopressors if hypotensive during/after fluid
                      resuscitation
                    </ListItem>
                  </List>
                </Alert>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          <Button variant="contained" color="error" startIcon={<PhoneInTalk />}>
            Activate Rapid Response
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sepsis Protocol Dialog */}
      <Dialog
        open={protocolDialog}
        onClose={() => setProtocolDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>SEP-1 Sepsis Bundle Protocol</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            3-Hour Bundle (Time Zero = Recognition)
          </Typography>
          <List>
            <ListItem>
              <Chip label="1" color="primary" sx={{ mr: 2 }} />
              <ListItemText
                primary="Measure lactate level"
                secondary="Repeat if initial lactate > 2 mmol/L"
              />
            </ListItem>
            <ListItem>
              <Chip label="2" color="primary" sx={{ mr: 2 }} />
              <ListItemText
                primary="Obtain blood cultures"
                secondary="Before administering antibiotics"
              />
            </ListItem>
            <ListItem>
              <Chip label="3" color="primary" sx={{ mr: 2 }} />
              <ListItemText
                primary="Administer broad-spectrum antibiotics"
                secondary="Within 1 hour of recognition"
              />
            </ListItem>
            <ListItem>
              <Chip label="4" color="primary" sx={{ mr: 2 }} />
              <ListItemText
                primary="Rapid IV fluid resuscitation"
                secondary="30 mL/kg crystalloid for hypotension or lactate ≥4 mmol/L"
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            6-Hour Bundle
          </Typography>
          <List>
            <ListItem>
              <Chip label="5" color="secondary" sx={{ mr: 2 }} />
              <ListItemText
                primary="Apply vasopressors"
                secondary="For hypotension not responding to fluid resuscitation (MAP ≥65 mmHg)"
              />
            </ListItem>
            <ListItem>
              <Chip label="6" color="secondary" sx={{ mr: 2 }} />
              <ListItemText
                primary="Reassess volume status"
                secondary="If hypotensive after fluid resuscitation or lactate ≥4 mmol/L"
              />
            </ListItem>
            <ListItem>
              <Chip label="7" color="secondary" sx={{ mr: 2 }} />
              <ListItemText
                primary="Re-measure lactate"
                secondary="If initial lactate was elevated"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProtocolDialog(false)}>Close</Button>
          <Button variant="contained" startIcon={<Assignment />}>
            Print Protocol
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
