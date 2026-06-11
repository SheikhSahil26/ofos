import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../utils/appError";
import { ICreateModifierGroup, ICreateModifierOption, IUpdateModifierOption } from "../interfaces/modifier.interface";
import { ModifierService } from "../services/modifier.service";
import { Request, Response } from "express";
import { createModifierGroupSchema, createModifierOptionSchema, updateModifierGroupSchema, updateModifierOptionSchema } from "../validators/modifier.validation";

export class ModifierController{

    private modifierService = new ModifierService();

    createModifierGroup = asyncHandler(async (req: Request,res: Response) => {

        const menuItemId = req.params.menuItemId;
        if(typeof menuItemId != 'string'){
            throw new AppError("category ID is required", 400);
        }

        const data: ICreateModifierGroup = {
            ...req.body,
            menuItemId: menuItemId,
        };

        const { error } = createModifierGroupSchema.validate(data);

        if (error) {
            throw new AppError(
                error.details[0]?.message ||
                "Validation failed",
                400
            );
        }

        const response = await this.modifierService.createModifierGroup(data);

        res.status(response.statusCode || 201).json(response);
    });

    getModifierGroupsByMenuItemId = asyncHandler(async (req: Request,res: Response) => {

        const menuItemId = req.params.menuItemId;
        if(typeof menuItemId != 'string'){
            throw new AppError("category ID is required", 400);
        }

        const response = await this.modifierService.getModifierGroupsByMenuItemId(menuItemId);

        res.status(response.statusCode || 200).json(response);
    });

    updateModifierGroup = asyncHandler(async (req: Request, res: Response) => {

        const { error } = updateModifierGroupSchema.validate(req.body);

        if (error) {
            throw new AppError(
                error.details[0]?.message ||
                "Validation failed",
                400
            );
        }

        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("ID is required", 400);
        }

        const response = await this.modifierService.updateModifierGroup(id,req.body);

        res.status(response.statusCode || 200).json(response);
    });

    softDeleteModifierGroup = asyncHandler(async (req: Request,res: Response) => {

        const id = req.params.id;

        if (typeof id != 'string') {
            throw new AppError(
                "Modifier group ID is required",
                400
            );
        }

        const response = await this.modifierService.softDeleteModifierGroup(id);

        res.status(response.statusCode || 200).json(response);
    });

    createModifierOption = asyncHandler(async (req: Request, res: Response) => {

        const payload: ICreateModifierOption = {
            ...req.body,
            modifierGroupId: req.params.groupId,
            extraPrice: req.body.extraPrice
                ? Number(req.body.extraPrice)
                : 0,
        };

        const { error } = createModifierOptionSchema.validate(payload);

        if (error) {
            throw new AppError(
                error.details[0]?.message ||
                "Validation failed",
                400
            );
        }

        const response = await this.modifierService.createModifierOption(payload);

        res.status(response.statusCode || 201).json(response);
    });

    getModifierOptionsByGroupId = asyncHandler(async (req: Request,res: Response) => {

        const id = req.params.groupId;

        if (typeof id != 'string') {
            throw new AppError(
                "Modifier group ID is required",
                400
            );
        }

        const response = await this.modifierService.getModifierOptionsByGroupId(id);

        res.status(response.statusCode || 200).json(response);
    });

    updateModifierOption = asyncHandler(async (req: Request,res: Response) => {

        const { error } = updateModifierOptionSchema.validate(req.body);

        if (error) {
            throw new AppError(
                error.details[0]?.message ||
                "Validation failed",
                400
            );
        }

        const id = req.params.id;

        if (typeof id != 'string') {
            throw new AppError(
                "Modifier group ID is required",
                400
            );
        }

        const data: IUpdateModifierOption = {
            ...req.body,
            ...(req.body.extraPrice !== undefined && {
                extraPrice: Number(req.body.extraPrice),
            }),
        };

        const response = await this.modifierService.updateModifierOption(id,data);

        res.status(response.statusCode || 200).json(response);
    });

    softDeleteModifierOption = asyncHandler(async (req: Request,res: Response) => {

        const id = req.params.id;

        if (typeof id != 'string') {
            throw new AppError("Modifier group ID is required",400);
        }

        const response = await this.modifierService.softDeleteModifierOption(id);

        res.status(response.statusCode || 200).json(response);
    }
);
}