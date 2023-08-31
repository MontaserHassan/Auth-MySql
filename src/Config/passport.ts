
import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { UserModel as User } from "../Models/user.model";
import { generatePasswordFun } from './genratePassword';
import { sign as jwtSign } from 'jsonwebtoken';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { v4 as uuidv4 } from 'uuid';
import { createUserSession } from '../Services/auth.service';

// ------------------------------------- sql -------------------------------------

import { AppDataSource } from "./sequelize-typeOrm";
import { UserSQL } from "../Models/userSQL.model";


const userRepo = AppDataSource.getRepository(UserSQL);


// Google
const config = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};


passport.use(new Strategy(AUTH_OPTIONS, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await userRepo.findOne({ where: { email: profile._json.email } });
    let token: string;
    let role: string
    let permission: string[]
    if (!user) {
      const newUser = new UserSQL();
      newUser.firstName = profile._json.given_name;
      newUser.lastName = profile._json.family_name;
      newUser.role = role || 'User';
      newUser.email = profile._json.email;
      newUser.password = generatePasswordFun();
      newUser.authByThirdParty = true;
      newUser.confirm_email = true;
      newUser.googleToken = accessToken;
      newUser.permission = permission || [];
      user = await userRepo.save(newUser);
    };
    //token = await jwtSign({id:user._id , role:user.role, permission: user.permission} , process.env.TOKEN_SIGNATURE , {expiresIn : '7d'});
    const token_id = uuidv4();
    const expiresIn = '7d';
    const sessionToken = await createUserSession(token_id, user, expiresIn);
    token = sessionToken
    return done(null, token, user);
  } catch (err) {
    console.log(err)
    done(err);
  }
}));


// Facebook
const facebookConfig = {
  FACEBOOK_ID: process.env.FACEBOOK_CLIENT_ID,
  FACEBOOK_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
};

const FACEBOOK_OPTIONS = {
  clientID: facebookConfig.FACEBOOK_ID,
  clientSecret: facebookConfig.FACEBOOK_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'email']
};

passport.use(new FacebookStrategy(FACEBOOK_OPTIONS, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await userRepo.findOne({ where: { email: profile._json.email } });
    let token: string;
    let role: string
    let permission: string[]
    if (!user) {
      const newUser = new UserSQL();
      newUser.firstName = profile._json.given_name;
      newUser.lastName = profile._json.family_name;
      newUser.role = role || 'User';
      newUser.email = profile._json.email;
      newUser.password = generatePasswordFun();
      newUser.authByThirdParty = true;
      newUser.confirm_email = true;
      newUser.facebookToken = accessToken;
      newUser.permission = permission || [];
      user = await userRepo.save(newUser);
    };
    //token = await jwtSign({id:user._id , role:user.role, permission: user.permission} , process.env.TOKEN_SIGNATURE , {expiresIn : '7d'});
    const token_id = uuidv4();
    const expiresIn = '7d';
    const sessionToken = await createUserSession(token_id, user, expiresIn);
    token = sessionToken
    return done(null, token, user);
  } catch (err) {
    console.log(err)
    // Log Error
    done(err);
  };
}));



export default passport;