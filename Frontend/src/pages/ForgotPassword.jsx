import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router";
import apiRequest from "../utils/apiRequest";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await apiRequest.post("/users/forgot-password", { email });
      setMessage(res.data.message || "Reset link sent to your email.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send reset link. Try again.",
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
            Reset your password
          </Typography>

          {message && (
            <Typography
              color="primary"
              variant="body2"
              sx={{
                mb: 2,
                width: "100%",
                textAlign: "center",
                color: "#14a800",
              }}
            >
              {message}
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{
                  color: "#14a800",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Back to Login
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
