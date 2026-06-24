// checkoutPage.js (Part 2A)

const DELIVERY_FEE = 40;
const TAX_RATE = 0.05;

let checkoutData = null;
let selectedAddressId = null;
let selectedPaymentMethod = "UPI";
let appliedCoupon = null;
let cartData = null;
// ----------------------------------------------------
// INIT
// ----------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("change-address-btn")
        ?.addEventListener("click", () => {

            document
                .getElementById("address-list")
                .classList.toggle("hidden");

        });

    fetchCheckoutDetails();
    loadCartItems();

});

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

        console.log("Cart items:", result.data);

         cartData = result.data;

         renderCartItems(cartData);
         renderSummary(cartData);

    }catch(error){
        console.error("Error loading cart items:", error);
        // Optionally, display an error message to the user
    }
}



// ----------------------------------------------------
// FETCH CHECKOUT DATA
// ----------------------------------------------------

async function fetchCheckoutDetails() {

    try {

        showLoader();

        const response = await apiRequest(
            "/api/cart/checkout-details",
            "GET"
        );

        const result = await response.json();

        if (!result.success) {

            showToast(
                result.error || "Failed to load checkout",
                "error"
            );

            window.location.href = "/cart";

            return;
        }

        checkoutData = result.data;

        console.log("Checkout details:", checkoutData);

        if (
            !checkoutData.cart ||
            checkoutData.cart.items.length === 0
        ) {

            showToast(
                "Cart is empty",
                "error"
            );

            window.location.href = "/cart";

            return;
        }

        selectedAddressId =
            checkoutData.defaultAddressId ||
            checkoutData.addresses[0]?.id;

        renderAddress();

        renderPaymentMethods();

        renderCartItems(checkoutData.cart);

        renderAvailableCoupons(checkoutData.availableCoupons);

        renderSummary(checkoutData.cart);

    }
    catch (err) {

        console.error(err);

        showToast(
            "Something went wrong",
            "error"
        );

    }
    finally {

        hideLoader();

    }

}

// ----------------------------------------------------
// ADDRESS
// ----------------------------------------------------

function renderAddress() {

    const container =
        document.getElementById(
            "address-container"
        );

    const addresses =
        checkoutData.addresses;

    if (!addresses.length) {

        container.innerHTML = `

        <div class="border rounded-2xl p-8 text-center text-gray-400">

            No address found

        </div>

        `;

        return;
    }

    const selectedAddress =
        addresses.find(
            a => a.id === selectedAddressId
        ) || addresses[0];

    selectedAddressId =
        selectedAddress.id;

    container.innerHTML =
        buildAddressCard(
            selectedAddress,
            true
        );

    renderAddressList();

}

function buildAddressCard(
    address,
    selected = false
) {

    return `

    <div class="border-2 ${
        selected
            ? "border-orange-500 bg-orange-50"
            : "border-gray-200"
    } rounded-2xl p-6">

        <h3 class="font-semibold text-lg">

            ${address.label}

            ${
                address.isDefault
                    ? `<span class="text-sm text-gray-400">(Default)</span>`
                    : ""
            }

        </h3>

        <p class="text-gray-500 mt-3">
            ${address.addressLine1}
        </p>

        <p class="text-gray-500">
            ${address.city},
            ${address.state}
            ${address.pincode}
        </p>

    </div>

    `;
}

function renderAddressList() {

    const container =
        document.getElementById(
            "address-list"
        );

    container.innerHTML =
        checkoutData.addresses
            .map(
                address => `

        <div
        data-id="${address.id}"
        class="address-option border rounded-2xl p-5 cursor-pointer hover:border-orange-400">

            <h3 class="font-semibold">

                ${address.label}

            </h3>

            <p class="text-sm text-gray-500 mt-2">

                ${address.addressLine1}

            </p>

        </div>

    `
            )
            .join("");

    document
        .querySelectorAll(
            ".address-option"
        )
        .forEach(
            option => {

                option.addEventListener(
                    "click",
                    () => {

                        selectedAddressId =
                            option.dataset.id;

                        renderAddress();

                        document
                            .getElementById(
                                "address-list"
                            )
                            .classList.add(
                                "hidden"
                            );

                    }
                );

            }
        );

}

