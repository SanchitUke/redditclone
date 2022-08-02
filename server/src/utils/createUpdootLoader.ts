import DataLoader from "dataloader";
import { In } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { Users } from "../entities/User";

export const createUpdootLoader = () => new DataLoader<{postId: number, userId: number}, Updoot | null> ( async (keys) => {
    const updoots = await Updoot.findBy(keys as any);
    const updootIdsToUpdoot: Record< string, Updoot> = {};
    updoots.forEach((updoot) => {
        updootIdsToUpdoot[`${updoot.postId}|${updoot.userId}`] = updoot;
    });
    return keys.map((key) => updootIdsToUpdoot[`${key.postId}|${key.userId}`] );
});
