import express, { type NextFunction, type Request, type Response } from 'express'
import passport from 'passport';
import jwt from 'passport-jwt';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false, failureRedirect: '/login' }, (err: any, user: any) => {
        if (err) return next(err);

        if (!user) {
            return res.status(401).redirect('/api/auth/login')
        }
        req.user = user;
        next();
    })(req, res, next);
}   