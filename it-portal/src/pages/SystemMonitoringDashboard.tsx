import {
  ArrowDownward,
  ArrowUpward,
  CheckCircle,
  CloudQueue,
  DataUsage,
  Dns,
  Memory,
  NetworkCheck,
  NotificationsActive,
  Refresh,
  Router,
  Security,
  Settings,
  Speed,
  Storage,
  Timeline,
  Warning,
} from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
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
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPie,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend: "up" | "down" | "stable";
}

interface ServerStatus {
  id: string;
  name: string;
  type: "app" | "database" | "cache" | "gateway";
  status: "online" | "offline" | "maintenance";
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  lastCheck: Date;
}

interface SecurityAlert {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  type: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export default function SystemMonitoringDashboard() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Mock real-time data
  const [systemMetrics] = useState<SystemMetric[]>([
    {
      name: "CPU Usage",
      value: 42,
      unit: "%",
      status: "healthy",
      trend: "stable",
    },
    {
      name: "Memory Usage",
      value: 67,
      unit: "%",
      status: "warning",
      trend: "up",
    },
    {
      name: "Disk Usage",
      value: 35,
      unit: "%",
      status: "healthy",
      trend: "up",
    },
    {
      name: "Network Latency",
      value: 12,
      unit: "ms",
      status: "healthy",
      trend: "down",
    },
    {
      name: "API Response Time",
      value: 89,
      unit: "ms",
      status: "healthy",
      trend: "stable",
    },
    {
      name: "Database Queries",
      value: 1247,
      unit: "/min",
      status: "healthy",
      trend: "up",
    },
  ]);

  const [servers] = useState<ServerStatus[]>([
    {
      id: "srv-001",
      name: "app-server-01",
      type: "app",
      status: "online",
      cpu: 45,
      memory: 62,
      disk: 38,
      uptime: "15d 7h 23m",
      lastCheck: new Date(),
    },
    {
      id: "srv-002",
      name: "db-primary",
      type: "database",
      status: "online",
      cpu: 78,
      memory: 85,
      disk: 67,
      uptime: "45d 12h 15m",
      lastCheck: new Date(),
    },
    {
      id: "srv-003",
      name: "redis-cache",
      type: "cache",
      status: "online",
      cpu: 12,
      memory: 34,
      disk: 15,
      uptime: "120d 3h 45m",
      lastCheck: new Date(),
    },
    {
      id: "srv-004",
      name: "kong-gateway",
      type: "gateway",
      status: "online",
      cpu: 23,
      memory: 41,
      disk: 20,
      uptime: "90d 18h 30m",
      lastCheck: new Date(),
    },
  ]);

  const [securityAlerts] = useState<SecurityAlert[]>([
    {
      id: "sec-001",
      severity: "high",
      type: "Failed Login Attempts",
      message: "Multiple failed login attempts detected from IP 192.168.1.100",
      timestamp: new Date("2024-11-21T10:30:00"),
      resolved: false,
    },
    {
      id: "sec-002",
      severity: "medium",
      type: "Certificate Expiry",
      message: "SSL certificate for api.hospital.com expires in 7 days",
      timestamp: new Date("2024-11-21T09:15:00"),
      resolved: false,
    },
    {
      id: "sec-003",
      severity: "low",
      type: "System Update",
      message: "PostgreSQL 16.1 security update available",
      timestamp: new Date("2024-11-21T08:00:00"),
      resolved: false,
    },
  ]);

  // Performance data for charts
  const performanceData = [
    { time: "00:00", cpu: 32, memory: 45, requests: 120 },
    { time: "04:00", cpu: 28, memory: 42, requests: 80 },
    { time: "08:00", cpu: 45, memory: 58, requests: 250 },
    { time: "12:00", cpu: 68, memory: 72, requests: 450 },
    { time: "16:00", cpu: 55, memory: 65, requests: 380 },
    { time: "20:00", cpu: 42, memory: 53, requests: 220 },
    { time: "23:59", cpu: 35, memory: 48, requests: 150 },
  ];

