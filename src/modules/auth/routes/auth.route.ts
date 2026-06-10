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


    this.router.post('/refresh-token', this.controller.refreshToken);
    this.router.post('/logout', this.controller.logout)

    //Test the Token
    this.router.get('/dashboard', isAuthenticated, (req: Request, res: Response) => {
      const user = req.user as any;

      console.log("user",user)
      const role : string = user.role;

      // console.log(role.toLowerCase());
      

      res.render(`auth/${role.toLowerCase()}/dashboard`)
    })


    // Forget Password  related Routes...........................
    // Token validation with page are pending...
    this.router.route('/forget-password/:email')
      .get(this.controller.forgetPassword)
      .post(this.controller.verifyOtp)

    this.router.get('/static/inbox', isAuthenticated, this.controller.mailInboxPage);
    this.router.get('/static/forget-password', this.controller.forgetPasswordPage);
    this.router.patch('/reset-password', this.controller.resetPassword)

  }
}