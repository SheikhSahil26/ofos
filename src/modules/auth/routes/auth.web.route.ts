import { Router, Request, Response } from "express";
import type { IRoutes } from "../../../common/interfaces/route.interface.js";
import { AuthController } from "../controllers/auth.controller.js";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware.js";
import { validate } from "../../../middlewares/signupValidate.js";
import { signupSchema } from "../validators/register.validator.js";
import "../../../config/jwtAuth.js";
import { Payload } from "@prisma/client/runtime/library";


export class AuthWebRoutes implements IRoutes {
  path = '/';
  router = Router();
  controller = new AuthController();


  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {

    this.router.get('/',this.controller.landingPage)


    // Static pages....
    this.router.get(
      "/:role/register", 
      this.controller.registerPage
    );

    this.router.get(
      "/:role/login",
      this.controller.loginPage
    );


    this.router.get('/inbox', this.controller.mailInboxPage);
    this.router.get('/forget-password', this.controller.forgetPasswordPage);
    this.router.get('/reset-password',this.controller.resetPasswordPage)


    this.router.get('/role-selection',this.controller.roleSelectionPage)
    
    //Test the Token
    this.router.get('/:role/dashboard',this.controller.getDashboard)
  }
}