import { Response } from 'express';
import { Request } from 'express';
import { NextFunction } from 'express';
import AppError from './appErorr';
import Logger from '../Config/logger';

const sendErrorDev = (error: AppError, res: Response, req: Request) => {
    res.status(error.statusCode).json({
        status: error.status,
        error: error,
        message: error.message,
        stack: error.stack
    });
    Logger.error(`error: ${error}`, {req}); //\nerror stack: ${error.stack}
}

const sendErrorProd = (error: AppError, res: Response, req: Request) => {
    if(error.isOperational){
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Oops! something went wrong',
        });
        Logger.error(`error: ${error}`, {req});//\nerror stack: ${error.stack}
    }
}
export default (error: AppError, req: Request, res: Response, next: NextFunction) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res, req);
    } else {
        sendErrorProd(error, res ,req);
    }
}