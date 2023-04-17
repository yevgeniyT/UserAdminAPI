import { Router } from "express";

//express-formidable is a middleware for Express.js that simplifies handling form submissions with enctype multipart/form-data. It is particularly useful when your form includes file uploads.
import formidable from "express-formidable";
//other components imports
import {
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser,
} from "../controllers/userController";
import { validateFormData } from "../middlewares/valdateFormData";

const userRouter = Router();

//Router for sign in user
userRouter.post("/register", formidable(), validateFormData, registerUser);
//Router for verifying email
userRouter.post("/verify-email", verifyEmail);

userRouter.post("/login", loginUser);
userRouter.get("/logout", logoutUser);
export default userRouter;
