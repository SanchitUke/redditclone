import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () =>{
  const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string});
  // console.log("variables:", variables);
  const [{data, error, fetching}] = usePostsQuery({
    variables
  });
  if(!fetching && !data) {
    return(<div>{error?.message}</div>);
  }
 
  return(
    <Layout>
      {!data ? (
        <div>loading</div>
      ) : (
        <Stack spacing={8}>{
          data.posts.posts.map((p) => !p ? null : (
            <Flex key={p.id} p={5} shadow='md' borderWidth='1px' >
              <UpdootSection post={p} />
              <Box flex={1}>
                <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                  <Link>
                    <Heading fontSize='xl'>{p.title}</Heading> 
                  </Link>
                </NextLink>
                <Text>posted by { p.creator.username }</Text>
                <Flex align='center'>
                  <Text flex={1} mt={4}>{p.textSnippet}</Text>
                    <Box ml="auto">
                      <EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
                    </Box> 
                </Flex>
              </Box>
            </Flex>   
          )
        )}</Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button onClick={() => {
            setVariables({
              limit: variables.limit,
              cursor: data.posts.posts[data.posts.posts.length-1].createdAt
            })
            }} isLoading={fetching} m="auto" my={6}>
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
