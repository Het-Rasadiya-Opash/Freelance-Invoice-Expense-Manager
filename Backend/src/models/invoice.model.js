import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Line item description is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["TIME", "FLAT"],
      required: true,
    },
    timeEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeEntry",
      default: null,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true },
);

const fxSnapshotSchema = new mongoose.Schema(
  {
    baseCurrency: {
      type: String,
      uppercase: true,
    },
    targetCurrency: {
      type: String,
      uppercase: true,
    },
    rate: {
      type: Number,
    },
    snapshotAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const recurringConfigSchema = new mongoose.Schema(
  {
    isRecurring: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ["WEEKLY", "MONTHLY"],
      default: "MONTHLY",
    },
    nextRunAt: {
      type: Date,
    },
    lastRunAt: {
      type: Date,
    },
    endAfter: {
      type: Date,
    },
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
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
      required: [true, "Client is required"],
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["DRAFT", "SENT", "PAID", "OVERDUE"],
      default: "DRAFT",
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    paidAt: {
      type: Date,
      default: null,
    },

    lineItems: {
      type: [lineItemSchema],
      default: [],
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    fxSnapshot: {
      type: fxSnapshotSchema,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
    },
    terms: {
      type: String,
      trim: true,
    },

    pdfUrl: {
      type: String,
      default: null,
    },

    recurring: {
      type: recurringConfigSchema,
      default: () => ({ isRecurring: false }),
    },
  },
  {
    timestamps: true,
  },
);

invoiceSchema.pre("validate", async function () {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments({
      userId: this.userId,
    });
    this.invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;
  }
});

invoiceSchema.pre("save", function () {
  if (this.status === "SENT" && this.dueDate && new Date() > this.dueDate) {
    this.status = "OVERDUE";
  }
});

invoiceSchema.pre("validate", function () {
  if (
    this.isModified("lineItems") ||
    this.isModified("taxRate") ||
    this.isModified("discountAmount")
  ) {
    this.lineItems.forEach((item) => {
      item.amount = parseFloat(
        ((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2),
      );
    });

    const subtotal = this.lineItems.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );
    this.subtotal = parseFloat(subtotal.toFixed(2));

    const taxAmount = parseFloat(
      ((subtotal * (this.taxRate || 0)) / 100).toFixed(2),
    );
    this.taxAmount = taxAmount;

    const total = parseFloat(
      (subtotal + taxAmount - (this.discountAmount || 0)).toFixed(2),
    );
    this.total = Math.max(0, total);
  }
});

const invoiceModel = mongoose.model("Invoice", invoiceSchema);

export default invoiceModel;
