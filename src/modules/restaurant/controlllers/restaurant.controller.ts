import { Request, Response } from "express";
import { RestaurantService } from "../services/restaurant.service";

export class RestaurantController {
  private restaurantService = new RestaurantService();

  //get all restaurants
  getRestaurants = async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;

      const limit = Number(req.query.limit) || 10;

      const search = req.query.search as string;

      const data = await this.restaurantService.getRestaurants(
        page,
        limit,
        search,
      );

      return res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      console.log(err);

      return res.status(500).json({
        success: false,
        message: "Error fetching restaurants",
      });
    }
  };

  //get restaurant by owner
  getMyRestaurants = async (req: Request, res: Response) => {
    try {
      const userId = req.user.userId;

      const page = Number(req.query.page) || 1;

      const limit = Number(req.query.limit) || 10;

      const data = await this.restaurantService.getMyRestaurants(
        userId,
        page,
        limit,
      );

      return res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Error fetching restaurants",
      });
    }
  };

  //create restaurant
  async createRestaurant(data: any): Promise<void> {
    try {
    } catch (err) {
      throw err;
    }
  }
}
