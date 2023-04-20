declare type userType = {
    id: string;
    email: string;
    password: string;
    hashPassword: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    role: string;
    avatarImage: {
        data: Buffer;
        contentType: string;
    };

    isActive: boolean;
    lastLogin: Date;
};
