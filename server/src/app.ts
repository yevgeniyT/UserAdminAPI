// import express server, and types
import express, { Application, Request, Response } from "express";

// import dependencies
import cors from "cors";
import nodemon from "nodemon";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";

//other components imports
import connectDB from "./config/db";
import dev from "./config";

// use Application type from express
const app: Application = express();

//to use dependencies
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Server is running OK",
    });
});

const PORT = dev.app.serverPort;

app.listen(PORT, () => {
    console.log("Server is OK");
    connectDB();
});
