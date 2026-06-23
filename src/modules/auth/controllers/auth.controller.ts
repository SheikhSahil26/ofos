import type { Request, Response } from 'express';
import { IApiResponse, ILoginDto, ISignupDto } from '../interfaces/auth.interface';
import { AuthService } from '../services/auth.service';
import { AuthRepository } from '../repositories/auth.repository';
import jwt from 'jsonwebtoken'
import redisClient from '../../../config/redis';
import { date } from 'joi';


// This below two varible helps for logout directly from the controller...



export class AuthController {

  private authRepo = new AuthRepository();
  private authService = new AuthService();

  landingPage = async (req: Request, res: Response) => {

    return res.render(`auth/ziggy`);
  };

  registerPage = async (req: Request, res: Response) => {

    const role: string = String(req.params.role).toLowerCase();

    return res.render(`auth/${role}/register`, { role: role });
  };

  loginPage = async (req: Request, res: Response) => {
    const role: string = String(req.params.role).toLowerCase();
    return res.render(`auth/${role}/login`, { role: role });
  };

  roleSelectionPage = async (req: Request, res: Response) => {
    console.log("Helooo")
    return res.render(`auth/role-selection`);
  };


  // Register user who does not have already Accounts....
  register = async (req: Request, res: Response) => {
    const userInfo: ISignupDto = req.body
    const role: string =
      String(req.params.role).toUpperCase();


    try {
      const response: IApiResponse = await this.authService.registerUser(userInfo, role);
      if (response.status == 'Success') return res.status(201).json(response);
      else res.status(401).json(response);
    } catch (e: any) {
      res.status(500).json({ message: e.message })
    }
  };

  // Login role wise user..........
  login = async (req: Request, res: Response) => {
    const loginInfo: ILoginDto = req.body
    const role: string =
      String(req.params.role).toUpperCase();

    console.log(loginInfo);

    try {
      const response: IApiResponse = await this.authService.loginUser(loginInfo, role);
      if (response.status == 'Success') {
        const {
          accessToken,
          refreshToken
        } = response.data;


        const days =
          loginInfo.rememberMe === "on"
            ? 30
            : 7;

        res.cookie(
          "refreshToken",
          refreshToken,
          {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: days * 24 * 60 * 60 * 1000
          }
        );

        return res.status(201).json({
          status: "Success",
          statusCode: 200,
          message:
            "User Logged in succesfully..",
          data: {
            accessToken,
          }
        });

      }
      else res.status(401).json(response);
    } catch (e: any) {
      res.status(500).json({ message: e.message })
    }
  };

  logout = async (
    req: Request,
    res: Response
  ) => {

    const refreshToken =
      req.cookies.refreshToken;

    if (refreshToken) {
      await this.authRepo.revokeRefreshToken(
        refreshToken
      );
    }

    res.clearCookie(
      "refreshToken"
    );

    return res.json({
      status: "Success",
      statusCode: 200,
      message: "Logged out"
    });
  };

  // Refresh Token : Comes in picture when the user Access Token expire...
  refreshToken = async (req: Request, res: Response) => {

    console.log("refresh token", req.cookies.refreshToken)

    const refreshToken: string =
      req.cookies.refreshToken;

    const response =
      await this.authService.refreshToken(
        refreshToken
      );

    if (
      response.status === "Error"
    ) {
      return res.status(401).json(
        response
      );
    }

    return res.status(200).json(
      response
    );
  };

  getDashboard = (req: Request, res: Response) => {
    const role: string = String(req.params.role);
    res.render(`${role.toLowerCase()}/dashboard`, { role: role });
  }


  forgetPassword = async (req: Request, res: Response) => {
    const email: string = String(req.params.email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'Error',
        message: 'Invalid formate of Email..'
      })
    }

    try {
      // Verify Email is exist or not...............
      const response: IApiResponse = await this.authService.verifyUserByEmailForOtp(email);
      if (response.status == 'Success') {
        res.cookie('resetToken', response.data.resetToken, {
          maxAge: 5 * 60 * 1000,
          httpOnly: true,
        })
        return res.status(200).json(response);
      }
      else res.status(401).json(response);
    } catch (e: any) {
      res.status(500).json({ message: e.message })
    }

  };

  // Change password Page
  forgetPasswordPage = async (req: Request, res: Response) => {
    res.render('auth/forget-password');
  }

  // Sending the mail simulation page to the user with OTP
  mailInboxPage = async (req: Request, res: Response) => {
    return res.render('auth/inbox')
  }

  // Sending the mail simulation page to the user with OTP
  sentOtpOnMail = async (req: Request, res: Response) => {
    const user = req.user as Express.otpPayload
    console.log("user", user.email)
    const otp = await redisClient.get(`otp:${user.email}`)
    console.log(otp)
    return res.json({
      status: 'Success',
      statusCode: 200,
      data: {
        email: user.email,
        otp: otp
      }
    })
  }

  // Verify OTP with help of redis
  verifyOtp = async (req: Request, res: Response) => {
    const email: string = String(req.params.email);
    const otp: string = req.body.otp;



    try {
      const response: IApiResponse = await this.authService.verifyOTPService(otp, email)

      if (response.status == 'Success') {
        return res.status(200).json(response);
      }
      else res.status(401).json(response);
    } catch (e: any) {
      res.status(500).json({ message: e.message })
    }

  }

  resetPasswordPage = async (req: Request, res: Response) => {
    return res.render('auth/reset-password')
  }


  resetPassword = async (req: Request, res: Response) => {

    const user = req.user as Express.otpPayload
    console.log("user", user)
    const email: string = user.email;

    const password: string = req.body.password;
    if (!password) return res.status(400).json({ message: 'Password must be Required' });

    try {
      const response: IApiResponse = await this.authService.updateUserPasswordService(email, password);

      if (response.status == 'Success') {
        return res.status(200).json(response);
      }
      else res.status(401).json(response);
    } catch (e: any) {
      res.status(500).json({ message: e.message })
    }

  }


}
