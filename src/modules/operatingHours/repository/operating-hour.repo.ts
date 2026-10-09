import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  IOperatingHourResponse,
  IOperatingHourValidation,
} from "../interface/operating-hour.interface";

export class OperatingHourRepositiry {
  // Validate operating hour
  async validateOperatingHourById(
    id: string,
  ): Promise<IOperatingHourValidation | null> {
    return await prisma.operatingHour.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        branchId: true,
        dayOfWeek: true,
        isDeleted: true,
      },
    });
  }

  // Update operating hour
  async updateOperatingHour(
    id: string,
    payload: Prisma.OperatingHourUpdateInput,
  ): Promise<IOperatingHourResponse> {
    return await prisma.operatingHour.update({
      where: {
        id,
      },

      data: payload,

      select: {
        id: true,
        dayOfWeek: true,
        openTime: true,
        closeTime: true,
        isClosed: true,
      },
    });
  }
}
