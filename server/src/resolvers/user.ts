import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import { Users } from "../entities/User";
import { Mycontext } from "../types";
import argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from 'uuid';
import { dataSource } from "../typeormconfig";
import "dotenv/config";

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => Users, {nullable: true})
    user?: Users;
}

@Resolver(Users)
export class UserResolver {
    @FieldResolver(() => String)
    email(@Root() user: Users, @Ctx() { req }: Mycontext) {
        if(req.session.userId === user.id) {
            //this is the current user and email can be shown
            return user.email;
        }
        return "";
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { redis, req }: Mycontext
    ): Promise<UserResponse> {
        if(newPassword.length <= 2) {
            return { errors: [
                {
                    field: "newPassword",
                    message: "length should be greater than 2"
                }
            ]};
        } 
        const key = FORGET_PASSWORD_PREFIX+token;
        const userId = await redis.get(key);
        if(!userId) {
            return { errors: [
                {
                    field: "token",
                    message: "token expired"
                }
            ]};
        }
        const userIdNum = parseInt(userId);
        const user = await Users.findOne({where: { id: userIdNum }});
        
        if(!user) {
            return { errors: [
                {
                    field: "token",
                    message: "user no longer exists"
                }
            ]};
        }
        await Users.update(
            {id: userIdNum}, 
            { password: await argon2.hash(newPassword)}
            );

        await redis.del(key);

        //log in user after change password
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => Boolean)
    async forgotpassword(
        @Arg("email") email: string,
        @Ctx() {redis}: Mycontext
    ) {
        const user = await Users.findOne({where: {email}});
        if(!user) {
            return true;
        }

        const token = v4();
        await redis.set(FORGET_PASSWORD_PREFIX+token, user.id, "EX", 1000 * 60 * 24 * 3 ); //3 days
        await sendEmail(
            email, 
            `<a href="${process.env.FRONTEND_URL}/change-password/${token}">Reset Password</a>`
        );

        return true;
    }

    @Query(() => Users, {nullable: true })
    me( @Ctx() {req}: Mycontext ) {
        console.log("session:", req.session);
        if(!req.session.userId) {
            return null;
        }
        return Users.findOne({where: {id: req.session.userId }});
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() {req}: Mycontext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if(errors) {
            return { errors };
        }
        
        const hashedPassword = await argon2.hash(options.password);
        let user;
        try {
            const result = await dataSource
                .createQueryBuilder()
                .insert()
                .into(Users)
                .values({
                    username: options.username,
                    email: options.email,
                    password: hashedPassword
                })
                .returning('*')
                .execute();
            //console.log("result", result);
            user = result.raw[0];
        } catch(err: any) { 
            //duplicate username error
            if (err.code === '23505') {
                return {
                    errors: [ {
                        field: "username",
                        message: "username already taken"
                    }]
                }   
            }
        }
        //cookie will get set on the user
        //keep them logged in
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: Mycontext
    ): Promise<UserResponse> {
        const user = await Users.findOne( usernameOrEmail.includes('@') ? {where: {email: usernameOrEmail} } : {where: {username: usernameOrEmail}});
        if(!user) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: "that username does not exist"
                    }
                ]
            };
        }
        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password"
                    }
                ]
            };
        }

        req.session.userId = user.id;

        return {
            user
        };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: Mycontext){
        return new Promise((resolve) => req.session.destroy((err: any) => {
            if(err) {
                console.log(err);
                resolve(false);
                return;
            }
            res.clearCookie(COOKIE_NAME);

            resolve(true);
        }));
    }
}
