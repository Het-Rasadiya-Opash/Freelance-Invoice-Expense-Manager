import userModel from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, defaultCurrency, brandName } = req.body;
  let { logoUrl } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (!uploadResult) {
      throw new ApiError(500, "Failed to upload logo to Cloudinary");
    }
    logoUrl = uploadResult.secure_url;
  }

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await userModel.create({
    name,
    email,
    password,
    defaultCurrency,
    brandName,
    logoUrl,
  });
  const token = user.generateToken();

  const createdUser = await userModel.findById(user._id);

  if (!createdUser) {
    throw new ApiError(500, "User registration failed");
  }

  res.cookie("token", token);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, token },
        "User registered successfully",
      ),
    );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }
  const token = user.generateToken();
  const loggedInUser = await userModel.findById(user._id);
  res.cookie("token", token);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, token },
        "User logged in successfully",
      ),
    );
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User fetched successfully"));
});
