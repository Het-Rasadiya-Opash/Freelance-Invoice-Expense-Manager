import clientModel from "../models/client.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createClient = asyncHandler(async (req, res) => {
  const { name, company, email, billingAddress, defaultCurrency, notes } =
    req.body;

  if (!name || !email) {
    throw new ApiError(400, "Name and email are required");
  }

  const existingClient = await clientModel.findOne({
    email,
    userId: req.user._id,
  });

  if (existingClient) {
    throw new ApiError(400, "Client with this email already exists");
  }

  const client = await clientModel.create({
    name,
    company,
    email,
    billingAddress,
    defaultCurrency,
    notes,
    userId: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, client, "Client created successfully"));
});

export const getClients = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = { userId: req.user._id };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const clients = await clientModel
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .select("-__v");

  const totalClients = await clientModel.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        clients,
        pagination: {
          total: totalClients,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalClients / limit),
        },
      },
      "Clients fetched successfully",
    ),
  );
});

export const getClientById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const client = await clientModel.findOne({ _id: id, userId: req.user._id });

  if (!client) {
    throw new ApiError(404, "Client not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, client, "Client fetched successfully"));
});

export const updateClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  delete updates.userId;

  const client = await clientModel.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    updates,
    { returnDocument: "after", runValidators: true },
  );

  if (!client) {
    throw new ApiError(404, "Client not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, client, "Client updated successfully"));
});

export const deleteClient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const client = await clientModel.findOneAndDelete({
    _id: id,
    userId: req.user._id,
  });

  if (!client) {
    throw new ApiError(404, "Client not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Client deleted successfully"));
});
