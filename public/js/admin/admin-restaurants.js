document.addEventListener("DOMContentLoaded", async () => {
    await loadRestaurants();
    await loadDashboardStats();
});

async function loadRestaurants(page = 1) {

    try {

        const search =
            document.getElementById("searchInput").value;

        const status =
            document.getElementById("statusFilter").value;

        const openStatus =
            document.getElementById("openFilter").value;

        const sort =
            document.getElementById("sortFilter").value;

        const response = await apiRequest(
            `/api/admin/branches?page=${page}&limit=10&search=${encodeURIComponent(search)}&status=${status}&openStatus=${openStatus}&sort=${sort}`
        );
        const result = await response.json();

        const tbody =
            document.getElementById(
                "restaurantTableBody"
            );

        tbody.innerHTML = "";

        result.data.branches.forEach((branch) => {

            const row = `

        <tr
            class="
                border-b
                hover:bg-slate-50
                transition-all
            "
        >

            <!-- Restaurant -->

            <td class="p-5">

                <div class="flex items-center gap-3">

                    <img
                        src="${branch.restaurant.logo ||
                'https://placehold.co/60x60'
                }"
                        class="
                            w-14
                            h-14
                            rounded-xl
                            object-cover
                            border
                        "
                    >

                    <div>

                        <h4 class="font-semibold text-slate-800">
                            ${branch.restaurant.name}
                        </h4>

                        <p class="text-sm text-gray-500">
                            ${branch.city}, ${branch.state}
                        </p>

                    </div>

                </div>

            </td>

            <!-- Branch -->

            <td class="px-4">

                <div>

                    <p class="font-medium">
                        ${branch.branchName}
                    </p>

                    ${branch.isPrimary
                    ? `
                                <span
                                    class="
                                        text-xs
                                        bg-blue-100
                                        text-blue-600
                                        px-2
                                        py-1
                                        rounded-full
                                    "
                                >
                                    Primary
                                </span>
                              `
                    : ""
                }

                </div>

            </td>

            <!-- Branch Head -->

            <td class="px-4">

                <div>

                    <p class="font-medium">
                        ${branch.branchHead?.name ||
                "Not Assigned"
                }
                    </p>

                    <p class="text-xs text-gray-500">
                        ${branch.branchHead?.mobile ||
                ""
                }
                    </p>

                </div>

            </td>

            <!-- Orders -->

            <td class="text-center">

                <div>

                    <p class="font-bold text-lg">
                        ${branch.totalOrders}
                    </p>

                    <p class="text-xs text-green-600">
                        Delivered :
                        ${branch.deliveredOrders}
                    </p>

                </div>

            </td>

            <!-- Revenue -->

            <td
                class="
                    text-center
                    font-bold
                    text-green-600
                "
            >
                ₹${Number(
                    branch.totalRevenue
                ).toLocaleString()}
            </td>

            <!-- Rating -->

            <td class="text-center">

                <div
                    class="
                        flex
                        items-center
                        justify-center
                        gap-1
                    "
                >

                    <i
                        class="
                            fa-solid
                            fa-star
                            text-yellow-500
                        "
                    ></i>

                    <span class="font-semibold">
                        ${branch.averageRating}
                    </span>

                    <span class="text-xs text-gray-500">
                        (${branch.totalReviews})
                    </span>

                </div>

            </td>

            <!-- Open / Close -->

            <td class="text-center">

                ${branch.isOpenNow
                    ? `
                            <span
                                class="
                                    bg-green-100
                                    text-green-700
                                    px-3
                                    py-1
                                    rounded-full
                                    text-sm
                                "
                            >
                                Open
                            </span>
                        `
                    : `
                            <span
                                class="
                                    bg-red-100
                                    text-red-700
                                    px-3
                                    py-1
                                    rounded-full
                                    text-sm
                                "
                            >
                                Closed
                            </span>
                        `
                }

            </td>

            <!-- Verification -->

            <td class="text-center">

                ${branch.verificationStatus ===
                    "APPROVED"

                    ? `
                            <span
                                class="
                                    bg-green-100
                                    text-green-700
                                    px-3
                                    py-1
                                    rounded-full
                                    text-sm
                                "
                            >
                                Approved
                            </span>
                        `

                    : `
                            <span
                                class="
                                    bg-yellow-100
                                    text-yellow-700
                                    px-3
                                    py-1
                                    rounded-full
                                    text-sm
                                "
                            >
                                Pending
                            </span>
                        `
                }

            </td>

            <!-- Actions -->

            <td class="text-center">

                <div
                    class="
                        flex
                        justify-center
                        gap-2
                    "
                >

                    <button
                        class="
                            bg-blue-500
                            hover:bg-blue-600
                            text-white
                            w-9
                            h-9
                            rounded-lg
                        "
                        title="View"
                        onclick="viewBranch('${branch.id}')"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>

                    <button
                        class="
                            ${branch.isActive
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-500 hover:bg-green-600"
                }
                            text-white
                            w-9
                            h-9
                            rounded-lg
                        "
                        title="${branch.isActive
                    ? "Block"
                    : "Activate"
                }"
                        onclick="toggleBranch('${branch.id}')"
                    >
                        <i
                            class="
                                fa-solid
                                ${branch.isActive
                    ? "fa-ban"
                    : "fa-check"
                }
                            "
                        ></i>
                    </button>

                    <button
                        class="
                            bg-red-500
                            hover:bg-red-600
                            text-white
                            w-9
                            h-9
                            rounded-lg
                        "
                        title="Delete"
                        onclick="deleteBranch('${branch.id}')"
                    >
                        <i class="fa-solid fa-trash"></i>
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
            result.data.pagination.page,
            Math.ceil(
                result.data.pagination.total /
                result.data.pagination.limit
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

        await apiRequest(
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

async function loadDashboardStats() {

    try {

        const response =
            await apiRequest(
                "/api/admin/branches/stats"
            );

        if (!response?.ok) {
            setTimeout(() => {
                window.location.href = "http://localhost:8080/admin/login"
            }, 1500)
        }
        const result =
            await response.json();

        const stats =
            result.data;

        document.getElementById(
            "totalRestaurants"
        ).textContent =
            stats.totalRestaurants ?? 0;

        document.getElementById(
            "totalBranches"
        ).textContent =
            stats.totalBranches ?? 0;

        document.getElementById(
            "activeBranches"
        ).textContent =
            stats.activeBranches ?? 0;

        document.getElementById(
            "blockedBranches"
        ).textContent =
            stats.blockedBranches ?? 0;

        document.getElementById(
            "newBranches"
        ).textContent =
            stats.newBranchesThisMonth ?? 0;

    } catch (error) {

        console.error(
            "Dashboard stats error:",
            error
        );

    }

}