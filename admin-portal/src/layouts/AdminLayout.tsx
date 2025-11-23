import {
  AccountTree,
  AdminPanelSettings,
  Analytics,
  Assessment,
  Backup,
  Business,
  CloudSync,
  Dashboard,
  DataUsage,
  ExitToApp,
  Group,
  History,
  Notifications,
  Person,
  Policy,
  Security,
  Settings,
  Storage,
  SupervisorAccount,
  SystemUpdate,
  VerifiedUser,
  VpnKey,
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
    title: "System Overview",
    items: [
      { title: "Dashboard", path: "/dashboard", icon: <Dashboard /> },
      {
        title: "System Health",
        path: "/system-health",
        icon: <Assessment />,
        badge: "99.9%",
        badgeColor: "success",
      },
      { title: "Analytics", path: "/analytics", icon: <Analytics /> },
      { title: "Resource Monitor", path: "/resources", icon: <DataUsage /> },
    ],
  },
  {
    title: "User Management",
    items: [
      { title: "Users", path: "/users", icon: <Group />, badge: 1247 },
      { title: "Roles & Permissions", path: "/roles", icon: <VerifiedUser /> },
      { title: "Access Control", path: "/access-control", icon: <VpnKey /> },
      {
        title: "Active Sessions",
        path: "/sessions",
        icon: <SupervisorAccount />,
        badge: 89,
        badgeColor: "info",
      },
    ],
  },
  {
    title: "System Configuration",
    items: [
      { title: "General Settings", path: "/settings", icon: <Settings /> },
      {
        title: "Portal Configuration",
        path: "/portal-config",
        icon: <AdminPanelSettings />,
      },
      { title: "Service Management", path: "/services", icon: <AccountTree /> },
      {
        title: "Integration Settings",
        path: "/integrations",
        icon: <CloudSync />,
      },
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
        badgeColor: "warning",
      },
      { title: "Audit Logs", path: "/audit", icon: <History /> },
      { title: "Compliance", path: "/compliance", icon: <Policy /> },
      { title: "Data Privacy", path: "/privacy", icon: <VerifiedUser /> },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Backup & Recovery", path: "/backup", icon: <Backup /> },
      {
        title: "System Updates",
        path: "/updates",
        icon: <SystemUpdate />,
        badge: 2,
        badgeColor: "info",
      },
      { title: "Database Management", path: "/database", icon: <Storage /> },
      { title: "Multi-Tenant", path: "/tenants", icon: <Business /> },
    ],
  },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "System Overview",
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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <AdminPanelSettings sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Admin Portal
          </Typography>
          <Typography variant="caption">System Control Center</Typography>
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
              System Administrator
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Chip label="Super Admin" size="small" color="error" />
          <Chip
            label="All Access"
            size="small"
            color="success"
            sx={{ ml: 0.5 }}
          />
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
                            max={999}
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
            <AdminPanelSettings />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuSections
              .flatMap((s) => s.items)
              .find((item) => item.path === location.pathname)?.title ||
              "Admin Portal"}
          </Typography>

          {/* Quick Stats */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={<Group />}
              label="1,247 Users Online"
              color="success"
              size="small"
            />
            <Chip
              icon={<Assessment />}
              label="System: Healthy"
              color="success"
              size="small"
            />
            <Chip
              icon={<Security />}
              label="3 Security Alerts"
              color="warning"
              size="small"
              onClick={() => navigate("/security")}
              sx={{ cursor: "pointer" }}
            />

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={12} color="error">
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
