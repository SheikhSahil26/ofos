import { OrdersRepository } from "../repositories/orders.repository";
import { UserRepository } from "../../user/repositories/user.repository";
import { } from "../interfaces/orders.interface"
import { ServiceResponse } from "../../../common/types/service-response.types";


export class OrdersService {

    private restaurantRepo: OrdersRepository = new OrdersRepository();
    private userRepo: UserRepository = new UserRepository();



    // async getCart(
    //     userId: number
    // ): Promise<ServiceResponse<any>> {

    //     const cart =
    //         await this.ordersRepo.getCart(userId);

    //     if (!cart) {
    //         return {
    //             success: false,
    //             error: "Cart not found",
    //             statusCode: 404,
    //         };
    //     }

    //     return {
    //         success: true,
    //         message: "Cart fetched successfully",
    //         data: cart,
    //         statusCode: 200,
    //     };
    // }

}