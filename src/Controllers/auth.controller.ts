import { NextFunction, Request, Response } from "express";

import AppError from "../Utils/appErorr";
import { sendEmail } from "../Utils/sendEmail.util";
import Logger from "../Config/logger";
import passport from "../Config/passport";
import readTemplate from "../Utils/readTemplate.util";

import {
  registerService,
  sendConfirmationMailService,
  loginService,
  confirmEmailService,
  resendConfirmEmailService,
  logoutService,
  generateResetPasswordLinkService,
  resetPasswordService,
  callbackKeycloakURLService,
} from "../Services/auth.service";


export async function Register(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, role, password, permission } = req.body;

    // Call Service
    const result = await registerService(firstName, lastName, email, role, password, permission);
    if (result.isSuccess) {
      sendConfirmationMailService(result.user._id, result.user.email, req);
      Logger.info(`email: (${result.user.email}) Created Successfully.`, {
        req,
      });
      return res
        .status(result.status)
        .json({ message: result.message, user: result.user });
    } else {
      return res.status(result.status).json({ message: result.message });
    }
  } catch (error) {
    if (error.keyValue?.email) {
      res.status(409).json({ message: "This Email Already Exist" });
    } else {
      res.status(500).json({ message: "catch error : " + error.message });
    }
  };
};

export async function Login(req: Request, res: Response) {
  const { email, password, rememberMe } = req.body;
  try {
    const result: any = await loginService(email, password, rememberMe);
    if (result.isSuccess) {
      Logger.info(`UserId: (${result.user._id}) email: (${result.user.email}) LogIn Successfully.`, { req });
      return res.status(result.status).json({ message: result.message, user: result.user, token: result.Token });
    } else {
      Logger.error(`${result.message}`, { req });
      return res.status(result.status).json({ message: result.message });
    }
  } catch (error) {
    Logger.error(`Error Occurred While This User Try to LogIn email:(${email}) Error: ${error.message}.`, { req });
    res.status(500).json({ message: "Catch Error" + error.message });
  }
};

export async function confirmEmail(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const result = await confirmEmailService(token);
    if (result.isSuccess) {
      Logger.info(`This User id: (${result.user._id}) Confirmed Email Successfully.`, { req });
      return res.status(result.status).json({ message: result.message });
    } else {
      Logger.error(`This User id: (${result.user._id}) ${result.message}`, { req, });
      return res.status(result.status).json({ message: result.message });
    }
  } catch (error) {
    if (error.message == "jwt expired") {
      Logger.error(`Your Token is Expired`, { req });
      res.status(500).json({ message: "Your Token is Expired" });
    } else {
      Logger.error(`${error}`, { req });
      res.status(500).json({ message: "Catch Error", error });
    }
  }
}; // done

export async function resendConfirmEmail(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    console.log("userId: ", Number(userId));
    const result = await resendConfirmEmailService(req, Number(userId));
    console.log(result)
    if (result.isSuccess) {
      Logger.info(`This User id: (${userId}) Resend Confirmed Email Successfully.`, { req });
      return res.status(result.status).json({ message: result.message });
    } else {
      Logger.error(`This User id: (${userId}) ${result.message}`, { req });
      return res.status(result.status).json({ message: result.message });
    }
  } catch (error) {
    Logger.error(`Error Occurred While Resend Confirmed Email To This User (${req.params.userId}) : ${error.message}.`, { req });
    res.status(500).json({ message: "Catch Error" + error.message });
  }
}; // done

export async function Logout(req: Request, res: Response) {
  const userId = Number(req.user.userId);
  const token_id = req?.token_id || "empty";
  try {
    const result = await logoutService(userId, token_id);
    if (result.isSuccess) {
      Logger.info(`-email: (${result.user.email}) Logout Successfully.`, { req, });
      return res.status(result.status).json({ message: result.message });
    } else {
      Logger.error(`${result.message}`, { req });
      return res.status(result.status).json({ message: result.message });
    }
  } catch (error) {
    Logger.error(`Error Occurred While This User Try to LogIn id:(${userId}) Error: ${error.message}.`, { req });
    res.status(500).json({ message: "Catch Error" + error.message });
  }
}; // done


