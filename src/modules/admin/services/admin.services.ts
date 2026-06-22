import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";
import { ICustomerDetailsResponse, IRestaurantOwnerDetailsResponse, IUpdateUserStatus, IUserDetailsResponse } from "../interfaces/admin.interface";
import { AdminRepository } from "../repositories/admin.repositories";

export class AdminService{

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

    //activate and deactivate a user
    async updateUserStatus(id: string, data: IUpdateUserStatus): Promise<ServiceResponse<null>> {

        const user =
            await this.adminRepository.getUserById(id);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (user.isActive === data.isActive) {
            throw new AppError(
                `User is already ${
                    data.isActive ? "active" : "inactive"
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
            message: `User ${
                data.isActive
                    ? "activated"
                    : "deactivated"
            } successfully`,
            data: null,
            statusCode: 200,
        };
    }
}