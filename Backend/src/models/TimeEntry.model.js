import mongoose from "mongoose";

const timeEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    durationMinutes: {
      type: Number,
      min: [0, "Duration cannot be negative"],
    },
    isManual: {
      type: Boolean,
      default: false,
    },
    isRunning: {
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
  },
  {
    timestamps: true,
  },
);

timeEntrySchema.pre("save", async function () {
  if (!this.isManual && this.startTime && this.endTime) {
    const ms = this.endTime - this.startTime;
    this.durationMinutes = Math.round(ms / 60000);
  }
});

const timeEntryModel = mongoose.model("TimeEntry", timeEntrySchema);

export default timeEntryModel;
