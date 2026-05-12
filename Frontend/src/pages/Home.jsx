import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { logout } from "../features/usersSlice";
import apiRequest from "../utils/apiRequest";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import {
  AccountBalanceWallet,
  Add,
  Business,
  Dashboard as DashboardIcon,
  Email,
  Groups,
  HomeWork,
  NotificationsNone,
  Person,
  ReceiptLong,
  TrendingUp,
  Description,
  AccessTime,
  Settings,
  Assessment,
  Logout,
} from "@mui/icons-material";
import Dashboard from "../components/Dashboard";
import Client from "../components/Client";

const menuSections = [
  {
    title: "MAIN",
    items: [
      { key: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
      { key: "invoices", label: "Invoices", icon: <ReceiptLong />, badge: 3 },
      { key: "clients", label: "Clients", icon: <Groups /> },
      { key: "projects", label: "Projects", icon: <Description /> },
    ],
  },
  {
    title: "TRACK",
    items: [
      { key: "time_entries", label: "Time Entries", icon: <AccessTime /> },
      { key: "expenses", label: "Expenses", icon: <AccountBalanceWallet /> },
      { key: "reports", label: "Reports", icon: <Assessment /> },
    ],
  },
];

const Home = () => {
  const { currentUser } = useSelector((state) => state.users);
  const [activeTab, setActiveTab] = useState("dashboard");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiRequest.post("/users/logout");
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#F9FAFB",
        color: "#1F2937",
      }}
    >
      <Box
        component="aside"
        sx={{
          width: { xs: 84, md: 280 },
          flexShrink: 0,
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E5E7EB",
          px: { xs: 1, md: 2 },
          py: 4,
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ mb: 2, px: 2, display: { xs: "none", md: "block" } }}>
          <Typography sx={{ color: "#1F2937", fontSize: 32, fontWeight: 800 }}>
            Freelance
          </Typography>
        </Box>

        <Box sx={{ mb: 3, px: 2 }}>
          {currentUser && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                alt={currentUser.name}
                src={currentUser.avatar}
                sx={{ bgcolor: "#14a800", width: 36, height: 36 }}
              >
                {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
              </Avatar>
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: { xs: "none", md: "block" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "#1F2937",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentUser.name || "User"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6B7280",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {currentUser.email || "user@example.com"}
                </Typography>
              </Box>
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{
                  color: "#EF4444",
                  display: { xs: "none", md: "inline-flex" },
                }}
              >
                <Logout fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flex: 1,
            overflowY: "auto",
            mb: 2,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {menuSections.map((section) => (
            <Box key={section.title}>
              <Typography
                sx={{
                  color: "#9CA3AF",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "1px",
                  mb: 0.5,
                  px: 2,
                  display: { xs: "none", md: "block" },
                }}
              >
                {section.title}
              </Typography>
              <Box sx={{ display: "grid", gap: 0.5 }}>
                {section.items.map((item) => {
                  const isActive = activeTab === item.key;
                  return (
                    <Button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      startIcon={item.icon}
                      fullWidth
                      sx={{
                        justifyContent: { xs: "center", md: "flex-start" },
                        minHeight: 40,
                        px: { xs: 0, md: 2 },
                        borderRadius: "8px",
                        color: isActive ? "#14a800" : "#5F6368",
                        backgroundColor: isActive ? "#F0FDF4" : "transparent",
                        fontSize: 14,
                        fontWeight: 500,
                        textTransform: "none",
                        "& .MuiButton-startIcon": {
                          m: { xs: 0, md: "0 12px 0 0" },
                          color: isActive ? "#14a800" : "#5F6368",
                          "& svg": { fontSize: 20 },
                        },
                        "&:hover": {
                          backgroundColor: isActive ? "#F0FDF4" : "#F9FAFB",
                          color: isActive ? "#14a800" : "#14a800",
                          "& .MuiButton-startIcon": {
                            color: isActive ? "#14a800" : "#14a800",
                          },
                        },
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          display: { xs: "none", md: "flex" },
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        {item.label}
                        {item.badge && (
                          <Box
                            sx={{
                              backgroundColor: "#FCE8E6",
                              color: "#C5221F",
                              fontSize: 11,
                              fontWeight: 700,
                              minWidth: 18,
                              height: 18,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              ml: 1,
                            }}
                          >
                            {item.badge}
                          </Box>
                        )}
                      </Box>
                    </Button>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          component="main"
          sx={{
            maxWidth: 1180,
            mx: "auto",
            px: { xs: 2, md: 4 },
            py: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 5,
              gap: 2,
            }}
          >
            <Box>
              <Typography
                component="h1"
                sx={{
                  color: "#14a800",
                  fontSize: { xs: 32, md: 42 },
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                {menuSections
                  .flatMap((s) => s.items)
                  .find((i) => i.key === activeTab)?.label || "Dashboard"}
              </Typography>
            </Box>
          </Box>

          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "clients" && <Client />}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
