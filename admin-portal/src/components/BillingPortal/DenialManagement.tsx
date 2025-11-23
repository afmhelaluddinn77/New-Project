import {
  Analytics,
  AssignmentInd,
  Category,
  ExpandMore,
  Gavel,
  TrendingUp,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

export type DenialCategory =
  | "ADMINISTRATIVE"
  | "CLINICAL"
  | "ELIGIBILITY"
  | "AUTHORIZATION"
  | "TECHNICAL"
  | "OTHER";

export type AppealStatus =
  | "NOT_APPEALED"
  | "PREPARING"
  | "SUBMITTED"
  | "PENDING_RESPONSE"
  | "APPROVED"
  | "DENIED"
  | "WITHDRAWN";

export interface Denial {
  id: string;
  claimId: string;
  claimNumber: string;
  patientName: string;
  payerName: string;
  denialDate: string;
  denialCode: string;
  denialReason: string;
  category: DenialCategory;
  rootCause?: string;
  responsibility: "PROVIDER" | "PAYER" | "PATIENT" | "CLEARINGHOUSE";
  deniedAmount: number;
  appealStatus?: AppealStatus;
  appealDeadline?: string;
  assignedTo?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  resolvedAt?: string;
  recoveredAmount?: number;
}

interface DenialManagementProps {
  denials: Denial[];
  onAssignDenial: (
    denialId: string,
    assignedTo: string,
    priority: string
  ) => void;
  onCategorizeDenial: (
    denialId: string,
    category: DenialCategory,
    rootCause: string
  ) => void;
  onInitiateAppeal: (denialId: string, notes: string) => void;
  onUpdateAppealStatus: (denialId: string, status: AppealStatus) => void;
  onShowNotification: (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => void;
}

export default function DenialManagement({
  denials,
  onAssignDenial,
  onCategorizeDenial,
  onInitiateAppeal,
  onUpdateAppealStatus,
  onShowNotification,
}: DenialManagementProps) {
  const [categoryFilter, setCategoryFilter] = useState<DenialCategory | "ALL">(
    "ALL"
  );
  const [expandedDenial, setExpandedDenial] = useState<string | null>(null);
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    denialId?: string;
  }>({ open: false });
  const [appealDialog, setAppealDialog] = useState<{
    open: boolean;
    denialId?: string;
  }>({ open: false });
  const [categorizeDialog, setCategorizeDialog] = useState<{
    open: boolean;
    denialId?: string;
  }>({ open: false });

  const [assignFormData, setAssignFormData] = useState({
    assignedTo: "",
    priority: "MEDIUM",
  });
  const [appealFormData, setAppealFormData] = useState({ notes: "" });
  const [categorizeFormData, setCategorizeFormData] = useState({
    category: "ADMINISTRATIVE" as DenialCategory,
    rootCause: "",
  });

  const getDenialCategoryColor = (category: DenialCategory): string => {
    const colorMap = {
      ADMINISTRATIVE: "#ff9800",
      CLINICAL: "#f44336",
      ELIGIBILITY: "#9c27b0",
      AUTHORIZATION: "#3f51b5",
      TECHNICAL: "#795548",
      OTHER: "#607d8b",
    };
    return colorMap[category] || "#757575";
  };

  const getAppealStatusColor = (status: AppealStatus): string => {
    const colorMap = {
      NOT_APPEALED: "#9e9e9e",
      PREPARING: "#ff9800",
      SUBMITTED: "#2196f3",
      PENDING_RESPONSE: "#673ab7",
      APPROVED: "#4caf50",
      DENIED: "#f44336",
      WITHDRAWN: "#795548",
    };
    return colorMap[status] || "#757575";
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleAssign = () => {
    if (assignDialog.denialId && assignFormData.assignedTo) {
      onAssignDenial(
        assignDialog.denialId,
        assignFormData.assignedTo,
        assignFormData.priority
      );
      setAssignDialog({ open: false });
      onShowNotification("Denial assigned successfully", "success");
    }
  };

  const handleAppeal = () => {
    if (appealDialog.denialId && appealFormData.notes) {
      onInitiateAppeal(appealDialog.denialId, appealFormData.notes);
      setAppealDialog({ open: false });
      onShowNotification("Appeal initiated successfully", "success");
    }
  };

  const handleCategorize = () => {
    if (categorizeDialog.denialId && categorizeFormData.rootCause) {
      onCategorizeDenial(
        categorizeDialog.denialId,
        categorizeFormData.category,
        categorizeFormData.rootCause
      );
      setCategorizeDialog({ open: false });
      onShowNotification("Denial categorized successfully", "success");
    }
  };

  const calculateDenialStatistics = () => {
    const totalDenials = denials.length;
    const totalDeniedAmount = denials.reduce(
      (sum, d) => sum + d.deniedAmount,
      0
    );
    const totalRecoveredAmount = denials.reduce(
      (sum, d) => sum + (d.recoveredAmount || 0),
      0
    );
    const categoryCounts = denials.reduce(
      (acc, d) => {
        acc[d.category] = (acc[d.category] || 0) + 1;
        return acc;
      },
      {} as Record<DenialCategory, number>
    );

    return {
      totalDenials,
      totalDeniedAmount,
      totalRecoveredAmount,
      categoryCounts,
    };
  };

  const stats = calculateDenialStatistics();
  const filteredDenials =
    categoryFilter === "ALL"
      ? denials
      : denials.filter((d) => d.category === categoryFilter);

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Denial Management</Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category Filter</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as DenialCategory | "ALL")
              }
              label="Category Filter"
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              <MenuItem value="ADMINISTRATIVE">Administrative</MenuItem>
              <MenuItem value="CLINICAL">Clinical</MenuItem>
              <MenuItem value="ELIGIBILITY">Eligibility</MenuItem>
              <MenuItem value="AUTHORIZATION">Authorization</MenuItem>
              <MenuItem value="TECHNICAL">Technical</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Analytics />}
            onClick={() =>
              onShowNotification("Root cause analysis opened", "info")
            }
          >
            Root Cause Analysis
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Denials
              </Typography>
              <Typography variant="h4">{stats.totalDenials}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Denied Amount
              </Typography>
              <Typography variant="h4" color="error">
                {formatCurrency(stats.totalDeniedAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Recovered Amount
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(stats.totalRecoveredAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Recovery Rate
              </Typography>
              <Typography variant="h4">
                {stats.totalDeniedAmount > 0
                  ? `${((stats.totalRecoveredAmount / stats.totalDeniedAmount) * 100).toFixed(1)}%`
                  : "0%"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Distribution */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Denials by Category
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            {Object.entries(stats.categoryCounts).map(([category, count]) => (
              <Chip
                key={category}
                label={`${category}: ${count}`}
                sx={{
                  backgroundColor: getDenialCategoryColor(
                    category as DenialCategory
                  ),
                  color: "white",
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Denials List */}
      {filteredDenials.map((denial) => (
        <Accordion
          key={denial.id}
          expanded={expandedDenial === denial.id}
          onChange={() =>
            setExpandedDenial(expandedDenial === denial.id ? null : denial.id)
          }
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Grid container alignItems="center">
              <Grid item xs={2}>
                <Chip
                  label={denial.category}
                  size="small"
                  sx={{
                    backgroundColor: getDenialCategoryColor(denial.category),
                    color: "white",
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <Typography>{denial.claimNumber}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>{denial.patientName}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography color="error">
                  {formatCurrency(denial.deniedAmount)}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                {denial.appealStatus && (
                  <Chip
                    label={denial.appealStatus.replace("_", " ")}
                    size="small"
                    sx={{
                      backgroundColor: getAppealStatusColor(
                        denial.appealStatus
                      ),
                      color: "white",
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={2}>
                {denial.assignedTo ? (
                  <Box display="flex" alignItems="center">
                    <AssignmentInd sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body2">{denial.assignedTo}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Unassigned
                  </Typography>
                )}
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Denial Information
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Denial Date</TableCell>
                        <TableCell>{denial.denialDate}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Denial Code</TableCell>
                        <TableCell>{denial.denialCode}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Denial Reason</TableCell>
                        <TableCell>{denial.denialReason}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Responsibility</TableCell>
                        <TableCell>{denial.responsibility}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Root Cause</TableCell>
                        <TableCell>
                          {denial.rootCause || "Not analyzed"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Priority</TableCell>
                        <TableCell>
                          <Chip
                            label={denial.priority || "Not set"}
                            size="small"
                            color={
                              denial.priority === "HIGH" ? "error" : "default"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {denial.appealDeadline && !denial.resolvedAt && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <strong>Appeal Deadline:</strong> {denial.appealDeadline}
                  </Alert>
                )}

                {denial.resolvedAt && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <strong>Resolved:</strong> {denial.resolvedAt}
                    {denial.recoveredAmount && (
                      <>
                        {" "}
                        - Recovered: {formatCurrency(denial.recoveredAmount)}
                      </>
                    )}
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Actions
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Category />}
                    onClick={() => {
                      setCategorizeDialog({ open: true, denialId: denial.id });
                      setCategorizeFormData({
                        category: denial.category,
                        rootCause: denial.rootCause || "",
                      });
                    }}
                  >
                    Categorize & Analyze
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<AssignmentInd />}
                    onClick={() => {
                      setAssignDialog({ open: true, denialId: denial.id });
                      setAssignFormData({
                        assignedTo: denial.assignedTo || "",
                        priority: denial.priority || "MEDIUM",
                      });
                    }}
                  >
                    {denial.assignedTo ? "Reassign" : "Assign"} Staff
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Gavel />}
                    disabled={
                      denial.appealStatus !== "NOT_APPEALED" &&
                      denial.appealStatus !== undefined
                    }
                    onClick={() => {
                      setAppealDialog({ open: true, denialId: denial.id });
                      setAppealFormData({ notes: "" });
                    }}
                  >
                    Initiate Appeal
                  </Button>

                  {denial.appealStatus &&
                    denial.appealStatus !== "NOT_APPEALED" && (
                      <Button
                        variant="outlined"
                        startIcon={<TrendingUp />}
                        onClick={() => {
                          const nextStatus =
                            denial.appealStatus === "PREPARING"
                              ? "SUBMITTED"
                              : denial.appealStatus === "SUBMITTED"
                                ? "PENDING_RESPONSE"
                                : "APPROVED";
                          onUpdateAppealStatus(
                            denial.id,
                            nextStatus as AppealStatus
                          );
                          onShowNotification(
                            "Appeal status updated",
                            "success"
                          );
                        }}
                      >
                        Update Appeal Status
                      </Button>
                    )}
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Assign Dialog */}
      <Dialog
        open={assignDialog.open}
        onClose={() => setAssignDialog({ open: false })}
      >
        <DialogTitle>Assign Denial to Staff</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Assigned To"
              value={assignFormData.assignedTo}
              onChange={(e) =>
                setAssignFormData({
                  ...assignFormData,
                  assignedTo: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={assignFormData.priority}
                onChange={(e) =>
                  setAssignFormData({
                    ...assignFormData,
                    priority: e.target.value,
                  })
                }
                label="Priority"
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog({ open: false })}>
            Cancel
          </Button>
          <Button onClick={handleAssign} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Appeal Dialog */}
      <Dialog
        open={appealDialog.open}
        onClose={() => setAppealDialog({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Initiate Appeal</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Appeal Notes"
            value={appealFormData.notes}
            onChange={(e) => setAppealFormData({ notes: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAppealDialog({ open: false })}>
            Cancel
          </Button>
          <Button onClick={handleAppeal} variant="contained">
            Initiate Appeal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Categorize Dialog */}
      <Dialog
        open={categorizeDialog.open}
        onClose={() => setCategorizeDialog({ open: false })}
      >
        <DialogTitle>Categorize Denial</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categorizeFormData.category}
                onChange={(e) =>
                  setCategorizeFormData({
                    ...categorizeFormData,
                    category: e.target.value as DenialCategory,
                  })
                }
                label="Category"
              >
                <MenuItem value="ADMINISTRATIVE">Administrative</MenuItem>
                <MenuItem value="CLINICAL">Clinical</MenuItem>
                <MenuItem value="ELIGIBILITY">Eligibility</MenuItem>
                <MenuItem value="AUTHORIZATION">Authorization</MenuItem>
                <MenuItem value="TECHNICAL">Technical</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Root Cause Analysis"
              value={categorizeFormData.rootCause}
              onChange={(e) =>
                setCategorizeFormData({
                  ...categorizeFormData,
                  rootCause: e.target.value,
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategorizeDialog({ open: false })}>
            Cancel
          </Button>
          <Button onClick={handleCategorize} variant="contained">
            Save Analysis
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
