import {
  Analytics,
  Assignment,
  BugReport,
  Build,
  CloudQueue,
  Code,
  Dashboard,
  Description,
  DeviceHub,
  ExitToApp,
  Inventory,
  LocalOffer,
  Notifications,
  Person,
  Security,
  Settings,
  Speed,
  Storage,
  Support,
  Timeline,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Badge,
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
    title: "Operations",
    items: [
      { title: "Dashboard", path: "/dashboard", icon: <Dashboard /> },
      {
        title: "Incident Management",
        path: "/incidents",
        icon: <BugReport />,
        badge: 12,
        badgeColor: "error",
      },
      {
        title: "Service Requests",
        path: "/service-requests",
        icon: <Assignment />,
        badge: 8,
        badgeColor: "warning",
      },
      { title: "Change Management", path: "/changes", icon: <Build /> },
      { title: "Problem Management", path: "/problems", icon: <Support /> },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { title: "Asset Management", path: "/assets", icon: <Inventory /> },
      { title: "CMDB", path: "/cmdb", icon: <DeviceHub /> },
      { title: "Network Monitoring", path: "/network", icon: <CloudQueue /> },
      { title: "Server Management", path: "/servers", icon: <Storage /> },
      { title: "Performance Metrics", path: "/performance", icon: <Speed /> },
    ],
  },
  {
    title: "Development",
    items: [
      { title: "CI/CD Pipelines", path: "/cicd", icon: <Code /> },
      { title: "Release Management", path: "/releases", icon: <LocalOffer /> },
      { title: "API Gateway", path: "/api-gateway", icon: <DeviceHub /> },
      { title: "Log Analytics", path: "/logs", icon: <Timeline /> },
    ],
  },
  {
    title: "Security & Compliance",
    items: [
      {
        title: "Security Center",
        path: "/security",
        icon: <Security />,
        badge: 3,
        badgeColor: "error",
      },
      { title: "Audit Logs", path: "/audit", icon: <Description /> },
      { title: "Compliance Reports", path: "/compliance", icon: <Analytics /> },
    ],
  },
];

export default function ITLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Operations",
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
          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <DeviceHub sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            IT Portal
          </Typography>
          <Typography variant="caption">Service Management</Typography>
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
              IT Administrator
            </Typography>
          </Box>
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
                          <Badge
                            badgeContent={item.badge}
                            color={item.badgeColor || "error"}
                          >
                            {item.icon}
                          </Badge>
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
            <DeviceHub />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuSections
              .flatMap((s) => s.items)
              .find((item) => item.path === location.pathname)?.title ||
              "IT Portal"}
          </Typography>

          {/* Quick Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={<BugReport />}
              label="12 Open Incidents"
              color="error"
              size="small"
              onClick={() => navigate("/incidents")}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              icon={<Speed />}
              label="System: 99.9%"
              color="success"
              size="small"
            />

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={5} color="error">
                  <Notifications />
                </Badge>
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
