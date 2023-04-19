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
import { isLoggedIn } from "../middlewares/ensureAuthenticated";

const userRouter = Router();

//Using the session middleware in the userRouter instead of the main app.js file allows for more fine-grained control over which routes or groups of routes require session management. By applying the session middleware to the userRouter, you are specifically enabling sessions for user-related routes, while other routes in your application will not have access to session data.
//If you apply the session middleware in the main app.js file, it will be applied to all routes in the entire application. This can result in unnecessary overhead for routes that don't need session management, as the middleware will still create and manage session data for all requests, even if they don't use sessions.

userRouter.use(
    session({
        name: "user_session",
        secret: dev.app.sessionSecretKey,
        //resave: false - This option forces the session to be saved back to the session store, even if the session was never modified during the request. When set to false, the session will only be saved if it has been modified. It's generally recommended to set it to false to reduce the session store's load and improve performance.
        resave: false,
        //saveUninitialized: true - This option forces a new, uninitialized session to be saved to the session store. When set to true, the session will be saved even if it is new and has not been modified. This can be helpful for implementing login sessions, but setting it to false is more secure and can help reduce the number of stored sessions on the server.
        saveUninitialized: true,
        //cookie: { secure: true } - This option sets the properties of the session cookie. In this case, the secure option is set to true, which means the session cookie will only be sent over HTTPS connections. This is important for maintaining the security of user data.
        cookie: { secure: false, maxAge: 10 * 60 * 1000 }, //10 minutes is equal to 600 seconds, and there are 1000 milliseconds in a second When the maxAge time elapses, the session cookie will be removed from the client-side, and the user will effectively be logged out. However, the session data might still be stored on the server-side until the session store's data cleanup mechanism removes it.
    })
);

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
