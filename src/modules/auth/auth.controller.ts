import type{ Request, Response } from 'express';

export class AuthController {
//   private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    res.send("registered");
    
  };
}
