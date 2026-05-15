import {
  Add as AddIcon,
  Business,
  CalendarToday,
  Close as CloseIcon,
  CurrencyExchange,
  Delete as DeleteIcon,
  Description,
  Person,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import apiRequest from "../../utils/apiRequest";

const CreateInvoice = ({ open, handleClose, invoiceToEdit, onRefresh }) => {
  const [formData, setFormData] = useState({
    clientId: "",
    projectId: "",
    dueDate: "",
    currency: "INR",
    status: "DRAFT",
    notes: "",
    terms: "",
    lineItems: [{ description: "", type: "FLAT", quantity: 1, unitPrice: 0 }],
    fxSnapshot: {
      baseCurrency: "USD",
      targetCurrency: "INR",
      rate: 83.5,
      snapshotAt: new Date().toISOString(),
    },
  });

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsRes = await apiRequest.get("/clients");
        setClients(clientsRes.data.data.clients || []);

        try {
          const projectsRes = await apiRequest.get("/projects");
          setProjects(projectsRes.data.data || []);
        } catch (err) {
          console.error("Failed to fetch projects:", err);
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      }
    };
    
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (invoiceToEdit) {
      setFormData({
        clientId: invoiceToEdit.clientId?._id || invoiceToEdit.clientId || "",
        projectId:
          invoiceToEdit.projectId?._id || invoiceToEdit.projectId || "",
        dueDate: invoiceToEdit.dueDate
          ? invoiceToEdit.dueDate.substring(0, 10)
          : "",
        currency: invoiceToEdit.currency || "INR",
        status: invoiceToEdit.status || "DRAFT",
        notes: invoiceToEdit.notes || "",
        terms: invoiceToEdit.terms || "",
        lineItems: invoiceToEdit.lineItems || [
          { description: "", type: "FLAT", quantity: 1, unitPrice: 0 },
        ],
        fxSnapshot: invoiceToEdit.fxSnapshot || {
          baseCurrency: "USD",
          targetCurrency: "INR",
          rate: 83.5,
          snapshotAt: new Date().toISOString(),
        },
      });
    } else {
      setFormData({
        clientId: "",
        projectId: "",
        dueDate: "",
        currency: "INR",
        status: "DRAFT",
        notes: "",
        terms: "",
        lineItems: [
          { description: "", type: "FLAT", quantity: 1, unitPrice: 0 },
        ],
        fxSnapshot: {
          baseCurrency: "USD",
          targetCurrency: "INR",
          rate: 83.5,
          snapshotAt: new Date().toISOString(),
        },
      });
    }
  }, [invoiceToEdit, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "clientId") {
      setFormData({ ...formData, [name]: value, projectId: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFxSnapshotChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      fxSnapshot: {
        ...formData.fxSnapshot,
        [name]: name === "rate" ? parseFloat(value) : value,
      },
    });
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedLineItems = [...formData.lineItems];
    updatedLineItems[index][field] = value;
    setFormData({ ...formData, lineItems: updatedLineItems });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        { description: "", type: "FLAT", quantity: 1, unitPrice: 0 },
      ],
    });
  };

  const removeLineItem = (index) => {
    const updatedLineItems = formData.lineItems.filter((_, i) => i !== index);
    setFormData({ ...formData, lineItems: updatedLineItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const invalidLineItem = formData.lineItems.find(
      (item) => !item.description || item.quantity <= 0 || item.unitPrice < 0,
    );
    if (invalidLineItem) {
      setError(
        "Please fill all line item descriptions and ensure valid quantities and prices.",
      );
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      fxSnapshot: {
        ...formData.fxSnapshot,
        snapshotAt: formData.fxSnapshot.snapshotAt
          ? new Date(formData.fxSnapshot.snapshotAt).toISOString()
          : null,
      },
    };

    try {
      if (invoiceToEdit) {
        await apiRequest.put(`/invoices/${invoiceToEdit._id}`, payload);
      } else {
        await apiRequest.post("/invoices/create", payload);
      }
      onRefresh();
      handleClose();
    } catch (err) {
      const errorData =
        err.response?.data?.message ||
        "Failed to save invoice. Please try again.";
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
  };

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#14a800" }}>
          {invoiceToEdit ? "Edit Invoice" : "Generate New Invoice"}
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

      <DialogContent sx={{ p: 3, pt: "24px !important" }}>
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
          id="create-invoice-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              columnGap: 2,
              rowGap: 2.5,
              alignItems: "start",
            }}
          >
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
                  {client.name} {client.company ? `(${client.company})` : ""}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              id="projectId"
              label="Project (Optional)"
              name="projectId"
              select
              value={formData.projectId}
              onChange={handleChange}
              variant="outlined"
              sx={textFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: "#aaa", mr: 1 }} />
                    </InputAdornment>
                  ),
                },
              }}
            >
              <MenuItem value="">None</MenuItem>
              {projects
                .filter((project) => {
                  const projClientId = project.clientId?._id || project.clientId;
                  return projClientId === formData.clientId;
                })
                .map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
            </TextField>

            <TextField
              required
              fullWidth
              id="dueDate"
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              variant="outlined"
              sx={textFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday sx={{ color: "#aaa", mr: 1 }} />
                    </InputAdornment>
                  ),
                },
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              required
              fullWidth
              id="currency"
              label="Currency"
              name="currency"
              select
              value={formData.currency}
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

            <TextField
              required
              fullWidth
              id="status"
              label="Status"
              name="status"
              select
              value={formData.status}
              onChange={handleChange}
              variant="outlined"
              sx={textFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description sx={{ color: "#aaa", mr: 1 }} />
                    </InputAdornment>
                  ),
                },
              }}
            >
              <MenuItem value="DRAFT">DRAFT</MenuItem>
              <MenuItem value="SENT">SENT</MenuItem>
              <MenuItem value="PAID">PAID</MenuItem>
              <MenuItem value="OVERDUE">OVERDUE</MenuItem>
            </TextField>

            <Box sx={{ gridColumn: "1 / -1", mt: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1, color: "#666" }}
              >
                FX Snapshot
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Base Currency"
                    name="baseCurrency"
                    value={formData.fxSnapshot.baseCurrency}
                    onChange={handleFxSnapshotChange}
                    variant="outlined"
                    size="small"
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Target Currency"
                    name="targetCurrency"
                    value={formData.fxSnapshot.targetCurrency}
                    onChange={handleFxSnapshotChange}
                    variant="outlined"
                    size="small"
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Rate"
                    name="rate"
                    type="number"
                    value={formData.fxSnapshot.rate}
                    onChange={handleFxSnapshotChange}
                    variant="outlined"
                    size="small"
                    sx={textFieldSx}
                  />
                </Grid>
                
              </Grid>
            </Box>

            <Box sx={{ gridColumn: "1 / -1", mt: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1, color: "#666" }}
              >
                Line Items
              </Typography>

              {formData.lineItems.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "2fr 1fr 1fr 1fr auto",
                    },
                    gap: 2,
                    mb: 2,
                    alignItems: "center",
                  }}
                >
                  <TextField
                    required
                    fullWidth
                    label="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleLineItemChange(index, "description", e.target.value)
                    }
                    variant="outlined"
                    size="small"
                    sx={textFieldSx}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Type"
                    select
                    value={item.type || "FLAT"}
                    onChange={(e) =>
                      handleLineItemChange(index, "type", e.target.value)
                    }
                    variant="outlined"
                    size="small"
                    sx={textFieldSx}
                  >
                    <MenuItem value="FLAT">FLAT</MenuItem>
                    <MenuItem value="TIME">TIME</MenuItem>
                  </TextField>
                  <TextField
                    required
                    fullWidth
                    label="Qty"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleLineItemChange(
                        index,
                        "quantity",
                        parseFloat(e.target.value),
                      )
                    }
                    variant="outlined"
                    size="small"
                    sx={textFieldSx}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Unit Price"
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleLineItemChange(
                        index,
                        "unitPrice",
                        parseFloat(e.target.value),
                      )
                    }
                    variant="outlined"
                    size="small"
                    sx={textFieldSx}
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeLineItem(index)}
                    disabled={formData.lineItems.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addLineItem}
                sx={{
                  mt: 1,
                  borderRadius: "8px",
                  textTransform: "none",
                  borderColor: "#14a800",
                  color: "#14a800",
                  "&:hover": {
                    borderColor: "#108a00",
                    backgroundColor: "#F0FDF4",
                  },
                }}
              >
                Add Line Item
              </Button>
            </Box>

            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                fullWidth
                id="notes"
                label="Notes (Optional)"
                name="notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldSx}
              />
            </Box>

            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                fullWidth
                id="terms"
                label="Terms (Optional)"
                name="terms"
                multiline
                rows={2}
                value={formData.terms}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldSx}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
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
          form="create-invoice-form"
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
            ? invoiceToEdit
              ? "Updating..."
              : "Creating..."
            : invoiceToEdit
              ? "Update Invoice"
              : "Create Invoice"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateInvoice;
