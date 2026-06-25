let cartData = null; 
const DELIVERY_FEE = 40;
const TAX_RATE = 0.05;
//i will load the cart items from the backend redis
const itemCountSpan = document.getElementById("item-count");
async function loadCartItems(){
    try {
        const response = await apiRequest("/api/cart");
        console.log("Cart items response:", response);
        if(!response.ok){
            showToast(
                    "Failed to load cart items",
                    "error"
                );
        }

        const result = await response.json(); 

        if(!result.success) {
            showToast(
                   result.error || "Failed to load cart items","error"
                );
        }
        let itemCount=0;
        console.log("Cart items:", result.data);

        for (const item of result.data.items) {
            itemCount += item.quantity;
        }




        itemCountSpan.textContent = `Cart Items (${itemCount})`;
         cartData = result.data;

         renderCart(cartData);

    }catch(error){
        console.error("Error loading cart items:", error);
        // Optionally, display an error message to the user
    }
}

loadCartItems();

function renderCart(cart) {
  const container = document.getElementById("cart-items-container");

  if (!cart.items || cart.items.length === 0) {
    renderEmptyCart();
    return;
  }

  container.innerHTML = cart.items.map((item) => buildItemCard(item)).join("");

  attachItemEventListeners();
  renderSummary(cart.subtotal);
}

function renderEmptyCart() {
  const container = document.getElementById("cart-items-container");
  container.innerHTML = `
    <div class="bg-white rounded-3xl p-12 shadow-sm text-center">
      <p class="text-gray-500 text-lg">Your cart is empty</p>
      <a href="/home" class="text-orange-500 font-semibold mt-4 inline-block">Browse Menu</a>
    </div>
  `;
  renderSummary(0);
  document.getElementById("checkout-btn").disabled = true;
  document.getElementById("checkout-btn").classList.add("opacity-50", "cursor-not-allowed");
}


function buildItemCard(item) {
  const modifiersText = item.modifiers.length > 0
    ? item.modifiers.map((m) => m.modifierName).join(", ")
    : "";

  const unavailableBadge = !item.isCurrentlyAvailable
    ? `<span class="text-red-500 text-sm font-semibold ml-2">(Currently Unavailable)</span>`
    : "";

  return `
    <div class="bg-white rounded-3xl p-6 shadow-sm" data-menu-item-id="${item.menuItemId}">
      <div class="flex gap-6">

        <img
          src="${item.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591'}"
          class="w-40 h-40 rounded-2xl object-cover">

        <div class="flex-1">

          <div class="flex justify-between">
            <div>
              <h2 class="text-2xl font-bold">
                ${item.name}
                ${unavailableBadge}
              </h2>
              <p class="text-gray-500 mt-2">
                ${item.description || ""}
              </p>
              ${modifiersText ? `<p class="text-sm text-gray-400 mt-1">+ ${modifiersText}</p>` : ""}
            </div>

            <h2 class="font-bold text-2xl">
              ₹${item.itemTotal}
            </h2>
          </div>

          <div class="flex justify-between mt-8">

            <div class="flex items-center border rounded-xl overflow-hidden">
              <button class="qty-decrease px-5 py-3 bg-gray-100 text-xl" data-menu-item-id="${item.menuItemId}">
                -
              </button>
              <span class="px-6 font-semibold qty-display">
                ${item.quantity}
              </span>
              <button class="qty-increase px-5 py-3 bg-gray-100 text-xl" data-menu-item-id="${item.menuItemId}">
                +
              </button>
            </div>

            <button class="remove-item text-red-500 font-semibold" data-menu-item-id="${item.menuItemId}">
              Remove
            </button>

          </div>

        </div>

      </div>
    </div>
  `;
}

function renderSummary(subtotal) {
  const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = subtotal + DELIVERY_FEE + taxAmount;

  console.log(total, subtotal, DELIVERY_FEE, taxAmount);

  document.getElementById("summary-subtotal").textContent = `₹${subtotal}`;
  document.getElementById("summary-delivery-fee").textContent = `₹${DELIVERY_FEE}`;
  document.getElementById("summary-tax").textContent = `₹${taxAmount}`;
  document.getElementById("summary-total").textContent = `₹${total.toFixed(2)}`;
}

function attachItemEventListeners() {

  document.querySelectorAll(".qty-increase").forEach((btn) => {
    btn.addEventListener("click", () => {
      const menuItemId = btn.dataset.menuItemId;
      updateQuantity(menuItemId, 1);
    });
  });

  document.querySelectorAll(".qty-decrease").forEach((btn) => {
    btn.addEventListener("click", () => {
      const menuItemId = btn.dataset.menuItemId;
      updateQuantity(menuItemId, -1);
    });
  });

  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const menuItemId = btn.dataset.menuItemId;
      removeItem(menuItemId);
    });
  });
}

// js/cart/seeCartPage.js

async function updateQuantity(menuItemId, delta) {
  const item = cartData.items.find((i) => i.menuItemId === menuItemId);
  if (!item) return;

  const newQuantity = item.quantity + delta;

  try {
    const response = await apiRequest("/api/cart/update-quantity", "PATCH", {
      menuItemId,
      quantity: newQuantity,   // backend handles <= 0 by auto-removing
    });

    const result = await response.json();

    if (result.success) {
      cartData = result.data;
      renderCart(cartData);
    } else {
      showToast(result.error || "Failed to update quantity", "error");
    }
  } catch (err) {
    console.error("Update quantity failed:", err);
    showToast("Something went wrong", "error");
  }
}

async function removeItem(menuItemId) {
  try {
    const response = await apiRequest(`/api/cart/item/${menuItemId}`, "DELETE");
    const result = await response.json();

    if (result.success) {
      cartData = result.data;

      if (cartData.items.length === 0) {
        renderEmptyCart();
      } else {
        renderCart(cartData);
      }

      showToast("Item removed from cart", "success");
    } else {
      showToast(result.error || "Failed to remove item", "error");
    }
  } catch (err) {
    console.error("Remove item failed:", err.message);
    showToast("Something went wrong", "error");
  }
}
// ──────────────────────────────────────────────
// Checkout button
// ──────────────────────────────────────────────
document.getElementById("checkout-btn")?.addEventListener("click", () => {
  window.location.href = "/customer/checkout";
});
