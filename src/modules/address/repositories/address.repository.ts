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
    isDeleted: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
} as const;

export class AddressRepository{

    //get all addresses of users
    async getAddresses(userId: string): Promise<IAddress[]>{
        return prisma.userAddress.findMany({
            where: {
                userId,
                isDeleted: false,
            },
            select: addressSelect
        });
    }

    //get address by id
    async getAddressById(addressId: string, userId: string): Promise<IAddress | null>{
        return await prisma.userAddress.findFirst({
            where: {
                id: addressId,
                userId,
                isDeleted: false,
            },
            select: addressSelect
        });
    }

    //create new address for user
    async createAddress(data: ICreateAddress, userId: string): Promise<IAddress>{

        const payload: any = { userId };
        if (data.label != null) payload.label = data.label;
        if (data.addressLine1 != null) payload.addressLine1 = data.addressLine1;
        if (data.addressLine2 != null) payload.addressLine2 = data.addressLine2;
        if (data.city != null) payload.city = data.city;
        if (data.state != null) payload.state = data.state;
        if (data.pincode != null) payload.pincode = data.pincode;
        if (data.latitude != null) payload.latitude = data.latitude as any;
        if (data.longitude != null) payload.longitude = data.longitude as any;
        if (data.isDefault != null) payload.isDefault = data.isDefault;

        return prisma.userAddress.create({
            data: payload,
            select: addressSelect,
        });
    }

    //update address by id
    async updateAddressById(addressId: string, data: IUpdateAddress, userId: string): Promise<IAddress>{
        return await prisma.userAddress.update({
            where: {
                id: addressId,
                userId
            },
            data,
            select: addressSelect
        }); 
    }

    //delete address by id
    async deleteAddressById(addressId: string, userId: string): Promise<IAddress>{
        return await prisma.userAddress.update({
            where: {
                id: addressId,
                userId
            },
            data:{
                isDeleted: true,
                deletedAt: new Date(),
            },
            select: addressSelect
        });
    }

    //reset default address
    async resetDefaultAddress(userId: string): Promise<void>{
        await prisma.userAddress.updateMany({
            where: {
                userId
            },
            data: {
                isDefault: false
            }
        });
        console.log("reset default address");
    }

    //set default address
    async setDefaultAddress(addressId: string, userId: string): Promise<void>{
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
}