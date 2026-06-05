import { Router } from "express";
import type{ IRoutes } from "../../common/interfaces/route.interface.js";
import { AuthController } from "./auth.controller.js";

export class AuthRoutes implements IRoutes {
  path = '/auth';
  router = Router();
  controller = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register',this.controller.register);
    
}
}