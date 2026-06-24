
// /public/js/orders/deliveryPartner.js



let activeOrders = [];

let currentOrder = null;

let acceptingOrders = false;




async function loadPartnerProfile() {

    try {

        const response =
            await apiRequest(
                "/api/delivery/profile"
            );

        const result =
            await response.json();

        if (!result.success) {

            renderVerificationPending();

            return false;
        }

        const partner =
            result.data;

        console.log(
            "Partner Profile",
            partner
        );

        if (
            partner.status ===
            "PENDING_VERIFICATION"
        ) {

            renderVerificationPending();

            return false;
        }

        if (
            partner.status ===
            "SUSPENDED"
        ) {

            renderSuspendedAccount();

            return false;
        }

        const toggle =
            document.querySelector(
                'input[type="checkbox"]'
            );

        if (toggle) {

            toggle.checked =
                partner.status === "ACTIVE";
        }

        return true;

    }
    catch (error) {

        console.error(error);

        renderVerificationPending();

        return false;

    }

}

//if profile is not verified 
function renderVerificationPending() {

    document.body.innerHTML = `

    <div
    class="min-h-screen flex items-center justify-center bg-[#F8F8F8]">

        <div
        class="bg-white rounded-3xl shadow-lg p-12 max-w-lg text-center">

            <div
            class="w-24 h-24 rounded-full
            bg-orange-100
            flex items-center justify-center
            mx-auto">

                <span class="text-5xl">
                    ⏳
                </span>

            </div>

            <h1
            class="text-3xl font-bold mt-8">

                Verification Pending

            </h1>

            <p
            class="text-gray-500 mt-4">

                Your delivery partner profile
                is currently under review.

                Once approved by the admin,
                you will be able to accept
                delivery requests.

            </p>

            <button
            onclick="window.location.href='/delivery/profile'"
            class="
            mt-8
            bg-orange-500
            hover:bg-orange-600
            text-white
            px-8 py-4
            rounded-2xl">

                View Profile

            </button>

        </div>

    </div>

    `;
}

//if profile is suspended
function renderSuspendedAccount() {

    document.body.innerHTML = `

    <div
    class="min-h-screen flex items-center justify-center bg-[#F8F8F8]">

        <div
        class="bg-white rounded-3xl shadow-lg p-12 max-w-lg text-center">

            <div
            class="w-24 h-24 rounded-full
            bg-red-100
            flex items-center justify-center
            mx-auto">

                <span class="text-5xl">
                    ⚠️
                </span>

            </div>

            <h1
            class="text-3xl font-bold mt-8">

                Account Suspended

            </h1>

            <p
            class="text-gray-500 mt-4">

                Your delivery partner account
                has been suspended.

                Please contact support
                for further assistance.

            </p>

            <button
            class="
            mt-8
            bg-orange-500
            text-white
            px-8 py-4
            rounded-2xl">

                Contact Support

            </button>

        </div>

    </div>

    `;
}




/* ================================
INIT
================================ */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const canAccess =
            await loadPartnerProfile();

        if (!canAccess) {
            return;
        }

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
                        "PATCH"

                    );

                const result =
                    await response.json();

                console.log("availability", result);

                if (
                    result.data.currentStatus ===
                    "ACTIVE"
                ) {

                    showToast(
                        toggle.checked
                            ? "You are online"
                            : "You are offline",
                        "success"
                    );

                    startLocationTracking();

                }
                else {

                    showToast(
                        toggle.checked
                            ? "You are online"
                            : "You are offline",
                        "success"
                    );

                    stopLocationTracking();

                }

            }
            catch (err) {

                toggle.checked =
                    !toggle.checked;

                showToast(
                    "Failed to update availability",
                    "error"
                );

            }

        }
    );

}
let locationInterval = null;

async function getCurrentLocation() {

    return new Promise(
        (resolve, reject) => {

            if (!navigator.geolocation) {

                reject(
                    new Error(
                        "Geolocation not supported"
                    )
                );

                return;
            }

            navigator.geolocation.getCurrentPosition(

                (position) => {

                    resolve({
                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude
                    });

                },

                (error) => {

                    reject(error);

                },

                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }

            );

        }
    );
}

async function sendLocation() {

    try {

        console.log(
            "Sending location..."
        );

        const currentLocation =
            await getCurrentLocation();

        console.log(
            "Current Location:",
            currentLocation
        );

        const response =
            await apiRequest(
                "/api/delivery/update-partner-location",
                "PATCH",
                {
                    latitude:
                        currentLocation.latitude,

                    longitude:
                        currentLocation.longitude
                }
            );

        if (!response) {

            console.error(
                "apiRequest returned null"
            );

            return;
        }

        const result =
            await response.json();

        console.log(
            "Location Updated:",
            result
        );

    }
    catch (error) {

        console.error(
            "Location Tracking Error:",
            error
        );

    }
}

function startLocationTracking() {

    console.log(
        "Starting location tracking..."
    );

    if (locationInterval) {

        console.log(
            "Tracking already running"
        );

        return;
    }

    // First call immediately
    sendLocation();

    // Then poll every 5 sec
    locationInterval =
        setInterval(
            () => {

                console.log(
                    "Polling..."
                );

                sendLocation();

            },
            5000
        );

    console.log(
        "Interval Started:",
        locationInterval
    );
}

function stopLocationTracking() {

    console.log(
        "Stopping location tracking..."
    );

    if (!locationInterval)
        return;

    clearInterval(
        locationInterval
    );

    locationInterval = null;

    console.log(
        "Tracking stopped"
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

