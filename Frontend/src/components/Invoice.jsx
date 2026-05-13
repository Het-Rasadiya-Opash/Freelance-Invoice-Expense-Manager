import React, { useEffect, useState } from "react";
import { Button, Box } from "@mui/material";
import { Add } from "@mui/icons-material";
import apiRequest from "../utils/apiRequest";
import GetAllInvoices from "./GetAllInvoices";
import CreateInvoice from "./CreateInvoice";

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    try {
      const res = await apiRequest.get("/invoices");
      setInvoices(res.data.data.invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedInvoice(null);
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setOpen(true);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 3,
        }}
      >
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

      <CreateInvoice
        open={open}
        handleClose={handleClose}
        invoiceToEdit={selectedInvoice}
        onRefresh={fetchInvoices}
      />

      <GetAllInvoices
        invoices={invoices}
        fetchInvoices={fetchInvoices}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default Invoice;
