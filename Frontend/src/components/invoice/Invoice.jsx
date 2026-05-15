import { Add, Close, Download, FilterList } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import apiRequest from "../../utils/apiRequest";
import CreateInvoice from "./CreateInvoice";
import GetAllInvoices from "./GetAllInvoices";

const filterInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#fff",
    "&.Mui-focused fieldset": { borderColor: "#14a800" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#14a800" },
};

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("");
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

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filterStatus) params.status = filterStatus;
      if (filterClientId) params.clientId = filterClientId;
      if (filterProjectId) params.projectId = filterProjectId;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const res = await apiRequest.get("/invoices", { params });
      setInvoices(res.data.data.invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [
    filterStatus,
    filterClientId,
    filterProjectId,
    filterStartDate,
    filterEndDate,
  ]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedInvoice(null);
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setOpen(true);
  };

  const handleExportCSV = async () => {
    try {
      const params = { limit: 10000 };
      if (filterStatus) params.status = filterStatus;
      if (filterClientId) params.clientId = filterClientId;
      if (filterProjectId) params.projectId = filterProjectId;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const res = await apiRequest.get("/invoices", { params });
      const entries = res.data.data.invoices || [];

      const headers = [
        "Invoice #",
        "Client",
        "Project",
        "Issue Date",
        "Due Date",
        "Amount",
        "Status",
      ];

      const csvContent = [
        headers.join(","),
        ...entries.map((entry) => {
          const row = [
            `"${(entry.invoiceNumber || "").replace(/"/g, '""')}"`,
            `"${(entry.clientId?.name || entry.clientId?.company || "").replace(/"/g, '""')}"`,
            `"${(entry.projectId?.name || "").replace(/"/g, '""')}"`,
            entry.issueDate
              ? `"${new Date(entry.issueDate).toLocaleDateString()}"`
              : '""',
            entry.dueDate
              ? `"${new Date(entry.dueDate).toLocaleDateString()}"`
              : '""',
            entry.total || 0,
            `"${entry.status || "DRAFT"}"`,
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
        `invoices_${new Date().toISOString().slice(0, 10)}.csv`,
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
    setFilterStatus("");
    setFilterClientId("");
    setFilterProjectId("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const hasActiveFilters =
    filterStatus ||
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
          Generate Invoice
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
            select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            size="small"
            sx={{ ...filterInputSx, flex: "1 1 120px", minWidth: 110 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="SENT">Sent</MenuItem>
            <MenuItem value="PAID">Paid</MenuItem>
            <MenuItem value="OVERDUE">Overdue</MenuItem>
          </TextField>

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

      <CreateInvoice
        open={open}
        handleClose={handleClose}
        invoiceToEdit={selectedInvoice}
        onRefresh={fetchInvoices}
      />

      <GetAllInvoices
        invoices={invoices}
        loading={loading}
        fetchInvoices={fetchInvoices}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default Invoice;
