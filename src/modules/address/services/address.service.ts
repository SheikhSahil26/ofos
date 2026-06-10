import { IAddress, ICreateAddress, IUpdateAddress } from "../interfaces/address.interface";
import { AddressRepository } from "../repositories/address.repository";

export class AddressService{

    private addressRepo = new AddressRepository();

    //get all addresses of users
    async getAddresses(userId: string): Promise<IAddress[]>{
        try{
            return this.addressRepo.getAddresses(userId);
        }
        catch(err){
            throw err;
        }
    }

    //get address by id
    async getAddressById(addressId: string, userId: string){
        try{
            //check if address exist or not 
            await this.addressRepo.validateAddress(addressId, userId);

            return await this.addressRepo.getAddressById(addressId, userId);
        }
        catch(err){
            throw err;
        }
    }

    //create new address for user
    async createAddress(data: ICreateAddress, userId: string): Promise<IAddress>{
        try{
            if(data.isDefault){
                await this.addressRepo.resetDefaultAddress(userId);
            }

            return this.addressRepo.createAddress(data, userId);
        }
        catch(err){
            throw err;
        }
    }

    //update address by id
    async updateAddressById(addressId: string, data: IUpdateAddress, userId: string): Promise<IAddress>{
        try{
            //check if address exist or not
            await this.addressRepo.validateAddress(addressId, userId);

            return await this.addressRepo.updateAddressById(addressId, data, userId);
        }
        catch(err){
            throw err;
        }
    }

    //delete address by id
    async deleteAddressById(addressId: string, userId: string){
        try{
            //check if address exist or not
            await this.addressRepo.validateAddress(addressId, userId);

            await this.addressRepo.deleteAddressById(addressId, userId);
        }
        catch(err){
            throw err;
        }
    }

    //set default address
    async setDefaultAddress(addressId: string, userId: string): Promise<void>{
        try{
            //check if address exist or not
            await this.addressRepo.validateAddress(addressId, userId);
    
            //reset addresses
            await this.addressRepo.resetDefaultAddress(userId);
    
            //set default address
            await this.addressRepo.setDefaultAddress(addressId, userId);
        }
        catch(err){
            throw err;
        }
    }
}