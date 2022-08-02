import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./Post";
import { Users } from "./User";


@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @Column({type: "int"})
  value: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => Users)
  @ManyToOne(() => Users, (user) => user.updoots)
  user: Users;

  @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.updoots, {
    onDelete: "CASCADE"
  })
  post: Post;


}
