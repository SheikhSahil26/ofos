document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadCounts();

        await loadPendingApprovals();
    }
);

async function loadCounts() {

    try {

        const response =
            await fetch(
                "http://localhost:8080/api/admin/restaurant-approvals/count"
            );

        const result =
            await response.json();

        console.log(result)

        document.getElementById(
            "pendingRequestCount"
        ).textContent =
            `${result.data.totalPendingRequests} Pending Requests`;

        document.getElementById(
            "totalPendingApprovals"
        ).textContent =
            result.data.totalPendingRequests;

        document.getElementById(
            "approvedToday"
        ).textContent =
            result.data.approvedToday || 0;

        document.getElementById(
            "rejectedToday"
        ).textContent =
            result.data.rejectedToday || 0;

    } catch (error) {

        console.error(error);

    }
}

async function loadPendingApprovals(
    page = 1
) {

    try {

        const search =
            document.getElementById(
                "searchInput"
            )?.value || "";

        const response =
            await fetch(
                `http://localhost:8080/api/admin/restaurant-approvals?page=${page}&limit=10&search=${search}`
            );

        const result =
            await response.json();
        console.log(result)

        const tbody =
            document.getElementById(
                "approvalTableBody"
            );

        tbody.innerHTML = "";

        result.data.approvals.forEach(
            branch => {

                const row = `

                    <tr class="border-t hover:bg-slate-50">

                        <td class="p-5">

                         
                <div class="flex items-center gap-3">

                    <img
                        src="${branch.restaurantLogo ||
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
                            ${branch.restaurantName}
                        </h4>

                        <p class="text-sm text-gray-500">
                            ${branch.city}, ${branch.state}
                        </p>

                    </div>

                </div>

                        </td>

                        <td>
                            ${branch.branchName}
                        </td>

                        <td>

                            <div>

                                <p class="font-medium">
                                    ${branch.branchHead}
                                </p>

                            </div>

                        </td>

                        <td>
                            ${branch.branchContact}
                        </td>

                        <td>
                            ${new Date(
                        branch.appliedDate
                    ).toLocaleDateString()}
                        </td>

                        <td>

                            <div class="flex gap-2">

                                <a
                                    href="${branch.gstin}"
                                    target="_blank"
                                    class="
                                        bg-green-100
                                        text-green-600
                                        px-3
                                        py-1
                                        rounded-full
                                        text-xs
                                    "
                                >
                                    GST
                                </a>

                                <a
                                    href="${branch.fssaiLicense}"
                                    target="_blank"
                                    class="
                                        bg-blue-100
                                        text-blue-600
                                        px-3
                                        py-1
                                        rounded-full
                                        text-xs
                                    "
                                >
                                    FSSAI
                                </a>

                            </div>

                        </td>

                        <td>

                            <div class="flex justify-center gap-2">

                                <button
                                    onclick="viewBranch('${branch.branchId}')"
                                    class="
                                        border
                                        bg-white
                                        border-[#014f38]
                                        text-[#014f38]
                                        px-4
                                        py-2
                                        rounded-lg
                                    "
                                >
                                    View
                                </button>

                                <button
                                    onclick="approveBranch('${branch.branchId}')"
                                    class="
                                        bg-[#014f38]
                                        text-white
                                        px-4
                                        py-2
                                        rounded-lg
                                    "
                                >
                                    Approve
                                </button>

                                <button
                                    onclick="rejectBranch('${branch.branchId}')"
                                    class="
                                        bg-red-500
                                        text-white
                                        px-4
                                        py-2
                                        rounded-lg
                                    "
                                >
                                    Reject
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

                tbody.insertAdjacentHTML(
                    "beforeend",
                    row
                );

            }
        );

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

function renderPagination(
    currentPage,
    totalPages
) {

    const container =
        document.getElementById(
            "paginationContainer"
        );

    container.innerHTML = `
        <p class="text-gray-500">
            Page ${currentPage} of ${totalPages}
        </p>

        <div class="flex gap-2">

            ${Array.from(
        { length: totalPages },
        (_, i) => i + 1
    ).map(page => `

                    <button
                        onclick="loadPendingApprovals(${page})"
                        class="
                            w-10 h-10
                            rounded-xl

                            ${page === currentPage
            ? "bg-orange-500 text-white"
            : "border hover:bg-slate-100"
        }
                        "
                    >
                        ${page}
                    </button>

                `).join("")
        }

        </div>
    `;
}

function viewBranch(branchId) {

    window.location.href =
        `/admin/branches/${branchId}`;
}

async function approveBranch(
    branchId
) {

    if (!confirm(
        "Approve this branch?"
    )) return;

    await fetch(
        `/api/admin/restaurant-approvals/${branchId}/approve`,
        {
            method: "PATCH"
        }
    );

    loadPendingApprovals();
    loadCounts();
}

async function rejectBranch(
    branchId
) {

    if (!confirm(
        "Reject this branch?"
    )) return;

    await fetch(
        `/api/admin/restaurant-approvals/${branchId}/reject`,
        {
            method: "PATCH"
        }
    );

    loadPendingApprovals();
    loadCounts();
}