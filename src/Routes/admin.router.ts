import { Router } from "express";

import { findAllUsers, findUser, updateUser } from '../Controllers/admin.controller'

import { authPermissionMiddleware, authRoleMiddleware } from "../Middlewares/auth.middleware";


export const adminRouter = Router();


//Admins Only can Access to this router
adminRouter.use(authRoleMiddleware(['Admin']));


adminRouter.get('/users', authPermissionMiddleware('findAllUsers'), findAllUsers);
adminRouter.get('/user/:id', findUser);
adminRouter.patch('/user/:id', updateUser);
