import { Router } from "express";

//express-formidable is a middleware for Express.js that simplifies handling form submissions with enctype multipart/form-data. It is particularly useful when your form includes file uploads.
import formidable from "express-formidable";
//other components imports
import { registerUser } from "../controllers/userController";

const router = Router();

//Router for sign in user
router.post("/register", formidable(), registerUser);

export default router;