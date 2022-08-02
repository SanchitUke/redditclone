import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
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
                icon={<ChevronUpIcon />} 
                mb={1}
                colorScheme={ post.voteStatus === 1 ? "green" : undefined } />
              { post.points } 
              <IconButton aria-label='downvote' icon={<ChevronDownIcon />} mt={1} onClick={() => {
                  vote({
                      postId: post.id,
                      value: -1
                  })
                }} colorScheme={ post.voteStatus === -1 ? "red" : undefined } />
        </Flex>
    );
}
