import { UserSQL } from './../src/Models/userSQL.model';

export type LoginResult = {
    isSuccess: boolean;
    message: string;
    status: number;
    user?: UserSQL;
    Token?: string;
};