import { Request, Response } from "express";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { MenuItemService } from "../services/menu_item.service";
import { ICategoryParams } from "../interfaces/menu_item.interfaces";
import { AppError } from "../../../utils/appError";
import { addDietaryTagsSchema, createMenuItemSchema, updateAvailabilitySchema, updateBestsellerSchema } from "../validators/menu_item.validation";
import { uploadImage } from "../../../services/multer.service";

export class MenuItemController{
    private menuItemService = new MenuItemService();

    createMenuItem = asyncHandler(async (req: Request, res: Response) => {

        //validation
        const { error } = createMenuItemSchema.validate(req.body);
        if (error) {
            throw new AppError(
                error.details[0]?.message || "Validation failed",
                400
            );
        }

        //image uploading
        if (!req.file) {
            throw new AppError("Image file is required", 400);
        }
        const imageUrl = await uploadImage(
            req.file.buffer,
            `menuItem-${Date.now()}`,
            "/OFOS/menuItems",
        );

        const response =
            await this.menuItemService.createMenuItem({
                ...req.body,
                categoryId: req.params.categoryId,
                imageUrl: imageUrl
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

    updateMenuItemImage = asyncHandler(async (req: Request, res: Response) => {

        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("category ID is required", 400);
        }

        if (!req.file) {
            throw new AppError("Image file is required", 400);
        }

        const imageUrl = await uploadImage(
            req.file.buffer,
            `menuItem-${id}-${Date.now()}`,
            "/OFOS/menuItems",
        );

        const response = await this.menuItemService.updateMenuItemImage(id,imageUrl);

        res.status(response.statusCode || 200).json(response);
    });

    updateAvailability = asyncHandler(async (req: Request,res: Response) => {

        const { error } = updateAvailabilitySchema.validate(req.body);

        if (error) {
            throw new AppError(
                error.details[0]?.message || "Validation failed",
                400
            );
        }

        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("category ID is required", 400);
        }

        const response =
            await this.menuItemService.updateAvailability(id, req.body.isAvailable);

        res.status(response.statusCode || 200).json(response);
    });

    updateBestseller = asyncHandler(async (req: Request, res: Response) => {

        const { error } = updateBestsellerSchema.validate(req.body);

        if (error) {
            throw new AppError(
                error.details[0]?.message ||
                "Validation failed",
                400
            );
        }

        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("category ID is required", 400);
        }

        const response =
            await this.menuItemService.updateBestseller(id, req.body.isBestseller);

        res.status(response.statusCode || 200).json(response);
    });

    deleteMenuItem = asyncHandler(async (req: Request ,res: Response) => {
        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("category ID is required", 400);
        }

        const response = await this.menuItemService.deleteMenuItem(id);

        res.status(response.statusCode || 200).json(response);
    });

    addDietaryTags = asyncHandler(async (req: Request, res: Response) => {

        const { error } = addDietaryTagsSchema.validate(req.body);

        if (error) {
            throw new AppError(
                error.details[0]?.message ||
                "Validation failed",
                400
            );
        }

        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("category ID is required", 400);
        }

        const response = await this.menuItemService.addDietaryTags(id, req.body.tagIds);

        res.status(response.statusCode || 200).json(response);
    });

    removeDietaryTag = asyncHandler(async (req: Request,res: Response) => {

        const id = req.params.id;
        if(typeof id != 'string'){
            throw new AppError("category ID is required", 400);
        }

        const tagId = req.params.tagId;
        if(typeof tagId != 'string'){
            throw new AppError("category ID is required", 400);
        }

        const response = await this.menuItemService.removeDietaryTag(id,tagId);

        res.status(response.statusCode || 200).json(response);
    });

    searchMenuItems = asyncHandler(async (req: Request, res: Response) => {

        const searchTerm = req.query.name;

        if (!searchTerm || typeof searchTerm !== "string") {
            throw new AppError(
                "Search term is required",
                400
            );
        }

        const response = await this.menuItemService.searchMenuItems(searchTerm);

        res.status(response.statusCode || 200).json(response);
    });
}