// ----------------------------------------------------
// PAYMENT METHODS
// ----------------------------------------------------

const PAYMENT_OPTIONS = [

    {
        value: "UPI",
        label: "UPI",
        icon: "💸"
    },

    {
        value: "CARD",
        label: "Card",
        icon: "💳"
    },

    {
        value: "NET_BANKING",
        label: "Net Banking",
        icon: "🏦"
    },

    {
        value: "WALLET",
        label: "Wallet",
        icon: "👛"
    },

    {
        value: "COD",
        label: "Cash On Delivery",
        icon: "💵"
    }

];

function renderPaymentMethods() {

    const container =
        document.getElementById(
            "payment-methods-container"
        );

    container.innerHTML =
        PAYMENT_OPTIONS
            .map(
                option => `

<label
data-value="${option.value}"
class="payment-option border-2 ${
                    option.value === selectedPaymentMethod
                        ? "border-orange-500"
                        : "border-gray-200"
                } rounded-2xl px-6 py-5 flex justify-between items-center cursor-pointer">

<div class="flex gap-5 items-center">

<span class="text-2xl">

${option.icon}

</span>

<span class="font-medium">

${option.label}

</span>

</div>

<input
type="radio"
name="payment-method"
${option.value === selectedPaymentMethod ? "checked" : ""}>

</label>

`
            )
            .join("");

    document
        .querySelectorAll(
            ".payment-option"
        )
        .forEach(
            option => {

                option.addEventListener(
                    "click",
                    () => {

                        selectedPaymentMethod =
                            option.dataset.value;

                        renderPaymentMethods();

                    }
                );

            }
        );

}

// ----------------------------------------------------
// CART ITEMS
// ----------------------------------------------------

function renderCartItems(cartData) {

    const container =
        document.getElementById(
            "cart-items-container"
        );

    document.getElementById(
        "item-count"
    ).innerText =
        `${cartData.items.length} Items`;

    container.innerHTML =
        cartData.items
            .map(
                item => `

<div class="flex justify-between border-b pb-5">

<div>

<h3 class="font-semibold">

${item.name}

</h3>

<p class="text-gray-500 mt-2">

Qty ${item.quantity}

</p>

</div>

<div class="font-semibold">

₹${item.unitPrice}

</div>

</div>

`
            )
            .join("");

}

// ----------------------------------------------------

function showLoader() {

    document
        .getElementById(
            "checkout-loader"
        )
        .classList.remove(
            "hidden"
        );

}

function hideLoader() {

    document
        .getElementById(
            "checkout-loader"
        )
        .classList.add(
            "hidden"
        );

}




// ----------------------------------------------------
// COUPONS
// ----------------------------------------------------

function renderAvailableCoupons(coupons) {

    const container =
        document.getElementById(
            "available-coupons"
        );


    if (coupons.length===0) {

        container.innerHTML = `
        <div class="text-center text-gray-400">
            No coupons available
        </div>
        `;

        return;
    }

    container.innerHTML =
        coupons.map(coupon => `

<div class="border rounded-2xl p-5 flex justify-between items-center ${coupon.isEligible ? "" : "opacity-50"}">

    <div>

        <h3 class="font-semibold">
            ${coupon.code}
        </h3>

        <p class="text-sm text-gray-500 mt-1">
            ${getCouponDescription(coupon)}
        </p>

    </div>

    ${
        coupon.isEligible
            ? `<button
                data-code="${coupon.code}"
                class="coupon-btn text-orange-500 font-semibold">
                Apply
            </button>`
            : `<span class="text-gray-400 text-sm">
                Not eligible
               </span>`
    }

</div>

`)
.join("");

    document
        .querySelectorAll(".coupon-btn")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    applyCoupon(
                        btn.dataset.code
                    );

                }
            );

        });

}

function getCouponDescription(coupon) {

    switch (coupon.type) {

        case "PERCENTAGE":
            return `${coupon.discountValue}% off`;

        case "FLAT":
            return `Flat ₹${coupon.discountValue} off`;

        case "FREE_DELIVERY":
            return "Free Delivery";

        default:
            return "";
    }

}

