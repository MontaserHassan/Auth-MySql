import bcrypt from "bcryptjs";
import crypto from "crypto";
import moment from "moment";
import { sign as jwtSign, verify as jwtVerify } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import axios from "axios";
import querystring from "querystring";

import { UserModel as User, UserInterface } from "../Models/user.model";
import { UserSessionModel as UserSession } from "../Models/userSession.model";
import Token from "../Models/tokenResetPassword.model";

import { sendEmail } from "../Utils/sendEmail.util";
import { calculateExpirationDate } from "../Config/calculateExpirationDate";
import readTemplate from "../Utils/readTemplate.util";

// ------------------------------------- sql ---------------------------------------
import { AppDataSource } from "../Config/sequelize-typeOrm";
import { UserSQL } from '../Models/userSQL.model';
import { UserSessionSQL } from "../Models/userSessionSQL.model";
import { TokenResetPasswordSQL } from "../Models/tokenResetPasswordSQL.model";



const userRepo = AppDataSource.getRepository(UserSQL);
const sessionRepo = AppDataSource.getRepository(UserSessionSQL);
const tokenRepo = AppDataSource.getRepository(TokenResetPasswordSQL);


// ---------------------------------------- third-party ----------------------------------------

async function getKeyclaokAccessTokenByAuthCode(code: string) {
  const tokenUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM_NAME}/protocol/openid-connect/token`;

  const response = await axios.post(
    tokenUrl,
    querystring.stringify({
      grant_type: "authorization_code",
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      //   client_secret: keycloakConfig.clientSecret,
      redirect_uri: process.env.KEYCLOAK_REDIRICT_URL,
      code,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
}
// New Explicit Keycloak
export async function callbackKeycloakURLService(code: string) {
  const access_token = await getKeyclaokAccessTokenByAuthCode(code);
  console.log(access_token);
  const public_key = `-----BEGIN PUBLIC KEY-----\n${process.env.KEYCLOAK_PUBLIC_KEY}\n-----END PUBLIC KEY-----`;
  const data = await jwtVerify(access_token, public_key, { algorithms: ["RS256"], });
  const token: string = await jwtSign({ id: data.sid, role: data.resource_access.account.roles, permission: [], keycloak_user_code: code, }, process.env.TOKEN_SIGNATURE, { expiresIn: "7d" });
  return {
    isSuccess: true,
    message: "Successful Authentication using Keycloak.",
    status: 200,
    userId: data.sid,
    token,
  };
}

export async function createUserSession(token_id: string, user: UserSQL, expiresIn: string): Promise<string> {
  const token: string = await jwtSign({ id: user._id, role: user.role, permission: user.permission, token_id: token_id, }, process.env.TOKEN_SIGNATURE, { expiresIn });
  const expire_date = calculateExpirationDate(expiresIn);
  const newUserSession = new UserSessionSQL();
  newUserSession.user = user._id;
  newUserSession.token_id = token_id;
  newUserSession.expire_date = new Date(Number(expire_date));
  const savedUserSession = await sessionRepo.save(newUserSession);
  if (!savedUserSession) {
    return "Failed";
  } else {
    return token;
  }
}; // session for third-party - done


// -------------------------------------------- sql --------------------------------------------


export async function registerService(firstName: string, lastName: string, email: string, role: string, password: string, permission: string[]) {
  let existingUser = await userRepo.findOne({ where: { email: email } });
  if (existingUser) {
    return {
      isSuccess: false,
      message: "Sorry, This Email Already Exist",
      status: 409,
    };
  };
  const hashPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
  const newUser = new UserSQL();
  newUser.firstName = firstName;
  newUser.lastName = lastName;
  newUser.role = role;
  newUser.email = email;
  newUser.password = hashPassword;
  newUser.permission = permission;
  const savedUser = await userRepo.save(newUser);
  if (!savedUser) {
    return {
      isSuccess: false,
      message: "Sorry, Please try to signup again",
      status: 405,
      user: savedUser,
    };
  } else {
    return {
      isSuccess: true,
      message: "User Sign Up Successfully.",
      status: 201,
      user: savedUser,
    };
  }
}; // done

export async function sendConfirmationMailService(user_id: number, email: string, req: Request) {
  const payload = { userId: user_id };
  const secretKey = process.env.EMAIL_TOKEN;
  const token = jwtSign(payload, secretKey, { algorithm: "HS256", expiresIn: "30d", });
  const parameters = { '{{url}}': `${req.protocol}://${req.headers.host}/api/v1/auth/confirmEmail/${token}` }
  const message = await readTemplate('activateEmail.template.html', parameters);
  sendEmail(email, "Confirm Your Account.", message, user_id);
}; // done

export async function confirmEmailService(token: string) {
  const decoded = jwtVerify(token, process.env.EMAIL_TOKEN);
  if (!decoded) {
    return {
      isSuccess: false,
      message: "In-valid Token.",
      status: 403,
    };
  } else {
    const user = await userRepo.findOne({ where: { _id: decoded.userId } });
    if (!user) {
      return {
        isSuccess: false,
        message: "In-valid User ID.",
        status: 403,
      };
    } else {
      if (user.confirm_email) {
        return {
          isSuccess: false,
          message: "You already confirmed Please proceed to login Pages.",
          status: 403,
        };
      } else {
        user.confirm_email = true;
        await userRepo.save(user);
        return {
          isSuccess: true,
          message: "Done Please log In.",
          status: 200,
          user: user,
        };
      };
    };
  };
}; // done

