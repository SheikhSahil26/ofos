import { Router } from "express";
import type { IRoutes } from "../../../common/interfaces/route.interface.js";
import { AuthController } from "../controllers/auth.controller.js";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware.js";

export class AuthRoutes implements IRoutes {
  path = '/auth';
  router = Router();
  controller = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/static/register', this.controller.register);
    
    this.router.route('/forget-password/:email')
          .get(this.controller.forgetPassword)
          .post(this.controller.verifyOtp)

    this.router.get('/static/inbox', this.controller.mailInboxPage);
    this.router.get('/static/change-password', isAuthenticated, this.controller.changePasswordPage);
    this.router.patch('/reset-password', isAuthenticated, this.controller.resetPassword)

  }
}