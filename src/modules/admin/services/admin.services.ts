import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";
import { DeliveryService } from "../../delivery/services/delivery.service";
import { ICustomerDetailsResponse, IDeliveryPartnerApprovalStats, IRestaurantOwnerDetailsResponse, IUpdateUserStatus, IUserDetailsResponse } from "../interfaces/admin.interface";
import { AdminRepository } from "../repositories/admin.repositories";

export class AdminService {

    private adminRepository = new AdminRepository();


    async getUserDetails(id: string): Promise<ServiceResponse<IUserDetailsResponse>> {

        const user = await this.adminRepository.getUserDetails(id);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return {
            success: true,
            message: "User details fetched successfully",
            data: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                profilePhoto: user.profilePhoto,
                isVerified: user.isVerified,
                isActive: user.isActive,
                createdAt: user.createdAt,

                roles: user.userRoles.map(
                    userRole => userRole.role.role
                ),

                addresses: user.addresses.map(address => ({
                    id: address.id,
                    label: address.label,
                    addressLine1: address.addressLine1,
                    addressLine2: address.addressLine2,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    isDefault: address.isDefault,
                })),
            },
            statusCode: 200,
        };
    }

    //customer details
    async getCustomerDetails(id: string): Promise<ServiceResponse<ICustomerDetailsResponse>> {

        const customer = await this.adminRepository.getCustomerDetails(id);

        if (!customer) {
            throw new AppError("Customer not found", 404);
        }

        const isCustomer = customer.userRoles.some(
            userRole => userRole.role.role === "CUSTOMER"
        );

        if (!isCustomer) {
            throw new AppError("User is not a customer", 400);
        }

        const totalSpent = customer.orders.reduce(
            (sum, order) =>
                sum + Number(order.totalAmount),
            0
        );

        return {
            success: true,
            message: "Customer details fetched successfully",
            data: {
                id: customer.id,
                fullName: customer.fullName,
                email: customer.email,
                mobile: customer.mobile,
                profilePhoto: customer.profilePhoto,

                isVerified: customer.isVerified,
                isActive: customer.isActive,

                loyaltyPoints:
                    customer.loyaltyAccount?.currentPoints || 0,

                totalOrders: customer.orders.length,

                totalSpent,

                couponsUsed:
                    customer.couponUsages.length,

                addressesCount:
                    customer.addresses.length,

                createdAt: customer.createdAt,
            },
            statusCode: 200,
        };
    }

    //restaurant owner details
    async getRestaurantOwnerDetails(id: string): Promise<ServiceResponse<IRestaurantOwnerDetailsResponse>> {

        const owner = await this.adminRepository.getRestaurantOwnerDetails(id);

        if (!owner) {
            throw new AppError("Restaurant owner not found", 404);
        }

        const isOwner = owner.userRoles.some(
            userRole =>
                userRole.role.role === "RESTAURANT_OWNER"
        );

        if (!isOwner) {
            throw new AppError(
                "User is not a restaurant owner",
                400
            );
        }

        const totalRestaurants =
            owner.ownedRestaurants.length;

        const totalBranches =
            owner.ownedRestaurants.reduce(
                (sum, restaurant) =>
                    sum + restaurant.branches.length,
                0
            );

        return {
            success: true,
            message:
                "Restaurant owner details fetched successfully",
            data: {
                id: owner.id,
                fullName: owner.fullName,
                email: owner.email,
                mobile: owner.mobile,
                isVerified: owner.isVerified,
                isActive: owner.isActive,

                totalRestaurants,
                totalBranches,

                restaurants:
                    owner.ownedRestaurants.map(
                        restaurant => ({
                            id: restaurant.id,
                            name: restaurant.name,
                            isActive: restaurant.isActive,
                            totalBranches:
                                restaurant.branches.length,
                        })
                    ),

                createdAt: owner.createdAt,
            },
            statusCode: 200,
        };

    }

    // Get Branch history
    async getAllBranches(
        page: number,
        limit: number,
        search?: string,
        status?: string,
        openStatus?: string,
        sort?: string
    ): Promise<ServiceResponse<any>> {

        const data =
            await this.adminRepository
                .getAllBranches(
                    page,
                    limit,
                    search,
                    status,
                    openStatus,
                    sort
                );

        return {

            success: true,

            data: {
                pagination: {
                    page,
                    limit,
                    total: data.total
                },

                branches: data.branches
            },

            message:
                "Branches fetched successfully",

            statusCode: 200

        };

    }

    async getBranchesStats() {

        const stats =
            await this.adminRepository.getBranchesStats();

        return {
            success: true,
            data: stats,
            message: "Dashboard stats fetched successfully",
            statusCode: 200
        };

    }


    //activate and deactivate a user
    async updateUserStatus(id: string, data: IUpdateUserStatus): Promise<ServiceResponse<null>> {

        const user =
            await this.adminRepository.getUserById(id);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (user.isActive === data.isActive) {
            throw new AppError(
                `User is already ${data.isActive ? "active" : "inactive"
                }`,
                409
            );
        }

        await this.adminRepository.updateUserStatus(
            id,
            data.isActive
        );

        return {
            success: true,
            message: `User ${data.isActive
                ? "activated"
                : "deactivated"
                } successfully`,
            data: null,
            statusCode: 200,
        };
    }

    getPendingRestaurantApprovals = async (
        page: number,
        limit: number,
        search?: string
    ): Promise<ServiceResponse<any>> => {

        const result =
            await this.adminRepository
                .getPendingRestaurantApprovals(
                    page,
                    limit,
                    search
                );

        return {

            success: true,

            statusCode: 200,

            message:
                "Pending approval requests fetched successfully",

            data: {

                approvals:
                    result.approvals,

                pagination: {

                    page,

                    limit,

                    total:
                        result.total

                }

            }

        };
    };


    getPendingRestaurantApprovalCount =
        async (): Promise<ServiceResponse<any>> => {

            const total =
                await this.adminRepository
                    .getPendingRestaurantApprovalCount();

            return {

                success: true,

                statusCode: 200,

                message:
                    "Pending request count fetched successfully",

                data: {
                    totalPendingRequests:
                        total
                }

            };
        };

    approveBranch = async (
        branchId: string
    ): Promise<ServiceResponse<null>> => {

        await this.adminRepository
            .approveBranch(branchId);

        return {

            success: true,

            statusCode: 200,

            message:
                "Branch approved successfully"

        };
    };

    rejectBranch = async (
        branchId: string
    ): Promise<ServiceResponse<null>> => {

        await this.adminRepository
            .rejectBranch(branchId);

        return {

            success: true,

            statusCode: 200,

            message:
                "Branch rejected successfully"

        };
    };

    getPendingPartners = async (
        page: number,
        limit: number,
        search?: string

    ): Promise<ServiceResponse<any>> => {

        const result =
            await this.adminRepository.getPendingPartners(
                page,
                limit,
                search
            );

        return {

            success: true,

            message:
                "Pending delivery partners fetched successfully",

            data: {

                partners:
                    result.partners.map(
                        partner => ({

                            id:
                                partner.user.id,

                            fullName:
                                partner.user.fullName,

                            email:
                                partner.user.email,

                            mobile:
                                partner.user.mobile,

                            vehicleType:
                                partner.vehicleType,

                            vehicleNumber:
                                partner.vehicleNumber,

                            governmentId:
                                partner.governmentId,

                            createdAt:
                                partner.createdAt
                        })
                    ),

                pagination: {

                    page,

                    limit,

                    total:
                        result.total
                }
            },

            statusCode: 200
        };
    }

    getStats = async (): Promise<ServiceResponse<IDeliveryPartnerApprovalStats>> => {

        const stats =
            await this.adminRepository.getStats();

        return {

            success: true,

            statusCode: 200,

            message:
                "Delivery partner approval statistics fetched successfully",

            data: {
                pending: stats.pending,
                active: stats.active,
                suspended: stats.suspended
            }
        };
    }
    private deliveryService = new DeliveryService();

    approvePartner = async (
        partnerId: string
    ): Promise<ServiceResponse<null>> => {

        console.log(partnerId)

        const partner =

            await this.deliveryService.getPartnerProfile(
                partnerId
            );

        console.log(partner)

        if (!partner.data) {

            throw new AppError(
                "Delivery partner not found",
                404
            );
        }

        if (
            partner.data.status === "ACTIVE"
        ) {

            throw new AppError(
                "Partner already approved",
                400
            );
        }

        await this.adminRepository.approvePartner(
            partnerId
        );

        return {

            success: true,

            message:
                "Delivery partner approved successfully",

            statusCode: 200
        };
    }

    rejectPartner = async (
        partnerId: string
    ): Promise<ServiceResponse<null>> => {

        const partner =
            await this.deliveryService.getPartnerProfile(
                partnerId
            );

        console.log(partner)

        if (!partner.data) {

            throw new AppError(
                "Delivery partner not found",
                404
            );
        }

        if (
            partner.data.status === "SUSPENDED"
        ) {

            throw new AppError(
                "Partner already rejected",
                400
            );
        }

        await this.adminRepository.rejectPartner(
            partnerId
        );

        return {

            success: true,

            message:
                "Delivery partner rejected successfully",

            statusCode: 200
        };
    }

}