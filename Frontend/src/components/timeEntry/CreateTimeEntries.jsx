import {
  AccessTime,
  Assignment,
  Close as CloseIcon,
  Description,
  EditNote,
  Stop,
  Timer,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import apiRequest from "../../utils/apiRequest";

const toLocalDatetimeValue = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
};

const calcDurationMinutes = (start, end) => {
  if (!start || !end) return 0;
  const ms = new Date(end) - new Date(start);
  return ms > 0 ? Math.round(ms / 60000) : 0;
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    minHeight: 56,
    backgroundColor: "#fff",
    "&:hover fieldset": { borderColor: "#14a800" },
    "&.Mui-focused fieldset": { borderColor: "#14a800", borderWidth: "1px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#14a800" },
  "& .MuiInputBase-input": { fontSize: 15 },
};

const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: "#14a800" },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#14a800",
  },
};

const defaultForm = () => ({
  projectId: "",
  description: "",
  isManual: false,
  isRunning: true,
  startTime: "",
  endTime: "",
  durationMinutes: "",
});

const CreateTimeEntries = ({ open, handleClose, entryToEdit, onRefresh }) => {
  const [formData, setFormData] = useState(defaultForm());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await apiRequest.get("/projects");
        setProjects(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    if (open) fetchProjects();
  }, [open]);

  useEffect(() => {
    if (entryToEdit) {
      setFormData({
        projectId: entryToEdit.projectId?._id || entryToEdit.projectId || "",
        description: entryToEdit.description || "",
        isManual: entryToEdit.isManual || false,
        isRunning: entryToEdit.isRunning || false,
        startTime: entryToEdit.startTime
          ? toLocalDatetimeValue(entryToEdit.startTime)
          : "",
        endTime: entryToEdit.endTime
          ? toLocalDatetimeValue(entryToEdit.endTime)
          : "",
        durationMinutes:
          entryToEdit.durationMinutes !== undefined
            ? String(entryToEdit.durationMinutes)
            : "",
        isBilled: entryToEdit.isBilled || false,
      });
    } else {
      setFormData(defaultForm());
    }
    setError(null);
    setSuccess(null);
  }, [entryToEdit, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "isRunning" && checked) updated.isManual = false;
      if (name === "isManual" && checked) updated.isRunning = false;

      return updated;
    });
  };

  const buildPayload = () => {
    const {
      projectId,
      description,
      isManual,
      isRunning,
      startTime,
      endTime,
      durationMinutes,
      isBilled,
    } = formData;

    const payload = {
      projectId,
      description,
      isManual,
      isRunning,
      isBilled,
    };

    if (isRunning) {
      payload.startTime = startTime || undefined;
      payload.endTime = null;
      payload.durationMinutes = 0;
    } else if (isManual) {
      payload.startTime = startTime || undefined;
      payload.endTime = endTime || undefined;
      if (durationMinutes !== "" && durationMinutes !== undefined) {
        payload.durationMinutes = Number(durationMinutes);
      }
    } else {
      payload.startTime = startTime || undefined;
      payload.endTime = endTime || undefined;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (entryToEdit) {
        await apiRequest.put(
          `/time-entries/${entryToEdit._id}`,
          buildPayload(),
        );
        setSuccess("Time entry updated successfully.");
      } else {
        await apiRequest.post("/time-entries/create", buildPayload());
        setSuccess(
          formData.isRunning
            ? "Timer started! Click Stop when done."
            : "Time entry created successfully.",
        );
      }
      onRefresh();
      closeDialog();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save time entry. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!entryToEdit?._id) return;
    setStopping(true);
    setError(null);
    setSuccess(null);
    try {
      await apiRequest.patch(`/time-entries/${entryToEdit._id}/stop`);
      setSuccess("Timer stopped successfully.");
      onRefresh();
      setTimeout(() => closeDialog(), 800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to stop timer. Please try again.",
      );
    } finally {
      setStopping(false);
    }
  };

  const closeDialog = () => {
    setError(null);
    setSuccess(null);
    handleClose();
  };

  const isEditing = Boolean(entryToEdit);
  const showStop = isEditing && entryToEdit?.isRunning;
  const showEndTime =
    formData.isManual || (!formData.isRunning && !formData.isManual);
  const showDuration = formData.isManual;

  const liveDuration =
    showEndTime &&
    formData.startTime &&
    formData.endTime &&
    !formData.durationMinutes
      ? calcDurationMinutes(formData.startTime, formData.endTime)
      : null;

  const modeLabel = formData.isRunning
    ? "Timer Mode — Start now and stop later"
    : formData.isManual
      ? "Manual Mode — Enter times and duration"
      : "Quick Log — Both start & end required";

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: 560,
          borderRadius: "12px",
          m: { xs: 1.5, sm: 3 },
          overflowX: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ m: 0, px: { xs: 2.5, sm: 3 }, pt: 3, pb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <AccessTime sx={{ color: "#14a800", fontSize: 26 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#14a800" }}>
            {isEditing ? "Edit Time Entry" : "Log Time Entry"}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={closeDialog}
          sx={{ position: "absolute", right: 14, top: 14, color: "#aaa" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box
        sx={{
          mx: { xs: 2.5, sm: 3 },
          mb: 1,
          px: 2,
          py: 0.8,
          borderRadius: "8px",
          backgroundColor: formData.isRunning
            ? "#e8f5e9"
            : formData.isManual
              ? "#e3f2fd"
              : "#fff8e1",
          border: `1px solid ${
            formData.isRunning
              ? "#a5d6a7"
              : formData.isManual
                ? "#90caf9"
                : "#ffe082"
          }`,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {formData.isRunning ? (
          <Timer sx={{ color: "#388e3c", fontSize: 18 }} />
        ) : formData.isManual ? (
          <EditNote sx={{ color: "#1565c0", fontSize: 18 }} />
        ) : (
          <AccessTime sx={{ color: "#f57f17", fontSize: 18 }} />
        )}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: formData.isRunning
              ? "#2e7d32"
              : formData.isManual
                ? "#1565c0"
                : "#e65100",
          }}
        >
          {modeLabel}
        </Typography>
      </Box>

      <DialogContent
        sx={{ px: { xs: 2.5, sm: 3 }, pt: "20px !important", pb: 1 }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: "8px" }}>
            {success}
          </Alert>
        )}

        <Box
          component="form"
          id="create-time-entry-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                p: 1.5,
                borderRadius: "8px",
                backgroundColor: "#f9fbf7",
                border: "1px solid #eef2eb",
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    name="isRunning"
                    checked={formData.isRunning}
                    onChange={handleChange}
                    sx={switchSx}
                  />
                }
                label={
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 600, color: "#333" }}
                  >
                    Running Timer
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    name="isManual"
                    checked={formData.isManual}
                    onChange={handleChange}
                    sx={switchSx}
                  />
                }
                label={
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 600, color: "#333" }}
                  >
                    Manual Entry
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    name="isBilled"
                    checked={formData.isBilled}
                    onChange={handleChange}
                    sx={switchSx}
                  />
                }
                label={
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 600, color: "#333" }}
                  >
                    {formData.isBilled ? "Billed" : "Unbilled"}
                  </Typography>
                }
              />
            </Box>

            <Divider sx={{ borderColor: "#eee" }} />

            <TextField
              required
              fullWidth
              select
              id="projectId"
              label="Project"
              name="projectId"
              value={formData.projectId}
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
            >
              {projects.length === 0 && (
                <MenuItem disabled value="">
                  No projects found
                </MenuItem>
              )}
              {projects.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              id="description"
              label="Description"
              name="description"
              multiline
              rows={2}
              value={formData.description}
              onChange={handleChange}
              variant="outlined"
              placeholder="What are you working on?"
              sx={{
                ...textFieldSx,
                "& .MuiOutlinedInput-root": {
                  ...textFieldSx["& .MuiOutlinedInput-root"],
                  minHeight: 76,
                  alignItems: "flex-start",
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      style={{ alignItems: "flex-start", marginTop: "10px" }}
                    >
                      <Description sx={{ color: "#aaa" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              id="startTime"
              label="Start Time"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleChange}
              variant="outlined"
              sx={textFieldSx}
              helperText="Leave blank to use current date & time"
              slotProps={{ inputLabel: { shrink: true } }}
            />

            {showEndTime && (
              <TextField
                fullWidth
                id="endTime"
                label="End Time"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldSx}
                required={!formData.isManual}
                helperText={
                  !formData.isManual
                    ? "Required for quick log"
                    : "Required for manual entry"
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}

            {showDuration && (
              <TextField
                fullWidth
                id="durationMinutes"
                label="Duration (minutes)"
                name="durationMinutes"
                type="number"
                value={formData.durationMinutes}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldSx}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Timer sx={{ color: "#aaa" }} />
                      </InputAdornment>
                    ),
                    inputProps: { min: 0 },
                  },
                }}
                helperText={
                  liveDuration !== null
                    ? `Auto-calculated from times: ${liveDuration} min`
                    : "Optional — calculated automatically if left blank"
                }
              />
            )}

            {!formData.isManual &&
              !formData.isRunning &&
              liveDuration !== null && (
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: "8px",
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <Typography
                    sx={{ fontSize: 13, color: "#166534", fontWeight: 600 }}
                  >
                    ⏱ Calculated Duration: {liveDuration} minutes
                  </Typography>
                </Box>
              )}
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
          flexWrap: "wrap",
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
            "&:hover": { borderColor: "#aaa", backgroundColor: "#f5f5f5" },
          }}
        >
          Cancel
        </Button>

        {showStop && (
          <Button
            onClick={handleStop}
            variant="contained"
            disabled={stopping}
            startIcon={<Stop />}
            sx={{
              minWidth: 130,
              borderRadius: "24px",
              textTransform: "none",
              fontWeight: 800,
              backgroundColor: "#d32f2f",
              color: "#fff",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#b71c1c", boxShadow: "none" },
            }}
          >
            {stopping ? "Stopping…" : "Stop Timer"}
          </Button>
        )}

        <Button
          type="submit"
          form="create-time-entry-form"
          variant="contained"
          disabled={loading}
          startIcon={formData.isRunning ? <Timer /> : null}
          sx={{
            minWidth: 150,
            borderRadius: "24px",
            textTransform: "none",
            fontWeight: 800,
            backgroundColor: "#14a800",
            color: "#fff",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#108a00", boxShadow: "none" },
          }}
        >
          {loading
            ? isEditing
              ? "Updating…"
              : "Saving…"
            : isEditing
              ? "Update Entry"
              : formData.isRunning
                ? "Start Timer"
                : "Save Entry"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTimeEntries;
