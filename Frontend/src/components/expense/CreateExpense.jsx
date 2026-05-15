import {
  AttachMoney,
  Category,
  Close as CloseIcon,
  CloudUpload,
  DateRange,
  Description,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import apiRequest from "../../utils/apiRequest";

const EXPENSE_CATEGORIES = [
  "SOFTWARE",
  "HARDWARE",
  "TRAVEL",
  "MEALS",
  "OFFICE",
  "MARKETING",
  "UTILITIES",
  "SUBCONTRACTOR",
  "OTHER",
];

const CreateExpense = ({ open, handleClose, expenseToEdit, onRefresh }) => {
  const [formData, setFormData] = useState({
    description: "",
    category: "OTHER",
    amount: "",
    currency: "INR",
    date: new Date().toISOString().split("T")[0],
    isBillable: false,
    notes: "",
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        description: expenseToEdit.description || "",
        category: expenseToEdit.category || "OTHER",
        amount: expenseToEdit.amount || "",
        currency: expenseToEdit.currency || "INR",
        date: expenseToEdit.date
          ? new Date(expenseToEdit.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        isBillable: expenseToEdit.isBillable || false,
        notes: expenseToEdit.notes || "",
      });
      setReceiptFile(null); 
    } else {
      setFormData({
        description: "",
        category: "OTHER",
        amount: "",
        currency: "INR",
        date: new Date().toISOString().split("T")[0],
        isBillable: false,
        notes: "",
      });
      setReceiptFile(null);
    }
  }, [expenseToEdit, open]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("amount", formData.amount);
    data.append("currency", formData.currency);
    data.append("date", formData.date);
    data.append("isBillable", formData.isBillable);
    data.append("notes", formData.notes);
    if (receiptFile) {
      data.append("receipt", receiptFile);
    }

    try {
      if (expenseToEdit) {
        await apiRequest.put(`/expenses/${expenseToEdit._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await apiRequest.post("/expenses/create", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onRefresh();
      handleClose();
    } catch (err) {
      const errorData =
        err.response?.data?.message ||
        "Failed to save expense. Please try again.";
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
  };

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
          overflowX: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#14a800" }}>
          {expenseToEdit ? "Edit Expense" : "Add New Expense"}
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
      <DialogContent sx={{ p: 3, pt: "10px !important" }}>
        {error && (
          <Typography
            color="error"
            variant="body2"
            sx={{ mb: 2, textAlign: "center" }}
          >
            {error}
          </Typography>
        )}

        <Box
          component="form"
          id="create-expense-form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <TextField
            required
            fullWidth
            id="description"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            variant="outlined"
            sx={textFieldSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Description sx={{ color: "#aaa" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              required
              fullWidth
              id="amount"
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              variant="outlined"
              sx={textFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney sx={{ color: "#aaa" }} />
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
              sx={{ ...textFieldSx, minWidth: 120 }}
            >
              <MenuItem value="INR">INR</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
            </TextField>
          </Box>

          <TextField
            required
            fullWidth
            id="category"
            label="Category"
            name="category"
            select
            value={formData.category}
            onChange={handleChange}
            variant="outlined"
            sx={textFieldSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Category sx={{ color: "#aaa", mr: 1 }} />
                  </InputAdornment>
                ),
              },
            }}
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            required
            fullWidth
            id="date"
            label="Expense Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            variant="outlined"
            sx={textFieldSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <DateRange sx={{ color: "#aaa" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isBillable}
                onChange={handleChange}
                name="isBillable"
                color="primary"
              />
            }
            label="Billable to Client"
          />

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
            sx={textFieldSx}
          />

          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontWeight: 600, color: "#666" }}
            >
              Receipt (Optional)
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{
                textTransform: "none",
                borderColor: "#ccc",
                color: "#666",
                "&:hover": { borderColor: "#aaa", backgroundColor: "#f5f5f5" },
              }}
            >
              Upload Receipt
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept="image/*,application/pdf"
              />
            </Button>
            {receiptFile && (
              <Typography variant="caption" sx={{ ml: 2, color: "#14a800" }}>
                {receiptFile.name}
              </Typography>
            )}
            {expenseToEdit && expenseToEdit.receiptUrl && !receiptFile && (
              <Typography variant="caption" sx={{ ml: 2, color: "#666" }}>
                Existing receipt attached
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
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
        <Button
          type="submit"
          form="create-expense-form"
          variant="contained"
          disabled={loading}
          sx={{
            minWidth: 120,
            borderRadius: "24px",
            textTransform: "none",
            fontWeight: 800,
            backgroundColor: "#14a800",
            color: "#ffffff",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#108a00", boxShadow: "none" },
          }}
        >
          {loading ? "Saving..." : expenseToEdit ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateExpense;
