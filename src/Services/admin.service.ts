import { UserModel as User } from '../Models/user.model';


export async function findAllUsersService(userId: string) {
    const users = await User.find({ _id: { $ne: userId } }).select('-password');
    if (!users) {
        return {
            isSuccess: false,
            message: 'Oops..Error Occurred while retrieve data.',
            status: 405,
        };
    } else {
        return {
            isSuccess: true,
            message: 'Find All Users Successfully.',
            status: 200,
            users: users
        };
    };
};

export async function findUserService(user_id: string) {
    const user = await User.findById(user_id).select('-password');
    if (!user) {
        return {
            isSuccess: false,
            message: 'Oops..This User Not Exist.',
            status: 405,
        };
    } else {
        return {
            isSuccess: true,
            message: 'Find User Successfully.',
            status: 200,
            user: user
        };
    };
};

export async function updateUserService(user_id: string, updatedFields: {}) {
    const user = await User.findOneAndUpdate({ _id: user_id }, { $set: updatedFields }, { new: true }).select('-password');
    if (!user) {
        return {
            isSuccess: false,
            message: 'Oops..This User Not Exist So Can not Updated.',
            status: 405,
        }
    } else {
        return {
            isSuccess: true,
            message: 'update User Successfully.',
            status: 200,
            user: user
        }
    }
};