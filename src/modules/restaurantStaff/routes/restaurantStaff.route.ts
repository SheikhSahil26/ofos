import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { initialize } from "passport";

export class RestaurantStaffRoutes implements IRoutes{
    path = "/staff";
    router = Router();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){

    }
}