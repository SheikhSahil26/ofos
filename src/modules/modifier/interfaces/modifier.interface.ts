export interface ICreateModifierGroup {
    menuItemId: string;
    name: string;
    minSelection?: number;
    maxSelection?: number;
    isRequired?: boolean;
}

export interface IUpdateModifierGroup {
    name?: string;
    minSelection?: number;
    maxSelection?: number;
    isRequired?: boolean;
}

export interface ICreateModifierOption {
    modifierGroupId: string;
    name: string;
    extraPrice?: number;
}

export interface IUpdateModifierOption {
    name?: string;
    extraPrice?: number;
}