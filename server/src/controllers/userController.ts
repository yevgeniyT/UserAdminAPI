import { Request, Response } from "express";

//other components imports
import User from "../models/usersSchema";
import { checkPassword, encryptPassword } from "../helper/securePassword";
import { getToken, verifyToken } from "../helper/jwtToken";
import sendEmailWithNodeMailer from "../services/emailService";
import dev from "../config";

import { UserPayload } from "../@types/userTypes";

//The registerUser function is responsible for collecting user data, sending a verification email with a token. This is done to ensure that users must verify their email addresses before they can access the application. The token sent in the email contains the user data necessary for account activation.
const registerUser = async (req: Request, res: Response) => {
    try {
        //The Partial<T> type is a utility type that makes all properties of the type T optional. In my case, it means that every property of userType can be undefined. Don't forget to handle undefined in midleware.
        const { email, password, firstName, lastName } =
            req.body as Partial<userType>;
        const avatarImage = req.file as Express.Multer.File;

        //I want to check if user exist by email
        const isExist = await User.findOne({ email: email });
        if (isExist) {
            return res.status(404).json({
                message: "User is already exist",
            });
        }
        //use exported function to hash the password
        const hashPassword = await encryptPassword(password);
        // create a const with path of image that will be sored in DB later
        const avatarImagePath = `src/uploads/${avatarImage.filename}`;
        //place all data in token temporrary while waiting user confirmation send to email. getToken recieves 2 parameters, first is objext and the second is array of keys
        const token = getToken(
            { email, hashPassword, firstName, lastName, avatarImagePath },
            ["email", "hashPassword", "firstName", "lastName"]
        );

        // That const will be passed to emailService
        const emailData = {
            email,
            subject: "Account Activation Email",
            html: `
            <h2> Hello ${firstName} ${lastName} ! </h2>
            <p> Please click here to <a href="${dev.app.clientUrl}/api/v1/users/activate?token=${token}" target="_blank"> activate your account </a> </p>`,
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
                return res.status(401).json({
                    message: "Token can be expired",
                });
            }
            // Get decode data from decodedData to use when save data to DB
            const {
                email,
                hashPassword,
                firstName,
                lastName,
                avatarImagePath,
            }: UserPayload = decodedData;
            //Chek if the user exist already
            const isExist = await User.findOne({ email: email });
            if (isExist) {
                return res.status(400).json({
                    message: "User is already exist",
                });
            }
            console.log(avatarImagePath);
            console.log(email);

            //Creating user without image:
            const newUser = new User({
                email: email,
                password: hashPassword,
                firstName: firstName,
                lastName: lastName,
                isActive: true,
            });
            // conditionaly add image to DB
            if (avatarImagePath) {
                newUser.avatarImage = avatarImagePath;
            }
            console.log(newUser);

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
//The loginUser function handles user authentication by checking required fields, verifying the user's existence, and matching the provided password. If successful, it creates a session with a userId key, storing the user's _id from the database, and returns the user's basic information with a success message. In case of errors, it returns appropriate status codes and messages.
const loginUser = async (req: Request, res: Response) => {
    try {
        // 1. Check for missing required fields
        const { email, password } = req.body as Partial<userType>;

        //2 Chek if the user exist already
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                message: "User is not exist, please sing in first",
            });
        }

        // 3. Chect if the password match using helper/securePassword
        // get password from formidable and compare it with paswword in data base
        // use await as without it user will pass varification with any password!!!!!
        // password as string used to define type as sting because without that we have type error. That is because password can be undefined. But as we use validation as middleware in routers we can say for sure it 's a string
        const isPasswordMatched = await checkPassword(
            password as string,
            //String in scheama has String type, while password from payload string primitive. To meet TS requirments toString() is used
            user.password.toString()
        );

        if (!isPasswordMatched) {
            return res.status(400).json({
                message: "Incorrect data. Please try again.",
            });
        }
        // 4. Create a session with a userId key (can be any name) and store the user's _id from the database. We found the user above and have access to it here. This session is stored on the server, and a session cookie containing the _id is passed to the browser. A session is essentially an object that can store multiple key-value pairs.
        req.session.userId = user._id;
        //String in scheama has String type, while role from payload string primitive. To meet TS requirments toString() is used
        req.session.userRole = user.role.toString();

        return res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
            message: "User successfully logged in. Welcome!",
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
//The logoutUser function is a request handler for logging out a user. It first attempts to destroy the user session on the server-side. If there's an error during the session destruction, it responds with a status code of 500 and an error message. If the session is successfully destroyed, the handler clears the "user_session" cookie on the client-side, effectively logging the user out.
const logoutUser = (req: Request, res: Response) => {
    try {
        // Destroy the user session in server
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    message: "An error occurred while logging out.",
                });
            }
            // Clear the session cookie in user side
            res.clearCookie("user_session");

            return res.status(200).json({
                message: "User is logged out",
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
//This function, getUserProfile, is an asynchronous Express route handler that retrieves a user profile using the req.session.userId. It tries to find a user in the database using the findById method. If the user is not found, a 404 status is returned with an error message. If the user is found, a 200 status is returned with the user data and a success message.
const getUserProfile = async (req: Request, res: Response) => {
    try {
        // Here we pass id directly without using pair key-value by using findById methon insted of findByOne and data from session
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({
                message: "Can not find user with such id",
            });
        }

        return res.status(200).json({
            User: user,
            message: "Successful operation",
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
//The updateUserProfile function is an asynchronous Express route handler that updates a user profile using the req.session.userId and the request body. It first checks if the user with the given session ID exists in the database. If not, it returns a 404 status with an error message. If the user exists, it uses the findByIdAndUpdate Mongoose method with the spread operator to update the user's data. The new: true and runValidators: true options ensure the updated document is returned and schema validation rules are applied
const updateUserProfile = async (req: Request, res: Response) => {
    try {
        // 1. Check if the user with id stored in session exist in DB
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({
                message: "Can not find user with such id",
            });
        }
        // 2.Use findByIdAndUpdate mpngoose method to find user and update using spred operator (whatever we have in body - update)
        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            { ...req.body },
            //new: true: By default, the findByIdAndUpdate method returns the original document before the update. When you set the new option to true, it will return the updated document instead.
            //runValidators: true: Mongoose schemas can have validation rules defined, such as required fields, minlength, maxlength, etc. By default, these validation rules are applied when creating new documents, but not when updating existing ones. Setting the runValidators option to true ensures that the update operation follows the schema validation rules, so any updates that don't meet the criteria will result in an error.
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(500).json({
                message: "An error occurred while updating the user profile.",
            });
        }
        res.status(200).json({
            message: "Successful operation",
        });
    } catch (error: unknown) {
        if (typeof error === "string") {
            console.log("An unknown error occurred.");
        } else if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).json({
            message: "An unknown error occurred.",
        });
    }
};
//The deleteUserProfile function is an asynchronous Express route handler that deletes a user profile using the req.session.userId. It first checks if the user with the given session ID exists in the database. If not, it returns a 404 status with an error message. If the user exists, it uses the findByIdAndDelete Mongoose method to delete the user's data.
const deleteUserProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({
                message: "Can not find user with such id",
            });
        }
        await User.findByIdAndDelete(req.session.userId);
        res.status(200).json({
            message: "User was deleted sucessfuly",
        });
    } catch (error: unknown) {
        if (typeof error === "string") {
            console.log("An unknown error occurred.");
        } else if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).json({
            message: "An unknown error occurred.",
        });
    }
};

