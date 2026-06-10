import { Request, Response } from "express";
import { AddressService } from "../services/address.service";
import { ICreateAddress, IUpdateAddress } from "../interfaces/address.interface";

export class AddressController{

    private addressService = new AddressService();

    //get all addresses of users
    getAddresses = async(req: Request, res: Response) => {
        try{
            const userId = req.user.id;

            if(typeof userId !== "string"){
                throw new Error("Invalid user id");
            }

            const addresses = await this.addressService.getAddresses(userId);

            res.status(200).json({success: true, data: addresses});
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "internal server error"});
        }
    }

    //get address by id
    getAddressById = async(req: Request, res: Response) => {
        try{
            const addressId = req.params.id;
            const userId = req.user.id;

            if(typeof addressId !== "string" || typeof userId !== "string"){
                throw new Error("Invalid address id or user id");
            }

            const address = await this.addressService.getAddressById(addressId, userId);

            res.status(200).json({success: true, data: address});
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "internal server error"});
        }
    }

    //create new address for user
    createAddress = async(req: Request, res: Response) => {
        try{
            const userId = req.user.id;

            const data: ICreateAddress = req.body;

            const address = await this.addressService.createAddress(data, userId);

            res.status(200).json({success: true, message: "Address created successfully"});
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "internal server error"});
        }
    }

    //update address by id
    updateAddressById = async(req: Request, res: Response) => {
        try{
            const addressId = req.params.id;
            const userId = req.user.id;

            const data: IUpdateAddress = req.body;

            if(typeof addressId !== "string" || typeof userId !== "string"){
                throw new Error("Invalid address id or user id");
            }

            const address = await this.addressService.updateAddressById(addressId, data, userId);

            res.status(200).json({success: true, message: "Address updated successfully"});
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "internal server error"});
        }
    }

    //delete address by id
    deleteAddressById = async(req: Request, res: Response) => {
        try{
            const addressId = req.params.id;
            const userId = req.user.id;

            if(typeof addressId !== "string" || typeof userId !== "string"){
                throw new Error("Invalid address id or user id");
            }

            await this.addressService.deleteAddressById(addressId, userId);

            res.status(200).json({success: true, message: "Address deleted successfully"});
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "internal server error"});
        }
    }

    //set default address for user
    setDefaultAddress = async(req: Request, res: Response) => {
        try{
            const addressId = req.params.id;
            const userId = req.user.id;
    
            //validating address id and user id
            if(typeof addressId !== "string" || typeof userId !== "string"){
                throw new Error("Invalid address id or user id");
            }
    
            await this.addressService.setDefaultAddress(addressId, userId);

            res.status(200).json({success: true, message: "default address saved"});
        }
        catch(err){
            console.log(err);
            res.status(500).json({success: false, message: "internal server error"});
        }
    }
}