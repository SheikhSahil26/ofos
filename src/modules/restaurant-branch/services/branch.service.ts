import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";
import { RestaurantService } from "../../restaurant/services/restaurant.service";
import { ICreateRestaurantBranch, IRestaurantBranchListResponse, IRestaurantBranchResponse } from "../interfaces/branch.interface";
import { BranchRepository } from "../repositories/branch.repo";

export class BranchService {
    private branchRepo : BranchRepository= new BranchRepository(); 
    private restaurantService = new RestaurantService();
            


    // Create new branch for restaurant
    createBranch = async(
    restaurantId:string,
    userId:string,
    payload:ICreateRestaurantBranch
): Promise<ServiceResponse<IRestaurantBranchResponse>> => {

        await this.restaurantService
    .validateRestaurantOwnership(
        restaurantId,
        userId
    );

    // Primary branch validation
    if(payload.isPrimary){

        const primaryBranch =
        await this.branchRepo
        .validatePrimaryBranchExists(
            restaurantId
        );

        if(primaryBranch){

            throw new AppError(
                "Primary branch already exists",
                400
            );

        }

    }

    // GSTIN validation
    if(payload.gstin){

        const gstinExists =
        await this.branchRepo
        .validateGSTINExists(
            payload.gstin
        );

        if(gstinExists){

            throw new AppError(
                "GSTIN already exists",
                400
            );

        }

    }

    //FSSAI License validation
    if(payload.fssaiLicense){

        const fssaiExists =
        await this.branchRepo
        .validateFSSAIExists(
            payload.fssaiLicense
        );

        if(fssaiExists){

            throw new AppError(
                "FSSAI license already exists",
                400
            );

        }

    }

    //Create branch
    const branch =
    await this.branchRepo
    .createBranch({
        restaurant:{
            connect:{
                id:restaurantId
            }
        },
        branchName:
        payload.branchName,
        contactNumber:
        payload.contactNumber,
        addressLine1:
        payload.addressLine1,
        addressLine2:
        payload.addressLine2 ?? null,
        city:
        payload.city,
        state:
        payload.state,
        pincode:
        payload.pincode,
        gstin:
        payload.gstin ?? null,
        fssaiLicense:
        payload.fssaiLicense ?? null,
        latitude:
        payload.latitude ?? null,
        longitude:
        payload.longitude ?? null,
        deliveryRadiusKm:
        payload.deliveryRadiusKm ?? null,
        isPrimary:
        payload.isPrimary ?? false
    });

    return {
        success:true,
        data:branch,
        message:
        "Branch created successfully",
        statusCode:201
    };

}



// get branches by resttaurant id

async getBranches(
    restaurantId:string,
    userId:string,
    page:number,
    limit:number,
    search?:string
): Promise<ServiceResponse<IRestaurantBranchListResponse>>{

    await this.restaurantService
    .validateRestaurantOwnership(
        restaurantId,
        userId
    );

    const skip =
    (page - 1) * limit;

    const branches =
    await this.branchRepo
    .getBranches(
        restaurantId,
        skip,
        limit,
        search
    );

    const total =
    await this.branchRepo
    .countBranches(
        restaurantId,
        search
    );

    return {

        success:true,

        data:{

            branches,

            pagination:{

                total,

                page,

                limit,

                totalPages:
                Math.ceil(
                    total / limit
                )

            }

        },

        message:
        "Branches fetched successfully",
        statusCode:200

    };

}
}