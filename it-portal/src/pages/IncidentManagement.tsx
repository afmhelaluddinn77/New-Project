import {
  Add,
  Assignment,
  BugReport,
  CheckCircle,
  Close,
  Comment,
  Edit,
  FilterList,
  HourglassEmpty,
  PriorityHigh,
  Refresh,
  Search,
  Timer,
  Warning,
} from "@mui/icons-material";
import {
  Avatar,
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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

interface Incident {
  id: string;
  number: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: "P1" | "P2" | "P3" | "P4";
  impact: "High" | "Medium" | "Low";
  urgency: "High" | "Medium" | "Low";
  status: "New" | "In Progress" | "On Hold" | "Resolved" | "Closed";
  assignedTo: string;
  assignmentGroup: string;
  reporter: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  slaStatus: "On Time" | "At Risk" | "Breached";
  slaPercentage: number;
  affectedCI?: string;
  relatedIncidents?: string[];
  attachments?: number;
  comments?: number;
}

const mockIncidents: Incident[] = [
  {
    id: "1",
    number: "INC0010234",
    title: "Database connection timeout - Production",
    description:
      "Users experiencing timeout errors when accessing patient records",
    category: "Database",
    subcategory: "Performance",
    priority: "P1",
    impact: "High",
    urgency: "High",
    status: "In Progress",
    assignedTo: "John Smith",
    assignmentGroup: "Database Team",
    reporter: "Mary Johnson",
    createdAt: new Date("2024-11-24T08:00:00"),
    updatedAt: new Date("2024-11-24T08:30:00"),
    slaStatus: "At Risk",
    slaPercentage: 75,
    affectedCI: "PROD-DB-01",
    attachments: 3,
    comments: 5,
  },
  {
    id: "2",
    number: "INC0010235",
    title: "Email service not sending notifications",
    description: "Automated email notifications are not being delivered",
    category: "Application",
    subcategory: "Email Service",
    priority: "P2",
    impact: "Medium",
    urgency: "High",
    status: "New",
    assignedTo: "David Wilson",
    assignmentGroup: "Application Support",
    reporter: "Sarah Davis",
    createdAt: new Date("2024-11-24T09:15:00"),
    updatedAt: new Date("2024-11-24T09:15:00"),
    slaStatus: "On Time",
    slaPercentage: 90,
    affectedCI: "APP-EMAIL-01",
    attachments: 1,
    comments: 2,
  },
  {
    id: "3",
    number: "INC0010236",
    title: "Network latency in Building A",
    description: "Users in Building A reporting slow network speeds",
    category: "Network",
    subcategory: "Performance",
    priority: "P3",
    impact: "Low",
    urgency: "Medium",
    status: "On Hold",
    assignedTo: "Mike Chen",
    assignmentGroup: "Network Team",
    reporter: "Lisa Anderson",
    createdAt: new Date("2024-11-24T07:00:00"),
    updatedAt: new Date("2024-11-24T10:00:00"),
    slaStatus: "On Time",
    slaPercentage: 60,
    affectedCI: "NET-SW-A-01",
    comments: 8,
  },
];

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P1":
        return "error";
      case "P2":
        return "warning";
      case "P3":
        return "info";
      case "P4":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "info";
      case "In Progress":
        return "warning";
      case "On Hold":
        return "default";
      case "Resolved":
        return "success";
      case "Closed":
        return "default";
      default:
        return "default";
    }
  };

  const getSLAColor = (status: string) => {
    switch (status) {
      case "On Time":
        return "success";
      case "At Risk":
        return "warning";
      case "Breached":
        return "error";
      default:
        return "default";
    }
  };

  const stats = {
    total: incidents.length,
    new: incidents.filter((i) => i.status === "New").length,
    inProgress: incidents.filter((i) => i.status === "In Progress").length,
    resolved: incidents.filter((i) => i.status === "Resolved").length,
    p1: incidents.filter((i) => i.priority === "P1").length,
    slaBreached: incidents.filter((i) => i.slaStatus === "Breached").length,
  };

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || incident.status === filterStatus;
    const matchesPriority =
      filterPriority === "All" || incident.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Incident Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor, track, and resolve IT incidents across the organization
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BugReport color="primary" />
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Incidents
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Warning color="info" />
                <Box>
                  <Typography variant="h4">{stats.new}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    New
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <HourglassEmpty color="warning" />
                <Box>
                  <Typography variant="h4">{stats.inProgress}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircle color="success" />
                <Box>
                  <Typography variant="h4">{stats.resolved}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Resolved
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PriorityHigh color="error" />
                <Box>
                  <Typography variant="h4">{stats.p1}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    P1 Critical
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Timer color="error" />
                <Box>
                  <Typography variant="h4">{stats.slaBreached}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    SLA Breached
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search incidents..."
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterPriority}
                label="Priority"
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <MenuItem value="All">All Priorities</MenuItem>
                <MenuItem value="P1">P1 - Critical</MenuItem>
                <MenuItem value="P2">P2 - High</MenuItem>
                <MenuItem value="P3">P3 - Medium</MenuItem>
                <MenuItem value="P4">P4 - Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button startIcon={<Refresh />} variant="outlined">
                Refresh
              </Button>
              <Button startIcon={<FilterList />} variant="outlined">
                More Filters
              </Button>
              <Button
                startIcon={<Add />}
                variant="contained"
                onClick={() => setCreateDialogOpen(true)}
              >
                New Incident
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)}>
          <Tab label="My Incidents" />
          <Tab label="Unassigned" />
          <Tab label="All Open" />
          <Tab label="Recently Resolved" />
          <Tab label="SLA Breaches" />
        </Tabs>
      </Paper>

      {/* Incidents Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Number</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>SLA</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredIncidents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((incident) => (
                <TableRow key={incident.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {incident.number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{incident.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {incident.category} / {incident.subcategory}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={incident.priority}
                      size="small"
                      color={getPriorityColor(incident.priority) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={incident.status}
                      size="small"
                      color={getStatusColor(incident.status) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {incident.assignedTo[0]}
                      </Avatar>
                      <Typography variant="body2">
                        {incident.assignedTo}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        label={incident.slaStatus}
                        size="small"
                        color={getSLAColor(incident.slaStatus) as any}
                      />
                      <LinearProgress
                        variant="determinate"
                        value={incident.slaPercentage}
                        sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                        color={getSLAColor(incident.slaStatus) as any}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(incident.updatedAt).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedIncident(incident)}
                        >
                          <Assignment fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Add Comment">
                        <IconButton size="small">
                          <Comment fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredIncidents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) =>
            setRowsPerPage(parseInt(e.target.value, 10))
          }
        />
      </TableContainer>

      {/* Incident Details Dialog */}
      <Dialog
        open={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedIncident && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6">{selectedIncident.number}</Typography>
                <IconButton onClick={() => setSelectedIncident(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {selectedIncident.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedIncident.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Priority"
                        secondary={selectedIncident.priority}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Status"
                        secondary={selectedIncident.status}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Category"
                        secondary={`${selectedIncident.category} / ${selectedIncident.subcategory}`}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Assignment
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Assigned To"
                        secondary={selectedIncident.assignedTo}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Assignment Group"
                        secondary={selectedIncident.assignmentGroup}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Reporter"
                        secondary={selectedIncident.reporter}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedIncident(null)}>Close</Button>
              <Button variant="contained">Update Incident</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
