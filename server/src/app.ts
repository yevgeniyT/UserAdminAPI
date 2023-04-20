// import express server, and types
import express, { Application, Request, Response } from "express";

// import dependencies
import cors from "cors";
import nodemon from "nodemon";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";

//other components imports
import connectDB from "./config/db";
import dev from "./config";
import useRouter from "./routes/userRoutes";
import adminRouter from "./routes/adminRoutes";

// use Application type from express
const app: Application = express();

//to use dependencies
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// initialise session globaly inted of use in every router separately to use it between routers
app.use(
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

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Server is running OK",
    });
});

app.use("/api/v1/users", useRouter);
app.use("/api/v1/admin", adminRouter);
const PORT = dev.app.serverPort;

app.listen(PORT, () => {
    console.log("Server is OK");
    connectDB();
});
