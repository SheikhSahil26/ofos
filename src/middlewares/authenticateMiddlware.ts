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

      
      

     

      console.log("Authenticated user:", user);

      req.user = user;
      console.log("req.user", user);

      next();
    }
  )(req, res, next);

};