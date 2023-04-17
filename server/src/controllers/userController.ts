import { Request, Response } from "express";
import fs from "fs";

//other components imports
import User from "../models/usersSchema";
import { encryptPassword } from "../helper/securePassword";
import { getToken, verifyToken } from "../helper/jwtToken";
import sendEmailWithNodeMailer from "../helper/emailService";
import dev from "../config";

//The registerUser function is responsible for collecting user data, sending a verification email with a token. This is done to ensure that users must verify their email addresses before they can access the application. The token sent in the email contains the user data necessary for account activation.
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

//The verifyEmail function is responsible for verifying the token received from the user when they click the activation link in the email. If the token is valid, the function updates the user's record in the database,  and the user's account becomes active.
const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(404).json({
                message: "Token is missing",
            });
        }
        //Varifying and save user to DB
        //Use finction from helper/jwtToken to verify email and decode data
        verifyToken(token, async (err, decodedData) => {
            if (err) {
                console.log("An error occurred:", err.message);
                return res.status(401).json({
                    message: "Token can be expired",
                });
            }
            // Get decode data from decodedData to use when save data to DB
            const {
                email,
                password,
                firstName,
                lastName,
                avatarImage,
            }: userType = decodedData;
            //Chek if the user exist already
            const isExist = await User.findOne({ email: email });
            if (isExist) {
                return res.status(400).json({
                    message: "User is already exist",
                });
            }
            console.log(decodedData);

            //Creating user without image:
            const newUser = new User({
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                isActive: true,
            });

            //! need to type path and type
            // if (avatarImage) {
            //     newUser.avatarImage.data = fs.readFileSync(avatarImage.path);
            //     newUser.avatarImage.contentType = avatarImage.type;
            // }

            //Save user to DB
            const user = await newUser.save();
            if (!user) {
                return res.status(400).json({
                    message: "User was not created",
                });
            }
            return res.status(200).json({
                message: "User was created, you can sign in",
            });
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

export { registerUser, verifyEmail };
