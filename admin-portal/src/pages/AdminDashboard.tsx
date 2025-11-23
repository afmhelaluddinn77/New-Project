import {
  AccountTree,
  CloudQueue,
  Group,
  Notifications,
  Security,
  Speed,
  Storage,
  TrendingUp,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AdminDashboard() {
  const theme = useTheme();

  // System metrics data
  const systemMetrics = {
    totalUsers: 1247,
    activeUsers: 892,
    totalPortals: 12,
    activeServices: 8,
    systemUptime: "99.98%",
    avgResponseTime: "124ms",
    totalRequests: "2.4M",
    errorRate: "0.02%",
  };

  // Portal usage data
  const portalUsage = [
    {
      name: "Provider",
      users: 342,
      sessions: 1250,
      color: theme.palette.primary.main,
    },
    {
      name: "Patient",
      users: 523,
      sessions: 2340,
      color: theme.palette.success.main,
    },
    {
      name: "Nurses",
      users: 189,
      sessions: 890,
      color: theme.palette.info.main,
    },
    {
      name: "Admin",
      users: 45,
      sessions: 234,
      color: theme.palette.error.main,
    },
    {
      name: "Lab",
      users: 78,
      sessions: 456,
      color: theme.palette.warning.main,
    },
    {
      name: "Billing",
      users: 70,
      sessions: 380,
      color: theme.palette.secondary.main,
    },
  ];

  // System performance over time
  const performanceData = [
    { time: "00:00", cpu: 32, memory: 45, requests: 1200 },
    { time: "04:00", cpu: 28, memory: 42, requests: 800 },
    { time: "08:00", cpu: 65, memory: 68, requests: 3500 },
    { time: "12:00", cpu: 78, memory: 75, requests: 4500 },
    { time: "16:00", cpu: 72, memory: 70, requests: 4200 },
    { time: "20:00", cpu: 45, memory: 53, requests: 2200 },
    { time: "23:59", cpu: 35, memory: 48, requests: 1500 },
  ];

  // Service status
  const services = [
    {
      name: "Authentication Service",
      status: "online",
      port: 3001,
      uptime: "45d 12h",
      cpu: 12,
      memory: 34,
    },
    {
      name: "Patient Service",
      status: "online",
      port: 3002,
      uptime: "45d 12h",
      cpu: 45,
      memory: 67,
    },
    {
      name: "Provider Service",
      status: "online",
      port: 3003,
      uptime: "45d 11h",
      cpu: 23,
      memory: 45,
    },
    {
      name: "Lab Service",
      status: "online",
      port: 3004,
      uptime: "44d 23h",
      cpu: 18,
      memory: 38,
    },
    {
      name: "Billing Service",
      status: "warning",
      port: 3006,
      uptime: "2d 5h",
      cpu: 78,
      memory: 85,
    },
    {
      name: "Pharmacy Service",
      status: "online",
      port: 3007,
      uptime: "45d 12h",
      cpu: 15,
      memory: 32,
    },
  ];

  // Recent activities
  const recentActivities = [
    {
      type: "security",
      message: "Failed login attempts detected from IP 192.168.1.100",
      time: "5 min ago",
      severity: "high",
    },
    {
      type: "system",
      message: "Database backup completed successfully",
      time: "1 hour ago",
      severity: "info",
    },
    {
      type: "user",
      message: "New admin user created: john.admin@hospital.com",
      time: "2 hours ago",
      severity: "medium",
    },
    {
      type: "update",
      message: "System update available: v2.5.0",
      time: "3 hours ago",
      severity: "info",
    },
    {
      type: "performance",
      message: "High memory usage detected on Billing Service",
      time: "4 hours ago",
      severity: "high",
    },
  ];

  // License usage
  const licenseData = [
    { type: "Provider Licenses", used: 342, total: 500, percentage: 68 },
    { type: "Nurse Licenses", used: 189, total: 300, percentage: 63 },
    { type: "Admin Licenses", used: 45, total: 50, percentage: 90 },
    { type: "Lab Tech Licenses", used: 78, total: 100, percentage: 78 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "success";
      case "warning":
        return "warning";
      case "offline":
        return "error";
      default:
        return "default";
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case "security":
        return <Security color="error" />;
      case "system":
        return <Storage color="info" />;
      case "user":
        return <Group color="primary" />;
      case "update":
        return <CloudQueue color="success" />;
      case "performance":
        return <Speed color="warning" />;
      default:
        return <Notifications />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          System Administration Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete overview of EMR/HMS system health and performance
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
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
                  <Typography color="text.secondary" variant="caption">
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {systemMetrics.totalUsers}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +12% from last month
                  </Typography>
                </Box>
                <Group
                  sx={{ fontSize: 40, color: "primary.main", opacity: 0.3 }}
                />
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
                  <Typography color="text.secondary" variant="caption">
                    System Uptime
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {systemMetrics.systemUptime}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Exceeds SLA
                  </Typography>
                </Box>
                <TrendingUp
                  sx={{ fontSize: 40, color: "success.main", opacity: 0.3 }}
                />
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
                  <Typography color="text.secondary" variant="caption">
                    Active Services
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {systemMetrics.activeServices}/{systemMetrics.totalPortals}
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    1 service warning
                  </Typography>
                </Box>
                <AccountTree
                  sx={{ fontSize: 40, color: "info.main", opacity: 0.3 }}
                />
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
                  <Typography color="text.secondary" variant="caption">
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {systemMetrics.avgResponseTime}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Within target
                  </Typography>
                </Box>
                <Speed
                  sx={{ fontSize: 40, color: "warning.main", opacity: 0.3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* System Performance Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Performance (24 Hours)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke={theme.palette.error.main}
                  name="CPU %"
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke={theme.palette.info.main}
                  name="Memory %"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Portal Usage Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Portal Usage Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={portalUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="users"
                >
                  {portalUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Services and Activities */}
      <Grid container spacing={3}>
        {/* Service Status */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Service Status
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Port</TableCell>
                    <TableCell>Uptime</TableCell>
                    <TableCell>CPU</TableCell>
                    <TableCell>Memory</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.name}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={service.status}
                          size="small"
                          color={getStatusColor(service.status) as any}
                        />
                      </TableCell>
                      <TableCell>{service.port}</TableCell>
                      <TableCell>{service.uptime}</TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={service.cpu}
                            sx={{ width: 50, height: 4 }}
                            color={service.cpu > 70 ? "error" : "primary"}
                          />
                          <Typography variant="caption">
                            {service.cpu}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={service.memory}
                            sx={{ width: 50, height: 4 }}
                            color={service.memory > 80 ? "error" : "primary"}
                          />
                          <Typography variant="caption">
                            {service.memory}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>{getSeverityIcon(activity.type)}</ListItemIcon>
                  <ListItemText
                    primary={activity.message}
                    secondary={activity.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* License Usage */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              License Usage
            </Typography>
            <Grid container spacing={2}>
              {licenseData.map((license) => (
                <Grid item xs={12} sm={6} md={3} key={license.type}>
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">{license.type}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {license.used}/{license.total}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={license.percentage}
                      sx={{ height: 8, borderRadius: 1 }}
                      color={license.percentage > 80 ? "warning" : "primary"}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {license.percentage}% utilized
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
