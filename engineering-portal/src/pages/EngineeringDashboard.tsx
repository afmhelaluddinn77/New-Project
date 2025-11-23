import {
  Assignment,
  AssignmentTurnedIn,
  Logout,
  MonetizationOn,
  People,
  PersonAdd,
  TrendingUp,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function EngineeringDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const metrics = [
    {
      title: "Total Employees",
      value: "1,245",
      icon: People,
      color: "#10b981",
    },
    { title: "Open Positions", value: "23", icon: PersonAdd, color: "#667eea" },
    {
      title: "Leave Requests",
      value: "12",
      icon: Assignment,
      color: "#f093fb",
    },
    {
      title: "Pending Reviews",
      value: "8",
      icon: AssignmentTurnedIn,
      color: "#4facfe",
    },
    {
      title: "Training Programs",
      value: "15",
      icon: TrendingUp,
      color: "#43e97b",
    },
    {
      title: "Payroll Processed",
      value: "$2.4M",
      icon: MonetizationOn,
      color: "#fa709a",
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#f7fafc", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ bgcolor: "#10b981" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Engineering Portal - Dashboard
          </Typography>
          <Typography sx={{ mr: 2 }}>
            Welcome, {user?.firstName || user?.email}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ mb: 4, fontWeight: 600, color: "#2D3748" }}
        >
          Engineering Overview
        </Typography>

        <Grid container spacing={3}>
          {metrics.map((metric) => (
            <Grid item xs={12} sm={6} md={4} key={metric.title}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <metric.icon
                      sx={{ fontSize: 40, color: metric.color, mr: 2 }}
                    />
                    <Box>
                      <Typography
                        color="textSecondary"
                        gutterBottom
                        variant="body2"
                      >
                        {metric.title}
                      </Typography>
                      <Typography
                        variant="h5"
                        component="div"
                        sx={{ fontWeight: 600 }}
                      >
                        {metric.value}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Recent Activities
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • New employee onboarding - Sarah Johnson
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Performance review completed - Marketing Team
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • Training session scheduled - Compliance Update
                  </Typography>
                  <Typography variant="body2">
                    • Leave request approved - John Smith
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ borderColor: "#10b981", color: "#10b981" }}
                    >
                      Add Employee
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ borderColor: "#10b981", color: "#10b981" }}
                    >
                      View Reports
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ borderColor: "#10b981", color: "#10b981" }}
                    >
                      Manage Leave
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ borderColor: "#10b981", color: "#10b981" }}
                    >
                      Payroll
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
