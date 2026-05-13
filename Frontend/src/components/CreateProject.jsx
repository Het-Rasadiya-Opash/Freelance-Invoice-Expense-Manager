import React, { useState, useEffect } from "react";
import apiRequest from "../utils/apiRequest";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  Assignment,
  Description,
  Person,
  CurrencyExchange,
  Close as CloseIcon,
} from "@mui/icons-material";

const CreateProject = ({ open, handleClose, projectToEdit, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    clientId: "",
    hourlyRate: "",
    currency: "INR",
    status: "ACTIVE",
  });

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await apiRequest.get("/clients");
        setClients(res.data.data.clients || []);
      } catch (err) {
        console.error("Failed to fetch clients", err);
      }
    };

    if (open) {
      fetchClients();
    }
  }, [open]);

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        name: projectToEdit.name || "",
        description: projectToEdit.description || "",
        clientId: projectToEdit.clientId?._id || projectToEdit.clientId || "",
        hourlyRate: projectToEdit.hourlyRate || "",
        currency: projectToEdit.currency || "INR",
        status: projectToEdit.status || "ACTIVE",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        clientId: "",
        hourlyRate: "",
        currency: "INR",
        status: "ACTIVE",
      });
    }
  }, [projectToEdit, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (projectToEdit) {
        await apiRequest.put(`/projects/${projectToEdit._id}`, formData);
      } else {
        await apiRequest.post("/projects/create", formData);
      }
      onRefresh();
      handleClose();
    } catch (err) {
      const errorData =
        err.response?.data?.message ||
        "Failed to save project. Please try again.";
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

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: 600,
          borderRadius: "8px",
          m: { xs: 1.5, sm: 3 },
          overflowX: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ m: 0, px: { xs: 2.5, sm: 3 }, pt: 3, pb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#14a800" }}>
          {projectToEdit ? "Edit Project" : "Create New Project"}
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
          id="create-project-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            <TextField
              required
              fullWidth
              id="name"
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              sx={textFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Assignment sx={{ color: "#aaa" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              required
              fullWidth
              id="clientId"
              label="Client"
              name="clientId"
              select
              value={formData.clientId}
              onChange={handleChange}
              variant="outlined"
              sx={textFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "#aaa", mr: 1 }} />
                    </InputAdornment>
                  ),
                },
              }}
            >
              {clients.map((client) => (
                <MenuItem key={client._id} value={client._id}>
                  {client.name}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                required
                fullWidth
                id="hourlyRate"
                label="Hourly Rate"
                name="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyExchange sx={{ color: "#aaa" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                id="currency"
                label="Currency"
                name="currency"
                select
                value={formData.currency}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldSx}
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="INR">INR</MenuItem>
              </TextField>
            </Box>

            <TextField
              fullWidth
              id="status"
              label="Status"
              name="status"
              select
              value={formData.status}
              onChange={handleChange}
              variant="outlined"
              sx={textFieldSx}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="ARCHIVED">Archived</MenuItem>
            </TextField>

            <TextField
              fullWidth
              id="description"
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              variant="outlined"
              sx={{
                ...textFieldSx,
                "& .MuiOutlinedInput-root": {
                  ...textFieldSx["& .MuiOutlinedInput-root"],
                  minHeight: 100,
                  alignItems: "flex-start",
                },
              }}
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
          form="create-project-form"
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
            ? projectToEdit
              ? "Updating..."
              : "Creating..."
            : projectToEdit
              ? "Update Project"
              : "Create Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProject;
