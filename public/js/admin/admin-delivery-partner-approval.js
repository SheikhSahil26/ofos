let currentPage = 1;
const limit = 10;

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadStats();
        loadPendingPartners();

        document
            .getElementById("searchBtn")
            .addEventListener(
                "click",
                () => {
                    currentPage = 1;
                    loadPendingPartners();
                }
            );

    }
);

async function loadStats() {

    try {

        const response =
            await apiRequest(
                "http://localhost:8080/api/admin/delivery-partners-approvals/stats"
            );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        document.getElementById(
            "totalPendingApprovals"
        ).textContent =
            result.data.pending || 0;

        document.getElementById(
            "approvedToday"
        ).textContent =
            result.data.approvedToday || 0;

        document.getElementById(
            "rejectedToday"
        ).textContent =
            result.data.rejectedToday || 0;

        document.getElementById(
            "pendingRequestCount"
        ).textContent =
            `${result.data.pending || 0} Pending Requests`;

    } catch (error) {


        showToast(
            error.message ||
            "Unable to load stats",
            "error"
        );
    }
}

async function loadPendingPartners() {

    try {

        const search =
            document.getElementById(
                "searchInput"
            ).value.trim();

        const params =
            new URLSearchParams({
                page: currentPage,
                limit
            });

        if (search) {
            params.append(
                "search",
                search
            );
        }

        const response =
            await apiRequest(
                `http://localhost:8080/api/admin/delivery-partners-approvals/pending?${params}`
            );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        renderTable(
            result.data.partners
        );

        renderPagination(
            result.data.pagination.total
        );

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to load partners",
            "error"
        );
    }
}

function renderTable(partners) {

    const tbody =
        document.getElementById(
            "approvalTableBody"
        );

    tbody.innerHTML = "";

    if (!partners.length) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="text-center p-10 text-gray-500"
                >
                    No pending approvals found
                </td>
            </tr>
        `;

        return;
    }

    partners.forEach(partner => {

        tbody.innerHTML += `
            <tr class="border-t">

                <td class="p-5">
                    <div>
                        <p class="font-semibold">
                            ${partner.fullName}
                        </p>

                        <p class="text-sm text-gray-500">
                            ${partner.email}
                        </p>
                    </div>
                </td>

                <td>
                    ${partner.mobile || "-"}
                </td>

                <td>
                    ${partner.vehicleType}
                </td>

                <td>
                    ${partner.vehicleNumber}
                </td>

                <td>
                    ${partner.governmentId}
                </td>

                <td>
                    ${new Date(
            partner.createdAt
        ).toLocaleDateString()}
                </td>

                <td class="text-center">

                    <div class="flex gap-2 justify-center">

                        <button
                            onclick="approvePartner('${partner.id}')"
                            class="
                                bg-green-500
                                hover:bg-green-600
                                text-white
                                px-4
                                py-2
                                rounded-lg
                            "
                        >
                            Approve
                        </button>

                        <button
                            onclick="rejectPartner('${partner.id}')"
                            class="
                                bg-red-500
                                hover:bg-red-600
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
    });
}

async function approvePartner(id) {

    const confirmed =
        confirm(
            "Approve this delivery partner?"
        );

    if (!confirmed) {
        return;
    }

    try {

        console.log("request for approcal")

        const response =
            await apiRequest(`http://localhost:8080/api/admin/delivery-partners-approvals/${id}/approve`,"PATCH"
            );

        const result =
            await response.json();

        console.log("response come from server", result)

        if (!response.ok) {
            throw new Error(result.message);
        }

        showToast(
            result.message,
            "success"
        );

        loadStats();
        loadPendingPartners();

    } catch (error) {
        showToast(
            error.message,
            "error"
        );
    }
}

async function rejectPartner(id) {

    console.log(id)

    const confirmed =
        confirm(
            "Reject this delivery partner?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await apiRequest(`http://localhost:8080/api/admin/delivery-partners-approvals/${id}/reject`,
                {
                    method: "PATCH"
                }
            );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        showToast(
            result.message,
            "success"
        );

        loadStats();
        loadPendingPartners();

    } catch (error) {

        showToast(
            error.message,
            "error"
        );
    }
}

function renderPagination(total) {

    const container =
        document.getElementById(
            "paginationContainer"
        );

    container.innerHTML = "";

    const totalPages =
        Math.ceil(total / limit);

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.textContent = page;

        button.className =
            page === currentPage
                ? "bg-[#014f38] text-white px-4 py-2 rounded-lg"
                : "bg-slate-200 px-4 py-2 rounded-lg";

        button.onclick = () => {

            currentPage = page;

            loadPendingPartners();
        };

        container.appendChild(
            button
        );
    }
}