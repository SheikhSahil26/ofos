const restaurantsContainer =
    document.getElementById("restaurantsContainer");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("error");

const searchInput =
    document.getElementById("searchInput");

let searchTimeout;

document.addEventListener("DOMContentLoaded", () => {
    fetchRestaurants();
});

async function fetchRestaurants(search = "") {
    try {
        loading.classList.remove("hidden");
        restaurantsContainer.classList.add("hidden");
        errorBox.classList.add("hidden");

        let url = "/api/restaurants";

        if (search.trim()) {
            url += `?search=${encodeURIComponent(search.trim())}`;
        }

        const response = await apiRequest(url);

        if (!response.ok) {
            throw new Error("Failed to fetch restaurants");
        }

        const result = await response.json();

        const restaurants = result.data || [];

        renderRestaurants(restaurants);

    } catch (error) {
        errorBox.textContent =
            error.message || "Something went wrong";

        errorBox.classList.remove("hidden");

    } finally {
        loading.classList.add("hidden");
        restaurantsContainer.classList.remove("hidden");
    }
}

function renderRestaurants(restaurants) {
    restaurantsContainer.innerHTML = "";

    if (!restaurants.length) {
        restaurantsContainer.innerHTML = `
            <div class="col-span-full">
                <div class="bg-white rounded-3xl border p-12 text-center">
                    <i class="fa-solid fa-store text-5xl text-gray-300"></i>

                    <h3 class="text-xl font-semibold mt-4">
                        No Restaurants Found
                    </h3>
                    
                </div>
            </div>
        `;
        return;
    }

    restaurants.forEach((restaurant) => {

        const branch =
            restaurant.branches?.[0];

        const isOpen =
            branch?.isOpenNow ?? false;

        const card =
            document.createElement("a");

        card.href =
            `/customer/restaurants/${restaurant.id}`;

        card.className =
            "bg-white rounded-3xl overflow-hidden border shadow-sm hover:shadow-lg transition duration-300";

        card.innerHTML = `
            <div class="aspect-[16/9] bg-gray-100">
                <img
                    src="${restaurant.logoUrl || "/images/restaurant-placeholder.png"}"
                    alt="${restaurant.name}"
                    class="w-full h-full object-cover"
                >
            </div>

            <div class="p-6">

                <div class="flex justify-between items-start">
                    <h2 class="text-xl font-bold text-gray-900">
                        ${restaurant.name}
                    </h2>

                    <span
                        class="text-sm font-semibold px-3 py-1 rounded-full ${
                            isOpen
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }"
                    >
                        ${isOpen ? "Open" : "Closed"}
                    </span>
                </div>

                <p
                    class="text-gray-500 mt-3 line-clamp-3 min-h-[72px]"
                >
                    ${restaurant.description || "No description available"}
                </p>

                <div class="border-t mt-5 pt-4">

                    <div
                        class="flex items-center gap-2 text-gray-700"
                    >
                        <i
                            class="fa-solid fa-shop text-[#014f38]"
                        ></i>

                        <span>
                            ${branch?.branchName || "Main Branch"}
                        </span>
                    </div>

                    <div
                        class="flex items-center gap-2 text-gray-500 mt-2"
                    >
                        <i
                            class="fa-solid fa-location-dot text-[#ff7a00]"
                        ></i>

                        <span>
                            ${branch?.city || ""}
                            ${branch?.state ? ", " + branch.state : ""}
                        </span>
                    </div>

                </div>

            </div>
        `;

        restaurantsContainer.appendChild(card);
    });
}

searchInput?.addEventListener("input", (event) => {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
        fetchRestaurants(event.target.value);
    }, 500);
});