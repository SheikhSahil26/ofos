import { prisma } from "../../../config/prisma";
import { IAddress, ICreateAddress, IUpdateAddress } from "../interfaces/address.interface";

const addressSelect = {
    id: true,
    userId: true,
    label: true,
    addressLine1: true,
    addressLine2: true,
    city: true,
    state: true,
    pincode: true,
    latitude: true,
    longitude: true,
    isDefault: true,
    createdAt: true,
    updatedAt: true
} as const;

export class AddressRepository{

    //check if address exist or not
    async validateAddress(addressId: string, userId : string): Promise<boolean>{
        try{
            const address = await this.getAddressById(addressId, userId);
        
            if(!address){
                throw new Error("Address not found");
            }

            return true;
        }
        catch(err){
            throw err;
        }
    }

    //get all addresses of users
    async getAddresses(userId: string): Promise<IAddress[]>{
        try{
            return prisma.userAddress.findMany({
                where: {
                    userId
                },
                select: addressSelect
            });
        }
        catch(err){
            throw err;
        }
    }

    //get address by id
    async getAddressById(addressId: string, userId: string): Promise<IAddress | null>{
        try{
            return await prisma.userAddress.findFirst({
                where: {
                    id: addressId,
                    userId
                },
                select: addressSelect
            })
        }
        catch(err){
            throw err;
        }
    }

    //create new address for user
    async createAddress(data: ICreateAddress, userId: string): Promise<IAddress>{
        try{
            return prisma.userAddress.create({
                data: {
                    ...data,
                    userId
                },
                select: addressSelect
            });
        }
        catch(err){
            throw err;
        }
    }

    //update address by id
    async updateAddressById(addressId: string, data: IUpdateAddress, userId: string): Promise<IAddress>{
        try{
            return await prisma.userAddress.update({
                where: {
                    id: addressId,
                    userId
                },
                data,
                select: addressSelect
            }); 
        }
        catch(err){
            throw err;
        }
    }

    //delete address by id
    async deleteAddressById(addressId: string, userId: string){
        try{
            await prisma.userAddress.delete({
                where: {
                    id: addressId,
                    userId
                }
            });

            console.log("Address deleted successfully");
        }
        catch(err){
            throw err;
        }
    }

    //reset default address
    async resetDefaultAddress(userId: string): Promise<void>{
        try{
            await prisma.userAddress.updateMany({
                where: {
                    userId
                },
                data: {
                    isDefault: false
                }
            });
            console.log("reset default address")
        }
        catch(err){
            throw err;
        }
    }

    //set default address
    async setDefaultAddress(addressId: string, userId: string): Promise<void>{
        try{
            await prisma.userAddress.update({
                where: {
                    id: addressId,
                    userId
                },
                data: {
                    isDefault: true
                }
            });
            console.log("set default address");
        }
        catch(err){
            throw err;
        }
    }  
}