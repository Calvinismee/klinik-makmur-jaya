export type User = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    identity_number?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
    address?: string | null;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
};

export type Auth = {
    user: User;
};
