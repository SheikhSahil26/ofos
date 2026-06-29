import { Request, Response, NextFunction } from "express";
import passport from "passport";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  passport.authenticate(
    'jwt',
    { session: false }
    
    ,
    (err: any, user: any) => {

      if (err) {
        return next(err);
      }

      // console.log("Here use.............",user)

      
      

      if (!user) {
        return res.status(401).json({
          status: "Error",
          statusCode:401,
          message: "new kdfk User"
        });
      }

      console.log("Authenticated user:", user);

      req.user = user;
      console.log("req.user", user);

      next();
    }
  )(req, res, next);

};