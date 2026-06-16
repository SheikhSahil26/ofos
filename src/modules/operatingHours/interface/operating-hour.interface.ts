import { DayOfWeek } from "@prisma/client";

export interface IUpdateOperatingHour {

    openTime?:string;

    closeTime?:string;

    isClosed?:boolean;

}

export interface IOperatingHourValidation {

    id:string;

    branchId:string;

    dayOfWeek:DayOfWeek;

    isDeleted:boolean;

}

export interface IOperatingHourResponse {

    id:string;

    dayOfWeek:DayOfWeek;

    openTime:Date | null;

    closeTime:Date | null;

    isClosed:boolean;

}