import { Box, Button, Flex, Heading, Link as ChakraLink } from "@chakra-ui/react"
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from 'next/router';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
    const [{fetching: logoutFetching}, logout] = useLogoutMutation();
    let body = null;
    const[{data, fetching}] = useMeQuery({
        pause: isServer()
    });
    if(fetching) {

    } else if(!data?.me) {
        body = (    
            <>
                <ChakraLink as={NextLink} href = '/login' mr={2}>login</ChakraLink>
                <ChakraLink as={NextLink} href = '/register' >register</ChakraLink>
            </>
        );
    }
    else {
        body = (
            <Flex align='center'>
                <ChakraLink as={NextLink} href = '/create-post' mr={2}>
                {/* <NextLink href="/create-post"> */}
                    <Button variant={"surface"} mr={4}>Create Post </Button>
                {/* </NextLink> */}
                </ChakraLink>
                <Box mr={2}>{data.me.username}</Box>
                <Button onClick = { async() => {
                    await logout({});
                    router.reload();
                }}
                loading =  {logoutFetching}
                variant = "plain" > logout</Button>
            </Flex>
        );
    }
    return(
        <Flex zIndex={1} position='sticky' top={0} bg='tan' p={4} >
            <Flex flex={1} m='auto' align='center' maxW={800}>
                <ChakraLink as={NextLink} href = '/'>
                    <Heading>LiReddit</Heading>
                </ChakraLink>
                <Box ml={ 'auto' }>
                    {body}
                </Box>
            </Flex>
        </Flex>
    );
}