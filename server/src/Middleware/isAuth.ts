import { MiddlewareFn } from "type-graphql";
import { Mycontext } from "../types";


export const isAuth: MiddlewareFn<Mycontext> = ({ context }, next) => {
    if(!context.req.session.userId) {
        throw new Error("Not authenticated");
    }
    return next();
}