import {Request, Response} from "express";
import { Session, SessionData } from "express-session";
import type { RedisClientType } from 'redis';
import { createUpdootLoader } from "./utils/createUpdootLoader";
import { createUserLoader } from "./utils/createUserLoader";

export type Mycontext = {
    req: Request & { 
        session: Session & Partial<SessionData> & { userId: number };
    };
    redis: RedisClientType;
    res: Response ;
    userLoader: ReturnType<typeof createUserLoader>;
    updootLoader: ReturnType<typeof createUpdootLoader>;
}