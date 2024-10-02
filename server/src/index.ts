import "reflect-metadata";
import { COOKIE_NAME, _prod_ } from "./constants";
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import cors from 'cors';
import {DataSource} from 'typeorm';
import { Post } from "./entities/Post";
import { Users } from "./entities/User";
import { dataSource } from "./typeormconfig";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import 'dotenv/config';

const main = async () => {

    
    //sendEmail('bob@bob.com', 'hello there');
    // const dataSource = new DataSource({
    //     type: "postgres",
    //     username: "postgres",
    //     password: "postgres",
    //     database: "redditclone2",
    //     logging: true,
    //     synchronize: true,
    //     entities: [Post, Users]
    // });
    
    await dataSource.initialize();
    await dataSource.runMigrations();
    // await Post.delete({});
    const app = express();
    
    const RedisStore = connectRedis(session);
    const redis = new Redis();
    //let redisClient = redis.createClient({ legacyMode: true });
    //redisClient.connect().catch(console.error);

    app.use(
        cors({
            origin: process.env.FRONTEND_URL,
            credentials: true
        })
    );
    const appSecret = process.env.APP_SECRET;
    if(!appSecret) {
        throw new Error("APP_SECRET not found");
    }
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ 
                client: redis,
                disableTouch: true
             }),
             cookie: {
                 maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
                 httpOnly: true,
                 sameSite: "lax", //csrf
                 secure: _prod_,
                //  sameSite: "none", //csrf
                //  secure: true
             },
            saveUninitialized: false,
            secret: appSecret,
            resave: false,
        })
      );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}) => ({ req, res, redis, userLoader: createUserLoader(), updootLoader: createUpdootLoader() }),
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false
    });

    const appPort = parseInt(process.env.APP_PORT!);
    app.listen(appPort, () => {
        console.log(`server started on localhost: ${appPort}`);
    });
};

main().catch((err) => {
    console.error(err); 
});

