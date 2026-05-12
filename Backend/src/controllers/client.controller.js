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
