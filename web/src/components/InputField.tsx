import { Field, Input, Textarea } from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    name: string;
    label: string;
    textarea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({
    label,
    textarea,
    size: _,
    ...props
}) => {
    let InputOrTextarea = Input; 
    if(textarea) {
        InputOrTextarea = Textarea as any;
    }
    const [field, { error }] = useField(props);
    return(
        <Field.Root invalid={!!error}>
            <Field.Label > { label } </Field.Label>
            <InputOrTextarea {...field} {...props} id={field.name} />
            {error ? <Field.ErrorText>{error}</Field.ErrorText> : null } 
        </Field.Root>
    );  

};
