import { UsernamePasswordInput } from "./UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
    if(!options.email.includes('@')) {
        return [
            {
                field: "email",
                message: "invalid email"
            }
        ];
    }
    if(options.username.length <= 2) {
        return [
            {
                field: "username",
                message: "length should be greater than 2"
            }
        ];
    }
    if(options.username.includes('@')) {
        return  [
            {
                field: "username",
                message: "cannot include @ in username"
            }
        ];
    }
    if(options.password.length <= 2) {
        return [
            {
                field: "password",
                message: "length should be greater than 2"
            }
        ];
    } 
    return null;
}