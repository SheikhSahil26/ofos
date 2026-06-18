import { Prisma } from "@prisma/client";
import { ServiceResponse } from "../../../common/types/service-response.type";
import { AppError } from "../../../utils/appError";
import { IOperatingHourResponse, IOperatingHourValidation, IUpdateOperatingHour } from "../interface/operating-hour.interface";
import { OperatingHourRepositiry } from "../repository/operating-hour.repo";
import { BranchService } from "../../restaurantBranch/services/branch.service";

export class OperatingHourService {

    private operatingHourRepo : OperatingHourRepositiry = new OperatingHourRepositiry();

    private readonly branchService =
    new BranchService();

    async validateOperatingHourAccess(
    operatingHourId:string,
    userId:string
): Promise<ServiceResponse<IOperatingHourValidation>>{



    const operatingHour =
    await this.operatingHourRepo
    .validateOperatingHourById(
        operatingHourId
    );

    if(!operatingHour){

        throw new AppError(
            "Operating hour not found",
            404
        );

    }

    if(operatingHour.isDeleted){

        throw new AppError(
            "Operating hour has been deleted",
            404
        );

    }

    await this.branchService
    .validateBranchAccess(
        operatingHour.branchId,
        userId
    );

    return {

        success:true,

        data:operatingHour,

        message:
        "Operating hour validated successfully",

        statusCode:200

    };

}


async updateOperatingHour(
    operatingHourId:string,
    userId:string,
    payload:IUpdateOperatingHour
): Promise<ServiceResponse<IOperatingHourResponse>>{


    await this
    .validateOperatingHourAccess(
        operatingHourId,
        userId
    );

    if(payload.isClosed !== true){

        if(
            !payload.openTime ||
            !payload.closeTime
        ){

            throw new AppError(
                "Open time and close time are required",
                400
            );

        }

        if(
            payload.openTime >=
            payload.closeTime
        ){

            throw new AppError(
                "Close time must be greater than open time",
                400
            );

        }

    }

    const updatePayload:
    Prisma.OperatingHourUpdateInput = {};

    if (payload.isClosed !== undefined) {
        updatePayload.isClosed = payload.isClosed;
    }

    if(payload.isClosed){

        updatePayload.openTime =
        null;

        updatePayload.closeTime =
        null;

    }
    else{

        updatePayload.openTime =
        new Date(
            `1970-01-01T${payload.openTime}:00`
        );

        updatePayload.closeTime =
        new Date(
            `1970-01-01T${payload.closeTime}:00`
        );

    }

    const operatingHour =
    await this.operatingHourRepo
    .updateOperatingHour(
        operatingHourId,
        updatePayload
    );

    return {

        success:true,

        data:operatingHour,

        message:
        "Operating hour updated successfully",

        statusCode:200

    };

}
}