import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import passport from 'passport';
import { Request } from 'express';
import { UserRepository } from '../modules/auth/repositories/auth.repository';
import { PrismaClient } from '@prisma/client';


const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_TOKEN || "access_token_secret",
}


const prisma = new PrismaClient();
const userRepo = new UserRepository(prisma);

passport.use(
    new Strategy(opts, async (jwt_payload, done) => {
        try {
            const user = await userRepo.getUserByEmailAndRole(jwt_payload.email, jwt_payload.role);

            if (user) {
                return done(null, jwt_payload);
            }
            else {
                return done(null, false);
            }
        }
        catch (err) {
            console.log(err);
            return done(err, false);
        }
    })
)
