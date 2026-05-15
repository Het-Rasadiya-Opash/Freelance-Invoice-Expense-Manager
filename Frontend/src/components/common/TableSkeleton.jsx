import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const TableSkeleton = ({ columns, rowCount = 5 }) => {
  return (
    <Box sx={{ mt: 4, width: "100%" }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
          border: "1px solid #eef2eb",
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 760 }}>
          <TableHead sx={{ backgroundColor: "#f4fcf0" }}>
            <TableRow>
              {columns.map((col, index) => (
                <TableCell
                  key={index}
                  sx={{
                    fontWeight: 700,
                    color: "#555",
                    py: 2,
                    textAlign: col === "Actions" ? "center" : "left",
                  }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(rowCount)].map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={colIndex}
                    sx={{ py: 2, textAlign: col === "Actions" ? "center" : "left" }}
                  >
                    {col === "Actions" ? (
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="circular" width={24} height={24} />
                      </Box>
                    ) : (
                      <Skeleton variant="text" width={`${((colIndex * 17 + rowIndex * 13) % 40) + 40}%`} />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableSkeleton;
