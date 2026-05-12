import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router";
import { logout } from "../features/usersSlice";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Button,
  Container,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Person, Settings, Logout } from "@mui/icons-material";
import apiRequest from "../utils/apiRequest";

const Navbar = () => {
  const { currentUser } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await apiRequest.post("/users/logout");
    dispatch(logout());
    handleMenuClose();
    navigate("/login");
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
  };

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: "1px solid #e0e0e0", backgroundColor: "#ffffff" }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              fontWeight: 700,
              color: "#14a800",
              textDecoration: "none",
              fontFamily: "inherit",
            }}
          >
            Freelance
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {currentUser ? (
              <>
                <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                  <Avatar
                    alt={currentUser.name}
                    src={currentUser.avatar}
                    sx={{ bgcolor: "#14a800", width: 40, height: 40 }}
                  >
                    {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: "visible",
                      filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.12))",
                      mt: 1.5,
                      borderRadius: "12px",
                      minWidth: 220,
                      border: "1px solid #e0e0e0",
                      "& .MuiAvatar-root": {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                        borderLeft: "1px solid #e0e0e0",
                        borderTop: "1px solid #e0e0e0",
                      },
                    },
                  }}
                >
                  {/* User Info Header */}
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        alt={currentUser.name}
                        src={currentUser.avatar}
                        sx={{ bgcolor: "#14a800", width: 40, height: 40 }}
                      >
                        {currentUser.name
                          ? currentUser.name[0].toUpperCase()
                          : "U"}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: "#001e00" }}
                        >
                          {currentUser.name || "User"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#5e6d55" }}>
                          {currentUser.email || "user@example.com"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 0.5 }} />

                  {/* Menu Items */}
                  <MenuItem onClick={handleProfile} sx={{ py: 1, px: 2 }}>
                    <ListItemIcon>
                      <Person fontSize="small" sx={{ color: "#14a800" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="My Profile"
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: 500,
                      }}
                    />
                  </MenuItem>

                  <MenuItem onClick={handleMenuClose} sx={{ py: 1, px: 2 }}>
                    <ListItemIcon>
                      <Settings fontSize="small" sx={{ color: "#14a800" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Settings"
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: 500,
                      }}
                    />
                  </MenuItem>

                  <Divider sx={{ my: 0.5 }} />

                  <MenuItem onClick={handleLogout} sx={{ py: 1, px: 2 }}>
                    <ListItemIcon>
                      <Logout fontSize="small" sx={{ color: "#d32f2f" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Logout"
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: 500,
                        color: "#d32f2f",
                      }}
                    />
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="text"
                  sx={{
                    color: "#001e00",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": { color: "#14a800" },
                  }}
                >
                  Log In
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  sx={{
                    backgroundColor: "#14a800",
                    color: "#ffffff",
                    fontWeight: 600,
                    borderRadius: "24px",
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#108a00",
                      boxShadow: "none",
                    },
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
