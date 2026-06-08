import { type Request, type Response, type NextFunction } from 'express';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { configDotenv } from 'dotenv';
configDotenv();


export default function (passport: any) {

    let cookieExtractor = function (req: Request) {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies['token'];
        }
        return token;
    };
  
    let opts: any = {
        jwtFromRequest: cookieExtractor,
        // jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
        secretOrKey: process.env.SECRET
    }

    passport.use(new JwtStrategy(opts, (payload, done) => {
        if (payload) {
            return done(null, payload);
        }
        return done(null, false);
    }));

}