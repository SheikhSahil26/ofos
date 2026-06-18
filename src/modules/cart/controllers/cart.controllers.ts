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

        const userId = "1"; // Replace with req.user.userId

        const result =
            await this.cartService.clearCart(
                userId
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

        const userId = "1"; // replace with req.user.userId

        const result =
            await this.cartService.validateCart(
                userId
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

        const userId = "1"; // replace with req.user.userId

        const result =
            await this.cartService.getCartSummary(
                userId
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
}