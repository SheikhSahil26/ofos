import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AppError } from "../../../utils/appError";
import { MenuService } from "../services/menu.service";
import { Request, Response } from "express";

export class MenuController{
    private menuService = new MenuService();

    createCategory = asyncHandler(async (req: Request, res: Response) => {

        const branchId = req.params.branchId;
        if(typeof branchId != 'string'){
            throw new AppError("Branch ID is required", 400);
        }
        console.log(req.body)
        console.log("branch id : ", branchId);
        const response = await this.menuService.createCategory({
            branchId: branchId,
            name: req.body.name,
            displayOrder: req.body.displayOrder,
        });

        res.status(response.statusCode || 201).json({
            success: response.success,
            message: response.message,
            data: response.data,
        });
    });

    getCategories = asyncHandler(async (req, res) => {
        const branchId = req.params.branchId;
        if(typeof branchId != 'string'){
            throw new AppError("Branch ID is required", 400);
        }
        const response = await this.menuService.getCategoriesByBranchId(branchId);
        
        res.status(response.statusCode || 200).json(response);
    });

    getCategoryById = asyncHandler(async (req, res) => {
        const categoryId = req.params.id;
        if(typeof categoryId != 'string'){
            throw new AppError("Branch ID is required", 400);
        }
        const response = await this.menuService.getCategoryById(categoryId);

        res.status(response.statusCode || 200).json(response);
    });

    updateCategory = asyncHandler(async (req: Request, res: Response) => {
        const categoryId = req.params.id;
        
        if(typeof categoryId != 'string'){
            throw new AppError("Branch ID is required", 400);
        }
        const response =await this.menuService.updateCategory(categoryId,req.body);
        res.status(response.statusCode || 200).json(response);
    });

    deleteCategory = asyncHandler(async (req: Request, res: Response) => {
        const categoryId = req.params.id;

        if(typeof categoryId != 'string'){
            throw new AppError("Branch ID is required", 400);
        }
        const response = await this.menuService.deleteCategory(categoryId);

        res.status(response.statusCode || 200).json(response);   
    });

    reorderCategories = asyncHandler(async (req: Request, res: Response) => {
        const response = await this.menuService.reorderCategories(req.body.categories);

        res.status(response.statusCode || 200).json(response);
    });
}