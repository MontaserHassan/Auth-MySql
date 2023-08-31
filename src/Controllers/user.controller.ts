import { NextFunction, Request, Response } from "express";
import { verifyUserService } from '../Services/user.service';
import Logger from '../Config/logger';



export async function verifyUser(req: Request, res: Response) {
    try {
        const result = await verifyUserService(req);

        if (result.isSuccess) {
            Logger.info(`User is verified Successfully id:: (${result.data.id}) Successfully.`, { req });

            return res.status(result.status).json({ message: result.message, data: result.data });

        } else {
            Logger.error(`Occurred Error ${result.message}`, { req });

            return res.status(result.status).json({ message: result.message });
        }
    } catch (error) {
        Logger.error(`Occurred Error ${error.message}`, { req });
        console.log(error);

        return res.status(500).json({ message: error.message });
    }
}