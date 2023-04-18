// Import necessary modules
import { Request, Response, NextFunction } from "express";

import { isEmailValid, isStrongPassword } from "../helper/validation";

const validateFormData = (req: Request, res: Response, next: NextFunction) => {
    const { email, password, firstName, lastName } =
        req.fields as Partial<userType>;
    const { avatarImage } = req.files as Partial<userType>;

    // Check for missing required fields
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "All fields are required." });
    }
    // Validate email
    if (!isEmailValid(email as string)) {
        return res.status(400).json({ error: "Invalid email format." });
    }
    // Validate password
    if (!isStrongPassword(password as string)) {
        return res
            .status(400)
            .json({ error: "Password must be at least 8 characters long." });
    }

    // Proceed to the next middleware if validation passes
    next();
};

export { validateFormData };
