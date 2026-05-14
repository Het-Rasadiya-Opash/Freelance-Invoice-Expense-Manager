import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import invoiceModel from "../models/invoice.model.js";
import timeEntryModel from "../models/TimeEntry.model.js";

export const createInvoice = asyncHandler(async (req, res) => {
  const {
    clientId,
    projectId,
    invoiceNumber,
    dueDate,
    lineItems,
    taxRate,
    discountAmount,
    currency,
    notes,
    terms,
    recurring,
    fxSnapshot,
  } = req.body;

  if (!clientId || !dueDate || !lineItems || lineItems.length === 0) {
    throw new ApiError(400, "Client, due date, and line items are required");
  }

  if (invoiceNumber) {
    const existingInvoice = await invoiceModel.findOne({
      userId: req.user._id,
      invoiceNumber,
    });

    if (existingInvoice) {
      throw new ApiError(400, "Invoice number already exists");
    }
  }

  const invoice = new invoiceModel({
    userId: req.user._id,
    clientId,
    projectId: projectId || null,
    invoiceNumber,
    dueDate,
    lineItems,
    taxRate: taxRate || 0,
    discountAmount: discountAmount || 0,
    currency: currency || "INR",
    fxSnapshot: fxSnapshot || null,
    notes,
    terms,
    recurring,
    subtotal: 0,
    total: 0,
  });

  await invoice.save();

  const timeEntryIds = lineItems
    .filter((item) => item.type === "TIME" && item.timeEntryId)
    .map((item) => item.timeEntryId);

  if (timeEntryIds.length > 0) {
    await timeEntryModel.updateMany(
      { _id: { $in: timeEntryIds }, userId: req.user._id },
      { $set: { isBilled: true, invoiceId: invoice._id } },
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, invoice, "Invoice created successfully"));
});

export const getAllInvoices = asyncHandler(async (req, res) => {
  const {
    status,
    clientId,
    projectId,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = req.query;

  await invoiceModel.updateMany(
    {
      userId: req.user._id,
      status: "SENT",
      dueDate: { $lt: new Date() },
    },
    { $set: { status: "OVERDUE" } }
  );

  const query = { userId: req.user._id };

  if (status) query.status = status;
  if (clientId) query.clientId = clientId;
  if (projectId) query.projectId = projectId;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const invoices = await invoiceModel
    .find(query)
    .populate("clientId", "name email company address")
    .populate("projectId", "name")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit, 10));

  const total = await invoiceModel.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        invoices,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / parseInt(limit, 10)),
        },
      },
      "Invoices retrieved successfully",
    ),
  );
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await invoiceModel.updateOne(
    {
      _id: id,
      userId: req.user._id,
      status: "SENT",
      dueDate: { $lt: new Date() },
    },
    { $set: { status: "OVERDUE" } }
  );

  const invoice = await invoiceModel
    .findOne({ _id: id, userId: req.user._id })
    .populate("clientId", "name email company address")
    .populate("projectId", "name description");

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, invoice, "Invoice retrieved successfully"));
});

export const updateInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const invoice = await invoiceModel.findOne({ _id: id, userId: req.user._id });

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  if (
    updates.invoiceNumber &&
    updates.invoiceNumber !== invoice.invoiceNumber
  ) {
    const duplicate = await invoiceModel.findOne({
      userId: req.user._id,
      invoiceNumber: updates.invoiceNumber,
    });
    if (duplicate) {
      throw new ApiError(400, "Invoice number already exists");
    }
  }

  if (updates.lineItems) {
    const oldTimeEntryIds = invoice.lineItems
      .filter((item) => item.type === "TIME" && item.timeEntryId)
      .map((item) => item.timeEntryId.toString());

    const newTimeEntryIds = updates.lineItems
      .filter((item) => item.type === "TIME" && item.timeEntryId)
      .map((item) => item.timeEntryId.toString());

    const removedTimeEntryIds = oldTimeEntryIds.filter(
      (timeId) => !newTimeEntryIds.includes(timeId),
    );
    const addedTimeEntryIds = newTimeEntryIds.filter(
      (timeId) => !oldTimeEntryIds.includes(timeId),
    );

    if (removedTimeEntryIds.length > 0) {
      await timeEntryModel.updateMany(
        { _id: { $in: removedTimeEntryIds }, userId: req.user._id },
        { $set: { isBilled: false, invoiceId: null } },
      );
    }

    if (addedTimeEntryIds.length > 0) {
      await timeEntryModel.updateMany(
        { _id: { $in: addedTimeEntryIds }, userId: req.user._id },
        { $set: { isBilled: true, invoiceId: invoice._id } },
      );
    }
  }

  const allowedUpdates = [
    "clientId",
    "projectId",
    "invoiceNumber",
    "status",
    "issueDate",
    "dueDate",
    "paidAt",
    "lineItems",
    "taxRate",
    "discountAmount",
    "currency",
    "fxSnapshot",
    "notes",
    "terms",
    "recurring",
  ];

  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      invoice[field] = updates[field];
    }
  });

  await invoice.save();

  return res
    .status(200)
    .json(new ApiResponse(200, invoice, "Invoice updated successfully"));
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await invoiceModel.findOne({ _id: id, userId: req.user._id });

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  const timeEntryIds = invoice.lineItems
    .filter((item) => item.type === "TIME" && item.timeEntryId)
    .map((item) => item.timeEntryId);

  if (timeEntryIds.length > 0) {
    await timeEntryModel.updateMany(
      { _id: { $in: timeEntryIds }, userId: req.user._id },
      { $set: { isBilled: false, invoiceId: null } },
    );
  }

  await invoiceModel.deleteOne({ _id: id, userId: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Invoice deleted successfully"));
});
