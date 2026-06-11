import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { CartController } from "../controllers/cart.controllers";

export class CartRoutes implements IRoutes {
  path = "/cart";
  router = Router();
  controller = new CartController();

  
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // this.router.get("/", this.controller.getRestaurants);
    // this.router.get("/nearby", this.controller.getNearbyRestaurants);
    // this.router.get("/owner/my-restaurants", this.controller.getMyRestaurants);
console.log("Cart routes initialized");
    // Get current user's cart
this.router.get("/", this.controller.getCart);

this.router.post("/add-to-cart", this.controller.addToCart);

// // Add item to cart
// this.router.post("/items", this.controller.addCartItem);

// // Update cart item quantity/modifiers
// this.router.put("/items/:itemId", this.controller.updateCartItem);

// Remove item from cart
this.router.delete("/remove-item/:itemId", this.controller.removeCartItem); //delete the item's quantity first and if zero then remove the item entirely from cart

// // Clear entire cart
this.router.delete("/delete-cart", this.controller.clearCart);

// // Validate cart before checkout
  this.router.post("/validate",this.controller.validateCart);

// // Get cart summary
this.router.get("/summary", this.controller.getCartSummary);


  }
}