import { OrdersRepository } from "../repositories/orders.repository";
import { UserRepository } from "../../user/repositories/user.repository";
import { } from "../interfaces/orders.interface"


export class OrdersService{

    private restaurantRepo: OrdersRepository = new OrdersRepository();
    private userRepo: UserRepository = new UserRepository();

   
  
}