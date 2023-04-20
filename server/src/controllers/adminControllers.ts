import { Request, Response } from "express";

//other components imports
import User from "../models/usersSchema";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const allUsers = await User.find({ role: { $ne: "admin" } });

        res.status(200).json({
            message: "List of all users",
            users: allUsers,
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
const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                message: "Can not find user with such id",
            });
        }
        res.status(200).json({
            message: "Successful operation",
            user: user,
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
const createUser = async (req: Request, res: Response) => {
    try {
        // Your implementation logic goes here
        // For example: Fetch data, update data, delete data, etc.

        res.status(200).json({
            message: "Successful operation",
            // Add other relevant response data
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
const updateUserById = async (req: Request, res: Response) => {
    try {
        // Your implementation logic goes here
        // For example: Fetch data, update data, delete data, etc.

        res.status(200).json({
            message: "Successful operation",
            // Add other relevant response data
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
const deleteUserById = async (req: Request, res: Response) => {
    try {
        // Your implementation logic goes here
        // For example: Fetch data, update data, delete data, etc.

        res.status(200).json({
            message: "Successful operation",
            // Add other relevant response data
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

export { getAllUsers, getUserById, createUser, updateUserById, deleteUserById };
