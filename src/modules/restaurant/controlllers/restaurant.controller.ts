import { Request, Response } from "express";
import { RestaurantService } from "../services/restaurant.service";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../utils/appError";
import { uploadImage } from "../../../services/multer.service";
import {
  DayOfWeek
} from "@prisma/client";

export class RestaurantController {
  private restaurantService = new RestaurantService();

  //get all restaurants
  getRestaurants = asyncHandler(async(req: Request, res: Response) => {
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
        success: true,
      });
  });

  //get restaurant by owner
  getMyRestaurants = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.payload | undefined;
    if(!user || typeof user.userId !== "string"){
        throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

      const page = Number(req.query.page) || 1;

      const limit = Number(req.query.limit) || 10;

      const data = await this.restaurantService.getMyRestaurants(
        userId,
        page,
        limit,
      );

      return res.status(200).json({
        ...data,
        success: true,
      });
    })

  //GET nearby restaurants

getNearbyRestaurants = asyncHandler(async(
    req: Request,
    res: Response
) => {

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

});

  // create restaurant
 createRestaurant = asyncHandler(
  async (
    req: Request,
    res: Response
  ) => {

    const user = req.user as Express.payload | undefined;

    console.log("User from request:", user);
    if(!user || typeof user.userId !== "string"){
        throw new AppError("Invalid user id", 409);
    }

      const userId = user.userId;


    const operatingHours =
  JSON.parse(
    req.body.operatingHours
  )
  .filter(
    (day: any) =>
      !day.isClosed
  )
  .map(
    (day: any) => ({
      ...day,

      dayOfWeek:
        DayOfWeek[
          day.dayOfWeek as keyof typeof DayOfWeek
        ]
    })
  );

    const payload: any = {

      ...req.body,

      latitude:
        Number(
          req.body.latitude
        ),

      longitude:
        Number(
          req.body.longitude
        ),

      deliveryRadiusKm:
        Number(
          req.body.deliveryRadiusKm
        ),

      operatingHours

    };

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    if (files?.logo && files.logo[0]) {
      const logoUrl = await uploadImage(
        files.logo[0].buffer,
        files.logo[0].originalname,
        "OFOS/restaurant-logos"
      );
      payload.logoUrl = logoUrl;
    }

    if (files?.coverImage && files.coverImage[0]) {
      const coverImageUrl = await uploadImage(
        files.coverImage[0].buffer,
        files.coverImage[0].originalname,
        "OFOS/restaurant-cover-images"
      );
      payload.coverImageUrl = coverImageUrl;
    }

    const data =
      await this.restaurantService
        .createRestaurant(
            userId,
          payload
        );

    return res.status(201).json(data);

  }
);

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

});

  // update restaurant status

updateRestaurantStatus = asyncHandler(async(
    req: Request,
    res: Response
) => {
        const rawId = req.params.id;

        if (!rawId || Array.isArray(rawId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing restaurant id"
            });
        }

        const restaurantId: string = rawId;

      const user = req.user as Express.payload | undefined;
    if(!user || typeof user.userId !== "string"){
        throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

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
                message: "Invalid or missing restaurant id"
            });
        }

        const restaurantId: string = rawId;


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
});

// GET restaurant reviews 
getRestaurantReviews = asyncHandler(async(
    req: Request,
    res: Response
) => {


        const restaurantId =
        req.params.id as string;

        const page =
        Number(req.query.page) || 1;

        const limit =
        Number(req.query.limit) || 10;

        const reviewsResponse =
        await this.restaurantService
        .getRestaurantReviews(
            restaurantId,
            page,
            limit
        );

        const reviewsData = reviewsResponse.data;

        return res.status(200).json({
            success:true,
            data: reviewsData?.reviews ?? [],

            averageRating:
            reviewsData?.averageRating ?? 0,

            pagination:
            reviewsData?.pagination ?? {
                page,
                limit,
                total: 0
            }
        });

});

// Create review
createReview = asyncHandler(async(
    req: Request,
    res: Response
) => {



        const restaurantId =
        req.params.id as string;

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
            success:true,
            message:
                "Review submitted successfully",
            data:review
        });
});

getRestaurantPageData =
asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {

        const branchId =
            req.params.branchId as string;

        const user =
            req.user as Express.payload | undefined;

        const response =
            await this.restaurantService
                .getRestaurantPageData(
                    branchId,
                    user?.userId
                );

        return res
            .status(
                response.statusCode || 200
            )
            .json(response);

    }
);

  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.payload | undefined;
    if (!user || typeof user.userId !== "string") {
      throw new AppError("Invalid user id", 409);
    }

    const userId = user.userId;

    const data = await this.restaurantService.getDashboardStats(userId);

    return res.status(200).json({
      ...data,
      success: true,
    });
  });
}
