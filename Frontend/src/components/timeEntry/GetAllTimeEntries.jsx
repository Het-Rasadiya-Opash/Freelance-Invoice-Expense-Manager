import React, { useState } from "react";
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
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Timer, EditNote, StopCircle } from "@mui/icons-material";
import apiRequest from "../../utils/apiRequest";
import TableSkeleton from "../common/TableSkeleton";

const formatDuration = (minutes) => {
  if (minutes == null || minutes === 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const GetAllTimeEntries = ({ timeEntries, onEdit, onRefresh, loading }) => {
  const [stoppingId, setStoppingId] = useState(null);

  const handleStop = async (id) => {
    setStoppingId(id);
    try {
      await apiRequest.patch(`/time-entries/${id}/stop`);
      onRefresh();
    } catch (error) {
      console.error("Failed to stop timer:", error);
      alert(error?.response?.data?.message || "Failed to stop timer");
    } finally {
      setStoppingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      try {
        await apiRequest.delete(`/time-entries/${id}`);
        onRefresh();
      } catch (error) {
        console.error("Failed to delete time entry:", error);
        alert(error?.response?.data?.message || "Failed to delete time entry");
      }
    }
  };

  if (loading) {
    return (
      <TableSkeleton
        columns={[
          "Project",
          "Client",
          "Description",
          "Start",
          "End",
          "Duration",
          "Type",
          "Status",
          "Actions",
        ]}
      />
    );
  }

  if (!timeEntries || timeEntries.length === 0) {
    return (
      <Box
        sx={{
          mt: 4,
          textAlign: "center",
          p: 4,
          backgroundColor: "#f9fbf7",
          borderRadius: "8px",
          border: "1px dashed #c8e6c9",
        }}
      >
        <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 500 }}>
          No time entries found.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Click "Log Time Entry" to record your first entry, or adjust your
          filters.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, width: "100%", minWidth: 0 }}>
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
        <Table sx={{ minWidth: 860 }} aria-label="time entries table">
          <TableHead sx={{ backgroundColor: "#f4fcf0" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Project
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Client
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Description
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Start
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                End
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Duration
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#555", py: 2 }}>
                Type
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
            {timeEntries.map((entry) => (
              <TableRow
                key={entry._id}
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
                  {entry.projectId?.name || "—"}
                </TableCell>

                <TableCell sx={{ color: "#666", py: 2 }}>
                  {entry.clientId?.name || entry.clientId?.company || "—"}
                </TableCell>

                <TableCell
                  sx={{
                    color: "#666",
                    py: 2,
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.description || (
                    <em style={{ color: "#aaa" }}>No description</em>
                  )}
                </TableCell>

                <TableCell sx={{ color: "#666", py: 2, whiteSpace: "nowrap" }}>
                  {formatDateTime(entry.startTime)}
                </TableCell>

                <TableCell sx={{ color: "#666", py: 2, whiteSpace: "nowrap" }}>
                  {entry.isRunning ? (
                    <Chip
                      label="Running…"
                      size="small"
                      icon={<Timer sx={{ fontSize: "14px !important" }} />}
                      sx={{
                        backgroundColor: "#e8f5e9",
                        color: "#2e7d32",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        height: 24,
                      }}
                    />
                  ) : (
                    formatDateTime(entry.endTime)
                  )}
                </TableCell>

                <TableCell sx={{ color: "#333", py: 2, fontWeight: 600 }}>
                  {entry.isRunning
                    ? "—"
                    : formatDuration(entry.durationMinutes)}
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  {entry.isManual ? (
                    <Chip
                      label="Manual"
                      size="small"
                      icon={<EditNote sx={{ fontSize: "14px !important" }} />}
                      sx={{
                        backgroundColor: "#e3f2fd",
                        color: "#1565c0",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        height: 24,
                      }}
                    />
                  ) : (
                    <Chip
                      label="Timer"
                      size="small"
                      icon={<Timer sx={{ fontSize: "14px !important" }} />}
                      sx={{
                        backgroundColor: "#f3e5f5",
                        color: "#6a1b9a",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        height: 24,
                      }}
                    />
                  )}
                </TableCell>

                <TableCell sx={{ py: 2 }}>
                  {entry.isBilled ? (
                    <Chip
                      label="Billed"
                      size="small"
                      sx={{
                        backgroundColor: "#e8f5e9",
                        color: "#2e7d32",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        height: 24,
                      }}
                    />
                  ) : (
                    <Chip
                      label="Unbilled"
                      size="small"
                      sx={{
                        backgroundColor: "#fff8e1",
                        color: "#f57f17",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        height: 24,
                      }}
                    />
                  )}
                </TableCell>

                <TableCell
                  sx={{ py: 2, textAlign: "center", whiteSpace: "nowrap" }}
                >
                  {entry.isRunning && (
                    <Tooltip title="Stop Timer">
                      <span>
                        <IconButton
                          onClick={() => handleStop(entry._id)}
                          disabled={stoppingId === entry._id}
                          sx={{
                            color:
                              stoppingId === entry._id ? "#ccc" : "#f57c00",
                            mr: 0.5,
                          }}
                          aria-label="stop timer"
                        >
                          {stoppingId === entry._id ? (
                            <CircularProgress
                              size={20}
                              sx={{ color: "#f57c00" }}
                            />
                          ) : (
                            <StopCircle />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}

                  <Tooltip
                    title={
                      entry.isBilled ? "Cannot edit a billed entry" : "Edit"
                    }
                  >
                    <span>
                      <IconButton
                        onClick={() => onEdit(entry)}
                        disabled={entry.isBilled || entry.isRunning}
                        sx={{
                          color:
                            entry.isBilled || entry.isRunning
                              ? "#ccc"
                              : "#14a800",
                          mr: 0.5,
                        }}
                        aria-label="edit"
                      >
                        <Edit />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip
                    title={
                      entry.isBilled ? "Cannot delete a billed entry" : "Delete"
                    }
                  >
                    <span>
                      <IconButton
                        onClick={() => handleDelete(entry._id)}
                        disabled={entry.isBilled}
                        sx={{ color: entry.isBilled ? "#ccc" : "#d32f2f" }}
                        aria-label="delete"
                      >
                        <Delete />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GetAllTimeEntries;