export async function resendConfirmEmailService(req: Request, userId: number) {
  const user = await userRepo.findOne({ where: { _id: userId } });
  if (!user) {
    return {
      isSuccess: false,
      message: "In-valid User ID Or This User is not exist.",
      status: 403,
    };
  } else {
    if (user.confirm_email) {
      return {
        isSuccess: false,
        message: "You already confirmed Please proceed to login Page.",
        status: 403,
      };
    } else {
      const payload = { userId: user._id };
      const secretKey = process.env.EMAIL_TOKEN;
      const token = jwtSign(payload, secretKey, {
        algorithm: "HS256", expiresIn: "30d",
        //issuer: 'your-issuer',
        //audience: 'your-audience',
      });
      // send Email
      const parameters = { '{{url}}': `${req.protocol}://${req.headers.host}/api/v1/auth/confirmEmail/${token}` }
      const message = await readTemplate('activateEmail.template.html', parameters);
      sendEmail(user.email, "Confirm Your Account.", message, user._id);
      return {
        isSuccess: true,
        message: "Check Your mail.",
        status: 200,
      };
    }
  }
}; // done

export async function loginService(email: string, password: string, rememberMe: boolean) {
  console.log("4")
  console.log('email: ', email)
  let user = await userRepo.findOne({ where: { email: email } });
  console.log('user: ', user)
  if (!user) {
    console.log("5")
    return {
      isSuccess: false,
      message: "In-valid Email OR Password.",
      status: 404,
    };
  } else {
    if (!user.confirm_email) {
      return {
        isSuccess: false,
        message: "Please confirm your Email first.",
        status: 400,
      };
    } else {
      if (user.isBlocked) {
        return {
          isSuccess: false,
          message: "Your account has blocked by Admin.",
          status: 400,
        };
      } else {
        if (user.authByThirdParty) {
          return {
            isSuccess: false,
            message: "You Can't Login From This Page. Please Reset Your Password. Thanks For Your Time.",
            status: 400,
          };
        } else {
          const match = await user.checkPasswordIsValid(password);
          if (!match) {
            return await lockUserLogin(user);
          } else {
            const result = await unlockLoginTimeFun(user);
            console.log("6")
            if (result.isSuccess === false) { return result }
            user = result.user;
            let expiresIn = "24h";
            if (rememberMe) { expiresIn = "7d" }
            const SESSION_CONFIG = process.env.SESSION_CONFIG || "useSessionTable";
            if (SESSION_CONFIG == "useSessionTable") {
              const token_id = uuidv4();
              // Get Access Code 
              // let data = await axios.get(`http://localhost:8080/api/v1/assets/getAccessCodesV2?role=${user.role}`);
              const resUserSessionToken = await createUserSessionV2(token_id, user, expiresIn);
              if (resUserSessionToken == "Faild") {
                return {
                  isSuccess: false,
                  message: "Oops, Occurred a problem While login. Please Try Login again.",
                  status: 401,
                };
              }
              return {
                isSuccess: true,
                message: "User Login Successfully.",
                status: 200,
                user: user,
                Token: resUserSessionToken,
              };
            } else if (SESSION_CONFIG == "notUseSessionTable") {
              // Get Access Code 
              // let data = await axios.get(`http://localhost:8080/api/v1/assets/getAccessCodesV2?role=${user.role}`);
              // const TokenJWT = await jwtSign({ id: user._id, role: user.role, permission: user.permission, accessCodes: data.data.result }, process.env.TOKEN_SIGNATURE, { expiresIn });
              const TokenJWT = await jwtSign({ id: user._id, role: user.role, permission: user.permission }, process.env.TOKEN_SIGNATURE, { expiresIn });
              return {
                isSuccess: true,
                message: "User Login Successfully.",
                status: 200,
                user: user,
                Token: TokenJWT,
              };
            }
          }
        }
      }
    }
  }
}; // done

export async function logoutService(userId: number, token_id: string) {
  let userLogOut = await userRepo.findOne({ where: { _id: userId } });
  userLogOut.lastSeen = new Date(moment().format());
  await userRepo.save(userLogOut);
  if (!userLogOut) {
    return {
      isSuccess: false,
      message: "Sorry, Please try to Logout Again.",
      status: 401,
    };
  }
  if (process.env.SESSION_CONFIG == "useSessionTable") {
    const deActiveUserSession = await sessionRepo.findOne({ where: { token_id: token_id, user: userId } });
    deActiveUserSession.active = false;
    deActiveUserSession.end_date = new Date(moment().format());
    await sessionRepo.save(deActiveUserSession)
    if (!deActiveUserSession) {
      return {
        isSuccess: false,
        message: "Sorry, Please try to Logout again.",
        status: 401,
      };
    } else {
      return {
        isSuccess: true,
        message: "User Logout Successfully.",
        status: 200,
        user: userLogOut,
      };
    }
  } else {
    return {
      isSuccess: true,
      message: "User Logout Successfully.",
      status: 200,
      user: userLogOut,
    };
  };
}; // done

