import { Request, Response } from "express";

const registerUser = (req: Request, res: Response) => {
    try {
        //The Partial<T> type is a utility type that makes all properties of the type T optional. In my case, it means that every property of userType can be undefined. Don't forget to handle undefined in midleware.
        const { email, password, firstName, lastName } =
            req.fields as Partial<userType>;

        const { avatarImage } = req.files as Partial<userType>;
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
