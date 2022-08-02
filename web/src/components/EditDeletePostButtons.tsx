import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Box, IconButton, Link } from '@chakra-ui/react';
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
        <Box>
            <NextLink href='/post/edit/[id]' as={`/post/edit/${id}`}>
            <IconButton 
                aria-label="Edit Post"
                as={Link}
                icon={<EditIcon/>}
                mr={4}
            />
            </NextLink>
            <IconButton 
            aria-label="Delete Post" 
            icon={<DeleteIcon/>}
            onClick={() => {
                deletePost({ id });
            }}/>
        </Box> 
    );
}