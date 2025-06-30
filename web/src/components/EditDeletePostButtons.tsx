import { MdEdit, MdDelete  } from "react-icons/md";
import { Box, IconButton, Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface EditDeletePostButtonsProps {
    id: number
    creatorId: number
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({ id, creatorId }) => {
    const [{data: meData}] = useMeQuery();
    const [, deletePost] = useDeletePostMutation();
    if(meData?.me?.id !== creatorId) {
        return null;
    }
    return (
        <Box display={"flex"}>
            <ChakraLink as={NextLink} href={`/post/edit/${id}`} >
            <IconButton 
                aria-label="Edit Post"
                mr={4}
                variant={"surface"}
            > <MdEdit /> </IconButton>
            </ChakraLink>
            <IconButton 
            aria-label="Delete Post" 
            variant={"surface"}
            onClick={() => {
                deletePost({ id });
            }}> <MdDelete color="darkred" /> </IconButton>
        </Box> 
    );
}