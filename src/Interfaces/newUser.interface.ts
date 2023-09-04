export default interface UserInterfaceSQL {
    _id?: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    password: string;
    permission?: string[];

}