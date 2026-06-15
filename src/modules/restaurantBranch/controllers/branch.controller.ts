import { Request, Response } from "express";
import { BranchService } from "../services/branch.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import {
  ICreateRestaurantBranch,
  IUpdateBranchStatus,
  IUpdateRestaurantBranch,
} from "../interfaces/branch.interface";
import { AppError } from "../../../utils/appError";
import { OrderStatus } from "@prisma/client";

export class BranchController {
  private branchService = new BranchService();

  //Create new branch for restaurant
  createBranch = asyncHandler(async (req: Request, res: Response) => {
    const restaurantIdParam = req.params.restaurantId;
    const restaurantId = Array.isArray(restaurantIdParam)
      ? restaurantIdParam[0]
      : restaurantIdParam;

    if (!restaurantId) {
      throw new Error("restaurantId is required");
    }

    const user = req.user as Express.payload | undefined;
    if (!user || typeof user.userId !== "string") {
      throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

    const payload = req.body as ICreateRestaurantBranch;

    const data = await this.branchService.createBranch(
      restaurantId,
      userId,
      payload,
    );

    return res.status(data.statusCode ?? 200).json({
      ...data,
    });
  });

  getBranches = asyncHandler(async (req: Request, res: Response) => {
    const restaurantIdParam = req.params.restaurantId;
    const restaurantId = Array.isArray(restaurantIdParam)
      ? restaurantIdParam[0]
      : restaurantIdParam;

    if (!restaurantId) {
      throw new Error("restaurantId is required");
    }

    const user = req.user as Express.payload | undefined;
    if (!user || typeof user.userId !== "string") {
      throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search = req.query.search as string;

    const data = await this.branchService.getBranches(
      restaurantId,
      userId,
      page,
      limit,
      search,
    );

    return res.status(data.statusCode ?? 200).json({
      ...data,
    });
  });

  // Get branch details
  getBranchDetails = asyncHandler(async (req: Request, res: Response) => {
    console.log(req.params.branchId);
    
    const branchIdParam = req.params.branchId;
    const branchId = Array.isArray(branchIdParam)
      ? branchIdParam[0]
      : branchIdParam;

    if (!branchId) {
      throw new Error("branchId is required");
    }
    const user = req.user as Express.payload | undefined;
    if (!user || typeof user.userId !== "string") {
      throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

    const data = await this.branchService.getBranchDetails(branchId, userId);

    return res.status(data.statusCode ?? 200).json({
      ...data,
    });
  });

  // Update branch
  updateBranch = asyncHandler(async (req: Request, res: Response) => {
    const branchIdParam = req.params.id;
    const branchId = Array.isArray(branchIdParam)
      ? branchIdParam[0]
      : branchIdParam;

    if (!branchId) {
      throw new Error("branchId is required");
    }

    const user = req.user as Express.payload | undefined;
    if (!user || typeof user.userId !== "string") {
      throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

    const payload = req.body as IUpdateRestaurantBranch;

    const data = await this.branchService.updateBranch(
      branchId,
      userId,
      payload,
    );

    return res.status(data.statusCode!).json({
      ...data,
    });
  });

  // Update branch status
  updateBranchStatus = asyncHandler(async (req: Request, res: Response) => {
    const branchIdParam = req.params.id;
    const branchId = Array.isArray(branchIdParam)
      ? branchIdParam[0]
      : branchIdParam;

    if (!branchId) {
      throw new Error("branchId is required");
    }

    const user = req.user as Express.payload | undefined;
    if (!user || typeof user.userId !== "string") {
      throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

    const payload = req.body as IUpdateBranchStatus;

    const data = await this.branchService.updateBranchStatus(
      branchId,
      userId,
      payload,
    );

    return res.status(data.statusCode!).json({
      ...data,
    });
  });

  //Delete branch
  deleteBranch = asyncHandler(async (req: Request, res: Response) => {
    const branchIdParam = req.params.id;
    const branchId = Array.isArray(branchIdParam)
      ? branchIdParam[0]
      : branchIdParam;

    if (!branchId) {
      throw new Error("branchId is required");
    }

    const user = req.user as Express.payload | undefined;
    if (!user || typeof user.userId !== "string") {
      throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

    const data = await this.branchService.deleteBranch(branchId, userId);

    return res.status(data.statusCode!).json({
      ...data,
    });
  });

  // get orders for a branch
  getBranchOrders = asyncHandler(async (req: Request, res: Response) => {
    const branchIdParam = req.params.id;
    const branchId = Array.isArray(branchIdParam)
      ? branchIdParam[0]
      : branchIdParam;

    if (!branchId) {
      throw new Error("branchId is required");
    }

    const user = req.user as Express.payload | undefined;
    if (!user || typeof user.userId !== "string") {
      throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const status = req.query.status as OrderStatus;

    const data = await this.branchService.getBranchOrders(
      branchId,
      userId,
      page,
      limit,
      status,
    );

    return res.status(data.statusCode!).json({
      ...data,
    });
  });
}
