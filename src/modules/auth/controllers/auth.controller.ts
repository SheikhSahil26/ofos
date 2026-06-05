import type { Request, Response } from 'express';
import { IApiResponse } from '../interfaces/auth.interface';
import { AuthService } from '../services/auth.service';
export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    res.send("registered");
  };


  // Api that verify email end send email to that user
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
      const response: IApiResponse = await this.authService.verifyUserByEmail(email);
      if (response.status == 'Success') {
        res.cookie('token', response.data.token, {
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
  changePasswordPage = async (req: Request, res: Response) => {
    res.send("This is change Password page");
  }

  // Sending the mail simulation page to the user with OTP
  mailInboxPage = async (req: Request, res: Response) => {

    let user: any = req.user;
    console.log("Helooooooooooo")
    console.log(user)

    const otp = user.otp;
    console.log("Helooooo")
    // const username = user.username;
    // console.log(otp)

    return res.send(`Subject : Reset your Password , OTP-${otp}`);
  }

  // Verify OTP with help of redis
  verifyOtp = async (req: Request, res: Response) => {
    const email: string = String(req.params.email);
    const otp: string = req.body.otp;

    // let user: any = req.user;

    try {
      const response : IApiResponse = await this.authService.verifyOTPService(otp, email)

      if (response.status == 'Success') {
        return res.status(200).json(response);
      }
      else res.status(401).json(response);
    } catch (e: any) {
      res.status(500).json({ message: e.message })
    }

  }

  resetPassword = async (req: Request, res: Response) => {
    
    const user: any = req.user
    const password: string = req.body.password;
    if (!password) return res.status(400).json({ message: 'Password must be Required' });

    try {
        const response: IApiResponse = await this.authService.updateUserPasswordService(user.email, password);

        if (response.status == 'Success') {
            return res.status(200).json(response);
        }
        else res.status(401).json(response);
    } catch (e: any) {
        res.status(500).json({ message: e.message })
    }

  }

  
}
