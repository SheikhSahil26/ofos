import { Decimal } from "@prisma/client/runtime/library";

export interface IAddress{
    id: string;
    userId: string;
    label?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    latitude?: Decimal | null;
    longitude?: Decimal | null;
    isDefault?: boolean | null;
    isDeleted?: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export interface ICreateAddress{
    label?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    latitude?: Decimal | null;
    longitude?: Decimal | null;
    isDefault?: boolean | null;
}

export interface IUpdateAddress{
    label?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    latitude?: Decimal | null;
    longitude?: number | null;
}