import { Router } from "express";
import type{ IRoutes } from "../../../common/interfaces/route.interface.js";
import { AuthController } from "../../controllers/auth.controller.js";

export class AuthRoutes implements IRoutes {
  path = '/auth';
  router = Router();
  controller = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/register',this.controller.register);
    
}
}