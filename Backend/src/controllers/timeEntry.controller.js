import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import timeEntryModel from "../models/TimeEntry.model.js";
import projectModel from "../models/project.model.js";

export const createTimeEntry = asyncHandler(async (req, res) => {
  const {
    projectId,
    description,
    startTime,
    endTime,
    durationMinutes,
    isManual,
    isRunning,
  } = req.body;

  if (!projectId) {
    throw new ApiError(400, "Project ID is required");
  }

  const project = await projectModel.findOne({
    _id: projectId,
    userId: req.user._id,
  });

  if (!project) {
    throw new ApiError(404, "Project not found or unauthorized");
  }

  const clientId = project.clientId;

  let entryData = {
    userId: req.user._id,
    projectId,
    clientId,
    description,
    isManual: isManual || false,
    isRunning: isRunning || false,
  };

  if (entryData.isManual) {
    entryData.isRunning = false;
    entryData.startTime = startTime || new Date();
    entryData.endTime = endTime;

    if (durationMinutes !== undefined) {
      entryData.durationMinutes = durationMinutes;
    } else if (startTime && endTime) {
      const ms = new Date(endTime) - new Date(startTime);
      entryData.durationMinutes = Math.round(ms / 60000);
    }
  } else {
    if (entryData.isRunning) {
      entryData.startTime = startTime || new Date();
      entryData.endTime = null;
      entryData.durationMinutes = 0;
    } else {
      entryData.startTime = startTime || new Date();
      entryData.endTime = endTime || new Date();
    }
  }

  const timeEntry = await timeEntryModel.create(entryData);

  return res
    .status(201)
    .json(new ApiResponse(201, timeEntry, "Time entry created successfully"));
});

export const stopTimer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const timeEntry = await timeEntryModel.findOne({
    _id: id,
    userId: req.user._id,
  });

  if (!timeEntry) {
    throw new ApiError(404, "Time entry not found or unauthorized");
  }

  if (!timeEntry.isRunning) {
    throw new ApiError(400, "Timer is not currently running");
  }

  const now = new Date();
  const ms = now - timeEntry.startTime;
  const durationMinutes = Math.round(ms / 60000);

  timeEntry.endTime = now;
  timeEntry.durationMinutes = durationMinutes;
  timeEntry.isRunning = false;
  await timeEntry.save();

  return res
    .status(200)
    .json(new ApiResponse(200, timeEntry, "Timer stopped successfully"));
});

export const getAllTimeEntries = asyncHandler(async (req, res) => {
  const {
    projectId,
    clientId,
    isBilled,
    isRunning,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filter = { userId: req.user._id };

  if (projectId) filter.projectId = projectId;
  if (clientId) filter.clientId = clientId;
  if (isBilled !== undefined) filter.isBilled = isBilled === "true";
  if (isRunning !== undefined) filter.isRunning = isRunning === "true";

  if (startDate || endDate) {
    filter.startTime = {};
    if (startDate) filter.startTime.$gte = new Date(startDate);
    if (endDate) filter.startTime.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortDir = sortOrder === "asc" ? 1 : -1;

  const [timeEntries, total] = await Promise.all([
    timeEntryModel
      .find(filter)
      .populate("projectId", "name hourlyRate currency")
      .populate("clientId", "name company")
      .sort({ [sortBy]: sortDir })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    timeEntryModel.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        timeEntries,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Time entries retrieved successfully",
    ),
  );
});

export const getTimeEntryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const timeEntry = await timeEntryModel
    .findOne({ _id: id, userId: req.user._id })
    .populate("projectId", "name hourlyRate currency")
    .populate("clientId", "name company");

  if (!timeEntry) {
    throw new ApiError(404, "Time entry not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, timeEntry, "Time entry retrieved successfully"));
});

export const updateTimeEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { description, startTime, endTime, durationMinutes, isManual } =
    req.body;

  const timeEntry = await timeEntryModel.findOne({
    _id: id,
    userId: req.user._id,
  });

  if (!timeEntry) {
    throw new ApiError(404, "Time entry not found or unauthorized");
  }

  if (timeEntry.isBilled) {
    throw new ApiError(400, "Cannot edit a billed time entry");
  }

  if (description !== undefined) timeEntry.description = description;
  if (isManual !== undefined) timeEntry.isManual = isManual;
  if (startTime !== undefined) timeEntry.startTime = new Date(startTime);
  if (endTime !== undefined) timeEntry.endTime = new Date(endTime);

  if (durationMinutes !== undefined) {
    timeEntry.durationMinutes = durationMinutes;
  } else if (timeEntry.startTime && timeEntry.endTime) {
    const ms = timeEntry.endTime - timeEntry.startTime;
    timeEntry.durationMinutes = Math.round(ms / 60000);
  }

  await timeEntry.save();

  return res
    .status(200)
    .json(new ApiResponse(200, timeEntry, "Time entry updated successfully"));
});

export const deleteTimeEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const timeEntry = await timeEntryModel.findOne({
    _id: id,
    userId: req.user._id,
  });

  if (!timeEntry) {
    throw new ApiError(404, "Time entry not found or unauthorized");
  }

  if (timeEntry.isBilled) {
    throw new ApiError(400, "Cannot delete a billed time entry");
  }

  await timeEntry.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Time entry deleted successfully"));
});