export function authenticateByKeycloak(req: Request, res: Response, next: NextFunction) {
  const redirectUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM_NAME}/protocol/openid-connect/auth?client_id=${process.env.KEYCLOAK_CLIENT_ID}&redirect_uri=${process.env.KEYCLOAK_REDIRICT_URL}&response_type=code&scope=openid profile email`;
  res.redirect(redirectUrl);
};

export async function callbackKeycloakURL(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.query;
    const result = await callbackKeycloakURLService(code as string);
    Logger.info(`This UserId (${result.userId}) is Authenticated by Keycloak`, {
      req,
    });
    console.log(result);
    res.cookie("Token", result.token);
    res.redirect("http://localhost:3001");
  } catch (error) {
    Logger.error(
      `Error Occurred While Authenticating using Keycloak, Error: ${error.message}.`,
      { req }
    );
    res.redirect("http://localhost:3001");
  };
};

export async function logoutByKeycloak(req: Request, res: Response) {
  const redirectUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM_NAME}/protocol/openid-connect/logout?client_id=${process.env.KEYCLOAK_CLIENT_ID}`;
  res.redirect(redirectUrl);
}


// Auth By Google
export function authenticateByGoogle(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("google", { scope: ["email", "profile"], })(req, res, next);
};

export function callbackGoogleURL(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("google", { session: true }, (err, token, user) => {
    if (err) {
      Logger.error(`This UserId (${user._id}) is failed to Authenticated by Google`, { req });
      return next(err);
    }
    Logger.info(`This UserId (${user._id}) is Authenticated by Google`, { req, });
    res.cookie("Token", token);
    res.redirect("http://localhost:3001");
  })(req, res, next);
};


// Auth By Facebook
export function authenticateByFacebook(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("facebook", { scope: ["email"], })(req, res, next);
};

export function callbackFacebookURL(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("facebook", { session: true }, (err, token, user) => {
    if (err) {
      Logger.error(`User with id (${user.id}) failed to be authenticated by Facebook`, { req });
      return next(err);
    }
    Logger.info(`User with id (${user.id}) is authenticated by facebook`, { req, });
    res.cookie("Token", token);
    res.redirect("http://localhost:3001");
  })(req, res, next);
};

export async function requestResetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const result = await generateResetPasswordLinkService(email);
    if (result.isSuccess) {
      const parameters = { '{{url}}': result.link };
      const message = await readTemplate('resetPasswordLink.template.html', parameters);
      sendEmail(email, "Password Reset Request", message, result.user_id);
      Logger.info(`This User id: (${result.user_id}) email: (${email}) Want To Reset Password.`, { req });
      return res.status(result.status).json({ message: result.message });
    } else {
      Logger.error(`This User email: (${email}) ${result.message}`, { req });
      return res.status(result.status).json({ message: result.message });
    }
  } catch (error) {
    Logger.error(`Error Occurred While This User Try to generate reset password link Error: ${error.message}.`, { req });
    return next(new AppError(error.message, 500));
  }
}; // done

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("req.body: ", req.body);
    const { userId, token, password } = req.body;
    const result = await resetPasswordService(userId, token, password);
    if (result.isSuccess) {
      const message = await readTemplate('resetPasswordConfirmation.template.html');
      sendEmail(result.user.email, "Password Reset Request", message, result.user._id);
      Logger.info(`This User id: (${result.user._id}) email: (${result.user.email}) Reset Password Successfully.`, { req });
      return res.status(result.status).json({ message: result.message });
    } else {
      Logger.error(`This User id: (${userId}) ${result.message}`, { req });
      return res.status(result.status).json({ message: result.message });
    }
  } catch (error) {
    Logger.error(`Error Occurred While Try to Send Successful reset password mail: ${error.message}.`, { req });
    return next(new AppError(error.message, 500));
  }
};