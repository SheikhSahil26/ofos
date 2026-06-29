import { Request, Response } from "express";
import { CartService } from "../services/cart.services";
import { asyncHandler } from "../../../middlewares/asyncHandler";
import { AddToCartDTO } from "../dto/add-to-cart.dto";
import { RemoveCartItemDTO } from "../dto/remove-cart-item.dto";
import { ValidateCartResponseDTO } from "../dto/validate-cart.dto";
import { CartSummaryDTO } from "../dto/cart-summary.dto";

export class CartController {

    private cartService = new CartService();

    getCart = asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {

            const user = req.user as Express.payload  // dummy

            console.log(user,"user in cart controller")
            const data =
                await this.cartService.getCart(
                    user.userId
                );

                console.log(data,"cart data in controller")

            return res
                .status(
                    data.statusCode || 200
                )
                .json(data);
        }
    );

    addToCart = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as Express.payload // dummy

    const {
      menuItemId,
      quantity,
      modifiers,
      specialInstruction,
    }: AddToCartDTO = req.body;

    console.log("Add to cart request body:", req.body);
    

    const data = await this.cartService.addToCart(
      user.userId,
      menuItemId,
      Number(quantity),
      modifiers || [],
      specialInstruction,
    );

    return res
      .status(data.statusCode || 200)
      .json(data);
  }
);
    removeCartItem = asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {

            const user = req.user as Express.payload; // dummy

           const params: RemoveCartItemDTO = {
    itemId: req.params.itemId as string,
};

            const data =
                await this.cartService.removeCartItem(
                    user.userId,
                    params.itemId
                );

            return res
                .status(
                    data.statusCode || 200
                )
                .json(data);
        }
    );

   clearCart = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {

        const user = req.user as Express.payload; // Replace with req.user.userId

        const result =
            await this.cartService.clearCart(
                user.userId
            );

        return res
            .status(
                result.statusCode || 200
            )
            .json(result);
    }
);

    validateCart = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {

        const user = req.user as Express.payload; // replace with req.user.userId

        const result =
            await this.cartService.validateCart(
                user.userId
            );

               const response: ValidateCartResponseDTO =
            result.data!;

        return res
            .status(
                result.statusCode || 200
            )
            .json({
                ...result,
                data: response,
            });
    }
);

    getCartSummary = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {

        const user = req.user as Express.payload; // replace with req.user.userId

        const result =
            await this.cartService.getCartSummary(
                user.userId
            );

       const response: CartSummaryDTO =
            result.data!;

        return res
            .status(
                result.statusCode || 200
            )
            .json({
                ...result,
                data: response,
            });
    }
);

    deleteEntireItem = asyncHandler(
    async (
        req: Request,
        res: Response
    ) => {

        const user = req.user as Express.payload; // replace with req.user.userId

        const itemId = req.params.itemId as string;

        const result =
            await this.cartService.deleteEntireItemFromCart(
                user.userId,
                itemId
            );

        return res
            .status(
                result.statusCode || 200
            )
            .json(result);
    }
);

// modules/cart/controllers/cart.controller.ts

updateItemQuantity = asyncHandler(
  async (req: Request, res: Response) => {
    const user =req.user as Express.payload; // or your dummy for now
    const { menuItemId, quantity } = req.body;

    if (!menuItemId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "menuItemId and quantity are required",
      });
    }

    const result = await this.cartService.updateItemQuantity(
      user.userId,
      menuItemId,
      Number(quantity),
    );

    return res.status(result.statusCode).json(result);
  }
);

removeItem = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as Express.payload;
    const menuItemId = req.params.itemId as string;

    const result = await this.cartService.removeItemFromCart(
      user.userId,
      menuItemId,
    );

    return res.status(result.statusCode).json(result);
  }
);

// modules/cart/controllers/cart.controller.ts

getCheckoutDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as Express.payload;

    const result = await this.cartService.getCheckoutDetails(user.userId);

    return res.status(result.statusCode).json(result);
  }
);

}