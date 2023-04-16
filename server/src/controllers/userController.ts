import { Request, Response } from "express";

//other components imports
import User from "../models/usersSchema";
import { encryptPassword } from "../helper/securePassword";
import { getToken } from "../helper/jwtToken";
import sendEmailWithNodeMailer from "../helper/emailService";
import dev from "../config";

const registerUser = async (req: Request, res: Response) => {
    try {
        //The Partial<T> type is a utility type that makes all properties of the type T optional. In my case, it means that every property of userType can be undefined. Don't forget to handle undefined in midleware.
        const { email, password, firstName, lastName } =
            req.fields as Partial<userType>;
        const { avatarImage } = req.files as Partial<userType>;

        //I want to check if user exist by email
        const isExist = await User.findOne({ email: email });
        if (isExist) {
            return res.status(404).json({
                message: "User is already exist",
            });
        }
        //use exported function to hash the password
        const hashPassword = await encryptPassword(password);

        //place all data in token temporrary while waiting user confermation send to email
        const token = getToken(
            email,
            hashPassword,
            firstName,
            lastName,
            avatarImage
        );
        // That const will be passed to emailService
        const emailData = {
            email,
            subject: "Account Activation Email",
            html: `
            <h2> Hello ${firstName} ${lastName} ! </h2>
            <p> Please click here to <a href="${dev.app.clientUrl}/api/v1/users/activate/${token}" target="_blank"> activate your account </a> </p>`,
        };
        // use fuction from emailService to sent varification email>
        sendEmailWithNodeMailer(emailData);

        res.status(201).json({
            message: "Link has been sent",
            token: token,
        });
    } catch (error: unknown) {
        if (typeof error === "string") {
            console.log("An unknown error occurred.");
        } else if (error instanceof Error) {
            console.log(error.message);
        }
        return res.status(500).json({
            message: "An unknown error occurred.",
        });
    }
};

export { registerUser };
