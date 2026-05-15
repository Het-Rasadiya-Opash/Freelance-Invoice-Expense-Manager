import projectModel from "../models/project.model.js";
import clientModel from "../models/client.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, clientId, hourlyRate, currency, status } =
    req.body;

  if (!name || !clientId || hourlyRate === undefined) {
    throw new ApiError(400, "Name, client ID, and hourly rate are required");
  }

  const client = await clientModel.findOne({
    _id: clientId,
    userId: req.user._id,
  });
  if (!client) {
    throw new ApiError(404, "Client not found or unauthorized");
  }

  const project = await projectModel.create({
    name,
    description,
    clientId,
    hourlyRate,
    currency,
    status,
    userId: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await projectModel
    .find({ userId: req.user._id })
    .populate("clientId", "name email company");

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects retrieved successfully"));
});

export const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await projectModel
    .findOne({ _id: id, userId: req.user._id })
    .populate("clientId", "name email company");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project retrieved successfully"));
});

export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, clientId, hourlyRate, currency, status } =
    req.body;

  if (clientId) {
    const client = await clientModel.findOne({
      _id: clientId,
      userId: req.user._id,
    });
    if (!client) {
      throw new ApiError(404, "Client not found or unauthorized");
    }
  }

  const project = await projectModel.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { name, description, clientId, hourlyRate, currency, status },

    { returnDocument: "after", runValidators: true },
  );

  if (!project) {
    throw new ApiError(404, "Project not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await projectModel.findOneAndDelete({
    _id: id,
    userId: req.user._id,
  });

  if (!project) {
    throw new ApiError(404, "Project not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Project deleted successfully"));
});
