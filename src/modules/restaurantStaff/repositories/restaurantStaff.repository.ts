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
                id: branchId,
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
    async findStaffAssignment(userId: string, branchId: string){
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