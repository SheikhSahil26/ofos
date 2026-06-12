import { Request, Response } from "express";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { OperatingHourService } from "../service/operating-hour.service";
import { IUpdateOperatingHour } from "../interface/operating-hour.interface";
import { AppError } from "../../../utils/appError";


export class OperatingHourController {
    private operatingHourService = new OperatingHourService();

    updateOperatingHour = asyncHandler(
    async(
        req:Request,
        res:Response
    ) => {

        const operatingHourId =
        req.params.id;

        if(!operatingHourId || typeof operatingHourId !== "string"){
            throw new AppError("Invalid operating hour id", 409);
        }

        const user = req.user as Express.payload | undefined;
            if(!user || typeof user.userId !== "string"){
                throw new AppError("Invalid user id", 409);
            }
        
            const userId = user.userId;

        const payload =
        req.body as IUpdateOperatingHour;

        const data =
        await this.operatingHourService
        .updateOperatingHour(
            operatingHourId,
            userId,
            payload
        );

        return res.status(
            data.statusCode!
        ).json({
            ...data
        });

    }
);
}