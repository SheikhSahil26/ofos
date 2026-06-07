import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { AddressController } from "../controllers/address.controller";

export class AddressRoute implements IRoutes{
    path =  "/addresses";
    router = Router();
    controller = new AddressController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.get("/", this.controller.getAddresses);
        this.router.get("/:id", this.controller.getAddressById);
        this.router.post("/", this.controller.createAddress);
        this.router.put("/:id", this.controller.updateAddressById);
        this.router.delete("/:id", this.controller.deleteAddressById);
        this.router.patch("/default/:id", this.controller.setDefaultAddress);
    }
}