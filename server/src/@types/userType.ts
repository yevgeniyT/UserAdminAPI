declare type userType = {
    id: String;
    email: String;
    password: String;
    firstName: String;
    lastName: String;
    createdAt: Date;
    role: String;
    avatarImage: {
        data: Buffer;
        contentType: String;
    };

    isActive: Boolean;
    lastLogin: Date;
};
