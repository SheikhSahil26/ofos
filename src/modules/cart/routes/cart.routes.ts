import { Router } from "express";
import { IRoutes } from "../../../common/interfaces/route.interface";
import { CartController } from "../controllers/cart.controllers";
import { isAuthenticated } from "../../../middlewares/authenticateMiddlware";
import { authorizeRoles } from "../../../middlewares/roleMiddlware";

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
this.router.get("/", isAuthenticated,authorizeRoles("CUSTOMER") , this.controller.getCart);

this.router.post("/add-to-cart",isAuthenticated,authorizeRoles("CUSTOMER") ,this.controller.addToCart);

// // Add item to cart
// this.router.post("/items", this.controller.addCartItem);

// // Update cart item quantity/modifiers
// this.router.put("/items/:itemId", this.controller.updateCartItem);

// Remove item from cart
this.router.delete("/remove-item/:itemId",isAuthenticated,authorizeRoles("CUSTOMER") , this.controller.removeCartItem); //delete the item's quantity first and if zero then remove the item entirely from cart

this.router.delete("/delete-item/:itemId",isAuthenticated,authorizeRoles("CUSTOMER") , this.controller.clearCart); // Clear entire item at once

// // Clear entire cart
this.router.delete("/delete-cart", this.controller.clearCart);

// // Validate cart before checkout
  this.router.post("/validate",this.controller.validateCart);

// // Get cart summary
this.router.get("/summary", this.controller.getCartSummary);

this.router.patch("/update-quantity", isAuthenticated, authorizeRoles("CUSTOMER"), this.controller.updateItemQuantity);
this.router.delete("/item/:menuItemId", isAuthenticated, authorizeRoles("CUSTOMER"), this.controller.removeItem);

this.router.get("/checkout-details", isAuthenticated, authorizeRoles("CUSTOMER"), this.controller.getCheckoutDetails);
  }
}