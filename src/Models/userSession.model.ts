import mongoose, {Schema, Document} from "mongoose";


// Define Interface
interface UserSession extends Document{
    user_id: mongoose.Schema.Types.ObjectId,
    token_id: string,
    active: boolean,
    start_date: Date,
    end_date: Date,
    expire_date: Date
};


// Define Schema
const userSessionSchema: Schema<UserSession> = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    token_id:{
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    start_date: {
        type: Date,
        default: Date.now,
    },
    end_date: {
        type: Date,
        required: false
    },
    expire_date: {
        type: Date,
        required: true
    }
});

export const UserSessionModel = mongoose.model<UserSession>("user_session", userSessionSchema);