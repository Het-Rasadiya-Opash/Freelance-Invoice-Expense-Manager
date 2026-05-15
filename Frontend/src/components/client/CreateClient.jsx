import {
  Business,
  Close as CloseIcon,
  CurrencyExchange,
  Description,
  Email,
  HomeWork,
  Person,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import apiRequest from "../../utils/apiRequest";

const CreateClient = ({ open, handleClose, clientToEdit, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    defaultCurrency: "USD",
    notes: "",
  });

  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        name: clientToEdit.name || "",
        email: clientToEdit.email || "",
        company: clientToEdit.company || "",
        billingAddress: {
          street: clientToEdit.billingAddress?.street || "",
          city: clientToEdit.billingAddress?.city || "",
          state: clientToEdit.billingAddress?.state || "",
          zip: clientToEdit.billingAddress?.zip || "",
          country: clientToEdit.billingAddress?.country || "",
        },
        defaultCurrency: clientToEdit.defaultCurrency || "USD",
        notes: clientToEdit.notes || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        company: "",
        billingAddress: {
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "",
        },
        defaultCurrency: "USD",
        notes: "",
      });
    }
  }, [clientToEdit, open]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setFormData({
      ...formData,
      billingAddress: {
        ...formData.billingAddress,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (clientToEdit) {
        await apiRequest.put(`/clients/${clientToEdit._id}`, formData);
      } else {
        await apiRequest.post("/clients/create", formData);
      }
      onRefresh();
      handleClose();
    } catch (err) {
      const errorData =
        err.response?.data?.message ||
        "Failed to save client. Please try again.";
      setError(errorData);
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setError(null);
    handleClose();
  };

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      minHeight: 62,
      backgroundColor: "#fff",
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
    "& .MuiInputBase-input": {
      fontSize: 16,
    },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": {
      fontSize: 24,
    },
  };

  const notesFieldSx = {
    ...textFieldSx,
    "& .MuiOutlinedInput-root": {
      ...textFieldSx["& .MuiOutlinedInput-root"],
      minHeight: 116,
      alignItems: "flex-start",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: 960,
          borderRadius: "8px",
          m: { xs: 1.5, sm: 3 },
          overflowX: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ m: 0, px: { xs: 2.5, sm: 3 }, pt: 3, pb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#14a800" }}>
          {clientToEdit ? "Edit Client" : "Create New Client"}
        </Typography>

        <IconButton
          aria-label="close"
          onClick={closeDialog}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          px: { xs: 2.5, sm: 3 },
          pt: "28px !important",
          pb: 1,
          overflowX: "visible",
        }}
      >
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
          id="create-client-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              columnGap: 2,
              rowGap: 2.5,
              alignItems: "start",
            }}
          >
            <TextField
              required
              fullWidth
              id="name"
              label="Client Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              sx={textFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "#aaa" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              required
              fullWidth
              id="email"
              label="Client Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              sx={textFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#aaa" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              id="company"
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              variant="outlined"
              sx={textFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: "#aaa" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box
              sx={{
                display: "block",
                gridColumn: { xs: "auto", sm: "1 / -1" },
                mt: 0.5,
                maxWidth: { sm: 160 },
              }}
            >
              <TextField
                fullWidth
                id="defaultCurrency"
                label="Default Currency"
                name="defaultCurrency"
                select
                value={formData.defaultCurrency}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyExchange sx={{ color: "#aaa", mr: 1 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="INR">INR</MenuItem>
              </TextField>
            </Box>

            <Box sx={{ gridColumn: "1 / -1", mt: -0.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "#666",
                  fontSize: 16,
                  lineHeight: 1.2,
                }}
              >
                Billing Address
              </Typography>
            </Box>

            <TextField
              fullWidth
              id="street"
              label="Street Address"
              name="street"
              value={formData.billingAddress.street}
              onChange={handleAddressChange}
              variant="outlined"
              sx={textFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeWork sx={{ color: "#aaa" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              id="city"
              label="City"
              name="city"
              value={formData.billingAddress.city}
              onChange={handleAddressChange}
              variant="outlined"
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              id="state"
              label="State"
              name="state"
              value={formData.billingAddress.state}
              onChange={handleAddressChange}
              variant="outlined"
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              id="zip"
              label="ZIP / Postal Code"
              name="zip"
              value={formData.billingAddress.zip}
              onChange={handleAddressChange}
              variant="outlined"
              sx={textFieldSx}
            />
            <TextField
              fullWidth
              id="country"
              label="Country"
              name="country"
              value={formData.billingAddress.country}
              onChange={handleAddressChange}
              variant="outlined"
              sx={textFieldSx}
            />

            <Box sx={{ maxWidth: { md: 266 } }}>
              <TextField
                fullWidth
                id="notes"
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                variant="outlined"
                sx={notesFieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        style={{ alignItems: "flex-start", marginTop: "8px" }}
                      >
                        <Description sx={{ color: "#aaa" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3 },
          pt: 2,
          pb: 3,
          gap: 1,
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={closeDialog}
          variant="outlined"
          sx={{
            minWidth: 90,
            borderRadius: "24px",
            textTransform: "none",
            fontWeight: 700,
            borderColor: "#ccc",
            color: "#666",
            "&:hover": {
              borderColor: "#aaa",
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-client-form"
          variant="contained"
          disabled={loading}
          sx={{
            minWidth: 140,
            borderRadius: "24px",
            textTransform: "none",
            fontWeight: 800,
            backgroundColor: "#14a800",
            color: "#ffffff",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#108a00",
              boxShadow: "none",
            },
          }}
        >
          {loading
            ? clientToEdit
              ? "Updating..."
              : "Creating..."
            : clientToEdit
              ? "Update Client"
              : "Create Client"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateClient;
