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
      const userId = req.user.userId ;

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

  //GET nearby restaurants

getNearbyRestaurants = async(
    req: Request,
    res: Response
) => {
    try{

        const latitude = Number(req.query.latitude);
        const longitude = Number(req.query.longitude);
        const radius = Number(req.query.radius) || 5;

        if(
            isNaN(latitude) ||
            isNaN(longitude)
        ){
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required"
            });
        }

        const restaurants =
        await this.restaurantService
        .getNearbyRestaurants(
            latitude,
            longitude,
            radius
        );

        return res.status(200).json({
            success: true,
            data: restaurants
        });

    }
    catch(err){
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Error fetching nearby restaurants"
        });
    }
}
}
