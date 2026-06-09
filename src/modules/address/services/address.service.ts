import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";
import { IAddress, ICreateAddress, IUpdateAddress } from "../interfaces/address.interface";
import { AddressRepository } from "../repositories/address.repository";

export class AddressService{

    private addressRepo = new AddressRepository();

    //check if address exist or not
    async validateAddress(addressId: string, userId : string): Promise<boolean>{
        
        const address = await this.addressRepo.getAddressById(addressId, userId);
    
        if(!address){
            throw new AppError("Address not found");
        }

        return true;
    }

    //get all addresses of users
    async getAddresses(userId: string): Promise<ServiceResponse<IAddress[]>>{

        const addresses = await this.addressRepo.getAddresses(userId);

        return {
            success: true,
            data: addresses,
            message: "Addresses fetched successfully",
            statusCode: 200,
        }
    }

    //get address by id
    async getAddressById(addressId: string, userId: string): Promise<ServiceResponse<IAddress | null>>{

        //check if address exist or not 
        await this.validateAddress(addressId, userId);

        const address = await this.addressRepo.getAddressById(addressId, userId);

        return {
            success: true,
            data: address,
            message: "Address fetched successfully",
            statusCode: 200
        }
    }

    //create new address for user
    async createAddress(data: ICreateAddress, userId: string): Promise<ServiceResponse<IAddress>>{

        if(data.isDefault){
            await this.addressRepo.resetDefaultAddress(userId);
        }

        const address = await this.addressRepo.createAddress(data, userId);

        return {
            success: true,
            data: address,
            message: "Address created successfully",
            statusCode: 200
        }
    }

    //update address by id
    async updateAddressById(addressId: string, data: IUpdateAddress, userId: string): Promise<ServiceResponse<IAddress>>{

        //check if address exist or not
        await this.validateAddress(addressId, userId);

        const address = await this.addressRepo.updateAddressById(addressId, data, userId);

        return {
            success: true,
            data: address,
            message: "Address updated successfully",
            statusCode: 200
        }
    }

    //delete address by id
    async deleteAddressById(addressId: string, userId: string): Promise<ServiceResponse<null>>{

        //check if address exist or not
        await this.validateAddress(addressId, userId);

        await this.addressRepo.deleteAddressById(addressId, userId);

        return {
            success: true,
            message: "Address deleted successfully",
            statusCode: 200,
        }
    }

    //set default address
    async setDefaultAddress(addressId: string, userId: string): Promise<ServiceResponse<null>>{
        //check if address exist or not
        await this.validateAddress(addressId, userId);

        //reset addresses
        await this.addressRepo.resetDefaultAddress(userId);

        //set default address
        await this.addressRepo.setDefaultAddress(addressId, userId);

        return {
            success: true,
            message: "Default address set successfully",
            statusCode: 200
        }
    }
}