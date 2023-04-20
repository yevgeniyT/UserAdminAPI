//To type the userId property on the req.session object, extend the SessionData interface provided by the express-session package.

//This code extends the SessionData interface with the userId property of type string. By using the declare module syntax, we're telling TypeScript to merge our custom declaration with the existing express-session module.

import { SessionData } from "express-session";

declare module "express-session" {
    interface SessionData {
        userId?: string;
        userRole?: string;
    }
}
