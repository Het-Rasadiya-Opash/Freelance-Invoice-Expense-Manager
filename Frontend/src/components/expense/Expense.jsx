import { Add, Close, Download, FilterList } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import apiRequest from "../../utils/apiRequest";
import CreateExpense from "./CreateExpense";
import GetAllExpense from "./GetAllExpense";

const filterInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#fff",
    "&.Mui-focused fieldset": { borderColor: "#14a800" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#14a800" },
};

const Expense = () => {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterClientId, setFilterClientId] = useState("");
  const [filterProjectId, setFilterProjectId] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

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

  const fetchExpenses = useCallback(async () => {
    try {
      const params = { limit: 100 };
      if (filterCategory) params.category = filterCategory;
      if (filterClientId) params.clientId = filterClientId;
      if (filterProjectId) params.projectId = filterProjectId;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const res = await apiRequest.get("/expenses", { params });
      setExpenses(res.data.data.expenses);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  }, [
    filterCategory,
    filterClientId,
    filterProjectId,
    filterStartDate,
    filterEndDate,
  ]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedExpense(null);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setOpen(true);
  };

  const handleExportCSV = async () => {
    try {
      const params = { limit: 10000 };
      if (filterCategory) params.category = filterCategory;
      if (filterClientId) params.clientId = filterClientId;
      if (filterProjectId) params.projectId = filterProjectId;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const res = await apiRequest.get("/expenses", { params });
      const entries = res.data.data.expenses || [];

      const headers = [
        "Description",
        "Category",
        "Amount",
        "Currency",
        "Date",
        "Project",
        "Client",
        "Billable",
      ];

      const csvContent = [
        headers.join(","),
        ...entries.map((entry) => {
          const row = [
            `"${(entry.description || "").replace(/"/g, '""')}"`,
            `"${(entry.category || "").replace(/"/g, '""')}"`,
            entry.amount || 0,
            `"${entry.currency || "INR"}"`,
            `"${new Date(entry.date).toLocaleDateString()}"`,
            `"${(entry.projectId?.name || "").replace(/"/g, '""')}"`,
            `"${(entry.clientId?.name || entry.clientId?.company || "").replace(/"/g, '""')}"`,
            entry.isBillable ? '"Yes"' : '"No"',
          ];
          return row.join(",");
        }),
      ].join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `expenses_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to export CSV:", error);
      alert("Failed to export CSV");
    }
  };

  const clearFilters = () => {
    setFilterCategory("");
    setFilterClientId("");
    setFilterProjectId("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const hasActiveFilters =
    filterCategory ||
    filterClientId ||
    filterProjectId ||
    filterStartDate ||
    filterEndDate;

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 3,
          gap: 2,
        }}
      >
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
              backgroundColor: "#F0FDF4",
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
            "&:hover": {
              backgroundColor: "#108a00",
            },
          }}
        >
          Add Expense
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
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
            label="Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            size="small"
            sx={{ ...filterInputSx, flex: "1 1 150px", minWidth: 140 }}
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
        </Box>
      </Box>

      <CreateExpense
        open={open}
        handleClose={handleClose}
        expenseToEdit={selectedExpense}
        onRefresh={fetchExpenses}
      />
      <GetAllExpense
        expenses={expenses}
        onEdit={handleEdit}
        onRefresh={fetchExpenses}
      />
    </div>
  );
};

export default Expense;
