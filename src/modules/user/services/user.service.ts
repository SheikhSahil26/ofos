import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";
import { AddressRepository } from "../../address/repositories/address.repository";
import { LoyaltyPointsRepository } from "../../loyaltyPoints/repositories/loyaltyPoints.repository";
import { OrdersRepository } from "../../orders/repositories/orders.repository";
import { ICurrentOrder, IDashboard, IRecentRestaurant, IUpdateUser, IUser } from "../interfaces/user.interface";
import { UserRepository } from "../repositories/user.repository";

export class UserService{

    private userRepo = new UserRepository();
    private orderRepo = new OrdersRepository();
    private addressRepo = new AddressRepository();
    private loyaltyRepo = new LoyaltyPointsRepository();

    //check if user exist or not
    async validateUser(userId: string): Promise<boolean>{

        const user = await this.userRepo.findUserById(userId);

        if(!user || user.isDeleted){
            throw new AppError("User not found", 404);
        }

        return true;
    }

    //get dashboard of user
    async getDashboard(userId: string): Promise<ServiceResponse<IDashboard>>{
        
        //check if user exist or not
        await this.validateUser(userId);

        const [
            orders,
            addresses,
            loyaltyAccount,
            reviews,
            recentRestaurants,
            currentOrder,

        ] = await Promise.all([
            this.orderRepo.getOrderCountById(userId),

            this.addressRepo.getAddresses(userId),

            this.loyaltyRepo.getBalanceByCustomerId(userId),

            0,
            
            this.orderRepo.getRecentRestaurants(userId),

            this.orderRepo.getRecentOrder(userId),
        ]);

        //mapping restaurants to IRecentRestaurant interface
        const mappedRestaurants: IRecentRestaurant[] = recentRestaurants.map(order => ({
            restaurantId: order.branch.restaurant.id,
            restaurantName: order.branch.restaurant.name,
            logoUrl: order.branch.restaurant.logoUrl,

            branchId: order.branch.id,
            branchName: order.branch.branchName,

            placedAt: order.placedAt,
        }));

        //mapping current order to ICurrentOrder interface
        const mappedOrder: ICurrentOrder = {
            id: currentOrder?.id || null ,
            orderNumber: currentOrder?.orderNumber || null,
            status: currentOrder?.status || null,
            placedAt: currentOrder?.placedAt || null
        }

        
        const result: IDashboard = {
            id: userId,
            totalOrders: orders,
            savedAddresses: addresses.length || 0,
            loyaltyPoints: loyaltyAccount?.currentPoints || 0,
            totalReviews: reviews,
            recentRestaurants: mappedRestaurants,
            currentOrder: mappedOrder
        }

        console.log("user service", result);

        return {
            success: true,
            data: result,
            message: "Dashboard stats details fetched successfully",
            statusCode: 200
        }

    }

    //get profile of user
    async getProfile (userId: string): Promise<ServiceResponse<IUser | null>>{
  
        //check if user exist or not 
        await this.validateUser(userId);

        const user = await this.userRepo.getProfile(userId);
        return {
            success: true,
            data: user,
            message: "User profile fetched successfully",
            statusCode: 200
        }
    }

    //update profile of user
    async updateProfile(userId: string, data: IUpdateUser): Promise<ServiceResponse<IUser | null>> {

        //check if user exist or not
        await this.validateUser(userId);

        const updatedUser = await this.userRepo.updateProfile(userId, data);

        return {
            success: true,
            data: updatedUser,
            message: "User updated successfully",
            statusCode: 200
        }
    }

    //delete profile photo of user
    async deletePofilePhoto(userId: string): Promise<ServiceResponse<IUser | null>>{

        //check if user exist or not
        await this.validateUser(userId);

        const deletedUser = await this.userRepo.deleteProfilePhoto(userId);

        return {
            success: true,
            data: deletedUser,
            message: "User profile deleted successfully",
            statusCode: 200
        }
    }

    //delete profile of user
    async deleteUserAccount(userId: string): Promise<ServiceResponse<null>>{

        //check if user exist or not
        await this.validateUser(userId);

        await this.userRepo.deleteUserAccount(userId);

        return {
            success: true,
            message: "Profile photo deleted successfully",
            statusCode: 200
        }
    }
}