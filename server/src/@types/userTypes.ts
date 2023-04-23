//Use optional fuilds? to handle type error in userController as, all fuilds can be undefined if user not provide input
interface UserPayload {
    email?: string;
    hashPassword?: string;
    firstName?: string;
    lastName?: string;
    avatarImagePath?: string;
}
export { UserPayload };
