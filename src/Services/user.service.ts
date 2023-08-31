import { verify as jwtVerify } from 'jsonwebtoken';
import { Request } from "express";

export async function verifyUserService(req: Request) {
    let token;
    if (req.headers['authorization'].startsWith(`${process.env.BEARER_SECRET}`)) {
        token = req.headers['authorization'].split(' ')[1];
    };
    if (!token) {
        return {
            isSuccess: false,
            message: 'Unauthorized Access.',
            status: 401,
        }
    };
    const decoded = await jwtVerify(token, process.env.TOKEN_SIGNATURE);
    return {
        isSuccess: true,
        message: 'User Verified',
        status: 200,
        data: decoded
    };
};