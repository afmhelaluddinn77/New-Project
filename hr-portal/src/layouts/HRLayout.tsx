import {
  AccountBalance,
  Assessment,
  Assignment,
  Badge,
  Business,
  CalendarMonth,
  Dashboard,
  EmojiEvents,
  ExitToApp,
  Group,
  HealthAndSafety,
  History,
  Home,
  Notifications,
  Person,
  PersonAdd,
  Policy,
  School,
  Settings,
  Timeline,
  TrendingUp,
  Work,
  WorkHistory,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Badge as MuiBadge,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 280;

interface MenuSection {
  title: string;
  items: {
    title: string;
    path: string;
    icon: JSX.Element;
    badge?: string | number;
    badgeColor?: "error" | "warning" | "success" | "info";
  }[];
}

const menuSections: MenuSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", path: "/dashboard", icon: <Dashboard /> },
      {
        title: "Employee Directory",
        path: "/employees",
        icon: <Group />,
        badge: 523,
      },
      { title: "Org Chart", path: "/org-chart", icon: <Business /> },
      { title: "Analytics", path: "/analytics", icon: <Assessment /> },
    ],
  },
  {
    title: "Recruitment",
    items: [
      {
        title: "Job Postings",
        path: "/jobs",
        icon: <Work />,
        badge: 12,
        badgeColor: "info",
      },
      {
        title: "Applicants",
        path: "/applicants",
        icon: <PersonAdd />,
        badge: 45,
        badgeColor: "warning",
      },
      {
        title: "Interview Schedule",
        path: "/interviews",
        icon: <CalendarMonth />,
      },
      {
        title: "Onboarding",
        path: "/onboarding",
        icon: <Assignment />,
        badge: 8,
      },
    ],
  },
  {
    title: "Employee Management",
    items: [
      { title: "Employee Records", path: "/records", icon: <Badge /> },
      { title: "Time & Attendance", path: "/attendance", icon: <History /> },
      {
        title: "Leave Management",
        path: "/leave",
        icon: <Home />,
        badge: 15,
        badgeColor: "warning",
      },
      { title: "Performance", path: "/performance", icon: <TrendingUp /> },
    ],
  },
  {
    title: "Compensation & Benefits",
    items: [
      { title: "Payroll", path: "/payroll", icon: <AccountBalance /> },
      { title: "Benefits Admin", path: "/benefits", icon: <HealthAndSafety /> },
      {
        title: "Compensation Planning",
        path: "/compensation",
        icon: <EmojiEvents />,
      },
      { title: "Expense Management", path: "/expenses", icon: <WorkHistory /> },
    ],
  },
  {
    title: "Learning & Development",
    items: [
      { title: "Training Programs", path: "/training", icon: <School /> },
      { title: "Career Development", path: "/career", icon: <Timeline /> },
      {
        title: "Succession Planning",
        path: "/succession",
        icon: <TrendingUp />,
      },
      { title: "Skills Matrix", path: "/skills", icon: <Assessment /> },
    ],
  },
  {
    title: "Compliance",
    items: [
      { title: "Policies", path: "/policies", icon: <Policy /> },
      {
        title: "Compliance Reports",
        path: "/compliance",
        icon: <Assessment />,
      },
      { title: "Audit Trail", path: "/audit", icon: <History /> },
    ],
  },
];

export default function HRLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Overview",
  ]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();
    navigate("/login");
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Group sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            HR Portal
          </Typography>
          <Typography variant="caption">Human Resources</Typography>
        </Box>
      </Box>

      <Divider />

      {/* User Info */}
      <Box sx={{ p: 2, bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              HR Manager
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 1, display: "flex", gap: 0.5 }}>
          <Chip
            label="523 Employees"
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip label="12 Departments" size="small" variant="outlined" />
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: "auto", py: 1 }}>
        {menuSections.map((section) => (
          <Box key={section.title}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => toggleSection(section.title)}
                sx={{ py: 0.5, px: 2 }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                    >
                      {section.title.toUpperCase()}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
            <Collapse
              in={expandedSections.includes(section.title)}
              timeout="auto"
            >
              <List disablePadding>
                {section.items.map((item) => (
                  <ListItem key={item.path} disablePadding sx={{ px: 1 }}>
                    <ListItemButton
                      selected={location.pathname === item.path}
                      onClick={() => navigate(item.path)}
                      sx={{
                        borderRadius: 1,
                        mx: 1,
                        "&.Mui-selected": {
                          bgcolor: "primary.main",
                          color: "white",
                          "&:hover": {
                            bgcolor: "primary.dark",
                          },
                          "& .MuiListItemIcon-root": {
                            color: "white",
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.badge ? (
                          <MuiBadge
                            badgeContent={item.badge}
                            color={item.badgeColor || "error"}
                          >
                            {item.icon}
                          </MuiBadge>
                        ) : (
                          item.icon
                        )}
                      </ListItemIcon>
                      <ListItemText primary={item.title} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* Bottom Actions */}
      <List sx={{ p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/settings")}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1 }}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <Group />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuSections
              .flatMap((s) => s.items)
              .find((item) => item.path === location.pathname)?.title ||
              "HR Portal"}
          </Typography>

          {/* Quick Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={<PersonAdd />}
              label="45 New Applicants"
              color="warning"
              size="small"
              onClick={() => navigate("/applicants")}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              icon={<Home />}
              label="15 Leave Requests"
              color="info"
              size="small"
              onClick={() => navigate("/leave")}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              icon={<Work />}
              label="12 Open Positions"
              color="success"
              size="small"
              onClick={() => navigate("/jobs")}
              sx={{ cursor: "pointer" }}
            />

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <MuiBadge badgeContent={8} color="error">
                  <Notifications />
                </MuiBadge>
              </IconButton>
            </Tooltip>

            {/* Profile Menu */}
            <Tooltip title="Profile">
              <IconButton onClick={handleProfileMenu} color="inherit">
                <Person />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
              <MenuItem onClick={() => navigate("/settings")}>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "background.paper",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "background.paper",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
