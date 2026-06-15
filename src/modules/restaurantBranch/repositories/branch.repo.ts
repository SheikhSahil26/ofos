import  {prisma} from "../../../config/prisma"
import { OrderStatus, Prisma } from "@prisma/client";
import { IBranchAccessValidation, IBranchDetails, IBranchOrder, IBranchStatusResponse, IBranchValidation, IDeleteBranchResponse, IRestaurantBranchList, IRestaurantBranchResponse, IUpdatedBranchResponse } from "../interfaces/branch.interface";

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

// // Validate if branch exists
// async validateBranchNameExists(
//     restaurantId:string,
//     branchName:string
// ): Promise<{ id:string } | null>{

//     return await prisma.restaurantBranch.findFirst({
//         where:{
//             restaurantId,
//             branchName,
//             isDeleted:false
//         },
//         select:{
//             id:true
//         }
//     });

// }

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
    gstin:string,
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
    fssaiLicense:string,
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

// Validate Branch by id
async validateBranchById(
    branchId:string
): Promise<IBranchValidation | null>{

    return await prisma.restaurantBranch.findUnique({

        where:{
            id:branchId
        },

        select:{
            id:true,
            restaurantId:true,
            isDeleted:true,
            branchName:true,
            gstin:true,
            fssaiLicense:true,
            verificationStatus:true,
            isPrimary:true
        }

    });

}
 
// Get Branch details by id
async getBranchDetails(
    branchId:string
): Promise<IBranchDetails | null>{

    const result = await prisma.restaurantBranch.findUnique({

        where:{
            id:branchId
        },

        select:{

            id:true,

            restaurantId:true,

            branchName:true,

            contactNumber:true,

            addressLine1:true,

            addressLine2:true,

            city:true,

            state:true,

            pincode:true,

            gstin:true,

            fssaiLicense:true,

            verificationStatus:true,

            latitude:true,

            longitude:true,

            deliveryRadiusKm:true,

            isPrimary:true,

            isActive:true,

            createdAt:true,

            updatedAt:true,

            restaurant:{
                select:{
                    id:true,
                    name:true
                }
            },

            head:{
                select:{
                    id:true,

                    user:{
                        select:{
                            id:true,
                            fullName:true,
                            email:true,
                            mobile:true
                        }
                    }
                }
            },

            operatingHours:{
                where:{
                    isDeleted:false
                },

                select:{
                    id:true,
                    dayOfWeek:true,
                    openTime:true,
                    closeTime:true,
                    isClosed:true
                },

                orderBy:{
                    dayOfWeek:"asc"
                }
            }

        }

    });

    return result as IBranchDetails | null;

}


// Validate Branch Name exist
async validateBranchNameExists(
    restaurantId:string,
    branchName:string,
    branchId:string
): Promise<{ id:string } | null>{

    return await prisma.restaurantBranch.findFirst({

        where:{
            restaurantId,
            branchName,
            isDeleted:false,

            NOT:{
                id:branchId
            }
        },

        select:{
            id:true
        }

    });

}

// Get primary branch
async getPrimaryBranch(
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

// Update branch
async updateBranch(
    branchId:string,
    data:Prisma.RestaurantBranchUpdateInput
): Promise<IUpdatedBranchResponse>{

    return await prisma.restaurantBranch.update({

        where:{
            id:branchId
        },

        data,

        select:{
            id:true,
            branchName:true,
            city:true,
            state:true,
            verificationStatus:true,
            isPrimary:true,
            isActive:true,
            updatedAt:true
        }

    });

}


//Update Branch status (rennovation, suspension etc)
async updateBranchStatus(
    branchId:string,
    isActive:boolean
): Promise<IBranchStatusResponse>{

    return await prisma.restaurantBranch.update({

        where:{
            id:branchId
        },

        data:{
            isActive
        },

        select:{
            id:true,
            branchName:true,
            isActive:true,
            updatedAt:true
        }

    });

}


// Delete branch
async deleteBranch(
    branchId:string
): Promise<IDeleteBranchResponse>{

    return await prisma.restaurantBranch.update({

        where:{
            id:branchId
        },

        data:{
            isDeleted:true,
            deletedAt:new Date(),
            isActive:false
        },

        select:{
            id:true,
            branchName:true,
            isDeleted:true,
            deletedAt:true
        }

    });

}

//Count active branches
async countActiveBranches(
    restaurantId:string
): Promise<number>{
    return await prisma.restaurantBranch.count({
        where:{
            restaurantId,
            isDeleted:false
        }
    });
}

//Validate Branch access
async validateBranchAccess(
    branchId:string
): Promise<IBranchAccessValidation | null>{

    return await prisma.restaurantBranch.findUnique({
        where:{
            id:branchId
        },
        select:{
            id:true,
            isDeleted:true,
            restaurant:{
                select:{
                    ownerId:true
                }
            },
            staff:{
                where:{
                    isDeleted:false
                },
                select:{
                    userId:true
                }
            }
        }
    });
}

// get branch details
async getBranchOrders(
    branchId:string,
    skip:number,
    limit:number,
    status?:OrderStatus
): Promise<IBranchOrder[]>{

    return await prisma.order.findMany({
        where:{
            branchId,
            ...(status && {
                status
            })
        },

        select:{
            id:true,
            orderNumber:true,
            status:true,
            paymentStatus:true,
            totalAmount:true,
            placedAt:true,
            customer:{
                select:{
                    id:true,
                    fullName:true
                }
            }
        },
        orderBy:{
            placedAt:"desc"
        },
        skip,
        take:limit
    });

}

// Count branch orders
async countBranchOrders(
    branchId:string,
    status?:OrderStatus
): Promise<number>{

    return await prisma.order.count({
        where:{
            branchId,
            ...(status && {
                status
            })
        }
    });
}
}

