import { Router } from "express";
import { PayoutController } from "../controllers/payout.controller";
import { PayoutService } from "../services/payout.service";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { prisma } from "../../../config/prisma";



export class PayoutRoutes implements IRoutes {
    path = "/payouts";
    router = Router();
    payoutService = new PayoutService(prisma);
    controller = new PayoutController(this.payoutService);

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {

        this.router.get(
            "/dashboard/stats",
            this.controller.getDashboardStats
        );

        // Process the payout split and create entry inside the payoutTransaction.
        this.router.post(
            "/process/:orderId",
            this.controller.processPayout
        );

        this.router.get(
            "/order/:orderId",
            this.controller.getPayoutByOrderId
        );



        // Restaurant MOdules...

        // THis fetxh helkps to findout the branch pending payouts and lastSettledPayout Date.
        this.router.get(
            "/restaurants/:branchHeadId/pending-summary",
            this.controller.getRestaurantPendingSummary
        );

        // GET /api/payouts/restaurants/BH001/history?status=PENDING&page=1&limit=10
        // Payout History's..............
        this.router.get(
            "/restaurants/:branchHeadId/history",
            this.controller.getRestaurantHistory
        );


        //  Delivery Partner Module...............
        this.router.get(
            "/delivery-partners/:deliveryPartnerId/pending-summary",
            this.controller.getDeliveryPendingSummary
        );
        // GET /api/payouts/delivery-partners/DP001/history?status=PENDING&page=1&limit=10
        this.router.get(
            "/delivery-partners/:deliveryPartnerId/history",
            this.controller.getDeliveryHistory
        );




        // Settlements Routes Builded specially for Admin perspctive

        // This route will make the create settlement pending entry insdide the settlememt table and also assign the settlement id to the restaurantPayout Table
        this.router.post(
            "/settlements/restaurants",
            this.controller.createRestaurantSettlement
        );

        this.router.post(
            "/settlements/delivery-partners",
            this.controller.createDeliveryPartnerSettlement
        );

        // Admin To wahtch All pending Settlements
        this.router.get(
            "/settlements/pending",
            this.controller.getPendingSettlements
        );


        // Settelment History..
        // GET /api/payouts/settlements/history?page=1&limit=10
        // GET /api/payouts/settlements/history?status=SUCCESS

        this.router.get(
            "/settlements/history",
            this.controller.getSettlementHistory
        );


        // Get settlement By id
        this.router.get(
            "/settlements/:settlementId",
            this.controller.getSettlementById
        );


        // tHIS done the settlement of the restaurant OR Delivery Based on settlement Id.
        this.router.patch(
            "/settlements/:settlementId/complete",
            this.controller.completeSettlement
        );
    }


}




