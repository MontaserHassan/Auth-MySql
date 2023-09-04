import { NextFunction, Request, Response } from "express";
import { findAllUsersService, findUserService, updateUserService } from '../Services/admin.service'
import Logger from '../Config/logger';

export async function findAllUsers(req: Request, res: Response) {
    const userId = req.user.userId;
    try {
        const result = await findAllUsersService(userId);
        if (result.isSuccess) {
            Logger.info(`fetch all users Successfully.`, { req });
            res.status(result.status).json({ message: result.message, users: result.users });
        } else {
            Logger.error(`${result.message}`, { req });
            res.status(result.status).json({ message: result.message });
        }
    } catch (error) {
        Logger.error(`${error.message}`, { req });
        res.status(500).json({ message: "catch error : " + error.message });
    }
};

export async function findUser(req: Request, res: Response) {
    const userId = req.user.userId;
    const user_id = req.params['id'];
    try {
        const result = await findUserService(user_id);
        if (result.isSuccess) {

            Logger.info(`fetch user Successfully.`, { req });

            res.status(result.status).json({ message: result.message, user: result.user });

        } else {
            Logger.error(`${result.message}`, { req });

            res.status(result.status).json({ message: result.message });
        }
    } catch (error) {

        Logger.error(`${error.message}`, { req });

        res.status(500).json({ message: "catch error : " + error.message });
    }
}

export async function updateUser(req: Request, res: Response) {
    const userId = req.user.userId;
    const user_id = req.params['id'];
    const updatedFields = req.body;
    try {
        const result = await updateUserService(user_id, updatedFields);
        if (result.isSuccess) {

            Logger.info(`Update user id: (${result.user._id}) Successfully.`, { req });

            res.status(result.status).json({ message: result.message, user: result.user });

        } else {
            Logger.error(`${result.message}`, { req });

            res.status(result.status).json({ message: result.message });
        }
    } catch (error) {

        Logger.error(`${error.message}`, { req });
        res.status(500).json({ message: "catch error : " + error.message });
    }
}
