import { Router, Request, Response } from "express";
import type { IRoutes } from "../../../common/interfaces/route.interface.js";
import { AuthController } from "../controllers/auth.controller.js";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware.js";
import { validate } from "../../../middlewares/signupValidate.js";
import { signupSchema } from "../validators/register.validator.js";
import "../../../config/jwtAuth.js";
import { Payload } from "@prisma/client/runtime/library";


export class AuthRoutes implements IRoutes {
  path = '/auth';
  router = Router();
  controller = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {

    // Api's.....

    this.router.post(
      "/:role/register",
      validate(signupSchema),
      this.controller.register
    );   

    this.router.post(
      "/:role/login",
      this.controller.login
    );


    this.router.post('/refresh-token', this.controller.refreshToken);
    this.router.post('/logout', this.controller.logout)


    // Forget Password  related Routes...........................
    // Token validation with page are pending...
    this.router.route('/forget-password/:email')
      .get(this.controller.forgetPassword)
      .post(this.controller.verifyOtp)

    this.router.get('/inbox',isAuthenticated,this.controller.sentOtpOnMail);
    this.router.patch('/reset-password', isAuthenticated,this.controller.resetPassword)

  }
}