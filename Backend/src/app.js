import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/error.middleware.js";
export const app = express();

import userRouter from "./routes/user.route.js";
import clientRouter from "./routes/client.route.js";
import projectRouter from "./routes/project.route.js";
import timeEntryRouter from "./routes/timeEntry.route.js";
import invoiceRouter from "./routes/invoice.route.js";
import expenseRouter from "./routes/expense.route.js";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRouter);
app.use("/api/clients", clientRouter);
app.use("/api/projects", projectRouter);
app.use("/api/time-entries", timeEntryRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/expenses", expenseRouter);

//error handler
app.use(errorHandler);
