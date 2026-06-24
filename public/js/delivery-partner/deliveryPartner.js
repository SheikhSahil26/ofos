
// /public/js/orders/deliveryPartner.js

let isAvailable = true;

let activeOrders = [];

let currentOrder = null;

let acceptingOrders = false;


/* ================================
INIT
================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDashboard();

        setupAvailabilityToggle();

        // initializeSocket();

    }
);


/* ================================
LOAD DASHBOARD
================================ */

async function loadDashboard() {

    try {

        await Promise.all([
            loadActiveOrders(),
            loadCurrentOrder()
        ]);

    }
    catch (err) {

        console.error(err);

        showToast(
            "Failed to load dashboard",
            "error"
        );

    }

}


/* ================================
AVAILABILITY
================================ */

function setupAvailabilityToggle() {

    const toggle =
        document.querySelector(
            'input[type="checkbox"]'
        );

    if (!toggle)
        return;

    toggle.addEventListener(
        "change",
        async () => {

            try {

                const response =
                    await apiRequest(
                        "/api/delivery/toggle-availability",
                        "PATCH",
                        {
                            isAvailable:
                                toggle.checked
                        }
                    );

                const result =
                    await response.json();

                    console.log(result)

                

                if (
                    result
                ) {

                    showToast(
                        toggle.checked
                            ? "You are online"
                            : "You are offline",
                        "success"
                    );

                }

            }
            catch (err) {

                showToast(
                    "Failed to update availability",
                    "error"
                );

            }

        }
    );

}


/* ================================
ACTIVE ORDERS
================================ */

async function loadActiveOrders() {

    try {

        const response =
            await apiRequest(
                "/api/delivery-partner/orders/active"
            );

        const result =
            await response.json();

        if (!result.success)
            return;

        activeOrders =
            result.data;

        renderActiveOrders();

    }
    catch (err) {

        console.error(err);

    }

}


function renderActiveOrders() {

    const container =
        document.querySelector(
            ".space-y-6"
        );

    if (!container)
        return;

    container.innerHTML = "";

    activeOrders.forEach(
        order => {

            container.innerHTML += `

            <div
            class="bg-white rounded-3xl p-8 shadow-sm">

                <div class="flex justify-between">

                    <div>

                        <h3 class="text-2xl font-bold">
                            #${order.orderNumber}
                        </h3>

                        <p class="text-gray-500 mt-3">
                            ${order.restaurantName}
                        </p>

                        <p class="text-gray-500">
                            ${order.distanceKm} km Away
                        </p>

                    </div>

                    <span
                    class="bg-orange-100 text-orange-600 px-5 py-3 rounded-2xl">

                        Waiting

                    </span>

                </div>

                <div class="flex gap-4 mt-8">

                    <button
                    class="
                    view-route-btn
                    bg-[#014D2F]
                    text-white
                    px-6 py-3 rounded-2xl"
                    data-order-id="${order.id}">

                        View Route

                    </button>

                    <button
                    class="
                    accept-order-btn
                    bg-orange-500
                    text-white
                    px-6 py-3 rounded-2xl"
                    data-order-id="${order.id}">

                        Accept

                    </button>

                </div>

            </div>

            `;

        }
    );

}


/* ================================
ACCEPT ORDER
================================ */

document.addEventListener(
    "click",
    async e => {

        const button =
            e.target.closest(
                ".accept-order-btn"
            );

        if (!button)
            return;

        try {

            const response =
                await apiRequest(
                    `/api/delivery-partner/orders/${button.dataset.orderId}/accept`,
                    "PATCH"
                );

            const result =
                await response.json();

            if (
                result.success
            ) {

                showToast(
                    "Order accepted",
                    "success"
                );

                loadDashboard();

            }

        }
        catch (err) {

            showToast(
                "Unable to accept order",
                "error"
            );

        }

    }
);


/* ================================
CURRENT ORDER
================================ */

async function loadCurrentOrder() {

    try {

        const response =
            await apiRequest(
                "/api/delivery-partner/current-order"
            );

        const result =
            await response.json();

        if (
            result.success
        ) {

            currentOrder =
                result.data;

        }

    }
    catch (err) {

        console.error(err);

    }

}


/* ================================
PICKED UP
================================ */

document
.getElementById(
    "picked-up-btn"
)
?.addEventListener(
    "click",
    async () => {

        if (!currentOrder)
            return;

        const response =
            await apiRequest(
                `/api/orders/${currentOrder.id}/picked-up`,
                "PATCH"
            );

        const result =
            await response.json();

        if (
            result.success
        ) {

            showToast(
                "Picked up",
                "success"
            );

        }

    }
);


/* ================================
DELIVERED
================================ */

document
.getElementById(
    "delivered-btn"
)
?.addEventListener(
    "click",
    async () => {

        if (!currentOrder)
            return;

        const response =
            await apiRequest(
                `/api/orders/${currentOrder.id}/delivered`,
                "PATCH"
            );

        const result =
            await response.json();

        if (
            result.success
        ) {

            showToast(
                "Delivered successfully",
                "success"
            );

            loadDashboard();

        }

    }
);


/* ================================
REAL TIME SOCKET PLACEHOLDER
================================ */

// socket.on(
//     "newDeliveryRequest",
//     order => {
//
//         showToast(
//             "New Order Received",
//             "success"
//         );
//
//         activeOrders.unshift(
//             order
//         );
//
//         renderActiveOrders();
//
//     }
// );

