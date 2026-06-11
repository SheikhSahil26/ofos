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

    
    }
}