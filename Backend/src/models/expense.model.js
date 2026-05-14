import mongoose from "mongoose";

const EXPENSE_CATEGORIES = [
  "SOFTWARE",
  "HARDWARE",
  "TRAVEL",
  "MEALS",
  "OFFICE",
  "MARKETING",
  "UTILITIES",
  "SUBCONTRACTOR",
  "OTHER",
];


const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      required: [true, "Category is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Expense date is required"],
      default: Date.now,
    },
    receiptUrl: {
      type: String,
      default: null,
    },
    receiptMimeType: {
      type: String,
      default: null,
    },
    isBillable: {
      type: Boolean,
      default: false,
    },
    isBilled: {
      type: Boolean,
      default: false,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const expenseModel = mongoose.model("Expense", expenseSchema);

export default expenseModel;
