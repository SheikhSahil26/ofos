import { Request, Response } from "express";
import { CartService } from "../services/cart.services";

export class CartController {
  private cartService = new CartService();

  //this controller will get the cart details of the loggedin user!!
   getCart = async (req: Request, res: Response) => {
    try {

        // const userId :any = req.user.userId
        const userId = 1; //dummy id for test 

        const data = await this.cartService.getCart(userId);

        res.send("hello")
        
        


      
    } catch (err) {
     
    }
  };

  addToCart = async (req: Request, res: Response) => {
    try {
        const userId = 1; //dummy id for test 
        const { menuItemId, quantity} = req.body;

        console.log(menuItemId, quantity, "this is menu item id and quantity from req body")

        const data = await this.cartService.addToCart(userId, menuItemId, quantity);
        console.log("Cart after adding item:", data);
        
        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            data
        })

    } catch (err) {
        
    }
    }

    removeCartItem = async (req: Request, res: Response) => {
        try {
            const userId = 1; //dummy id for test 
            const itemId = req.params.itemId as string;

            await this.cartService.removeCartItem(userId, itemId);

            res.status(200).json({
                success: true,
                message: "Item removed from cart successfully",
            });
        }   catch (err) {      

        }    }             

    
}
