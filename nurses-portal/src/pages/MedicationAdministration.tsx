import {
  AccessTime,
  CheckCircle,
  Info,
  QrCodeScanner,
  Search,
  Shield,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import Quagga from "quagga";
import { useEffect, useState } from "react";

interface MedicationOrder {
  id: string;
  patientId: string;
  patientName: string;
  patientRoom: string;
  medicationName: string;
  dosage: string;
  route: string;
  frequency: string;
  scheduledTime: Date;
  prescribedBy: string;
  instructions?: string;
  highAlert?: boolean;
  prn?: boolean;
  lastAdministered?: Date;
  status: "pending" | "administered" | "held" | "refused" | "late";
  barcode: string;
}

interface MedicationAdministrationRecord {
  orderId: string;
  administeredAt: Date;
  administeredBy: string;
  verifiedBy?: string;
  notes?: string;
  painScore?: number;
  bloodPressure?: string;
  heartRate?: number;
  reason?: string;
}

export default function MedicationAdministration() {
  const [activeTab, setActiveTab] = useState(0);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<MedicationOrder | null>(null);
  const [administrationDialog, setAdministrationDialog] = useState(false);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "warning" | "info",
  });

  // Mock data
  const [medications] = useState<MedicationOrder[]>([
    {
      id: "1",
      patientId: "P001",
      patientName: "John Smith",
      patientRoom: "204A",
      medicationName: "Metformin",
      dosage: "500mg",
      route: "PO",
      frequency: "BID",
      scheduledTime: new Date("2024-11-21T08:00:00"),
      prescribedBy: "Dr. Johnson",
      instructions: "Take with food",
      status: "pending",
      barcode: "123456789",
    },
    {
      id: "2",
      patientId: "P002",
      patientName: "Mary Johnson",
      patientRoom: "205B",
      medicationName: "Morphine",
      dosage: "2mg",
      route: "IV",
      frequency: "Q4H PRN",
      scheduledTime: new Date("2024-11-21T09:00:00"),
      prescribedBy: "Dr. Williams",
      instructions: "For severe pain only",
      highAlert: true,
      prn: true,
      status: "pending",
      barcode: "987654321",
    },
    {
      id: "3",
      patientId: "P003",
      patientName: "Robert Davis",
      patientRoom: "206C",
      medicationName: "Lisinopril",
      dosage: "10mg",
      route: "PO",
      frequency: "QD",
      scheduledTime: new Date("2024-11-21T08:00:00"),
      prescribedBy: "Dr. Brown",
      status: "late",
      barcode: "456789123",
      lastAdministered: new Date("2024-11-20T08:15:00"),
    },
  ]);

  const [administrationNotes, setAdministrationNotes] = useState("");
  const [painScore, setPainScore] = useState<number | null>(null);
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
  });

  // Initialize barcode scanner
  useEffect(() => {
    if (scannerOpen) {
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            constraints: {
              width: 640,
              height: 480,
              facingMode: "environment",
            },
          },
          locator: {
            patchSize: "medium",
            halfSample: true,
          },
          decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_8_reader"],
          },
        },
        (err) => {
          if (err) {
            console.error("Barcode scanner initialization failed:", err);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected((result) => {
        handleBarcodeDetected(result.codeResult.code);
      });

      return () => {
        Quagga.stop();
      };
    }
  }, [scannerOpen]);

  const handleBarcodeDetected = (barcode: string | undefined) => {
    if (!barcode) return;

    // Find medication by barcode
    const medication = medications.find((m) => m.barcode === barcode);
    if (medication) {
      setSelectedMedication(medication);
      setScannerOpen(false);
      setVerificationDialog(true);
    } else {
      setNotification({
        open: true,
        message: "Medication not found. Please verify the barcode.",
        severity: "error",
      });
    }
  };

  const handleAdminister = () => {
    if (!selectedMedication) return;

    // Simulate administration
    const record: MedicationAdministrationRecord = {
      orderId: selectedMedication.id,
      administeredAt: new Date(),
      administeredBy: "Current Nurse",
      notes: administrationNotes,
      painScore: painScore || undefined,
      bloodPressure: vitalSigns.bloodPressure,
      heartRate: parseInt(vitalSigns.heartRate) || undefined,
    };

    console.log("Medication administered:", record);

    setNotification({
      open: true,
      message: `${selectedMedication.medicationName} administered successfully`,
      severity: "success",
    });

    // Reset states
    setAdministrationDialog(false);
    setSelectedMedication(null);
    setAdministrationNotes("");
    setPainScore(null);
    setVitalSigns({
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      oxygenSaturation: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "administered":
        return "success";
      case "pending":
        return "info";
      case "held":
        return "warning";
      case "refused":
        return "error";
      case "late":
        return "error";
      default:
        return "default";
    }
  };

  const filteredMedications = medications.filter(
    (med) =>
      med.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.patientRoom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.medicationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = medications.filter((m) => m.status === "pending").length;
  const lateCount = medications.filter((m) => m.status === "late").length;

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
          <Typography variant="h4" gutterBottom>
            Medication Administration Record (eMAR)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Barcode-enabled medication administration with real-time
            verification
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Badge badgeContent={lateCount} color="error">
            <Button variant="outlined" color="error" startIcon={<Warning />}>
              Late Medications
            </Button>
          </Badge>
          <Button
            variant="contained"
            startIcon={<QrCodeScanner />}
            onClick={() => setScannerOpen(true)}
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            }}
          >
            Scan Medication
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
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
                  <Typography color="text.secondary" variant="body2">
                    Due Now
                  </Typography>
                  <Typography variant="h3">{pendingCount}</Typography>
                </Box>
                <AccessTime sx={{ fontSize: 40, color: "info.main" }} />
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
                  <Typography color="text.secondary" variant="body2">
                    Late
                  </Typography>
                  <Typography variant="h3" color="error.main">
                    {lateCount}
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: "error.main" }} />
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
                  <Typography color="text.secondary" variant="body2">
                    Administered
                  </Typography>
                  <Typography variant="h3" color="success.main">
                    42
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: "success.main" }} />
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
                  <Typography color="text.secondary" variant="body2">
                    High Alert
                  </Typography>
                  <Typography variant="h3" color="warning.main">
                    3
                  </Typography>
                </Box>
                <Shield sx={{ fontSize: 40, color: "warning.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by patient name, room, or medication..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label="All Medications" />
              <Tab label="Due Now" />
              <Tab label="PRN" />
              <Tab label="High Alert" />
            </Tabs>
          </Grid>
        </Grid>
      </Paper>

      {/* Medication List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Medication</TableCell>
              <TableCell>Dosage/Route</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMedications.map((med) => (
              <TableRow key={med.id}>
                <TableCell>
                  <Typography variant="body2">
                    {format(med.scheduledTime, "HH:mm")}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {med.patientName.charAt(0)}
                    </Avatar>
                    <Typography>{med.patientName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{med.patientRoom}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {med.medicationName}
                    </Typography>
                    {med.highAlert && (
                      <Chip
                        label="High Alert"
                        size="small"
                        color="error"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                    {med.prn && (
                      <Chip
                        label="PRN"
                        size="small"
                        color="info"
                        sx={{ mt: 0.5, ml: 0.5 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {med.dosage} {med.route}
                </TableCell>
                <TableCell>
                  <Chip
                    label={med.status.toUpperCase()}
                    color={getStatusColor(med.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Scan & Administer">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setSelectedMedication(med);
                          setScannerOpen(true);
                        }}
                      >
                        <QrCodeScanner />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton
                        onClick={() => {
                          setSelectedMedication(med);
                          setAdministrationDialog(true);
                        }}
                      >
                        <Info />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Barcode Scanner Dialog */}
      <Dialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Scan Medication Barcode</DialogTitle>
        <DialogContent>
          <Box sx={{ position: "relative", height: 400 }}>
            <div
              id="scanner-container"
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            Position the barcode within the scanner frame. The scanner will
            automatically detect the medication.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScannerOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog
        open={verificationDialog}
        onClose={() => setVerificationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Shield color="warning" />
            Medication Verification
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMedication && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Barcode verified successfully! Please confirm the following
                information:
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Patient Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Name"
                          secondary={selectedMedication.patientName}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Room"
                          secondary={selectedMedication.patientRoom}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Patient ID"
                          secondary={selectedMedication.patientId}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Medication Details
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Medication"
                          secondary={selectedMedication.medicationName}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Dosage"
                          secondary={`${selectedMedication.dosage} ${selectedMedication.route}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Frequency"
                          secondary={selectedMedication.frequency}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>

              {selectedMedication.highAlert && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <strong>HIGH ALERT MEDICATION</strong> - Requires double
                  verification
                </Alert>
              )}

              {selectedMedication.instructions && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>Special Instructions:</strong>{" "}
                  {selectedMedication.instructions}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setVerificationDialog(false);
              setAdministrationDialog(true);
            }}
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            }}
          >
            Proceed to Administration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Administration Dialog */}
      <Dialog
        open={administrationDialog}
        onClose={() => setAdministrationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Document Medication Administration</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {selectedMedication?.prn && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Pain Assessment (PRN Medication)
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <Button
                        key={score}
                        variant={painScore === score ? "contained" : "outlined"}
                        onClick={() => setPainScore(score)}
                        sx={{ minWidth: 40 }}
                      >
                        {score}
                      </Button>
                    ))}
                  </Box>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Blood Pressure"
                placeholder="120/80"
                value={vitalSigns.bloodPressure}
                onChange={(e) =>
                  setVitalSigns({
                    ...vitalSigns,
                    bloodPressure: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Heart Rate"
                placeholder="72"
                value={vitalSigns.heartRate}
                onChange={(e) =>
                  setVitalSigns({ ...vitalSigns, heartRate: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">bpm</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Administration Notes"
                placeholder="Enter any relevant notes..."
                value={administrationNotes}
                onChange={(e) => setAdministrationNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdministrationDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAdminister}
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            }}
          >
            Confirm Administration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
