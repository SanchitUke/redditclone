import { errorExchange, fetchExchange } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation, VoteMutationVariables, DeletePostMutationVariables } from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { cacheExchange, Resolver, Cache } from '@urql/exchange-graphcache';
import Router from "next/router";
import { gql, stringifyVariables } from '@urql/core';
import { isServer } from "./isServer";

export type MergeMode = 'before' | 'after';

export interface PaginationParams {
  offsetArgument?: string;
  limitArgument?: string;
  mergeMode?: MergeMode;
}

const cursorPagination = (): Resolver => {
  
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(cache.resolve(entityKey, fieldKey) as string, "posts");
    //console.log("isItInTheCache:", isItInTheCache);
    info.partial = !isItInTheCache;
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if(!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      
      //console.log("data:", data, hasMore);
      results.push(...data);
    });
    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results
    };
  };
};

const invalidateAllPosts = ( cache: Cache ) => {
  const allFields = cache.inspectFields('Query');
    const fieldInfos = allFields.filter((info) => info.fieldName === 'posts');
    fieldInfos.forEach((fi) => {
      cache.invalidate("Query", "posts", fi.arguments)
    })
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = '';
  if(isServer()) {
    cookie = ctx.req.headers.cookie;
  }
  const schemaUrl = process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_URL;
  if(!schemaUrl) {
    throw new Error("No schema URL defined");
  }

  return {
    url:  schemaUrl,
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? { cookie } : undefined
    },
    exchanges: [cacheExchange({
      keys: {
        PaginatedPosts: () => null
      },
      resolvers: {
        Query: {
          posts: cursorPagination()
        }
      },
      updates: {
        Mutation: {
          deletePost: (_result, args, cache) => {
            cache.invalidate({ __typename: "Post", id: (args as DeletePostMutationVariables).id})
          },
          vote: (_result, args, cache) => {
            const {postId, value} = args as VoteMutationVariables;
            const data = cache.readFragment(
              gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                }
              `,
              { id: postId } as any
            );
            console.log('data: ', data);
            if(data) {
              if(data.voteStatus === value) {
                return;
              }
              const newPoints = data.points + (!data.voteStatus ? 1 : 2) * value;
              cache.writeFragment(
                gql`
                  fragment _ on Post {
                    points
                    voteStatus
                  }
                `,
                { id: postId, points: newPoints, voteStatus: value}
              );
            }
          },

          createPost: (_result, _args, cache) => {
            invalidateAllPosts(cache);
          },
            
          logout: (_result, _args, cache) => {
            betterUpdateQuery<LogoutMutation, MeQuery> (
              cache,
              {query: MeDocument},
              _result,
              () => ({ me: null })
            )
          },

          login: (_result, _args, cache) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache, 
              {query: MeDocument}, 
              _result, 
              (result, query) => {
                if(result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user
                  };
                }
              }
            );
            invalidateAllPosts(cache);
          },

          register: (_result, _args, cache) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache, 
              {query: MeDocument}, 
              _result, 
              (result, query) => {
                if(result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user
                  };
                }
              }
            );
          },
        },
      }
    }), 
    ssrExchange, errorExchange({
      onError(error) {
        if(error.message.includes("Not authenticated")) {
          Router.push("/login");
        }
      }
    }),
    fetchExchange]
  };
}
