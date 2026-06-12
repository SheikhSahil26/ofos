import { Router } from 'express';
import { IRoutes } from '../../../common/interfaces/route.interface';
import { BranchController } from '../controllers/branch.controller';

export class BranchRoutes implements IRoutes {
  path = '/branches';
  router = Router();
  controller = new BranchController();

    constructor() {
        this.initializeRoutes();
    }

  private initializeRoutes(): void {
    this.router.post("/add/:restaurantId", this.controller.createBranch); // Create a new Branch
    this.router.get("/owner/:restaurantId", this.controller.getBranches); // Get branches of a restaurant
    this.router.get("/:branchId", this.controller.getBranchDetails); // Get branch details by branchId
    this.router.put("/branches/:id", this.controller.updateBranch); // Update branch details
    this.router.delete("/branches/:id", this.controller.deleteBranch); // Delete branch
    this.router.get("/branches/:id/orders", this.controller.getBranchOrders); // Get all orderss for a branch
  }
}