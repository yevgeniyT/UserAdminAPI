import { createValidationMiddleware } from "./createValidationMiddleware";

const signUpValidation = createValidationMiddleware([
    "email",
    "password",
    "firstName",
    "lastName",
]);
const signInValidation = createValidationMiddleware(["email", "password"]);

const resetPasswordValidation = createValidationMiddleware([
    "email",
    "password",
]);

export { signUpValidation, signInValidation, resetPasswordValidation };
