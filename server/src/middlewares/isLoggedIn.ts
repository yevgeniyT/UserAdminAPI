// The isLoggedIn middleware is responsible for checking if the user is logged in by verifying the existence of a userId in the session object. If the userId exists, the middleware proceeds to the next function in the request-response cycle. If the userId is not found, a 401 Unauthorized status code is sent along with a message informing the user that they need to log in to access the resource.

// Import necessary modules and types
import { Request, Response, NextFunction } from "express";

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check if the session exist
        if (!req.session) {
            return res
                .status(401)
                .json({ message: "Unauthorized: No session found" });
        }
        // Check if the session exists in the cookies; if so, proceed to the next middleware
        console.log(req.session.userId);

        if (req.session.userId) {
            next();
        } else {
            res.status(401).json({
                message:
                    "You are not logged in. Please log in to access this resource.",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An unknown error occurred.",
        });
    }
};

export { isLoggedIn };
