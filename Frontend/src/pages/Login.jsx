import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router";
import {
  clearError,
  setCurrentUser,
  setError,
  setLoading,
} from "../features/usersSlice";
import apiRequest from "../utils/apiRequest";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { loading, error, currentUser } = useSelector((state) => state.users);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const res = await apiRequest.post("/users/login", formData);
      dispatch(setCurrentUser(res.data.data.user));
      navigate("/");
    } catch (err) {
      const errorData =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      dispatch(setError(errorData));
    } finally {
      dispatch(setLoading(false));
    }
  };
  const handleClickShowPassword = () => setShowPassword(!showPassword);

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
            Log in to Freelance Manager
          </Typography>

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
            onSubmit={handleLogin}
            noValidate
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Username or Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
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
              {loading ? "Logging In..." : "Log In"}
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
                to="/register"
                variant="body2"
                sx={{
                  color: "#14a800",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Don't have an account? Sign Up
              </Link>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{
                  color: "#14a800",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot password?
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
