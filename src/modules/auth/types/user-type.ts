import { Document } from "mongoose";

export type User = {

    email: string;
    password: string;
    verifyPassword?: (
        password: string,
        cb: (err: Error, isMatch?: boolean) => void
    ) => void;
};
export type UserDocument = User & Document;