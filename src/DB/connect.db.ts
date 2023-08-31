import mongoose from 'mongoose';

import { AppDataSource } from '../Config/sequelize-typeOrm';
// import { sequelize } from "../Config/sequelize";

export const connect = () => {
    mongoose.set('strictQuery', false);
    mongoose.connect(process.env.DB_URL, {
    }).then(() => { console.log("Database Connected....") })
        .catch((err: Error) => { console.log(err) });
}


// import { createConnection } from 'mysql2';

// export const connect = async () => {
//     const connection = createConnection({
//         host: process.env.DB_MYSQL,
//         user: process.env.DB_MYSQL_USER,
//         password: process.env.DB_MYSQL_PASSWORD,
//     });
//     try {
//         await connection.promise().connect();
//         console.log('Connected to MySQL server');
//         const dbName = process.env.DB_MYSQL_DATABASE;
//         await connection.promise().query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
//         console.log(`Database ${dbName} created or already exists`);
//     } catch (error) {
//         console.error('Error connecting to MySQL server:', error);
//     };
// };

// export const connectSQL = async () => {
//     try {
//         await sequelize.authenticate();
//         // console.log('Connected to MySQL server');
//         // await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_MYSQL_DATABASE}`);
//         // console.log(`Database ${process.env.DB_MYSQL_DATABASE} created or already exists`);
//     } catch (error) {
//         console.error('Error connecting to MySQL server:', error);
//     }
// };


export const connectSQL = async () => {
    AppDataSource.initialize()
        .then(() => {
            console.log("Data Source has been initialized!")
        })
        .catch((err) => {
            console.error("Error during Data Source initialization", err)
        })
}