async function createUserSessionV2(token_id: string, user: UserSQL, expiresIn: string): Promise<string> {
  const token: string = await jwtSign({ id: user._id, role: user.role, permission: user.permission, token_id: token_id }, process.env.TOKEN_SIGNATURE, { expiresIn });
  const expire_date = calculateExpirationDate(expiresIn);
  const newUserSession = new UserSessionSQL();
  newUserSession.user = user._id;
  newUserSession.token_id = token_id;
  newUserSession.expire_date = new Date(Number(expire_date));
  const savedUserSession = await sessionRepo.save(newUserSession);
  if (!savedUserSession) {
    return "Failed";
  } else {
    return token;
  }
}; // mysql - done

export async function generateResetPasswordLinkService(email: string) {
  const user = await userRepo.findOne({ where: { email: email } });
  if (!user) {
    return {
      isSuccess: false,
      message: "User does not exist",
      status: 404,
    };
  };
  const existingToken = await tokenRepo.findOne({ where: { user: user._id } });
  if (existingToken) await tokenRepo.remove(existingToken);
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(process.env.SALT_ROUND));
  console.log('hash: ', hash);
  const newToken = new TokenResetPasswordSQL();
  newToken.user = user._id;
  newToken.token = hash
  await tokenRepo.save(newToken);
  const link = `${process.env.CLIENT_URL}/resetPassword?token=${resetToken}&id=${user._id}`;
  return {
    isSuccess: true,
    message: "Check Your Mail To Reset Your Password.",
    status: 200,
    link: link,
    user_id: user._id,
  };
}; // mysql - done

export async function resetPasswordService(userId: number, token: string, password: string) {
  const passwordResetToken = await tokenRepo.findOne({ where: { user: userId } });
  console.log('passwordResetToken: ', passwordResetToken.token);
  console.log("token: ", token);
  // console.log("token after hash: ", await bcrypt.hash(token, Number(process.env.SALT_ROUND)))
  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!passwordResetToken || !isValid) {
    return {
      isSuccess: false,
      message: "Invalid or expired password reset token.",
      status: 404,
    };
  };
  const hash = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
  const user = await userRepo.findOne({ where: { _id: userId } });
  user.password = hash;
  await userRepo.save(user);
  await tokenRepo.delete({ user: userId });
  return {
    isSuccess: true,
    message: "User Reset Password Successfully Check Your Mail.",
    status: 200,
    user: user,
  };
}; // mysql - done

async function lockUserLogin(user: UserSQL) {
  user.failedLoginAttempts++;
  await userRepo.save(user);
  const currentTimestamp = Date.now();
  if (user.failedLoginAttempts >= Number(process.env.MAX_LOGIN_ATTEMPTS)) {
    if (user.unlockLoginTime && currentTimestamp > user.unlockLoginTime.getTime()) {
      user.failedLoginAttempts = 1;
      user.unlockLoginTime = undefined;
      await userRepo.save(user);
      return {
        isSuccess: false,
        message: "In-valid Email Or Password.",
        status: 400,
      };
    }
    if (!user.unlockLoginTime) {
      const lockTime = calculateExpirationDate(process.env.LOCK_TIME);
      user.unlockLoginTime = new Date(Number(lockTime));
      await userRepo.save(user);
    }
    const remainingMilliseconds = user.unlockLoginTime.getTime() - currentTimestamp;
    const remainingMinutes = Math.ceil(remainingMilliseconds / (1000 * 60)); // Convert milliseconds to minutes 
    return {
      isSuccess: false, message: `Too many failed login attempts. Please try again after ${remainingMinutes} minutes.`,
      status: 401,
    };
  } else {
    return {
      isSuccess: false,
      message: "In-valid Email Or Password.",
      status: 400,
    };
  }
}; // mysql - done

async function unlockLoginTimeFun(user: UserSQL) {
  if (user.unlockLoginTime !== null && (user.unlockLoginTime.getTime() > Date.now() || null)) {
    const currentTimestamp = Date.now();
    const remainingMilliseconds = user.unlockLoginTime.getTime() - currentTimestamp;
    const remainingMinutes = Math.ceil(remainingMilliseconds / (1000 * 60)); // Convert milliseconds to minutes // mySQL
    return {
      isSuccess: false,
      message: `Too many failed login attempts. Please try again after ${remainingMinutes} minutes.`,
      status: 401,
    };
  } else {
    if (user.unlockLoginTime && Date.now() > user.unlockLoginTime.getTime()) {
      user.failedLoginAttempts = 0;
      user.unlockLoginTime = null;
      await userRepo.save(user);
    }
    else if (user.failedLoginAttempts) {
      user.failedLoginAttempts = 0;
      await userRepo.save(user);
    }
    return {
      isSuccess: true,
      user
    }
  };
}; // done