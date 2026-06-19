import { Request, Response } from "express";
import { AddressService } from "../services/address.service";
import { ICreateAddress, IUpdateAddress } from "../interfaces/address.interface";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../utils/appError";
import { AddressValidation } from "../validations/address.validation";

export class AddressController{

    private addressService = new AddressService();

    //get all addresses of users
    getAddresses = asyncHandler( async(req: Request, res: Response) => {

        // const user = req.user as Express.payload | undefined;

        // if(!user || typeof user.userId !== "string"){
        //     throw new AppError("Invalid user id", 409);
        // }

        // const userId = user.userId;

        const userId = "428f4215-9945-4bda-92fb-6d46ae145955";

        AddressValidation.validateId(userId, "user id");

        const response = await this.addressService.getAddresses(userId);

        res.status(response.statusCode || 200).json(response);
    });

    //get address by id
    getAddressById = asyncHandler( async(req: Request, res: Response) => {

        const addressId = req.params.id;
        // const user = req.user as Express.payload | undefined;

        // if(!user || typeof user.userId !== "string"){
        //     throw new AppError("Invalid user id", 409);
        // }

        // const userId = user.userId;

        const userId = "428f4215-9945-4bda-92fb-6d46ae145955";

        if(typeof addressId !== "string"){
            throw new AppError("Invalid address id", 409);
        }

        AddressValidation.validateId(userId, "user id");
        AddressValidation.validateId(addressId, "address id");

        const response = await this.addressService.getAddressById(addressId, userId);

        res.status(response.statusCode || 200).json(response);
    });

    //create new address for user
    createAddress = asyncHandler(async(req: Request, res: Response) => {

        const user = req.user as Express.payload | undefined;

        if(!user || typeof user.userId !== "string"){
            throw new AppError("Invalid user id", 409);
        }

        const userId = user.userId;

        AddressValidation.validateId(userId, "user id");

        const data: ICreateAddress = req.body;

        AddressValidation.validateCreateAddress(data);

        const response = await this.addressService.createAddress(data, userId);

        res.status(response.statusCode || 200).json(response);
    });

    //update address by id
    updateAddressById = asyncHandler(async(req: Request, res: Response) => {

        const addressId = req.params.id;
        const user = req.user as Express.payload | undefined;

        if(!user || typeof user.userId !== "string"){
            throw new AppError("Invalid user id", 409);
        }

        const userId = user.userId;

        const data: IUpdateAddress = req.body;

        if(typeof addressId !== "string"){
            throw new AppError("Invalid address id", 409);
        }

        AddressValidation.validateId(userId, "user id");
        AddressValidation.validateId(addressId, "address id");
        AddressValidation.validateUpdateAddress(data);

        const response = await this.addressService.updateAddressById(addressId, data, userId);

        res.status(response.statusCode || 200).json(response);
    });

    //delete address by id
    deleteAddressById = asyncHandler(async(req: Request, res: Response) => {

        const addressId = req.params.id;
        const user = req.user as Express.payload | undefined;

        if(!user || typeof user.userId !== "string"){
            throw new AppError("Invalid user id", 409);
        }

        const userId = user.userId;

        if(typeof addressId !== "string"){
            throw new AppError("Invalid address id", 409);
        }

        AddressValidation.validateId(userId, "user id");
        AddressValidation.validateId(addressId, "address id");

        const response = await this.addressService.deleteAddressById(addressId, userId);

        res.status(response.statusCode || 200).json(response);
    });

    //set default address for user
    setDefaultAddress = asyncHandler(async(req: Request, res: Response) => {

        const addressId = req.params.id;
        const user = req.user as Express.payload | undefined;

        if(!user || typeof user.userId !== "string"){
            throw new AppError("Invalid user id", 409);
        }

        const userId = user.userId;

        //validating address id and user id
        if(typeof addressId !== "string"){
            throw new AppError("Invalid address id", 409);
        }

        AddressValidation.validateId(userId, "user id");
        AddressValidation.validateId(addressId, "address id");

        const response = await this.addressService.setDefaultAddress(addressId, userId);

        res.status(response.statusCode || 200).json(response);
    });
}