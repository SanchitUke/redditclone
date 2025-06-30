import { FaChevronUp, FaChevronDown } from "react-icons/fa6";
import { Flex, IconButton } from '@chakra-ui/react';
import React from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
    post: PostSnippetFragment;

}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [, vote] = useVoteMutation();
    return(
        <Flex direction="column" alignItems="center" mr={4}>
              <IconButton 
                onClick={() => {
                    vote({
                      postId: post.id,
                      value: 1
                    })
                    console.log('voteStatus: ', post.voteStatus);
                }}
                aria-label='upvote' 
                mb={1}
                variant="surface"
                colorPalette={ post.voteStatus === 1 ? "green" : undefined } > <FaChevronUp /></IconButton>
              { post.points } 
              <IconButton aria-label='downvote' mt={1} onClick={() => {
                  vote({
                      postId: post.id,
                      value: -1
                  })
                }} 
                variant="surface" 
                colorPalette={ post.voteStatus === -1 ? "red" : undefined } > <FaChevronDown /> </IconButton>
        </Flex>
    );
}
