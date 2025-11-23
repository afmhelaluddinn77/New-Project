import {
  AccountTree,
  Api,
  Assessment,
  BugReport,
  Build,
  Code,
  Dashboard,
  DataObject,
  DeveloperMode,
  DeviceHub,
  ExitToApp,
  GitHub,
  Insights,
  IntegrationInstructions,
  LocalOffer,
  Memory,
  Notifications,
  Person,
  PlayCircle,
  Science,
  Security,
  Settings,
  Speed,
  Storage,
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
    title: "Development",
    items: [
      { title: "Dashboard", path: "/dashboard", icon: <Dashboard /> },
      {
        title: "CI/CD Pipelines",
        path: "/pipelines",
        icon: <PlayCircle />,
        badge: 3,
        badgeColor: "info",
      },
      {
        title: "Code Reviews",
        path: "/reviews",
        icon: <Code />,
        badge: 5,
        badgeColor: "warning",
      },
      { title: "Repositories", path: "/repositories", icon: <GitHub /> },
      {
        title: "Merge Requests",
        path: "/merge-requests",
        icon: <AccountTree />,
        badge: 8,
      },
    ],
  },
  {
    title: "DevOps",
    items: [
      { title: "Infrastructure", path: "/infrastructure", icon: <Storage /> },
      { title: "Deployments", path: "/deployments", icon: <Build /> },
      { title: "Environments", path: "/environments", icon: <DeviceHub /> },
      { title: "Release Management", path: "/releases", icon: <LocalOffer /> },
      {
        title: "Container Registry",
        path: "/containers",
        icon: <DataObject />,
      },
    ],
  },
  {
    title: "Quality & Testing",
    items: [
      { title: "Test Automation", path: "/testing", icon: <Science /> },
      { title: "Code Quality", path: "/quality", icon: <Assessment /> },
      {
        title: "Security Scanning",
        path: "/security",
        icon: <Security />,
        badge: 2,
        badgeColor: "error",
      },
      { title: "Bug Tracking", path: "/bugs", icon: <BugReport /> },
    ],
  },
  {
    title: "Monitoring",
    items: [
      { title: "Performance", path: "/performance", icon: <Speed /> },
      { title: "Logs & Traces", path: "/logs", icon: <Timeline /> },
      { title: "Metrics", path: "/metrics", icon: <Insights /> },
      { title: "API Monitor", path: "/api-monitor", icon: <Api /> },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        title: "API Documentation",
        path: "/api-docs",
        icon: <IntegrationInstructions />,
      },
      { title: "Database Tools", path: "/database", icon: <Storage /> },
      {
        title: "Development Tools",
        path: "/dev-tools",
        icon: <DeveloperMode />,
      },
      { title: "Resource Monitor", path: "/resources", icon: <Memory /> },
    ],
  },
];

export default function EngineeringLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Development",
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
        <Code sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Engineering
          </Typography>
          <Typography variant="caption">DevOps Platform</Typography>
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
              Senior Engineer
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 1, display: "flex", gap: 0.5 }}>
          <Chip label="Full Stack" size="small" variant="outlined" />
          <Chip label="DevOps" size="small" variant="outlined" />
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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0a0e27" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "#0f1729",
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
            <Code />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuSections
              .flatMap((s) => s.items)
              .find((item) => item.path === location.pathname)?.title ||
              "Engineering Portal"}
          </Typography>

          {/* Quick Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={<PlayCircle />}
              label="3 Pipelines Running"
              color="info"
              size="small"
              onClick={() => navigate("/pipelines")}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              icon={<AccountTree />}
              label="8 PRs Pending"
              color="warning"
              size="small"
              onClick={() => navigate("/merge-requests")}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              icon={<Build />}
              label="Build: Success"
              color="success"
              size="small"
            />

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={7} color="error">
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
              bgcolor: "#0f1729",
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
              bgcolor: "#0f1729",
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
