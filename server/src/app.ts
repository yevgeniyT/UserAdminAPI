// import express server, and types
import express, { Request, Response } from "express";

// import dependencies
import cors from "cors";
import nodemon from "nodemon";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";
import { log } from "console";

const app = express();

//to use dependencies
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Server is running",
    });
});

const PORT = 3002;

app.listen(PORT, () => {
    console.log("Server is OK");
});
