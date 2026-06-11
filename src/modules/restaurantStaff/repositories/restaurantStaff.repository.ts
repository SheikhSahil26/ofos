import {prisma} from "../../../config/prisma";

export class RestaurantStaffRepository{

    //get branch by id
    async getBranchById(branchId: string){
        return await prisma.restaurantBranch.findFirst({
            where: {
                id: branchId,
                isDeleted: false
            }
        });
    }

    //get staff by branch
    async getStaffByBranch(branchId: string){
        return await prisma.restaurantStaff.findMany({
            where: {
                branchId: branchId,
                isActive: true,
                isDeleted: false
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        mobile: true
                    }
                }
            },
        });
    }

    //checking staff is assigned to particular branch 
    async findStaffAssignment(branchId: string, userId: string){
        return await prisma.restaurantStaff.findUnique({
            where: {
                userId_branchId: {
                    userId,
                    branchId
                }
            }
        });
    }

    //add staff
    async addStaff(branchId: string, userId: string){
        return await prisma.restaurantStaff.create({
            data: {
                branchId,
                userId
            },
            include: {
                user: true
            }
        });
    }

    //reactive staff
    async reactiveStaff(branchId: string, userId: string){
        return await prisma.restaurantStaff.update({
            where: {
                userId_branchId: {
                    userId,
                    branchId
                }
            },
            data: {
                isDeleted: false,
                isActive: true,
                deletedAt: null
            },
            include: {
                user: true
            }
        });
    }

    //remove staff
    async removeStaff(branchId: string, userId: string){
        return await prisma.restaurantStaff.update({
            where: {
                userId_branchId: {
                    userId,
                    branchId,
                }
            },
            data: {
                isDeleted: true,
                isActive: false,
                deletedAt: new Date()
            }
        })
    }
}