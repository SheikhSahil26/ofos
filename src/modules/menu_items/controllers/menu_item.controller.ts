import { Request, Response } from "express";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { MenuItemService } from "../services/menu_item.service";
import { ICategoryParams } from "../interfaces/menu_item.interfaces";
import { AppError } from "../../../utils/appError";

export class MenuItemController{
    private menuItemService = new MenuItemService();

    createMenuItem = asyncHandler(async (req: Request, res: Response) => {
        const response =
            await this.menuItemService.createMenuItem({
            ...req.body,
            categoryId: req.params.categoryId,
            });

        res.status(response.statusCode || 201).json(response);
    });

    getMenuItemsByCategory = asyncHandler(async (req: Request,res: Response) => {
        const categoryId = req.params.categoryId;
        if(typeof categoryId != 'string'){
            throw new AppError("category ID is required", 400);
        }
        const response = await this.menuItemService.getMenuItemsByCategory(categoryId);

        res.status(response.statusCode || 200).json(response);
    });

    getMenuItemById = asyncHandler(async (req: Request,res: Response) => {
        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("category ID is required", 400);
        }
        const response = await this.menuItemService.getMenuItemById(id);

        res.status(response.statusCode || 200).json(response);
    });

    updateMenuItem = asyncHandler(async (req: Request,res: Response) => {
        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("category ID is required", 400);
        }

        const response =
            await this.menuItemService.updateMenuItem(id,req.body);

        res.status(response.statusCode || 200).json(response);
    });
}