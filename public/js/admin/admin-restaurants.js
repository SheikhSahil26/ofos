document.addEventListener("DOMContentLoaded", async () => {
    await loadRestaurants();
});

async function loadRestaurants(page = 1) {

    try {

        const response =
            await fetch(
                `/api/restaurants?page=${page}&limit=10`
            );

        const result = await response.json();

        const tbody =
            document.getElementById(
                "restaurantTableBody"
            );

        tbody.innerHTML = "";

        result.data.forEach(restaurant => {

            const branch =
                restaurant.branches?.[0];

            const city =
                branch?.city || "N/A";

            const status =
                branch?.isOpenNow
                    ? `
                        <span class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                            Open
                        </span>
                    `
                    : `
                        <span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                            Closed
                        </span>
                    `;

            const logo =
                restaurant.logoUrl ||
                "https://placehold.co/100x100";

            const row = `
                <tr class="border-t hover:bg-slate-50">

                    <td class="p-5">

                        <div class="flex items-center gap-3">

                            <img
                                src="${logo}"
                                class="w-12 h-12 rounded-xl object-cover"
                            >

                            <div>

                                <h4 class="font-semibold">
                                    ${restaurant.name}
                                </h4>

                                <p class="text-sm text-gray-500">
                                    ${city}
                                </p>

                            </div>

                        </div>

                    </td>

                    <td>
                        -
                    </td>

                    <td>
                        Restaurant
                    </td>

                    <td>
                        -
                    </td>

                    <td>
                        -
                    </td>

                    <td>
                        ${status}
                    </td>

                    <td>

                        <div class="flex justify-center gap-2">

                            <button
                                class="bg-blue-500 text-white px-3 py-2 rounded-lg"
                                onclick="viewRestaurant('${restaurant.id}')"
                            >
                                View
                            </button>

                            <button
                                class="bg-yellow-500 text-white px-3 py-2 rounded-lg"
                                onclick="toggleRestaurant('${restaurant.id}')"
                            >
                                Block
                            </button>

                            <button
                                class="bg-red-500 text-white px-3 py-2 rounded-lg"
                                onclick="deleteRestaurant('${restaurant.id}')"
                            >
                                Delete
                            </button>

                        </div>

                    </td>

                </tr>
            `;

            tbody.insertAdjacentHTML(
                "beforeend",
                row
            );

        });

        renderPagination(
            result.pagination.page,
            Math.ceil(
                result.pagination.total /
                result.pagination.limit
            )
        );

    } catch (error) {

        console.error(error);

    }
}

function renderPagination(currentPage, totalPages) {

    const container =
        document.getElementById(
            "paginationContainer"
        );

    if (!container) return;

    container.innerHTML = "";

    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        container.innerHTML += `
            <button
                onclick="loadRestaurants(${i})"
                class="
                    w-10 h-10
                    rounded-xl
                    ${i === currentPage
                ? "bg-orange-500 text-white"
                : "border hover:bg-slate-100"}
                "
            >
                ${i}
            </button>
        `;
    }
}

function viewRestaurant(id) {

    window.location.href =
        `/admin/restaurants/${id}`;

}

async function deleteRestaurant(id) {

    if (
        !confirm(
            "Are you sure you want to delete this restaurant?"
        )
    ) return;

    try {

        await fetch(
            `/api/restaurants/${id}`,
            {
                method: "DELETE"
            }
        );

        loadRestaurants();

    } catch (error) {

        console.error(error);

    }
}

function toggleRestaurant(id) {

    alert(
        `Block/Unblock restaurant ${id}`
    );

}