import { Router } from "express";
import type { IRoutes } from "../../../common/interfaces/route.interface.js";
import { AuthController } from "../controllers/auth.controller.js";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware.js";
import { validate } from "../../../middlewares/signupValidate.js";
import { signupSchema } from "../validators/register.validator.js";

export class AuthRoutes implements IRoutes {
  path = '/auth';
  router = Router();
  controller = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {

    this.router.get(
      "/:role/static/register",
      this.controller.registerPage
    );

    this.router.get(
      "/:role/static/login",
      this.controller.loginPage
    );

    this.router.post(
      "/:role/api/register",
      validate(signupSchema),
      this.controller.register
    );

    this.router.post(
      "/:role/api/login",
      this.controller.login
    );


    this.router.post('/refresh-token',this.controller.refreshToken);


    // Forget Password  related Routes...........................
    this.router.route('/forget-password/:email')
      .get(this.controller.forgetPassword)
      .post(this.controller.verifyOtp)

    this.router.get('/static/inbox', this.controller.mailInboxPage);
    this.router.get('/static/change-password', this.controller.changePasswordPage);
    this.router.patch('/reset-password', this.controller.resetPassword)

  }
}