import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Timer, EditNote } from "@mui/icons-material";
import apiRequest from "../utils/apiRequest";

const emptyForm = {
  projectId: "",
  description: "",
  isManual: true,
  startTime: "",
  endTime: "",
  durationMinutes: "",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    "&.Mui-focused fieldset": { borderColor: "#14a800" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#14a800" },
};

const CreateTimeEntries = ({ open, handleClose, entryToEdit, onRefresh }) => {
  const [form, setForm] = useState(emptyForm);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await apiRequest.get("/projects");
        setProjects(res.data.data || []);
      } catch {
        setProjects([]);
      }
    };
    if (open) fetchProjects();
  }, [open]);

  useEffect(() => {
    if (entryToEdit) {
      const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 16) : "");
      setForm({
        projectId: entryToEdit.projectId?._id || entryToEdit.projectId || "",
        description: entryToEdit.description || "",
        isManual: entryToEdit.isManual ?? true,
        startTime: fmt(entryToEdit.startTime),
        endTime: fmt(entryToEdit.endTime),
        durationMinutes: entryToEdit.durationMinutes ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [entryToEdit, open]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.projectId) {
      setError("Please select a project.");
      return;
    }
    if (
      form.isManual &&
      !form.durationMinutes &&
      !(form.startTime && form.endTime)
    ) {
      setError("Please provide start & end time or duration (minutes).");
      return;
    }

    const payload = {
      projectId: form.projectId,
      description: form.description,
      isManual: form.isManual,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      durationMinutes: form.durationMinutes
        ? Number(form.durationMinutes)
        : undefined,
      isRunning: false,
    };

    setLoading(true);
    try {
      if (entryToEdit) {
        await apiRequest.put(`/time-entries/${entryToEdit._id}`, payload);
      } else {
        await apiRequest.post("/time-entries/create", payload);
      }
      onRefresh();
      handleClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isEdit = Boolean(entryToEdit);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          pt: 3,
          px: 3,
          fontWeight: 800,
          fontSize: "1.25rem",
          color: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {form.isManual ? (
          <EditNote sx={{ color: "#14a800" }} />
        ) : (
          <Timer sx={{ color: "#14a800" }} />
        )}
        {isEdit ? "Edit Time Entry" : "Log Time Entry"}
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
        <Box
          sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 0.5 }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={form.isManual}
                onChange={handleChange}
                name="isManual"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#14a800" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#14a800",
                  },
                }}
              />
            }
            label={
              <Typography
                sx={{ fontWeight: 600, color: "#333", fontSize: "0.9rem" }}
              >
                {form.isManual ? "Manual Entry" : "Timer Entry"}
              </Typography>
            }
          />

          <TextField
            select
            label="Project *"
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={inputSx}
          >
            {projects.map((p) => (
              <MenuItem key={p._id} value={p._id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
            size="small"
            placeholder="What did you work on?"
            sx={inputSx}
          />

          <TextField
            label="Start Time"
            name="startTime"
            type="datetime-local"
            value={form.startTime}
            onChange={handleChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={inputSx}
          />

          {form.isManual && (
            <TextField
              label="End Time"
              name="endTime"
              type="datetime-local"
              value={form.endTime}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={inputSx}
            />
          )}

          {form.isManual && (
            <TextField
              label="Duration (minutes)"
              name="durationMinutes"
              type="number"
              value={form.durationMinutes}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="e.g. 90"
              inputProps={{ min: 0 }}
              helperText="Calculated automatically from start/end if left blank"
              sx={inputSx}
            />
          )}

          {error && (
            <Typography
              sx={{
                color: "#d32f2f",
                fontSize: "0.85rem",
                backgroundColor: "#fdecea",
                p: 1.5,
                borderRadius: "8px",
              }}
            >
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            borderColor: "#ddd",
            color: "#555",
            fontWeight: 600,
            "&:hover": { borderColor: "#bbb", backgroundColor: "#f9f9f9" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : null
          }
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            backgroundColor: "#14a800",
            color: "#fff",
            fontWeight: 600,
            px: 3,
            "&:hover": { backgroundColor: "#108a00" },
          }}
        >
          {isEdit ? "Save Changes" : "Log Time"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTimeEntries;
