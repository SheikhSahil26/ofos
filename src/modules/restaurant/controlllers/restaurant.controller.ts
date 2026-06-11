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

     // create restaurant
      createRestaurant = async(
        req: Request,
        res: Response
    ) => {

        try{

            const userId =
                req.user!.userId;

            const restaurant =
                await this.restaurantService
                .createRestaurant(
                    userId,
                    req.body
                );

            return res.status(201).json({
                success:true,
                message:
                "Restaurant created successfully",
                data:restaurant
            });

        }
        catch(err){

            console.log(err);

            return res.status(400).json({
                success:false,
                message:
                    err instanceof Error
                    ? err.message
                    : "Error creating restaurant"
            });
        }
    };

    // Update restaurant details
    updateRestaurant = async(
    req: Request,
    res: Response
) => {

    try{

        const restaurantIdRaw = req.params.id;
        const restaurantId = Array.isArray(restaurantIdRaw)
          ? restaurantIdRaw[0]
          : restaurantIdRaw;

        if (!restaurantId) {
          return res.status(400).json({
            success: false,
            message: "Restaurant id is required",
          });
        }

        const userId = req.user!.userId;

        const restaurant =
        await this.restaurantService
        .updateRestaurant(
            restaurantId,
            userId,
            req.body
        );

        return res.status(200).json({
            success:true,
            message:
            "Restaurant updated successfully",
            data:restaurant
        });

    }
    catch(err){

        console.log(err);

        return res.status(400).json({
            success:false,
            message:
            err instanceof Error
            ? err.message
            : "Error updating restaurant"
        });
    }
}

// update restaurant status
// restaurant.controller.ts

updateRestaurantStatus = async(
    req: Request,
    res: Response
) => {

    try{

        const rawId = req.params.id;

        if (!rawId || Array.isArray(rawId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing restaurant id"
            });
        }

        const restaurantId: string = rawId;

        const userId =
        req.user!.userId;

        const { isActive } =
        req.body;

        if(
            typeof isActive !== "boolean"
        ){
            return res.status(400).json({
                success:false,
                message:
                "isActive must be boolean"
            });
        }

        const restaurant =
        await this.restaurantService
        .updateRestaurantStatus(
            restaurantId,
            userId,
            isActive
        );

        return res.status(200).json({
            success:true,
            message:
                isActive
                ? "Restaurant activated successfully"
                : "Restaurant deactivated successfully",
            data: restaurant
        });

    }
    catch(err){

        console.log(err);

        return res.status(400).json({
            success:false,
            message:
                err instanceof Error
                ? err.message
                : "Error updating status"
        });
    }
}

// delete restaurant

deleteRestaurant = async(
    req: Request,
    res: Response
) => {

    try{

        const rawId = req.params.id;

        if (!rawId || Array.isArray(rawId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing restaurant id"
            });
        }

        const restaurantId: string = rawId;

        const userId =
        req.user!.userId;

        await this.restaurantService
        .deleteRestaurant(
            restaurantId,
            userId
        );

        return res.status(200).json({
            success: true,
            message:
                "Restaurant deleted successfully"
        });

    }
    catch(err){

        console.log(err);

        return res.status(400).json({
            success:false,
            message:
                err instanceof Error
                ? err.message
                : "Error deleting restaurant"
        });
    }
}

// GET restaurant reviews 
getRestaurantReviews = async(
    req: Request,
    res: Response
) => {

    try{

        const restaurantId =
        req.params.id as string;

        const page =
        Number(req.query.page) || 1;

        const limit =
        Number(req.query.limit) || 10;

        const reviews =
        await this.restaurantService
        .getRestaurantReviews(
            restaurantId,
            page,
            limit
        );

        return res.status(200).json({
            success:true,
            data:reviews.reviews,

            averageRating:
            reviews.averageRating,

            pagination:
            reviews.pagination
        });

    }
    catch(err){

        console.log(err);

        return res.status(400).json({
            success:false,
            message:
                err instanceof Error
                ? err.message
                : "Error fetching reviews"
        });
    }
}

// Create review
createReview = async(
    req: Request,
    res: Response
) => {

    try{

        const restaurantId =
        req.params.id as string;

        const userId =
        req.user!.userId;

        const review =
        await this.restaurantService
        .createReview(
            restaurantId,
            userId,
            req.body
        );

        return res.status(201).json({
            success:true,
            message:
                "Review submitted successfully",
            data:review
        });

    }
    catch(err){

        console.log(err);

        return res.status(400).json({
            success:false,
            message:
                err instanceof Error
                ? err.message
                : "Error creating review"
        });
    }
}
}