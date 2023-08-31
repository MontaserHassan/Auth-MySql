import { Router } from "express";

import {verifyUser} from '../Controllers/user.controller';

export const userRouter = Router();


userRouter.post('/verifyUser', verifyUser);