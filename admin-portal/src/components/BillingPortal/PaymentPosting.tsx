import {
  AccountBalance,
  Add,
  AttachMoney,
  AutoAwesome,
  CreditCard,
  Receipt,
  Remove,
} from "@mui/icons-material";
import {
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
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

export type PaymentMethod =
  | "CHECK"
  | "EFT"
  | "CREDIT_CARD"
  | "CASH"
  | "INSURANCE"
  | "PATIENT_PAYMENT"
  | "OTHER";

export type PostingStatus =
  | "PENDING"
  | "PARTIALLY_POSTED"
  | "POSTED"
  | "VOID"
  | "REVERSED";

export interface Payment {
  id: string;
  paymentNumber: string;
  payerName?: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  totalAmount: number;
  appliedAmount: number;
  unappliedAmount: number;
  postingStatus: PostingStatus;
  aiMatchScore?: number;
  suggestedClaims?: Array<{
    claimId: string;
    claimNumber: string;
    patientName: string;
    totalCharges: number;
    matchConfidence: number;
  }>;
}

export interface PaymentAllocation {
  claimId: string;
  claimNumber: string;
  amount: number;
  notes?: string;
}

interface PaymentPostingProps {
  payments: Payment[];
  onCreatePayment: (payment: Partial<Payment>) => void;
  onPostPayment: (paymentId: string, allocations: PaymentAllocation[]) => void;
  onReversePayment: (paymentId: string, reason: string) => void;
  onShowNotification: (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => void;
}

export default function PaymentPosting({
  payments,
  onCreatePayment,
  onPostPayment,
  onReversePayment,
  onShowNotification,
}: PaymentPostingProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [postingDialogOpen, setPostingDialogOpen] = useState(false);
  const [reverseDialogOpen, setReverseDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    paymentMethod: "CHECK",
    totalAmount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
  });

  const [allocations, setAllocations] = useState<PaymentAllocation[]>([]);
  const [reverseReason, setReverseReason] = useState("");

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: PostingStatus): string => {
    const colorMap = {
      PENDING: "#ff9800",
      PARTIALLY_POSTED: "#2196f3",
      POSTED: "#4caf50",
      VOID: "#f44336",
      REVERSED: "#795548",
    };
    return colorMap[status] || "#757575";
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "CREDIT_CARD":
        return <CreditCard />;
      case "CHECK":
        return <Receipt />;
      case "EFT":
        return <AccountBalance />;
      case "CASH":
        return <AttachMoney />;
      default:
        return <Receipt />;
    }
  };

  const handleCreatePayment = () => {
    if (newPayment.totalAmount && newPayment.totalAmount > 0) {
      onCreatePayment(newPayment);
      setCreateDialogOpen(false);
      setNewPayment({
        paymentMethod: "CHECK",
        totalAmount: 0,
        paymentDate: new Date().toISOString().split("T")[0],
      });
      onShowNotification("Payment created successfully", "success");
    }
  };

  const handlePostPayment = () => {
    if (selectedPayment && allocations.length > 0) {
      const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
      if (totalAllocated > selectedPayment.totalAmount) {
        onShowNotification("Total allocation exceeds payment amount", "error");
        return;
      }
      onPostPayment(selectedPayment.id, allocations);
      setPostingDialogOpen(false);
      setAllocations([]);
      onShowNotification("Payment posted successfully", "success");
    }
  };

  const handleAddAllocation = () => {
    setAllocations([
      ...allocations,
      {
        claimId: "",
        claimNumber: "",
        amount: 0,
      },
    ]);
  };

  const handleRemoveAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const handleAllocationChange = (
    index: number,
    field: keyof PaymentAllocation,
    value: any
  ) => {
    const updated = [...allocations];
    updated[index] = { ...updated[index], [field]: value };
    setAllocations(updated);
  };

  const handleAIMatch = (payment: Payment) => {
    if (payment.suggestedClaims && payment.suggestedClaims.length > 0) {
      const autoAllocations = payment.suggestedClaims
        .filter((claim) => claim.matchConfidence > 0.7)
        .map((claim) => ({
          claimId: claim.claimId,
          claimNumber: claim.claimNumber,
          amount: Math.min(claim.totalCharges, payment.unappliedAmount),
          notes: `AI matched with ${(claim.matchConfidence * 100).toFixed(0)}% confidence`,
        }));
      setAllocations(autoAllocations);
      onShowNotification(`AI matched ${autoAllocations.length} claims`, "info");
    }
  };

  const unpostedPayments = payments.filter(
    (p) =>
      p.postingStatus === "PENDING" || p.postingStatus === "PARTIALLY_POSTED"
  );

  const postedPayments = payments.filter(
    (p) =>
      p.postingStatus === "POSTED" ||
      p.postingStatus === "VOID" ||
      p.postingStatus === "REVERSED"
  );

  const totalUnapplied = unpostedPayments.reduce(
    (sum, p) => sum + p.unappliedAmount,
    0
  );

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Payment Posting</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Payment
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unposted Payments
              </Typography>
              <Typography variant="h4">{unpostedPayments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Unapplied
              </Typography>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(totalUnapplied)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Posted Today
              </Typography>
              <Typography variant="h4" color="success.main">
                {
                  postedPayments.filter(
                    (p) =>
                      p.paymentDate === new Date().toISOString().split("T")[0]
                  ).length
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                AI Match Rate
              </Typography>
              <Typography variant="h4">
                {
                  unpostedPayments.filter(
                    (p) => p.aiMatchScore && p.aiMatchScore > 0.7
                  ).length
                }
                /{unpostedPayments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Unposted Payments */}
      <Typography variant="h6" gutterBottom>
        Unposted Payments
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Payment #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Payer</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Applied</TableCell>
              <TableCell align="right">Unapplied</TableCell>
              <TableCell>AI Match</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {unpostedPayments.map((payment) => (
              <TableRow key={payment.id} hover>
                <TableCell>{payment.paymentNumber}</TableCell>
                <TableCell>{payment.paymentDate}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {getMethodIcon(payment.paymentMethod)}
                    <Typography sx={{ ml: 1 }}>
                      {payment.paymentMethod}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{payment.payerName || "Patient"}</TableCell>
                <TableCell>{payment.referenceNumber || "-"}</TableCell>
                <TableCell align="right">
                  {formatCurrency(payment.totalAmount)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(payment.appliedAmount)}
                </TableCell>
                <TableCell align="right">
                  <Typography color="warning.main">
                    {formatCurrency(payment.unappliedAmount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {payment.aiMatchScore ? (
                    <Box display="flex" alignItems="center">
                      <AutoAwesome sx={{ mr: 1, color: "primary.main" }} />
                      <Typography>
                        {(payment.aiMatchScore * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setPostingDialogOpen(true);
                      if (payment.aiMatchScore && payment.aiMatchScore > 0.7) {
                        handleAIMatch(payment);
                      }
                    }}
                  >
                    Post
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Posted Payments History */}
      <Typography variant="h6" gutterBottom>
        Posted Payments
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Payment #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Payer</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {postedPayments.slice(0, 5).map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.paymentNumber}</TableCell>
                <TableCell>{payment.paymentDate}</TableCell>
                <TableCell>{payment.payerName || "Patient"}</TableCell>
                <TableCell align="right">
                  {formatCurrency(payment.totalAmount)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={payment.postingStatus}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(payment.postingStatus),
                      color: "white",
                    }}
                  />
                </TableCell>
                <TableCell>
                  {payment.postingStatus === "POSTED" && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setReverseDialogOpen(true);
                      }}
                    >
                      Reverse
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Payment Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={newPayment.paymentMethod}
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      paymentMethod: e.target.value as PaymentMethod,
                    })
                  }
                  label="Payment Method"
                >
                  <MenuItem value="CHECK">Check</MenuItem>
                  <MenuItem value="EFT">EFT</MenuItem>
                  <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="INSURANCE">Insurance</MenuItem>
                  <MenuItem value="PATIENT_PAYMENT">Patient Payment</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={newPayment.paymentDate}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, paymentDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payer Name"
                value={newPayment.payerName}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, payerName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reference Number"
                value={newPayment.referenceNumber}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    referenceNumber: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Amount"
                type="number"
                value={newPayment.totalAmount}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    totalAmount: parseFloat(e.target.value),
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreatePayment} variant="contained">
            Create Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Posting Dialog */}
      <Dialog
        open={postingDialogOpen}
        onClose={() => setPostingDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Post Payment - {selectedPayment?.paymentNumber}
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Total Amount: {formatCurrency(selectedPayment.totalAmount)} |
                Unapplied: {formatCurrency(selectedPayment.unappliedAmount)}
              </Alert>

              {selectedPayment.suggestedClaims &&
                selectedPayment.suggestedClaims.length > 0 && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <AutoAwesome sx={{ verticalAlign: "middle", mr: 1 }} />
                      AI Suggested Matches:
                    </Typography>
                    <List dense>
                      {selectedPayment.suggestedClaims.map((claim, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`${claim.claimNumber} - ${claim.patientName}`}
                            secondary={`Amount: ${formatCurrency(claim.totalCharges)} | Confidence: ${(claim.matchConfidence * 100).toFixed(0)}%`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                )}

              <Typography variant="subtitle2" gutterBottom>
                Payment Allocations
              </Typography>

              {allocations.map((allocation, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Claim Number"
                        value={allocation.claimNumber}
                        onChange={(e) =>
                          handleAllocationChange(
                            index,
                            "claimNumber",
                            e.target.value
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={allocation.amount}
                        onChange={(e) =>
                          handleAllocationChange(
                            index,
                            "amount",
                            parseFloat(e.target.value)
                          )
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Notes"
                        value={allocation.notes}
                        onChange={(e) =>
                          handleAllocationChange(index, "notes", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveAllocation(index)}
                      >
                        <Remove />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddAllocation}
                fullWidth
              >
                Add Allocation
              </Button>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Summary</Typography>
                <Typography>
                  Total Allocated:{" "}
                  {formatCurrency(
                    allocations.reduce((sum, a) => sum + (a.amount || 0), 0)
                  )}
                </Typography>
                <Typography>
                  Remaining:{" "}
                  {formatCurrency(
                    selectedPayment.unappliedAmount -
                      allocations.reduce((sum, a) => sum + (a.amount || 0), 0)
                  )}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPostingDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePostPayment}
            variant="contained"
            disabled={allocations.length === 0}
          >
            Post Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reverse Payment Dialog */}
      <Dialog
        open={reverseDialogOpen}
        onClose={() => setReverseDialogOpen(false)}
      >
        <DialogTitle>Reverse Payment</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will reverse all allocations for this payment.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for Reversal"
            value={reverseReason}
            onChange={(e) => setReverseReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReverseDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (selectedPayment && reverseReason) {
                onReversePayment(selectedPayment.id, reverseReason);
                setReverseDialogOpen(false);
                setReverseReason("");
                onShowNotification("Payment reversed successfully", "success");
              }
            }}
            variant="contained"
            color="error"
          >
            Reverse Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
