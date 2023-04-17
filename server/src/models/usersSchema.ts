// Dependencies and types imports
import mongoose, { Schema, Document, model } from "mongoose";

//other components imports
import { getUniqueID } from "../helper/getId";
import { isEmailValid, isStrongPassword } from "../helper/validation";

//Extends the Document interface from Mongoose. This interface represents the structure of a product document in the database, including its properties and their types. Needed first of all for model
export interface IUser extends Document {
    id: String;
    email: String;
    password: String;
    firstName: String;
    lastName: String;
    createdAt: Date;
    role: String;
    // type this way image
    avatarImage: {
        data: Buffer;
        contentType: String;
    };
    isActive: Boolean;
    lastLogin: Date;
}
//The Schema type in Mongoose, when used with TypeScript, is a way to define a schema programmatically while benefiting from type checking and autocompletion. It helps you to ensure that the structure of the schema you create is consistent with Mongoose's expected format.

const userSchema: Schema = new mongoose.Schema({
    //SchemaTypes from mongoose are used to define the types of the fields in a schema. They provide better type safety and ensure consistency between the defined schema and the actual data stored in the database.
    id: {
        type: String,
        required: true,
        default: getUniqueID(),
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: isEmailValid,
            message: "Invalid email fromat",
        },
    },
    password: {
        type: String,
        required: true,
        validator: {
            validator: isStrongPassword,
            message: "Paswword is not strong enough",
        },
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
        default: "user",
    },
    avatarImage: {
        //Buffer is a built-in Node.js class that represents a chunk of binary data. Using Buffer in this case allows you to store image data directly in the MongoDB document as binary data.
        data: Buffer,
        contentType: String, // in future it will store type of file jpg, png ..
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    lastLogin: {
        type: Date,
    },
});

const User = model<IUser>("UsersData", userSchema);

export default User;
