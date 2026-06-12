import { DayOfWeek } from "@prisma/client";

export const isBranchOpenNow = (
    operatingHours:{
        dayOfWeek:DayOfWeek;
        openTime:Date | null;
        closeTime:Date | null;
        isClosed:boolean;
    }[]
): boolean => {

    const now =
    new Date();

    const currentDay =
    [
        DayOfWeek.SUN,
        DayOfWeek.MON,
        DayOfWeek.TUE,
        DayOfWeek.WED,
        DayOfWeek.THU,
        DayOfWeek.FRI,
        DayOfWeek.SAT
    ][now.getDay()];

    const todayHours =
    operatingHours.find(
        hour =>
        hour.dayOfWeek === currentDay
    );

    if(
        !todayHours ||
        todayHours.isClosed
    ){
        return false;
    }

    const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes();

    const openMinutes =
    todayHours.openTime!.getHours() * 60 +
    todayHours.openTime!.getMinutes();

    const closeMinutes =
    todayHours.closeTime!.getHours() * 60 +
    todayHours.closeTime!.getMinutes();

    return (
        currentMinutes >= openMinutes &&
        currentMinutes <= closeMinutes
    );

};