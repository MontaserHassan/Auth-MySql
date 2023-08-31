import mongoose, {Schema, Document} from "mongoose";
import bcrypt, {compare} from 'bcryptjs';

// Define User Interface Schema
export interface UserInterface extends Document{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    permission: string[];
    confirm_email: boolean;
    isBlocked: boolean;
    lastSeen: Date;
    googleToken: string,
    githubToken: string,
    facebookToken: string,
    authByThirdParty: boolean,
    unlockLoginTime: Date;
    failedLoginAttempts: number;
    password: string;
    checkPasswordIsValid(password: string): boolean;
}

// Define Schema
const userSchema: Schema<UserInterface> = new mongoose.Schema({
    firstName: {
        type: String, 
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String, 
        required: [true, 'email is required'], 
        match: [/^\S+@\S+\.\S+$/, 'Please fill a valid email address'], 
        unique: true
    },
    role: {
        type: String, 
        default: 'projectManager', 
        required: true, 
        enum: ['admin', 'user', 'projectManager','departmentManager']
    },
    permission: [
        { 
            type: String 
        }
    ],
    confirm_email: {
        type: Boolean,
        required: true,
        default: false
    },
    isBlocked: {
        type: Boolean,
        required: true,
        default: false
    },
    lastSeen: {
        type: Date
    },
    googleToken: {
        type: String,
        required: false
    },
    githubToken: {
        type: String,
        required: false
    },
    facebookToken: {
        type: String,
        required: false
    },
    authByThirdParty: {
        type: Boolean,
        default: false
    },
    unlockLoginTime: Date,
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    password: {
        type: String, 
        required: true,
        
    }
},
{ 
    timestamps: true 
});


// Add Method To Check Password Validate
userSchema.methods.checkPasswordIsValid = async function (password: string) : Promise<boolean> {
    const RES = await compare(password, this.password);

    return RES;
};


// Hash Password Pre Save
// userSchema.pre('save', async function (next) {
//     this.password = await bcrypt.hash(this.password , parseInt(process.env.SALT_ROUND));
//     next();
// });




// Create UserModel
export const UserModel = mongoose.model<UserInterface>("authUsers", userSchema);
