import { Request, Response } from "express";
import { BranchService } from "../services/branch.service";
import { AppError } from "../../../utils/appError";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import jwt from "jsonwebtoken";
import { prisma } from "../../../config/prisma";

export class BranchWebController {
  private branchService = new BranchService();

  renderBranchDetails = asyncHandler(async (req: Request, res: Response) => {
    const branchId = req.params.branchId;
    
    if (!branchId || typeof branchId !== "string") {
      return res.status(400).send("Invalid branch ID");
    }

    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      return res.redirect("/restaurant_owner/login");
    }

    let userId: string;
    let userEmail: string;
    try {
      const decoded = jwt.verify(refreshToken, String(process.env.JWT_REFRESH_SECRET)) as any;
      userId = decoded.userId;
      userEmail = decoded.email;
    } catch (err) {
      console.error("Web Route Auth Error:", err);
      res.clearCookie("refreshToken");
      return res.redirect("/restaurant_owner/login");
    }

    try {
      const [dashboardData, currentUser] = await Promise.all([
        this.branchService.getBranchDashboardData(branchId, userId),
        prisma.user.findUnique({ where: { id: userId, isDeleted: false }, select: { fullName: true, email: true } })
      ]);

      return res.render("restaurant/branch-details", {
        activePage: "branches",
        branch: dashboardData.data.branch,
        orders: dashboardData.data.orders,
        ordersTotal: dashboardData.data.ordersTotal,
        menu: dashboardData.data.menu,
        currentUser: currentUser ?? { fullName: userEmail ?? "Owner", email: userEmail ?? "" }
      });
    } catch (error) {
      console.error("Error rendering branch details:", error);
      return res.status(500).send("Error loading branch details.");
    }
  });
}
