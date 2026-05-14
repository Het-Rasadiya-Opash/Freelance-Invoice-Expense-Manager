import React, { useEffect, useState } from "react";
import { Button, Box } from "@mui/material";
import { Add } from "@mui/icons-material";
import CreateExpense from "./CreateExpense";
import apiRequest from "../../utils/apiRequest";
import GetAllExpense from "./GetAllExpense";

const Expense = () => {
  const [open, setOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await apiRequest.get("/expenses");
      setExpenses(res.data.data.expenses);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedExpense(null);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setOpen(true);
  };

  useEffect(() => {
    fetchExpenses();
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
          Add Expense
        </Button>
      </Box>

      <CreateExpense
        open={open}
        handleClose={handleClose}
        expenseToEdit={selectedExpense}
        onRefresh={fetchExpenses}
      />
      <GetAllExpense
        expenses={expenses}
        onEdit={handleEdit}
        onRefresh={fetchExpenses}
      />
    </div>
  );
};

export default Expense;
