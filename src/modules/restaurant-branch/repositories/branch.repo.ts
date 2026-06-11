import  {prisma} from "../../../config/prisma"
import { Prisma } from "@prisma/client";
import { IRestaurantBranchList, IRestaurantBranchResponse } from "../interfaces/branch.interface";

export class BranchRepository {

    // Create a new Branch for a restaurant
    async createBranch(
    payload: Prisma.RestaurantBranchCreateInput
): Promise<IRestaurantBranchResponse>{
    
    return await prisma.restaurantBranch.create({
        data:payload,
        select:{
            id:true,
            restaurantId:true,
            branchName:true,
            contactNumber:true,
            city:true,
            state:true,
            isPrimary:true,
            isActive:true
        }
    });

} 

// Validate if branch exists
async validateBranchNameExists(
    restaurantId:string,
    branchName:string
): Promise<{ id:string } | null>{

    return await prisma.restaurantBranch.findFirst({
        where:{
            restaurantId,
            branchName,
            isDeleted:false
        },
        select:{
            id:true
        }
    });

}

// Validate Primary branch exists for a restaurant

async validatePrimaryBranchExists(
    restaurantId:string
): Promise<{ id:string } | null>{

    return await prisma.restaurantBranch.findFirst({
        where:{
            restaurantId,
            isPrimary:true,
            isDeleted:false
        },
        select:{
            id:true
        }
    });

}

// Validate if GSTIN already exists or not for a branch

async validateGSTINExists(
    gstin:string
): Promise<{ id:string } | null>{

    return await prisma.restaurantBranch.findFirst({
        where:{
            gstin,
            isDeleted:false
        },
        select:{
            id:true
        }
    });

}

// Validate if FSSAI License already exist or not for a branch

async validateFSSAIExists(
    fssaiLicense:string
): Promise<{ id:string } | null>{

    return await prisma.restaurantBranch.findFirst({
        where:{
            fssaiLicense,
            isDeleted:false
        },
        select:{
            id:true
        }
    });

}


// Get branches  by reataurant id with pagination and search(for owner)
async getBranches(
    restaurantId:string,
    skip:number,
    limit:number,
    search?:string
): Promise<IRestaurantBranchList[]>{

    return await prisma.restaurantBranch.findMany({

        where:{
            restaurantId,
            isDeleted:false,

            ...(search && {
                branchName:{
                    contains:search
                }
            })
        },

        select:{
            id:true,
            branchName:true,
            contactNumber:true,
            city:true,
            state:true,
            verificationStatus:true,
            isPrimary:true,
            isActive:true,
            createdAt:true
        },

        skip,

        take:limit,

        orderBy:{
            createdAt:"desc"
        }

    });

}

// count branches for a restaurant
async countBranches(
    restaurantId:string,
    search?:string
): Promise<number>{

    return await prisma.restaurantBranch.count({

        where:{
            restaurantId,
            isDeleted:false,

            ...(search && {
                branchName:{
                    contains:search
                }
            })
        }

    });

}
}


