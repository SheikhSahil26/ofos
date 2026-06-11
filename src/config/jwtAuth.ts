import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
import passport from 'passport';
import { Request } from 'express';
import { AuthRepository } from '../modules/auth/repositories/auth.repository';
import { PrismaClient } from '@prisma/client';


const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: String(process.env.JWT_ACCESS_SECRET) || "access_token_secret",
}



const authRepo = new AuthRepository();

passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            // console.log("Helooooo***************8")
            // console.log(jwt_payload)
            const user = await authRepo.getUserByEmailAndRole(jwt_payload.email, jwt_payload.role);

            if (user) {
                return done(null, user);
            }
            else {
                 console.log(user)
                return done(null, false);
            }
        }
        catch (err) {
            console.log(err);
            return done(err, false);
        }
    })
)
