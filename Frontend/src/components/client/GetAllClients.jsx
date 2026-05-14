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
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import apiRequest from "../../utils/apiRequest";

const GetAllClients = ({ clients, onEdit, onRefresh }) => {
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await apiRequest.delete(`/clients/${id}`);
        onRefresh();
      } catch (error) {
        console.error("Failed to delete client:", error);
        alert("Failed to delete client");
      }
    }
  };

  if (!clients || clients.length === 0) {
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
          No clients found.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Click "Create Client" to add your first client.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, width: "100%", minWidth: 0 }}>
      <TableContainer
        component={Paper}
        className="clients-table-container"
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
        <Table sx={{ minWidth: 760 }} aria-label="clients table">
          <TableHead sx={{ backgroundColor: "#f4fcf0" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Client Name
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Email
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Company
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Currency
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Location
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2, textAlign: "center" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client._id || client.email}
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
                  {client.name}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {client.email}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {client.company || "-"}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {client.defaultCurrency}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {client.billingAddress &&
                  (client.billingAddress.city || client.billingAddress.country)
                    ? [
                        client.billingAddress.city,
                        client.billingAddress.country,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : "-"}
                </TableCell>
                <TableCell sx={{ py: 2, textAlign: "center" }}>
                  <IconButton
                    onClick={() => onEdit(client)}
                    sx={{ color: "#14a800", mr: 1 }}
                    aria-label="edit"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(client._id)}
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

export default GetAllClients;
