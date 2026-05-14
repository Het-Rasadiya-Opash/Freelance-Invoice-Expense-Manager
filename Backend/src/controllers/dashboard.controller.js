import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import invoiceModel from "../models/invoice.model.js";
import mongoose from "mongoose";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const totalOutstandingAgg = await invoiceModel.aggregate([
    {
      $match: {
        userId: userObjectId,
        status: { $in: ["SENT", "OVERDUE"] },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
      },
    },
  ]);
  const totalOutstanding = totalOutstandingAgg[0]?.total || 0;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const paidThisMonthAgg = await invoiceModel.aggregate([
    {
      $match: {
        userId: userObjectId,
        status: "PAID",
        paidAt: { $gte: startOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
      },
    },
  ]);
  const paidThisMonth = paidThisMonthAgg[0]?.total || 0;

  const topClients = await invoiceModel.aggregate([
    {
      $match: {
        userId: userObjectId,
        status: "PAID",
      },
    },
    {
      $group: {
        _id: "$clientId",
        revenue: { $sum: "$total" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "clients",
        localField: "_id",
        foreignField: "_id",
        as: "clientInfo",
      },
    },
    { $unwind: "$clientInfo" },
    {
      $project: {
        _id: 1,
        revenue: 1,
        clientName: "$clientInfo.name",
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalOutstanding,
        paidThisMonth,
        topClients,
      },
      "Dashboard data fetched successfully",
    ),
  );
});
