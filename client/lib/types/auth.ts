export interface UserInterface {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    date_joined: string;
    phone_number: string | null;
    full_name: string; 
}

export interface UserWriteInterface {
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    phone_number?: string | null;
    password?: string;
    password2?: string;
}