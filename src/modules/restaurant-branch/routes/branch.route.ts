import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { BranchController } from "../controllers/branch.controller";

export class BranchRoutes implements IRoutes {
  path = "/restaurant/branch";
  router = Router();
  controller = new BranchController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/add/:restaurantId", this.controller.createBranch);
    this.router.get("/:restaurantId",this.controller.getBranches);
  }
}