const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        // 1. Check for missing required fields
        const { email, firstName, lastName } = req.body as Partial<userType>;
        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }

        // 2. Chek if the user exist already
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                message: "User is not exist",
            });
        }

        // 3. Place email to token to use it after confirmation that will be send by email. getToken recieves 2 parameters, first is objext and the second is array of keys
        const token = getToken({ email }, ["email"]);

        // 4. Store email text to be sent by email in variable
        const emailData = {
            email,
            subject: "Reset password Email",
            html: `
            <h2> Hello ${firstName} ${lastName} ! </h2>
            <p> Please click here to <a href="${dev.app.clientUrl}/api/v1/users/reset-password?token=${token}" target="_blank"> reset your password  </a> </p>`,
        };

        // 5. Send email useing fuction from emailService to sent varification email>
        sendEmailWithNodeMailer(emailData);

        res.status(200).json({
            message: "Link to reset password has been sent to your email",
            token: token,
        });
    } catch (error: unknown) {
        if (typeof error === "string") {
            console.log("An unknown error occurred.");
        } else if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).json({
            message: "An unknown error occurred.",
        });
    }
};
const validatePasswordResetToken = async (req: Request, res: Response) => {
    try {
        // 1. Get token from params
        const token = req.params.token;

        // 2. Check if the token exist
        if (!token) {
            return res.status(404).json({
                message: "Token is missing",
            });
        }
        // 3. Varifying and save user to DB. Use finction from helper/jwtToken to verify email and decode data
        verifyToken(token, async (err, decodedData) => {
            if (err) {
                console.log("An error occurred:", err.message);
                return res.status(401).json({
                    message: "Token can be expired",
                });
            }
            res.status(200).json({
                message: "Successful operation",
                email: decodedData.email,
            });
        });
    } catch (error: unknown) {
        if (typeof error === "string") {
            console.log("An unknown error occurred.");
        } else if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).json({
            message: "An unknown error occurred.",
        });
    }
};
const resetPassword = async (req: Request, res: Response) => {
    try {
        // 1. Get data from front end. Important that user is not passing email, it passed as successful massege when user varify token. Just need to store it and pass back to use it to find user in db
        const { email, password } = req.body;

        // 2. Check if we have all fields, Checking done by middlware in routers

        // 4. Encrypt password before saving to db
        const hashPassword = await encryptPassword(password);

        // 4. Update the user in the database using the email
        await User.updateOne(
            { email: email },
            {
                $set: {
                    password: hashPassword,
                },
            }
        );
        res.status(200).json({
            message: "Password updated successfully",
        });
    } catch (error: unknown) {
        if (typeof error === "string") {
            console.log("An unknown error occurred.");
        } else if (error instanceof Error) {
            console.log(error.message);
        }
        res.status(500).json({
            message: "An unknown error occurred.",
        });
    }
};
export {
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    requestPasswordReset,
    validatePasswordResetToken,
    resetPassword,
};
