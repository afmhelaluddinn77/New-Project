import {
  Assessment,
  Assignment,
  Dashboard,
  ExitToApp,
  Healing,
  LocalHospital,
  Medication,
  Menu as MenuIcon,
  MonitorHeart,
  PeopleAlt,
  Security,
  SwapHoriz,
  Warning,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 280;

const menuItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <Dashboard />,
    badge: null,
  },
  {
    title: "Patient Assignment",
    path: "/patient-assignment",
    icon: <Assignment />,
    badge: "8",
  },
  {
    title: "Medication Admin",
    path: "/medication-administration",
    icon: <Medication />,
    badge: "12",
  },
  {
    title: "Vitals Documentation",
    path: "/vitals",
    icon: <MonitorHeart />,
    badge: "5",
  },
  {
    title: "Nursing Assessment",
    path: "/assessment",
    icon: <Assessment />,
    badge: null,
  },
  {
    title: "Shift Handoff",
    path: "/shift-handoff",
    icon: <SwapHoriz />,
    badge: null,
  },
  {
    title: "Wound Care",
    path: "/wound-care",
    icon: <Healing />,
    badge: null,
  },
  {
    title: "Care Coordination",
    path: "/care-coordination",
    icon: <PeopleAlt />,
    badge: null,
  },
  {
    title: "Quality & Safety",
    path: "/quality-safety",
    icon: <Security />,
    badge: null,
  },
  {
    title: "Sepsis Alerts",
    path: "/sepsis",
    icon: <Warning />,
    badge: "2",
    color: "error",
  },
];

export default function NursesLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
        }}
      >
        <LocalHospital sx={{ fontSize: 32, mr: 1 }} />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Nurses Portal
          </Typography>
          <Typography variant="caption">EMR/HMS System</Typography>
        </Box>
      </Box>
      <Divider />

      {/* User Info */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 40,
              height: 40,
              mr: 2,
            }}
          >
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              RN - Unit 3B
            </Typography>
          </Box>
        </Box>
        <Chip
          label="Day Shift: 7:00 AM - 7:00 PM"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mt: 1 }}
        />
      </Box>
      <Divider />

      {/* Navigation Menu */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
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
              <ListItemIcon
                sx={{
                  color: item.color ? `${item.color}.main` : "inherit",
                  minWidth: 40,
                }}
              >
                {item.badge ? (
                  <Badge
                    badgeContent={item.badge}
                    color={(item.color as any) || "error"}
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

      <Box sx={{ flexGrow: 1 }} />
      <Divider />

      {/* Logout */}
      <List sx={{ p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={logout} sx={{ borderRadius: 2 }}>
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
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
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
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find((item) => item.path === location.pathname)?.title ||
              "Nurses Portal"}
          </Typography>

          {/* Quick Actions */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              icon={<Warning />}
              label="2 Critical Alerts"
              color="error"
              size="small"
              onClick={() => navigate("/sepsis")}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              icon={<Medication />}
              label="12 Meds Due"
              color="warning"
              size="small"
              onClick={() => navigate("/medication-administration")}
              sx={{ cursor: "pointer" }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
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
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
