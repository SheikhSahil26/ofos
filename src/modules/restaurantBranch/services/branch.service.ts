import { OrderStatus, Prisma, VerificationStatus } from "@prisma/client";
import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";
import { RestaurantService } from "../../restaurant/services/restaurant.service";
import {
  IBranchAccessValidation,
  IBranchDetails,
  IBranchOrdersResponse,
  IBranchStatusResponse,
  IBranchValidation,
  ICreateRestaurantBranch,
  IDeleteBranchResponse,
  IRestaurantBranchListResponse,
  IRestaurantBranchResponse,
  IUpdateBranchStatus,
  IUpdatedBranchResponse,
  IUpdateRestaurantBranch,
} from "../interfaces/branch.interface";
import { BranchRepository } from "../repositories/branch.repo";
import { prisma } from "../../../config/prisma";

export class BranchService {
  private branchRepo: BranchRepository = new BranchRepository();
  private restaurantService = new RestaurantService();

  // Create new branch for restaurant
  createBranch = async (
    restaurantId: string,
    userId: string,
    payload: ICreateRestaurantBranch,
  ): Promise<ServiceResponse<IRestaurantBranchResponse>> => {
    await this.restaurantService.validateRestaurantOwnership(
      restaurantId,
      userId,
    );

    // Required field validations
    if (!payload.branchName?.trim()) {
      throw new AppError("Branch name is required", 400);
    }

    if (!payload.contactNumber?.trim()) {
      throw new AppError("Contact number is required", 400);
    }

    if (!payload.addressLine1?.trim()) {
      throw new AppError("Address line 1 is required", 400);
    }

    if (!payload.city?.trim()) {
      throw new AppError("City is required", 400);
    }

    if (!payload.state?.trim()) {
      throw new AppError("State is required", 400);
    }

    if (!payload.pincode?.trim()) {
      throw new AppError("Pincode is required", 400);
    }

    // Latitude and longitude validation
    if (payload.latitude !== undefined && payload.latitude !== null) {
      if (payload.latitude < -90 || payload.latitude > 90) {
        throw new AppError("Invalid latitude. Must be between -90 and 90", 400);
      }
    }

    if (payload.longitude !== undefined && payload.longitude !== null) {
      if (payload.longitude < -180 || payload.longitude > 180) {
        throw new AppError("Invalid longitude. Must be between -180 and 180", 400);
      }
    }

    // Delivery radius validation
    if (payload.deliveryRadiusKm !== undefined && payload.deliveryRadiusKm !== null) {
      if (payload.deliveryRadiusKm <= 0) {
        throw new AppError("Delivery radius must be greater than 0", 400);
      }
    }

    // Duplicate branch name check within restaurant
    const existingBranch = await this.branchRepo.validateBranchNameExists(
      restaurantId,
      payload.branchName,
      "",
    );

    if (existingBranch) {
      throw new AppError("Branch name already exists for this restaurant", 400);
    }

    // Primary branch validation
    if (payload.isPrimary) {
      const primaryBranch =
        await this.branchRepo.validatePrimaryBranchExists(restaurantId);

      if (primaryBranch) {
        throw new AppError("Primary branch already exists", 400);
      }
    }

    // GSTIN validation
    if (payload.gstin) {
      const gstinExists = await this.branchRepo.validateGSTINExists(
        payload.gstin,
      );

      if (gstinExists) {
        throw new AppError("GSTIN already exists", 400);
      }
    }

    //FSSAI License validation
    if (payload.fssaiLicense) {
      const fssaiExists = await this.branchRepo.validateFSSAIExists(
        payload.fssaiLicense,
      );

      if (fssaiExists) {
        throw new AppError("FSSAI license already exists", 400);
      }
    }

    //Create branch
    const branch = await this.branchRepo.createBranch({
      restaurant: {
        connect: {
          id: restaurantId,
        },
      },
      branchName: payload.branchName,
      contactNumber: payload.contactNumber,
      addressLine1: payload.addressLine1,
      addressLine2: payload.addressLine2 ?? null,
      city: payload.city,
      state: payload.state,
      pincode: payload.pincode,
      gstin: payload.gstin ?? null,
      fssaiLicense: payload.fssaiLicense ?? null,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      deliveryRadiusKm: payload.deliveryRadiusKm ?? null,
      isPrimary: payload.isPrimary ?? false,
    });

    return {
      success: true,
      data: branch,
      message: "Branch created successfully",
      statusCode: 201,
    };
  };

