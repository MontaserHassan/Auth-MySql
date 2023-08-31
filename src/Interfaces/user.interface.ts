export default interface Iuser{
    username?: string,
    userId?: string,
    user_fname?: string,
    user_lname?: string,
    user_role? : Array<string>,
    user_permission? : Array<string>,
    auth? : boolean
}