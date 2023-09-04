import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { UserSQL } from '../Models/userSQL.model';
import { UserSessionSQL } from '../Models/userSessionSQL.model';
import { TokenResetPasswordSQL } from '../Models/tokenResetPasswordSQL.model';
import { RolesSQL } from '../Models/rolesSQL.model';

dotenv.config();


export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST_SQL,
    port: Number(process.env.DB_PORT_SQL),
    username: process.env.DB_MYSQL_USER,
    password: process.env.DB_MYSQL_PASSWORD,
    database: process.env.DB_MYSQL_DATABASE,
    logging: true,
    synchronize: true,
    entities: [UserSQL, UserSessionSQL, TokenResetPasswordSQL, RolesSQL]
});