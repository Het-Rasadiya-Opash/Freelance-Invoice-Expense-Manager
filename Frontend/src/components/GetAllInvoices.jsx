import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  Chip,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import apiRequest from "../utils/apiRequest";

const GetAllInvoices = ({ invoices, fetchInvoices, onEdit }) => {
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await apiRequest.delete(`/invoices/${id}`);
        if (fetchInvoices) {
          fetchInvoices();
        }
      } catch (error) {
        console.error("Failed to delete invoice:", error);
        alert("Failed to delete invoice");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "SENT":
        return "primary";
      case "PAID":
        return "success";
      case "OVERDUE":
        return "error";
      default:
        return "default";
    }
  };

  if (!invoices || invoices.length === 0) {
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
          No invoices found.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Click "Generate Invoice" to add your first invoice.
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
        <Table sx={{ minWidth: 760 }} aria-label="invoices table">
          <TableHead sx={{ backgroundColor: "#f4fcf0" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Invoice #
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Client
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Project
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Issue Date
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Due Date
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Amount
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2, textAlign: "center" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow
                key={invoice._id}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": { backgroundColor: "#f9fbf7" },
                  transition: "background-color 0.2s ease",
                }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ fontWeight: 600, color: "#14a800", py: 2 }}
                >
                  {invoice.invoiceNumber || "N/A"}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {invoice.clientId?.name ||
                    invoice.clientId?.company ||
                    "Unknown Client"}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {invoice.projectId?.name || "-"}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {invoice.issueDate
                    ? new Date(invoice.issueDate).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {invoice.dueDate
                    ? new Date(invoice.dueDate).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography sx={{ fontWeight: 700, color: "#1F2937", fontSize: "0.95rem" }}>
                    {invoice.currency} {invoice.total !== undefined ? invoice.total.toFixed(2) : "0.00"}
                  </Typography>
                  {invoice.fxSnapshot && invoice.fxSnapshot.rate && (
                    <Box sx={{ mt: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ 
                          color: "#14a800", 
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          backgroundColor: "#F0FDF4",
                          px: 1,
                          py: 0.25,
                          borderRadius: "4px",
                          display: "inline-block"
                        }}
                      >
                        {invoice.fxSnapshot.targetCurrency} {(invoice.total * invoice.fxSnapshot.rate).toFixed(2)}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ color: "#9CA3AF", fontSize: "0.7rem", mt: 0.25 }}
                      >
                        1 {invoice.fxSnapshot.baseCurrency} = {invoice.fxSnapshot.rate} {invoice.fxSnapshot.targetCurrency}
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    label={invoice.status || "DRAFT"}
                    color={getStatusColor(invoice.status)}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                  />
                </TableCell>
                <TableCell sx={{ py: 2, textAlign: "center" }}>
                  <IconButton
                    onClick={() => onEdit && onEdit(invoice)}
                    sx={{ color: "#14a800", mr: 1 }}
                    aria-label="edit"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(invoice._id)}
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

export default GetAllInvoices;
