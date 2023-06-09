//It checks if the user role stored in the session is "admin" and proceeds to the next middleware if the condition is met. If the user role is not "admin", it returns a 401 Unauthorized response with a corresponding message.

// Import necessary modules and types
import { Request, Response, NextFunction } from "express";

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.session.userRole);
        // Check if the session exist
        if (!req.session) {
            return res
                .status(401)
                .json({ message: "Unauthorized: No session found" });
        }
        const role = req.session.userRole;

        if (role === "admin") {
            next();
        } else {
            res.status(401).json({
                message: "Unauthorized: Only admins can access this resource",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An unknown error occurred.",
        });
    }
};

export { isAdmin };
