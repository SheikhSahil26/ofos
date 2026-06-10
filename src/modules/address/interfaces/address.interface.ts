import { Decimal } from "@prisma/client/runtime/library";

export interface IAddress{
    id: string;
    userId: string;
    label?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    pinCode?: string | null;
    latitude?: Decimal | null;
    longitude?: Decimal | null;
    isDefault?: boolean | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateAddress{
    label?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    pinCode?: string | null;
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
    pinCode?: string | null;
    latitude?: Decimal | null;
    longitude?: number | null;
}