import { Router } from "express";
import session from "express-session";

//express-formidable is a middleware for Express.js that simplifies handling form submissions with enctype multipart/form-data. It is particularly useful when your form includes file uploads.
import formidable from "express-formidable";

//other components imports
import {
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
} from "../controllers/userController";
import { validateFormData } from "../middlewares/valdateFormData";
import dev from "../config";
import { isLoggedIn } from "../middlewares/isLoggedIn";

const userRouter = Router();

//Router for sign in user
userRouter.post("/register", formidable(), validateFormData, registerUser);
//Router for verifying email
userRouter.post("/verify-email", verifyEmail);

userRouter.post("/login", loginUser);
userRouter.get("/logout", logoutUser);

// Read, Update, Delete profile routers using chaining
userRouter
    .route("/profile")
    .get(isLoggedIn, getUserProfile)
    .put(isLoggedIn, updateUserProfile)
    .delete(isLoggedIn, deleteUserProfile);

//Routers tp handele forgot-reset password
userRouter.post("/forgot-password", requestPasswordReset);
userRouter.get("/reset-password/:token", validatePasswordResetToken);
userRouter.put("/reset-password", resetPassword);

export default userRouter;
