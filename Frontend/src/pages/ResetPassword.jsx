import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import apiRequest from "../utils/apiRequest";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await apiRequest.post(`/users/reset-password/${token}`, {
        password,
      });
      setMessage(res.data.message || "Password reset successful.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reset password. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        py: 4,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 1,
              fontWeight: 700,
              color: "#14a800",
              fontFamily: "inherit",
            }}
          >
            freelance
          </Typography>

          <Typography
            component="h2"
            variant="h6"
            sx={{ mb: 3, fontWeight: 500, color: "#001e00" }}
          >
            Enter new password
          </Typography>

          {message && (
            <Typography
              color="primary"
              variant="body2"
              sx={{ mb: 2, width: "100%", textAlign: "center", color: "#14a800" }}
            >
              {message} Redirecting to login...
            </Typography>
          )}

          {error && (
            <Typography
              color="error"
              variant="body2"
              sx={{ mb: 2, width: "100%", textAlign: "center" }}
            >
              {error}
            </Typography>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&:hover fieldset": {
                    borderColor: "#14a800",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#14a800",
                    borderWidth: "1px",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#14a800",
                },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&:hover fieldset": {
                    borderColor: "#14a800",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#14a800",
                    borderWidth: "1px",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#14a800",
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1,
                mb: 3,
                py: 1.2,
                fontWeight: 600,
                borderRadius: "24px",
                backgroundColor: "#14a800",
                color: "#ffffff",
                boxShadow: "none",
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  backgroundColor: "#108a00",
                  boxShadow: "none",
                },
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;
