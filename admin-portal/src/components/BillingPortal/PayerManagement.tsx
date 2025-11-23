import {
  Analytics,
  Business,
  Edit,
  Email,
  PersonAdd,
  Phone,
  Receipt,
  Send,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

export interface Payer {
  id: string;
  name: string;
  payerId: string;
  contactPerson?: string;
  contactTitle?: string;
  phone: string;
  email?: string;
  address1: string;
  city: string;
  state: string;
  zipCode: string;
  claimSubmissionMethod: string;
  remittanceMethod: string;
  requiresAuth: boolean;
  requiresReferral: boolean;
  acceptsSecondary: boolean;
  eftEnrolled: boolean;
  isActive: boolean;
  contractStartDate?: string;
  contractEndDate?: string;
  timeLimitDays: number;
}

interface PayerManagementProps {
  payers: Payer[];
  onAddPayer: (payer: Partial<Payer>) => void;
  onUpdatePayer: (id: string, payer: Partial<Payer>) => void;
  onShowNotification: (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => void;
}

export default function PayerManagement({
  payers,
  onAddPayer,
  onUpdatePayer,
  onShowNotification,
}: PayerManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState<Payer | null>(null);
  const [formData, setFormData] = useState<Partial<Payer>>({
    name: "",
    payerId: "",
    contactPerson: "",
    contactTitle: "",
    phone: "",
    email: "",
    address1: "",
    city: "",
    state: "",
    zipCode: "",
    claimSubmissionMethod: "electronic",
    remittanceMethod: "electronic",
    requiresAuth: false,
    requiresReferral: false,
    acceptsSecondary: true,
    eftEnrolled: false,
    isActive: true,
    timeLimitDays: 90,
  });

  const handleOpen = (payer?: Payer) => {
    if (payer) {
      setEditMode(true);
      setSelectedPayer(payer);
      setFormData(payer);
    } else {
      setEditMode(false);
      setSelectedPayer(null);
      setFormData({
        name: "",
        payerId: "",
        contactPerson: "",
        contactTitle: "",
        phone: "",
        email: "",
        address1: "",
        city: "",
        state: "",
        zipCode: "",
        claimSubmissionMethod: "electronic",
        remittanceMethod: "electronic",
        requiresAuth: false,
        requiresReferral: false,
        acceptsSecondary: true,
        eftEnrolled: false,
        isActive: true,
        timeLimitDays: 90,
      });
    }
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedPayer(null);
  };

  const handleSubmit = () => {
    if (editMode && selectedPayer) {
      onUpdatePayer(selectedPayer.id, formData);
      onShowNotification("Payer updated successfully", "success");
    } else {
      onAddPayer(formData);
      onShowNotification("Payer added successfully", "success");
    }
    handleClose();
  };

  const handleChange =
    (field: keyof Payer) =>
    (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
    };

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Payer Management</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => handleOpen()}
        >
          Add New Payer
        </Button>
      </Box>

      <Grid container spacing={3}>
        {payers.map((payer) => (
          <Grid item xs={12} md={6} key={payer.id}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="start"
                >
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {payer.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Payer ID: {payer.payerId}
                    </Typography>
                  </Box>
                  <Chip
                    label={payer.isActive ? "Active" : "Inactive"}
                    color={payer.isActive ? "success" : "default"}
                    size="small"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <PersonAdd
                        sx={{ mr: 1, fontSize: 18, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        {payer.contactPerson}
                        {payer.contactTitle && ` (${payer.contactTitle})`}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Phone
                        sx={{ mr: 1, fontSize: 18, color: "text.secondary" }}
                      />
                      <Typography variant="body2">{payer.phone}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Email
                        sx={{ mr: 1, fontSize: 18, color: "text.secondary" }}
                      />
                      <Typography variant="body2">{payer.email}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Business
                        sx={{ mr: 1, fontSize: 18, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        {payer.address1}, {payer.city}, {payer.state}{" "}
                        {payer.zipCode}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Send
                        sx={{ mr: 1, fontSize: 18, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        Claims: {payer.claimSubmissionMethod}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Receipt
                        sx={{ mr: 1, fontSize: 18, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        Remittance: {payer.remittanceMethod}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box display="flex" gap={1} mt={2}>
                  <Chip
                    label={
                      payer.requiresAuth
                        ? "Prior Auth Required"
                        : "No Auth Required"
                    }
                    size="small"
                    color={payer.requiresAuth ? "warning" : "default"}
                  />
                  <Chip
                    label={
                      payer.requiresReferral
                        ? "Referral Required"
                        : "No Referral"
                    }
                    size="small"
                    color={payer.requiresReferral ? "info" : "default"}
                  />
                  <Chip
                    label={payer.eftEnrolled ? "EFT Enrolled" : "No EFT"}
                    size="small"
                    color={payer.eftEnrolled ? "success" : "default"}
                  />
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={2}
                >
                  <Typography variant="caption" color="text.secondary">
                    Time Limit: {payer.timeLimitDays} days
                  </Typography>
                  <Box>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpen(payer)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Analytics />}
                      onClick={() =>
                        onShowNotification("Payer statistics opened", "info")
                      }
                    >
                      Statistics
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Payer Dialog */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? "Edit Payer" : "Add New Payer"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payer Name"
                value={formData.name}
                onChange={handleChange("name")}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payer ID"
                value={formData.payerId}
                onChange={handleChange("payerId")}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={handleChange("contactPerson")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Title"
                value={formData.contactTitle}
                onChange={handleChange("contactTitle")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={handleChange("phone")}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={handleChange("email")}
                type="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address1}
                onChange={handleChange("address1")}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleChange("city")}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={handleChange("state")}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Zip Code"
                value={formData.zipCode}
                onChange={handleChange("zipCode")}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Claim Submission Method</InputLabel>
                <Select
                  value={formData.claimSubmissionMethod}
                  onChange={handleChange("claimSubmissionMethod")}
                  label="Claim Submission Method"
                >
                  <MenuItem value="electronic">Electronic</MenuItem>
                  <MenuItem value="paper">Paper</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Remittance Method</InputLabel>
                <Select
                  value={formData.remittanceMethod}
                  onChange={handleChange("remittanceMethod")}
                  label="Remittance Method"
                >
                  <MenuItem value="electronic">Electronic</MenuItem>
                  <MenuItem value="paper">Paper</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Time Limit (days)"
                value={formData.timeLimitDays}
                onChange={handleChange("timeLimitDays")}
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" flexDirection="column" gap={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.requiresAuth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requiresAuth: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Requires Prior Authorization"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.requiresReferral}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requiresReferral: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Requires Referral"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.acceptsSecondary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          acceptsSecondary: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Accepts Secondary Claims"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.eftEnrolled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          eftEnrolled: e.target.checked,
                        })
                      }
                    />
                  }
                  label="EFT Enrolled"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                  }
                  label="Active"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "Update" : "Add"} Payer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
