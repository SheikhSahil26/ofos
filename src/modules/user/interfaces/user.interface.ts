export interface IExistUser{
    id: string;
    email: string;
    isDeleted: boolean;
}

export interface IUpdateUser{
    fullName?: string;
    mobile?: string;
    profilePhoto?: string | null;
}

export interface IUser{
    id: string;
    fullName: string;
    email: string;
    mobile: string;
    profilePhoto?: string | null;
    isVerified: boolean;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}