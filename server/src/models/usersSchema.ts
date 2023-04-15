import mongoose, { Schema, Document, model } from "mongoose";

//Generating UUID in the schema:
// Pros:
// The ID generation logic is centralized in the schema definition.
// No need to explicitly generate the UUID when creating a new user in the controller.
// Cons:
// The schema becomes less flexible since it always generates a UUID for the id field.
import { v4 as uuidv4 } from "uuid";

//Extends the Document interface from Mongoose. This interface represents the structure of a product document in the database, including its properties and their types. Needed first of all for model
export interface IUser extends Document {
    id: String;
    email: String;
    password: String;
    firstName: String;
    lastName: String;
    createdAt: Date;
    role: String;
    avatarUrl: String;
    idActive: Boolean;
    lastLogin: Date;
}
//The Schema type in Mongoose, when used with TypeScript, is a way to define a schema programmatically while benefiting from type checking and autocompletion. It helps you to ensure that the structure of the schema you create is consistent with Mongoose's expected format.
const userSchema: Schema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        default: uuidv4(),
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    createdAT: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        enum: ["user", "admin", "moderator"],
    },
    avatarUrl: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: {
        type: Date,
    },
});

const User = model<IUser>("UsersData", userSchema);