document
    .getElementById("apply-coupon-btn")
    ?.addEventListener(
        "click",
        () => {

            const code =
                document
                    .getElementById(
                        "coupon-input"
                    )
                    .value
                    .trim();

            applyCoupon(code);

        }
    );

function applyCoupon(code) {

    const coupon =
        checkoutData.availableCoupons.find(
            c =>
                c.code.toUpperCase()
                ===
                code.toUpperCase()
        );

    const message =
        document.getElementById(
            "coupon-message"
        );

    if (!coupon) {

        appliedCoupon = null;

        message.innerHTML = `
        <span class="text-red-500">
            Invalid coupon code
        </span>
        `;

        renderSummary(cartData);

        return;
    }

    if (!coupon.isEligible) {

        appliedCoupon = null;

        message.innerHTML = `
        <span class="text-red-500">
            ${coupon.reasonIfNotEligible}
        </span>
        `;

        renderSummary(cartData);

        return;
    }

    appliedCoupon = coupon;

    message.innerHTML = `
    <span class="text-green-600">
        Coupon applied successfully
    </span>
    `;

    renderSummary(cartData);

}

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------

function renderSummary(cartData) {

    const subtotal =
        cartData.subtotal;

    const tax =
        Number(
            (
                subtotal *
                TAX_RATE
            ).toFixed(2)
        );

    let deliveryFee =
        DELIVERY_FEE;

    let discount = 0;

    if (appliedCoupon) {

        if (
            appliedCoupon.type ===
            "PERCENTAGE"
        ) {

            discount =
                subtotal *
                appliedCoupon.discountValue /
                100;

            if (
                appliedCoupon.maxDiscount
            ) {

                discount =
                    Math.min(
                        discount,
                        appliedCoupon.maxDiscount
                    );
            }

        }

        else if (
            appliedCoupon.type ===
            "FLAT"
        ) {

            discount =
                appliedCoupon.discountValue;

        }

        else if (
            appliedCoupon.type ===
            "FREE_DELIVERY"
        ) {

            discount =
                deliveryFee;

        }

    }

    const total =
        (
            subtotal +
            tax +
            deliveryFee -
            discount
        ).toFixed(2);

    document.getElementById(
        "summary-subtotal"
    ).innerText = `₹${subtotal}`;

    document.getElementById(
        "summary-tax"
    ).innerText = `₹${tax}`;

    document.getElementById(
        "summary-delivery-fee"
    ).innerText = `₹${deliveryFee}`;

    document.getElementById(
        "summary-total"
    ).innerText = `₹${total}`;

    const row =
        document.getElementById(
            "coupon-discount-row"
        );

    if (discount > 0) {

        row.classList.remove(
            "hidden"
        );

        document.getElementById(
            "summary-discount"
        ).innerText =
            `-₹${discount.toFixed(2)}`;

    }

    else {

        row.classList.add(
            "hidden"
        );

    }

}

// ----------------------------------------------------
// PLACE ORDER
// ----------------------------------------------------

document
.getElementById(
    "place-order-btn"
)
?.addEventListener(
    "click",
    placeOrder
);

async function placeOrder() {

    if (!selectedAddressId) {

        showToast(
            "Please select address",
            "error"
        );

        return;
    }

    const btn =
        document.getElementById(
            "place-order-btn"
        );

    try {

        btn.disabled = true;

        btn.innerText =
            "Placing Order...";

        const response =
            await apiRequest(
                "/api/orders/place-order",
                "POST",
                {
                    addressId:
                        selectedAddressId,

                    paymentMethod:
                        selectedPaymentMethod,

                    couponCode:
                        appliedCoupon?.code
                }
            );

        const result =
            await response.json();

        if (!result.success) {

            showToast(
                result.error ||
                "Failed to place order",
                "error"
            );

            return;
        }

        showToast(
            "Order placed successfully",
            "success"
        );

        window.location.href =
            `/track-order/${result.data.orderId}`;

    }

    catch (err) {

        console.error(err);

        showToast(
            "Something went wrong",
            "error"
        );

    }

    finally {

        btn.disabled = false;

        btn.innerText =
            "Place Order";

    }

}