import { Request, Response } from "express";
import { RestaurantService } from "../services/restaurant.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../utils/appError";

export class RestaurantController {
  private restaurantService = new RestaurantService();

  //get all restaurants
  getRestaurants = asyncHandler(async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;

      const limit = Number(req.query.limit) || 10;

      const search = req.query.search as string;

      const data = await this.restaurantService.getRestaurants(
        page,
        limit,
        search,
      );

      return res.status(200).json({
        ...data,
      });
  });

  //get restaurant by owner
  getMyRestaurants = asyncHandler(async (req: Request, res: Response) => {
    const userId = "1eaab1e4-6bd3-458c-a708-65307da24d9e";

      const page = Number(req.query.page) || 1;

      const limit = Number(req.query.limit) || 10;

      const data = await this.restaurantService.getMyRestaurants(
        userId,
        page,
        limit,
      );

      return res.status(200).json({
        ...data,
      });
    
  });

  //GET nearby restaurants

  getNearbyRestaurants = asyncHandler(async (req: Request, res: Response) => {

      const latitude = Number(req.query.latitude);
      const longitude = Number(req.query.longitude);
      const radius = Number(req.query.radius) || 5;

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }

      const restaurants = await this.restaurantService.getNearbyRestaurants(
        latitude,
        longitude,
        radius,
      );

      return res.status(200).json({
        success: true,
        data: restaurants,
      });
    
  });

  // create restaurant
  createRestaurant = asyncHandler(async (req: Request, res: Response) => {
    const userId = "1eaab1e4-6bd3-458c-a708-65307da24d9e";

      const restaurant = await this.restaurantService.createRestaurant(
        userId,
        req.body,
      );

      return res.status(201).json({
        success: true,
        message: "Restaurant created successfully",
        data: restaurant,
      });
  });

  // Update restaurant details
  updateRestaurant = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.payload | undefined;
    if(!user || typeof user.userId !== "string"){
        throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

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

      const restaurant = await this.restaurantService.updateRestaurant(
        restaurantId,
        userId,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: "Restaurant updated successfully",
        data: restaurant,
      });
    });

  // update restaurant status

  updateRestaurantStatus = asyncHandler(async (req: Request, res: Response) => {
      const rawId = req.params.id;

      if (!rawId || Array.isArray(rawId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing restaurant id",
        });
      }

      const restaurantId: string = rawId;

      const user = req.user as Express.payload | undefined;
    if(!user || typeof user.userId !== "string"){
        throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be boolean",
        });
      }

      const restaurant = await this.restaurantService.updateRestaurantStatus(
        restaurantId,
        userId,
        isActive,
      );

      return res.status(200).json({
        success: true,
        message: isActive
          ? "Restaurant activated successfully"
          : "Restaurant deactivated successfully",
        data: restaurant,
      });
  });

  // delete restaurant

  deleteRestaurant = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.payload | undefined;
    if(!user || typeof user.userId !== "string"){
        throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

      const rawId = req.params.id;

      if (!rawId || Array.isArray(rawId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing restaurant id",
        });
      }

      const restaurantId: string = rawId;


      await this.restaurantService.deleteRestaurant(restaurantId, userId);

      return res.status(200).json({
        success: true,
        message: "Restaurant deleted successfully",
      });
  });

  // GET restaurant reviews
  getRestaurantReviews = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = req.params.id as string;

      const page = Number(req.query.page) || 1;

      const limit = Number(req.query.limit) || 10;

      const reviews = await this.restaurantService.getRestaurantReviews(
        restaurantId,
        page,
        limit,
      );

      return res.status(200).json({
        success: true,
        data: {
          review: reviews.data.reviews,

          averageRating: reviews.data.averageRating,

          pagination: reviews.data.pagination,
        },
      });
  });

  // Create review
  createReview = asyncHandler(async (req: Request, res: Response) => {
      const restaurantId = req.params.id as string;

      const user = req.user as Express.payload | undefined;
    if(!user || typeof user.userId !== "string"){
        throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;
      const review = await this.restaurantService.createReview(
        restaurantId,
        userId,
        req.body,
      );

      return res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: review,
      });
  });
}
