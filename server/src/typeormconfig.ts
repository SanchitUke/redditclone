import path from "path";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { Updoot } from "./entities/Updoot";
import { Users } from "./entities/User";


export const dataSource = new DataSource({
    type: "postgres",
    username: "postgres",//"ubuntu",
    password: "postgres",//"asdfghjkl",
    database: "redditclone2",
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, Users, Updoot]
});