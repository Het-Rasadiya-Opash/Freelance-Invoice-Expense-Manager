import React, { useEffect, useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import CreateClient from "./CreateClient";
import apiRequest from "../utils/apiRequest";
import GetAllClients from "./GetAllClients";

const Client = () => {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchClients = async () => {
    try {
      const res = await apiRequest.get("/clients");
      setClients(res.data.data.clients);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedClient(null);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setOpen(true);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#333" }}>
          Clients
        </Typography>
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
          Create Client
        </Button>
      </Box>

      <CreateClient
        open={open}
        handleClose={handleClose}
        clientToEdit={selectedClient}
        onRefresh={fetchClients}
      />
      <GetAllClients
        clients={clients}
        onEdit={handleEdit}
        onRefresh={fetchClients}
      />
    </div>
  );
};

export default Client;
