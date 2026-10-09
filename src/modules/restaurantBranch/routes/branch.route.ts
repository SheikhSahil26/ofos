import { Router } from 'express';
import { IRoutes } from '../../../common/interfaces/route.interface';
import { BranchController } from '../controllers/branch.controller';
import { isAuthenticated } from '../../../middlewares/authenticateMiddlware';

export class BranchRoutes implements IRoutes {
  path = '/branches';
  router = Router();
  controller = new BranchController();

    constructor() {
        this.initializeRoutes();
    }

  private initializeRoutes(): void {
    this.router.post("/add/:restaurantId", isAuthenticated, this.controller.createBranch); // Create a new Branch
    this.router.get("/owner/:restaurantId", isAuthenticated, this.controller.getBranches); // Get branches of a restaurant
    this.router.get("/:branchId", isAuthenticated, this.controller.getBranchDetails); // Get branch details by branchId
    this.router.put("/:id", isAuthenticated, this.controller.updateBranch); // Update branch details
    this.router.delete("/:id", isAuthenticated, this.controller.deleteBranch); // Delete branch
    this.router.get("/:id/orders", isAuthenticated, this.controller.getBranchOrders); // Get all orders for a branch
  }
}