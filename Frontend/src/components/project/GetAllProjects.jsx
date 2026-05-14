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

const GetAllProjects = ({ projects, onEdit, onRefresh }) => {
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await apiRequest.delete(`/projects/${id}`);
        onRefresh();
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert("Failed to delete project");
      }
    }
  };

  if (!projects || projects.length === 0) {
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
          No projects found.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Click "Create Project" to add your first project.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, width: "100%", minWidth: 0 }}>
      <TableContainer
        component={Paper}
        className="projects-table-container"
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
        <Table sx={{ minWidth: 760 }} aria-label="projects table">
          <TableHead sx={{ backgroundColor: "#f4fcf0" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Project Name
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Client
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Hourly Rate
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Currency
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Status
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
            {projects.map((project) => (
              <TableRow
                key={project._id}
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
                  {project.name}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {project.clientId?.name || "-"}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {project.hourlyRate}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {project.currency}
                </TableCell>
                <TableCell sx={{ color: "#666", py: 2 }}>
                  {project.status}
                </TableCell>
                <TableCell sx={{ py: 2, textAlign: "center" }}>
                  <IconButton
                    onClick={() => onEdit(project)}
                    sx={{ color: "#14a800", mr: 1 }}
                    aria-label="edit"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(project._id)}
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

export default GetAllProjects;
