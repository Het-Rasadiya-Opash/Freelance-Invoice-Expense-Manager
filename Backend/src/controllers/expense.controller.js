import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import expenseModel from "../models/expense.model.js";
import clientModel from "../models/client.model.js";
import projectModel from "../models/project.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createExpense = asyncHandler(async (req, res) => {
  const {
    clientId,
    projectId,
    description,
    category,
    amount,
    currency,
    date,
    isBillable,
    notes,
  } = req.body;

  if (!description || !category || !amount) {
    throw new ApiError(400, "Description, category, and amount are required");
  }

  if (clientId) {
    const client = await clientModel.findOne({ _id: clientId, userId: req.user._id });
    if (!client) {
      throw new ApiError(404, "Client not found or unauthorized");
    }
  }

  if (projectId) {
    const project = await projectModel.findOne({ _id: projectId, userId: req.user._id });
    if (!project) {
      throw new ApiError(404, "Project not found or unauthorized");
    }
  }

  const expenseData = {
    userId: req.user._id,
    clientId: clientId || null,
    projectId: projectId || null,
    description,
    category,
    amount,
    currency: currency || "INR",
    date: date || new Date(),
    isBillable: isBillable === "true" || isBillable === true,
    notes,
  };

  if (req.file) {
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (cloudinaryResponse) {
      expenseData.receiptUrl = cloudinaryResponse.secure_url;
      expenseData.receiptMimeType = req.file.mimetype;
    } else {
      throw new ApiError(500, "Failed to upload receipt to Cloudinary");
    }
  }

  const expense = await expenseModel.create(expenseData);

  return res
    .status(201)
    .json(new ApiResponse(201, expense, "Expense created successfully"));
});

export const getExpenses = asyncHandler(async (req, res) => {
  const {
    category,
    clientId,
    projectId,
    date,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sort = "-date",
  } = req.query;

  const query = { userId: req.user._id };

  if (category) query.category = category;
  if (clientId) query.clientId = clientId;
  if (projectId) query.projectId = projectId;

  if (date) {
    query.date = date;
  } else if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const expenses = await expenseModel
    .find(query)
    .populate("clientId", "name company email")
    .populate("projectId", "name")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit, 10));

  const total = await expenseModel.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        expenses,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / parseInt(limit, 10)),
        },
      },
      "Expenses retrieved successfully",
    ),
  );
});

export const getExpenseById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const expense = await expenseModel
    .findOne({ _id: id, userId: req.user._id })
    .populate("clientId", "name company email")
    .populate("projectId", "name");

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense retrieved successfully"));
});

export const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    clientId,
    projectId,
    description,
    category,
    amount,
    currency,
    date,
    isBillable,
    notes,
  } = req.body;

  const expense = await expenseModel.findOne({ _id: id, userId: req.user._id });

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  if (clientId) {
    const client = await clientModel.findOne({ _id: clientId, userId: req.user._id });
    if (!client) {
      throw new ApiError(404, "Client not found or unauthorized");
    }
  }

  if (projectId) {
    const project = await projectModel.findOne({ _id: projectId, userId: req.user._id });
    if (!project) {
      throw new ApiError(404, "Project not found or unauthorized");
    }
  }

  const updateData = {
    clientId: clientId !== undefined ? clientId || null : expense.clientId,
    projectId: projectId !== undefined ? projectId || null : expense.projectId,
    description: description || expense.description,
    category: category || expense.category,
    amount: amount || expense.amount,
    currency: currency || expense.currency,
    date: date || expense.date,
    isBillable:
      isBillable !== undefined
        ? isBillable === "true" || isBillable === true
        : expense.isBillable,
    notes: notes !== undefined ? notes : expense.notes,
  };

  if (req.file) {
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (cloudinaryResponse) {
      updateData.receiptUrl = cloudinaryResponse.secure_url;
      updateData.receiptMimeType = req.file.mimetype;
    } else {
      throw new ApiError(500, "Failed to upload receipt to Cloudinary");
    }
  }

  const updatedExpense = await expenseModel
    .findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: updateData },
      { returnDocument: "after", runValidators: true },
    )
    .populate("clientId", "name company email")
    .populate("projectId", "name");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedExpense, "Expense updated successfully"));
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const expense = await expenseModel.findOneAndDelete({
    _id: id,
    userId: req.user._id,
  });

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Expense deleted successfully"));
});
