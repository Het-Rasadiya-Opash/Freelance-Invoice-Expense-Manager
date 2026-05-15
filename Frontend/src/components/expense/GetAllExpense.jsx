import { Delete, Edit, Visibility } from "@mui/icons-material";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import apiRequest from "../../utils/apiRequest";
import TableSkeleton from "../common/TableSkeleton";

const GetAllExpense = ({ expenses, onEdit, onRefresh, loading }) => {
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await apiRequest.delete(`/expenses/${id}`);
        onRefresh();
      } catch (error) {
        console.error("Failed to delete expense:", error);
        alert("Failed to delete expense");
      }
    }
  };

  if (loading) {
    return (
      <TableSkeleton
        columns={[
          "Date",
          "Description",
          "Category",
          "Amount",
          "Billable",
          "Receipt",
          "Actions",
        ]}
      />
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <Box
        sx={{
          mt: 4,
          textAlign: "center",
          p: 4,
          backgroundColor: "#f9fbf7",
          borderRadius: "8px",
        }}
      >
        <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 500 }}>
          No expenses found.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Click "Add Expense" to add your first expense.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, width: "100%", minWidth: 0 }}>
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          maxWidth: "100%",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
          overflowX: "auto",
          overflowY: "hidden",
          border: "1px solid #eef2eb",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table sx={{ minWidth: 760 }} aria-label="expenses table">
          <TableHead sx={{ backgroundColor: "#f4fcf0" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Date
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Description
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Category
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Amount
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Billable
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Receipt
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: "#555",
                  py: 2,
                  textAlign: "center",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow
                key={expense._id}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": { backgroundColor: "#f9fbf7" },
                  transition: "background-color 0.2s ease",
                }}
              >
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {new Date(expense.date).toLocaleDateString()}
                </TableCell>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ fontWeight: 600, color: "#14a800", py: 2 }}
                >
                  {expense.description}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  <Chip
                    label={expense.category}
                    size="small"
                    sx={{
                      backgroundColor: "#eef2eb",
                      color: "#555",
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {expense.currency} {expense.amount.toFixed(2)}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {expense.isBillable ? (
                    <Chip
                      label={expense.isBilled ? "Billed" : "Billable"}
                      size="small"
                      color={expense.isBilled ? "success" : "warning"}
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Non-billable
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {expense.receiptUrl ? (
                    <Tooltip title="View Receipt">
                      <IconButton
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: "#14a800" }}
                        aria-label="view receipt"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ py: 2, textAlign: "center" }}>
                  <IconButton
                    onClick={() => onEdit(expense)}
                    sx={{ color: "#14a800", mr: 1 }}
                    aria-label="edit"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(expense._id)}
                    sx={{ color: "#d32f2f" }}
                    aria-label="delete"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GetAllExpense;