  // get branches by restaurant id

  async getBranches(
    restaurantId: string,
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<ServiceResponse<IRestaurantBranchListResponse>> {
    await this.restaurantService.validateRestaurantOwnership(
      restaurantId,
      userId,
    );

    const skip = (page - 1) * limit;

    const branches = await this.branchRepo.getBranches(
      restaurantId,
      skip,
      limit,
      search,
    );

    const total = await this.branchRepo.countBranches(restaurantId, search);

    return {
      success: true,

      data: {
        branches,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      message: "Branches fetched successfully",
      statusCode: 200,
    };
  }


  //validate Bramch Exist
  

  // Validate branch ownership
  async validateBranchOwnership(
    branchId: string,
    userId: string,
  ): Promise<ServiceResponse<IBranchValidation>> {
    const branch = await this.branchRepo.validateBranchById(branchId);

    if (!branch) {
      throw new AppError("Branch not found", 404);
    }

    if (branch.isDeleted) {
      throw new AppError("Branch has been deleted", 404);
    }

    await this.restaurantService.validateRestaurantOwnership(
      branch.restaurantId,
      userId,
    );

    return {
      success: true,
      data: branch,
      message: "Branch validated successfully",
      statusCode: 200,
    };
  }

  // Get branch details by id
  async getBranchDetails(
    branchId: string,
    userId: string,
  ): Promise<ServiceResponse<IBranchDetails>> {
    // Validate branch ownership
    await this.validateBranchOwnership(branchId, userId);

    const branch = await this.branchRepo.getBranchDetails(branchId);

    if (!branch) {
      throw new AppError("Branch details not found", 404);
    }

    return {
      success: true,
      data: branch,
      message: "Branch details fetched successfully",
      statusCode: 200,
    };
  }

  // Update branch
  async updateBranch(
    branchId: string,
    userId: string,
    payload: IUpdateRestaurantBranch,
  ): Promise<ServiceResponse<IUpdatedBranchResponse>> {
    const validation = await this.validateBranchOwnership(branchId, userId);

    const branch = validation.data!;

    if (payload.branchName && payload.branchName !== branch.branchName) {
      const existingBranch = await this.branchRepo.validateBranchNameExists(
        branch.restaurantId,
        payload.branchName,
        branchId,
      );

      if (existingBranch) {
        throw new AppError("Branch name already exists", 400);
      }
    }

    if (payload.gstin && payload.gstin !== branch.gstin) {
      const existingGST = await this.branchRepo.validateGSTINExists(
        payload.gstin,
      );

      if (existingGST) {
        throw new AppError("GSTIN already exists", 400);
      }
    }

    if (payload.fssaiLicense && payload.fssaiLicense !== branch.fssaiLicense) {
      const existingFSSAI = await this.branchRepo.validateFSSAIExists(
        payload.fssaiLicense,
      );

      if (existingFSSAI) {
        throw new AppError("FSSAI License already exists", 400);
      }
    }

    if (branch.isPrimary && payload.isPrimary === false) {
      throw new AppError(
        "Restaurant must have at least one primary branch",
        400,
      );
    }

    const requiresReverification =
      (payload.gstin && payload.gstin !== branch.gstin) ||
      (payload.fssaiLicense && payload.fssaiLicense !== branch.fssaiLicense);

    const updateData: Prisma.RestaurantBranchUpdateInput = {} as any;

    // Only set fields that are provided in payload to satisfy exactOptionalPropertyTypes
    if (payload.branchName !== undefined)
      updateData.branchName = payload.branchName ?? null;
    if (payload.contactNumber !== undefined)
      updateData.contactNumber = payload.contactNumber ?? null;
    if (payload.addressLine1 !== undefined)
      updateData.addressLine1 = payload.addressLine1 ?? null;
    if (payload.addressLine2 !== undefined)
      updateData.addressLine2 = payload.addressLine2 ?? null;
    if (payload.city !== undefined) updateData.city = payload.city ?? null;
    if (payload.state !== undefined) updateData.state = payload.state ?? null;
    if (payload.pincode !== undefined)
      updateData.pincode = payload.pincode ?? null;
    if (payload.gstin !== undefined) updateData.gstin = payload.gstin ?? null;
    if (payload.fssaiLicense !== undefined)
      updateData.fssaiLicense = payload.fssaiLicense ?? null;
    if (payload.latitude !== undefined) updateData.latitude = payload.latitude;
    if (payload.longitude !== undefined)
      updateData.longitude = payload.longitude;
    if (payload.deliveryRadiusKm !== undefined)
      updateData.deliveryRadiusKm = payload.deliveryRadiusKm;
    if (payload.isPrimary !== undefined)
      updateData.isPrimary = payload.isPrimary;

    if (requiresReverification) {
      updateData.verificationStatus = VerificationStatus.PENDING;
    }

    if (payload.isPrimary === true) {
      const primaryBranch = await this.branchRepo.getPrimaryBranch(
        branch.restaurantId,
      );

      await prisma.$transaction(async (tx) => {
        if (primaryBranch && primaryBranch.id !== branchId) {
          await tx.restaurantBranch.update({
            where: {
              id: primaryBranch.id,
            },

            data: {
              isPrimary: false,
            },
          });
        }

        await tx.restaurantBranch.update({
          where: {
            id: branchId,
          },

          data: updateData,
        });
      });

      const updatedBranch = await this.branchRepo.updateBranch(branchId, {});

      return {
        success: true,
        data: updatedBranch,
        message: "Branch updated successfully",
        statusCode: 200,
      };
    }

    const updatedBranch = await this.branchRepo.updateBranch(
      branchId,
      updateData,
    );

    return {
      success: true,
      data: updatedBranch,
      message: "Branch updated successfully",
      statusCode: 200,
    };
  }

  //Update Branch status
  async updateBranchStatus(
    branchId: string,
    userId: string,
    payload: IUpdateBranchStatus,
  ): Promise<ServiceResponse<IBranchStatusResponse>> {
    await this.validateBranchOwnership(branchId, userId);

    const branch = await this.branchRepo.updateBranchStatus(
      branchId,
      payload.isActive,
    );

    return {
      success: true,
      data: branch,
      message: payload.isActive
        ? "Branch activated successfully"
        : "Branch deactivated successfully",
      statusCode: 200,
    };
  }

  async deleteBranch(
    branchId: string,
    userId: string,
  ): Promise<ServiceResponse<IDeleteBranchResponse>> {
    const validation = await this.validateBranchOwnership(branchId, userId);

    const branch = validation.data!;

    if (branch.isPrimary) {
      throw new AppError(
        "Primary branch cannot be deleted. Assign another branch as primary first.",
        400,
      );
    }

    const totalBranches = await this.branchRepo.countActiveBranches(
      branch.restaurantId,
    );

    if (totalBranches <= 1) {
      throw new AppError("Restaurant must have at least one branch", 400);
    }

    const deletedBranch = await this.branchRepo.deleteBranch(branchId);

    return {
      success: true,
      data: deletedBranch,
      message: "Branch deleted successfully",
      statusCode: 200,
    };
  }

  // get all orders for a branch
  async validateBranchAccess(
    branchId: string,
    userId: string,
  ): Promise<ServiceResponse<IBranchAccessValidation>> {
    const branch = await this.branchRepo.validateBranchAccess(branchId);

    if (!branch) {
      throw new AppError("Branch not found", 404);
    }

    if (branch.isDeleted) {
      throw new AppError("Branch has been deleted", 404);
    }

    const isOwner = branch.restaurant.ownerId === userId;

    const isStaff = branch.staff.some((staff) => staff.userId === userId);

    if (!isOwner && !isStaff) {
      throw new AppError("Unauthorized access", 403);
    }

    return {
      success: true,
      data: branch,
      message: "Branch access validated successfully",
      statusCode: 200,
    };
  }

  async getBranchOrders(
    branchId: string,
    userId: string,
    page: number,
    limit: number,
    status?: OrderStatus,
  ): Promise<ServiceResponse<IBranchOrdersResponse>> {
    await this.validateBranchAccess(branchId, userId);

    const skip = (page - 1) * limit;

    const orders = await this.branchRepo.getBranchOrders(
      branchId,
      skip,
      limit,
      status,
    );

    const total = await this.branchRepo.countBranchOrders(branchId, status);

    return {
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      message: "Branch orders fetched successfully",
      statusCode: 200,
    };
  }
}
