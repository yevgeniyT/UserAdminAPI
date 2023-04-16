import jwt from "jsonwebtoken";

import dev from "../config";

//Use optional fuilds to handle type error in userController as, all fuilds can be undefined if user not provide input
const getToken = (
    email?: string,
    password?: string,
    firstName?: string,
    lastName?: string,
    avatarImage?: {
        data: Buffer;
        contentType: string;
    }
): string => {
    if (!email || !password || !firstName || !lastName) {
        // Handle the case where some of the parameters are undefined
        throw new Error("Some required parameters are missing");
    }
    // First object is data which will pe coded in token, secon one is secrect key to uncode
    const token = jwt.sign(
        { email, password, firstName, lastName, avatarImage },
        dev.app.jwtKey,
        //token will be unvalid in to minutes
        { expiresIn: "10m" }
    );
    return token;
};

export { getToken };