  const serviceHealthData = [
    { name: "Healthy", value: 42, color: theme.palette.success.main },
    { name: "Warning", value: 8, color: theme.palette.warning.main },
    { name: "Critical", value: 2, color: theme.palette.error.main },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getStatusColor = (
    status: string
  ): "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "online":
      case "healthy":
        return "success";
      case "warning":
      case "maintenance":
        return "warning";
      case "offline":
      case "critical":
        return "error";
      default:
        return "info";
    }
  };

  const getServerIcon = (type: string) => {
    switch (type) {
      case "app":
        return <CloudQueue />;
      case "database":
        return <Storage />;
      case "cache":
        return <Memory />;
      case "gateway":
        return <Router />;
      default:
        return <Dns />;
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
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
          <Typography
            variant="h4"
            sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
          >
            System Monitoring Dashboard
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, mt: 0.5 }}
          >
            Real-time infrastructure monitoring and management
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Badge
            badgeContent={securityAlerts.filter((a) => !a.resolved).length}
            color="error"
          >
            <IconButton color="primary">
              <NotificationsActive />
            </IconButton>
          </Badge>
          <Button
            variant="outlined"
            startIcon={
              refreshing ? <CircularProgress size={16} /> : <Refresh />
            }
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Settings />}>
            Configure
          </Button>
        </Box>
      </Box>

      {/* System Health Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                  <Typography color="white" variant="body2">
                    System Uptime
                  </Typography>
                  <Typography color="white" variant="h4">
                    99.98%
                  </Typography>
                  <Typography color="white" variant="caption">
                    Last 30 days
                  </Typography>
                </Box>
                <CheckCircle
                  sx={{ fontSize: 48, color: "rgba(255, 255, 255, 0.8)" }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
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
                  <Typography color="white" variant="body2">
                    Active Incidents
                  </Typography>
                  <Typography color="white" variant="h4">
                    3
                  </Typography>
                  <Typography color="white" variant="caption">
                    2 high priority
                  </Typography>
                </Box>
                <Warning
                  sx={{ fontSize: 48, color: "rgba(255, 255, 255, 0.8)" }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
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
                  <Typography color="white" variant="body2">
                    API Calls
                  </Typography>
                  <Typography color="white" variant="h4">
                    2.4M
                  </Typography>
                  <Typography color="white" variant="caption">
                    Today
                  </Typography>
                </Box>
                <Timeline
                  sx={{ fontSize: 48, color: "rgba(255, 255, 255, 0.8)" }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
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
                  <Typography color="white" variant="body2">
                    Data Transfer
                  </Typography>
                  <Typography color="white" variant="h4">
                    1.2TB
                  </Typography>
                  <Typography color="white" variant="caption">
                    This month
                  </Typography>
                </Box>
                <DataUsage
                  sx={{ fontSize: 48, color: "rgba(255, 255, 255, 0.8)" }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab
            label="Infrastructure"
            icon={<CloudQueue />}
            iconPosition="start"
          />
          <Tab label="Performance" icon={<Speed />} iconPosition="start" />
          <Tab label="Security" icon={<Security />} iconPosition="start" />
          <Tab label="Network" icon={<NetworkCheck />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* System Metrics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                System Metrics
              </Typography>
              <List>
                {systemMetrics.map((metric, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={metric.name}
                      secondary={
                        <LinearProgress
                          variant="determinate"
                          value={metric.value}
                          color={getStatusColor(metric.status)}
                          sx={{ mt: 1 }}
                        />
                      }
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h6">
                        {metric.value}
                        {metric.unit}
                      </Typography>
                      {metric.trend === "up" ? (
                        <ArrowUpward fontSize="small" color="error" />
                      ) : metric.trend === "down" ? (
                        <ArrowDownward fontSize="small" color="success" />
                      ) : null}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Server Status */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Server Status
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Server</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>CPU</TableCell>
                      <TableCell>Memory</TableCell>
                      <TableCell>Uptime</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {servers.map((server) => (
                      <TableRow key={server.id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {getServerIcon(server.type)}
                            <Typography variant="body2">
                              {server.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={server.status}
                            color={getStatusColor(server.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <CircularProgress
                              variant="determinate"
                              value={server.cpu}
                              size={20}
                              thickness={4}
                              color={server.cpu > 80 ? "error" : "primary"}
                            />
                            <Typography variant="caption">
                              {server.cpu}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <CircularProgress
                              variant="determinate"
                              value={server.memory}
                              size={20}
                              thickness={4}
                              color={server.memory > 80 ? "error" : "primary"}
                            />
                            <Typography variant="caption">
                              {server.memory}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {server.uptime}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Performance Chart */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    name="CPU %"
                  />
                  <Line
                    type="monotone"
                    dataKey="memory"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                    name="Memory %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Service Health */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Service Health
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={serviceHealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPie>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {serviceHealthData.map((item) => (
                  <Box
                    key={item.name}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: item.color,
                          borderRadius: "50%",
                        }}
                      />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                      {item.value} services
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Security Alerts */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Security Alerts
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Severity</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {securityAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Chip
                            label={alert.severity.toUpperCase()}
                            color={
                              alert.severity === "critical"
                                ? "error"
                                : alert.severity === "high"
                                  ? "error"
                                  : alert.severity === "medium"
                                    ? "warning"
                                    : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{alert.type}</TableCell>
                        <TableCell>{alert.message}</TableCell>
                        <TableCell>
                          {new Date(alert.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={alert.resolved ? "Resolved" : "Active"}
                            color={alert.resolved ? "success" : "warning"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined">
                            Investigate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
