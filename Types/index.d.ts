import Iuser from "Interfaces/user.interface";

//import Express, { Request } from 'express';

declare module 'express-serve-static-core' {
    export interface Request {
        user: Iuser,
        token_id: string
    }
}
