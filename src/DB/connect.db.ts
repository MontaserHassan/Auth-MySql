import mongoose from 'mongoose';
import { AppDataSource } from '../Config/typeOrm';

export const connect = () => {
    mongoose.set('strictQuery', false);
    mongoose.connect(process.env.DB_URL, {
    }).then(() => { console.log("Database Connected....") })
        .catch((err: Error) => { console.log(err) });
}


export const connectSQL = async () => {
    AppDataSource.initialize()
        .then(() => {
            console.log("Data Source has been initialized!");
        })
        .catch((err) => {
            console.error("Error during Data Source initialization", err);
        })
}