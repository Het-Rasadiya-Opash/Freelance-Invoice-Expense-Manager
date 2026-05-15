import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
} from "@mui/material";
import { Add, Search, FilterList, Close, Download } from "@mui/icons-material";
import CreateTimeEntries from "./CreateTimeEntries";
import GetAllTimeEntries from "./GetAllTimeEntries";
import apiRequest from "../../utils/apiRequest";

const filterInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#fff",
    "&.Mui-focused fieldset": { borderColor: "#14a800" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#14a800" },
};

const TimeEntries = () => {
  const [open, setOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterProjectId, setFilterProjectId] = useState("");
  const [filterClientId, setFilterClientId] = useState("");
  const [filterBilled, setFilterBilled] = useState("");
  const [filterRunning, setFilterRunning] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [filteredEntries, setFilteredEntries] = useState([]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          apiRequest.get("/projects"),
          apiRequest.get("/clients"),
        ]);
        setProjects(pRes.data.data || []);
        setClients(cRes.data.data?.clients || []);
      } catch {}
    };
    fetchMeta();
  }, []);

  const fetchTimeEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: 100,
      };
      if (filterProjectId) params.projectId = filterProjectId;
      if (filterClientId) params.clientId = filterClientId;
      if (filterBilled !== "") params.isBilled = filterBilled;
      if (filterRunning !== "") params.isRunning = filterRunning;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const res = await apiRequest.get("/time-entries", { params });
      setTimeEntries(res.data.data?.timeEntries || []);
    } catch (error) {
      console.error("Failed to fetch time entries:", error);
    } finally {
      setLoading(false);
    }
  }, [filterProjectId, filterClientId, filterBilled, filterRunning, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredEntries(timeEntries);
    } else {
      const q = search.toLowerCase();
      setFilteredEntries(
        timeEntries.filter(
          (e) =>
            e.description?.toLowerCase().includes(q) ||
            e.projectId?.name?.toLowerCase().includes(q) ||
            e.clientId?.name?.toLowerCase().includes(q),
        ),
      );
    }
  }, [search, timeEntries]);

  const handleOpen = () => {
    setSelectedEntry(null);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedEntry(null);
  };
  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setOpen(true);
  };

  const handleExportCSV = async () => {
    try {
      const params = {
        limit: 10000,
      };
      if (filterProjectId) params.projectId = filterProjectId;
      if (filterClientId) params.clientId = filterClientId;
      if (filterBilled !== "") params.isBilled = filterBilled;
      if (filterRunning !== "") params.isRunning = filterRunning;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const res = await apiRequest.get("/time-entries", { params });
      const entries = res.data.data?.timeEntries || [];

      const headers = ['Description', 'Project', 'Client', 'Duration (Mins)', 'Start Time', 'End Time', 'Billed'];
      
      const csvContent = [
        headers.join(','),
        ...entries.map(entry => {
          const row = [
            `"${(entry.description || '').replace(/"/g, '""')}"`,
            `"${(entry.projectId?.name || '').replace(/"/g, '""')}"`,
            `"${(entry.clientId?.name || entry.clientId?.company || '').replace(/"/g, '""')}"`,
            entry.durationMinutes || 0,
            `"${new Date(entry.startTime).toLocaleString()}"`,
            entry.endTime ? `"${new Date(entry.endTime).toLocaleString()}"` : '""',
            entry.isBilled ? '"Yes"' : '"No"'
          ];
          return row.join(',');
        })
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `time_entries_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to export CSV:", error);
      alert("Failed to export CSV");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterProjectId("");
    setFilterClientId("");
    setFilterBilled("");
    setFilterRunning("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const hasActiveFilters =
    search ||
    filterProjectId ||
    filterClientId ||
    filterBilled !== "" ||
    filterRunning !== "" ||
    false;

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* <Typography variant="h5" sx={{ fontWeight: 800, color: "#333" }}>
          Time Entries
        </Typography> */}
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExportCSV}
          sx={{
            borderColor: "#14a800",
            color: "#14a800",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            "&:hover": { 
              borderColor: "#108a00",
              backgroundColor: "#F0FDF4"
            },
          }}
        >
          Export CSV
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
          sx={{
            backgroundColor: "#14a800",
            color: "#ffffff",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            "&:hover": { backgroundColor: "#108a00" },
          }}
        >
          Log Time Entry
        </Button>
      </Box>

      <Box
        sx={{
          backgroundColor: "#f9fbf7",
          border: "1px solid #eef2eb",
          borderRadius: "12px",
          p: 2.5,
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <FilterList sx={{ color: "#14a800", fontSize: 20 }} />
          <Typography
            sx={{ fontWeight: 700, color: "#333", fontSize: "0.95rem" }}
          >
            Search & Filter
          </Typography>
          {hasActiveFilters && (
            <Chip
              label="Clear all"
              size="small"
              icon={<Close sx={{ fontSize: "14px !important" }} />}
              onClick={clearFilters}
              sx={{
                ml: "auto",
                backgroundColor: "#fff3e0",
                color: "#e65100",
                fontWeight: 600,
                fontSize: "0.75rem",
                cursor: "pointer",
                "&:hover": { backgroundColor: "#ffe0b2" },
              }}
            />
          )}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <TextField
            placeholder="Search description, project, client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ ...filterInputSx, flex: "1 1 220px", minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#999", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Start Date"
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            size="small"
            sx={{
              ...filterInputSx,
              flex: "1 1 150px",
              minWidth: 140,
              "& input::-webkit-datetime-edit": {
                color: filterStartDate ? "inherit" : "transparent",
              },
              "& input:focus::-webkit-datetime-edit": {
                color: "inherit",
              },
            }}
          />

          <TextField
            label="End Date"
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            size="small"
            sx={{
              ...filterInputSx,
              flex: "1 1 150px",
              minWidth: 140,
              "& input::-webkit-datetime-edit": {
                color: filterEndDate ? "inherit" : "transparent",
              },
              "& input:focus::-webkit-datetime-edit": {
                color: "inherit",
              },
            }}
          />

          <TextField
            select
            label="Project"
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
            size="small"
            sx={{ ...filterInputSx, flex: "1 1 150px", minWidth: 140 }}
          >
            <MenuItem value="">All Projects</MenuItem>
            {projects.map((p) => (
              <MenuItem key={p._id} value={p._id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Client"
            value={filterClientId}
            onChange={(e) => setFilterClientId(e.target.value)}
            size="small"
            sx={{ ...filterInputSx, flex: "1 1 150px", minWidth: 140 }}
          >
            <MenuItem value="">All Clients</MenuItem>
            {clients.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name || c.company}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Billed"
            value={filterBilled}
            onChange={(e) => setFilterBilled(e.target.value)}
            size="small"
            sx={{ ...filterInputSx, flex: "1 1 120px", minWidth: 110 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Billed</MenuItem>
            <MenuItem value="false">Unbilled</MenuItem>
          </TextField>

          <TextField
            select
            label="Status"
            value={filterRunning}
            onChange={(e) => setFilterRunning(e.target.value)}
            size="small"
            sx={{ ...filterInputSx, flex: "1 1 120px", minWidth: 110 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Running</MenuItem>
            <MenuItem value="false">Stopped</MenuItem>
          </TextField>
        </Box>

        {(filterProjectId ||
          filterClientId ||
          filterBilled !== "" ||
          filterRunning !== "") && (
          <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
            {filterProjectId && (
              <Chip
                label={`Project: ${projects.find((p) => p._id === filterProjectId)?.name || "?"}`}
                size="small"
                onDelete={() => setFilterProjectId("")}
                sx={{
                  backgroundColor: "#e8f5e9",
                  color: "#2e7d32",
                  fontWeight: 600,
                }}
              />
            )}
            {filterClientId && (
              <Chip
                label={`Client: ${clients.find((c) => c._id === filterClientId)?.name || "?"}`}
                size="small"
                onDelete={() => setFilterClientId("")}
                sx={{
                  backgroundColor: "#e3f2fd",
                  color: "#1565c0",
                  fontWeight: 600,
                }}
              />
            )}
            {filterBilled !== "" && (
              <Chip
                label={filterBilled === "true" ? "Billed" : "Unbilled"}
                size="small"
                onDelete={() => setFilterBilled("")}
                sx={{
                  backgroundColor: "#fff8e1",
                  color: "#f57f17",
                  fontWeight: 600,
                }}
              />
            )}
            {filterRunning !== "" && (
              <Chip
                label={filterRunning === "true" ? "Running" : "Stopped"}
                size="small"
                onDelete={() => setFilterRunning("")}
                sx={{
                  backgroundColor: "#f3e5f5",
                  color: "#6a1b9a",
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        )}
      </Box>

      <Typography
        variant="body2"
        sx={{ color: "#888", mb: 1, fontSize: "0.82rem" }}
      >
        {filteredEntries.length} entr
        {filteredEntries.length === 1 ? "y" : "ies"} found
      </Typography>

      <CreateTimeEntries
        open={open}
        handleClose={handleClose}
        entryToEdit={selectedEntry}
        onRefresh={fetchTimeEntries}
      />

      <GetAllTimeEntries
        timeEntries={filteredEntries}
        onEdit={handleEdit}
        onRefresh={fetchTimeEntries}
        loading={loading}
      />
    </div>
  );
};

export default TimeEntries;
