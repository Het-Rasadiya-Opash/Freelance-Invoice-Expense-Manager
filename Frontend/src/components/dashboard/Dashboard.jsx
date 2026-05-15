import {
  MonetizationOn as MoneyIcon,
  AccountBalanceWallet as WalletIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import apiRequest from "../../utils/apiRequest";

const Dashboard = () => {
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [paidThisMonth, setPaidThisMonth] = useState(0);
  const [topClients, setTopClients] = useState([]);

  const fetchDashboradSummary = async () => {
    try {
      const res = await apiRequest.get("/dashboard/summary");
      setTotalOutstanding(res.data.data.totalOutstanding || 0);
      setPaidThisMonth(res.data.data.paidThisMonth || 0);
      setTopClients(res.data.data.topClients || []);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
    }
  };

  useEffect(() => {
    fetchDashboradSummary();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          mb: 4,
        }}
      >
        <Card
          sx={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid #e0e0e0",
            backgroundColor: "#ffffff",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          }}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
            <Avatar
              sx={{
                bgcolor: "#f4fcf0",
                color: "#14a800",
                width: 56,
                height: 56,
                mr: 2,
                borderRadius: "12px",
              }}
            >
              <WalletIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography
                variant="overline"
                sx={{ color: "#5e6d55", fontWeight: 600, letterSpacing: 1 }}
              >
                Total Outstanding
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#001e00" }}
              >
                $
                {totalOutstanding.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid #e0e0e0",
            backgroundColor: "#ffffff",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          }}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
            <Avatar
              sx={{
                bgcolor: "#f4fcf0",
                color: "#14a800",
                width: 56,
                height: 56,
                mr: 2,
                borderRadius: "12px",
              }}
            >
              <MoneyIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography
                variant="overline"
                sx={{ color: "#5e6d55", fontWeight: 600, letterSpacing: 1 }}
              >
                Paid This Month
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#001e00" }}
              >
                $
                {paidThisMonth.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Paper
        sx={{
          p: 4,
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          border: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 3, color: "#001e00" }}
        >
          Top Clients by Revenue
        </Typography>
        <List>
          {topClients.length > 0 ? (
            topClients.map((client, index) => (
              <ListItem
                key={client._id}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: "8px",
                  mb: 1,
                  backgroundColor: "#ffffff",
                  border: "1px solid #e0e0e0",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f9fbf7",
                    borderColor: "#14a800",
                  },
                }}
                secondaryAction={
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: "#14a800" }}
                  >
                    $
                    {client.revenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                }
              >
                <Avatar
                  sx={{
                    bgcolor: "#f4fcf0",
                    color: "#14a800",
                    mr: 2,
                    fontWeight: 600,
                  }}
                >
                  {index + 1}
                </Avatar>
                <ListItemText
                  primary={client.clientName}
                  primaryTypographyProps={{ fontWeight: 600, color: "#001e00" }}
                />
              </ListItem>
            ))
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: "#5e6d55",
                textAlign: "center",
                py: 4,
                fontStyle: "italic",
              }}
            >
              No client data available
            </Typography>
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default Dashboard;
