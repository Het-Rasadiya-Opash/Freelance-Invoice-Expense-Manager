import {
  ArrowForward,
  CloudUpload,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Paper,
  TextField,
  Typography,
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

const currencies = [
  { value: "USD", label: "$ (USD)" },
  { value: "EUR", label: "EUR (EUR)" },
  { value: "GBP", label: "GBP (GBP)" },
  { value: "INR", label: "INR (INR)" },
  { value: "JPY", label: "JPY (JPY)" },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    brandName: "",
    defaultCurrency: "USD",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.users);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleRegister = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      if (formData.brandName) data.append("brandName", formData.brandName);
      if (formData.defaultCurrency) {
        data.append("defaultCurrency", formData.defaultCurrency);
      }
      if (logoFile) {
        data.append("logoUrl", logoFile);
      }

      const res = await apiRequest.post("/users/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(setCurrentUser(res.data.data.user));
      navigate("/");
    } catch (err) {
      const errorData =
        err.response?.data?.message || "Registration failed. Please try again.";
      dispatch(setError(errorData));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const labelSx = {
    display: "block",
    mb: 0.75,
    color: "#5a665e",
    fontSize: "0.84rem",
    fontWeight: 700,
    lineHeight: 1.2,
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: "#ffffff",
      color: "#334138",
      fontSize: "0.86rem",
      "& fieldset": {
        borderColor: "#dce4db",
      },
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
    "& .MuiInputBase-input::placeholder": {
      color: "#b4bfb4",
      opacity: 1,
    },
    "& .MuiSelect-icon": {
      color: "#89968c",
      fontSize: 21,
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        py: { xs: 3, sm: 5 },
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ px: { xs: 0, sm: 2 } }}>
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
            Create your account
          </Typography>

          {error && (
            <Typography
              color="error"
              variant="body2"
              sx={{
                mb: 2,
                width: "100%",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              {error}
            </Typography>
          )}

          <Box
            component="form"
            onSubmit={handleRegister}
            noValidate
            sx={{ width: "100%" }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                columnGap: 2,
                rowGap: 2,
              }}
            >
              <Box>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  variant="outlined"
                  sx={fieldSx}
                />
              </Box>

              <Box>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  sx={fieldSx}
                />
              </Box>

              <Box sx={{ gridColumn: "1 / -1" }}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    ...fieldSx,
                    "& .MuiIconButton-root": {
                      color: "#b8c9b5",
                      mr: -0.25,
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
              </Box>

              <Box>
                <TextField
                  fullWidth
                  name="brandName"
                  label="Brand Name (Optional)"
                  id="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  variant="outlined"
                  sx={fieldSx}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  select
                  name="defaultCurrency"
                  label="Default Currency"
                  id="defaultCurrency"
                  value={formData.defaultCurrency}
                  onChange={handleChange}
                  variant="outlined"
                  sx={fieldSx}
                >
                  {currencies.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography component="span" sx={labelSx}>
                  Brand Logo (Optional)
                </Typography>
                <Box
                  component="label"
                  sx={{
                    display: "flex",
                    minHeight: 128,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    p: 2,
                    border: "2px dashed #e0e0e0",
                    borderRadius: "8px",
                    backgroundColor: "#fafafa",
                    cursor: "pointer",
                    textAlign: "center",
                    transition:
                      "border-color 160ms ease, background-color 160ms ease",
                    "&:hover": {
                      borderColor: "#14a800",
                      backgroundColor: "#f7fcf1",
                    },
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {logoPreview ? (
                    <Avatar
                      src={logoPreview}
                      sx={{ width: 44, height: 44, borderRadius: "8px" }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        backgroundColor: "#e8f5e9",
                      }}
                    >
                      <CloudUpload sx={{ fontSize: 24, color: "#14a800" }} />
                    </Box>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#6b786d",
                      fontSize: "0.84rem",
                      fontWeight: 700,
                    }}
                  >
                    {logoFile ? logoFile.name : "Upload Brand Logo (Optional)"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#8c998f", fontWeight: 600 }}
                  >
                    PNG, JPG up to 5MB
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              endIcon={!loading && <ArrowForward fontSize="small" />}
              sx={{
                mt: 3,
                mb: 2,
                minHeight: 46,
                fontWeight: 600,
                borderRadius: "24px",
                backgroundColor: "#14a800",
                color: "#ffffff",
                boxShadow: "none",
                textTransform: "none",
                fontSize: "0.92rem",
                "&:hover": {
                  backgroundColor: "#108a00",
                  boxShadow: "none",
                },
              }}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
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
                  fontSize: "0.88rem",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Already have an account? Log In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
