import "reflect-metadata";
import { COOKIE_NAME, _prod_ } from "./constants";
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { createClient } from "redis";
import session from "express-session";
import { RedisStore } from 'connect-redis';
import cors from 'cors';
import { dataSource } from "./typeormconfig";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import http from 'http'
import 'dotenv/config';

const main = async () => {
    
    await dataSource.initialize();
    await dataSource.runMigrations();

    const app = express();

    const redis = createClient({ url: 'redis://127.0.0.1:6379' });
    await redis.connect();
    
    const redisStore = new RedisStore({ 
        client: redis,
        prefix: 'sess:'
    })

    const appSecret = process.env.APP_SECRET;
    if(!appSecret) {
        throw new Error("APP_SECRET not found");
    }
    app.use(
        session({
            name: COOKIE_NAME,
            store: redisStore,
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
    const httpServer = http.createServer(app)

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await apolloServer.start();

    app.use('/graphql',
        cors({
            origin: process.env.FRONTEND_URL,
            credentials: true,
        }),
        express.json(),
        expressMiddleware(apolloServer, {
            context: async ({req, res}) => ({ req, res, redis, userLoader: createUserLoader(), updootLoader: createUpdootLoader() }),
        }),
    );

    const appPort = parseInt(process.env.APP_PORT!);
    
    await new Promise<void>(resolve => httpServer.listen({ port: appPort }, resolve));
    console.log(`🚀 Server ready at http://localhost:${appPort}/graphql`);

};

main().catch((err) => {
    console.error(err); 
});

