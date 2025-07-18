import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';

import React, { useState } from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const ForgotPassword: React.FC<{}> = ({}) => {
    const [complete, setComplete] = useState(false);
    const [, forgotPassword] = useForgotPasswordMutation();
    return (
        <Wrapper variant='small'>
            <Formik 
                initialValues = {{ email: "" }} 
                onSubmit = {async (values) => {
                    await forgotPassword(values);
                    setComplete(true);
                }}
            >
                {( { isSubmitting } ) => complete ? <Box>If an account with that email ID exists, we sent you an email</Box> : (
                    <Form>
                        <Box mt = {4}>
                            <InputField
                                name='email'
                                placeholder='email'
                                label='Email'
                                type="email"
                            />
                        </Box>
                        <Button 
                            mt={4} 
                            type='submit' 
                            colorScheme='teal' 
                            loading = { isSubmitting }
                        > 
                            Forgot password 
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);
