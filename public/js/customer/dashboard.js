document.addEventListener(
    "DOMContentLoaded",
    loadDashboard
);

async function loadDashboard() {

    try {

        const response =
            await apiRequest(
                "/api/users/dashboard"
            );

        if (!response?.ok) {
            throw new Error(
                "Failed to load dashboard"
            );
        }

        const result =
            await response.json();

        const stats =
            result.data;

        document.getElementById(
            "totalOrders"
        ).textContent =
            stats.totalOrders;

        document.getElementById(
            "savedAddresses"
        ).textContent =
            stats.savedAddresses;

        document.getElementById(
            "loyaltyPoints"
        ).textContent =
            stats.loyaltyPoints;

        document.getElementById(
            "availablePoints"
        ).textContent = stats.loyaltyPoints;

        document.getElementById(
            "totalReviews"
        ).textContent =
            stats.totalReviews;

        // Current Order
        renderCurrentOrder(
            stats.currentOrder
        );

        // Recent Restaurants
        renderRecentRestaurants(
            stats.recentRestaurants || []
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to load dashboard",
            "error"
        );
    }
}

//rendering current order
function renderCurrentOrder(order) {

    const container =
        document.getElementById(
            "currentOrderContainer"
        );

    if (!container) return;

    if (!order || Object.keys(order).length) {

        container.innerHTML = `
            <div class="text-center py-4">
                <p class="text-gray-500">
                    No active orders
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div>
            <h3 class="font-semibold text-lg">
                ${order.orderNumber}
            </h3>

            <p class="text-orange-500 font-medium mt-1">
                ${formatStatus(order.status)}
            </p>

            <p class="text-gray-500 text-sm mt-1">
                Ordered on
                ${formatDate(order.placedAt)}
            </p>
            <a href="#" class="inline-block mt-3 text-[#ff7a00] font-medium">
                Track Order
            </a>
        </div>
    `;
}

//recent restaurants
function renderRecentRestaurants(restaurants) {

    const container =
        document.getElementById(
            "recentRestaurantsContainer"
        );

    if (!container) return;

    if (!restaurants.length) {

        container.innerHTML = `
            <div class="text-center py-4">
                <p class="text-gray-500">
                    No previous orders yet
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        restaurants.map(restaurant => `
            <div>

                <img
                    src="${restaurant.logoUrl || '/images/default-restaurant.png'}"
                    alt="${restaurant.restaurantName}"
                    class="w-32 h-24 rounded-xl object-cover"
                >

                <p class="font-medium mt-2">
                    ${restaurant.restaurantName}
                </p>

                <p class="text-sm text-gray-500">
                    ${restaurant.branchName}
                </p>

                <p class="text-xs text-gray-400">
                    ${formatDate(restaurant.placedAt)}
                </p>

            </div>
        `).join("");
}

function formatDate(date) {

    return new Date(date)
        .toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
}

function formatStatus(status) {

    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );
}