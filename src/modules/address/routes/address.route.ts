import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { AddressController } from "../controllers/address.controller";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware";

export class AddressRoutes implements IRoutes{
    path =  "/addresses";
    router = Router();
    controller = new AddressController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){
        this.router.get("/", isAuthenticated,this.controller.getAddresses);
        this.router.get("/:id", isAuthenticated, this.controller.getAddressById);
        this.router.post("/", isAuthenticated, this.controller.createAddress);
        this.router.put("/:id", isAuthenticated, this.controller.updateAddressById);
        this.router.delete("/:id", isAuthenticated, this.controller.deleteAddressById);
        this.router.patch("/default/:id", isAuthenticated, this.controller.setDefaultAddress);
    }
}