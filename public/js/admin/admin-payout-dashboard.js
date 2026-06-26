document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDashboardStats();
        loadPendingSettlements();
        bindDashboardEvents();

    }
);

function bindDashboardEvents() {

    document
        .getElementById("pendingCard")
        .addEventListener(
            "click",
            loadPendingSettlements
        );

    document
        .getElementById("restaurantCard")
        .addEventListener(
            "click",
            loadRestaurantPending
        );

    document
        .getElementById("deliveryCard")
        .addEventListener(
            "click",
            loadDeliveryPending
        );

}

async function loadDashboardStats() {

    try {

        const response =
            await apiRequest(
                "http://localhost:8080/api/payouts/dashboard/stats",
                "GET"
            );

        const result = await response.json();
        const stats =
            result.data;

        console.log(stats)

        document.getElementById(
            "pendingSettlements"
        ).innerText =
            stats.pendingSettlements;

        document.getElementById(
            "restaurantPending"
        ).innerText =
            `₹${stats.restaurantPendingAmount}`;

        document.getElementById(
            "deliveryPending"
        ).innerText =
            `₹${stats.deliveryPendingAmount}`;

        document.getElementById(
            "todaySettlements"
        ).innerText =
            stats.todaySettlements;

        document.getElementById(
            "totalPaid"
        ).innerText =
            `₹${stats.totalPaidAmount}`;

    }
    catch (error) {

        console.error(error);

    }
}

async function loadPendingSettlements() {

    try {

        const response =
            await apiRequest(
                "http://localhost:8080/api/payouts/settlements/pending",
                "GET"
            );

        const result = await response.json();

        console.log(result.data)
        renderPendingSettlements(
            result.data.settlements
        );

    }
    catch (error) {

        console.error(error);

    }
}

function renderPendingSettlements(
    settlements
) {

    console.log(settlements)

    const tbody =
        document.getElementById(
            "pendingSettlementBody"
        );

    tbody.innerHTML = "";

    settlements.forEach(
        settlement => {

            tbody.innerHTML += `
            <tr class="border-b">

                <td class="p-4">
                    ${settlement.id}
                </td>

                <td>
                    ${settlement.settlementType}
                </td>

                <td>
                    ${settlement.beneficiaryId}
                </td>

                <td>
                    ₹${settlement.totalAmount}
                </td>

                <td>
                    ${new Date(
                settlement.createdAt
            ).toLocaleDateString()}
                </td>

                <td class="text-center">

                    <button
                        onclick="completeSettlement('${settlement.id}')"
                        class="
                        bg-green-500
                        text-white
                        px-4
                        py-2
                        rounded-lg">

                        Complete

                    </button>

                </td>

            </tr>
            `;
        }
    );
}

async function completeSettlement(
    settlementId
) {

    if (
        !confirm(
            "Complete this settlement?"
        )
    ) {
        return;
    }

    try {

        const response =
            await apiRequest(
                `http://localhost:8080/api/payouts/settlements/${settlementId}/complete`,
                "PATCH"
            );

        showToast(
            response.message,
            "success"
        );

        loadDashboardStats();
        loadPendingSettlements();

    }
    catch (error) {

        showToast(
            error.message,
            "error"
        );

    }
}

async function loadRestaurantPending() {

    document.getElementById(
        "tableTitle"
    ).innerText =
        "Restaurant Pending Payouts";

    const response =
        await apiRequest(
            "/api/admin/payouts/restaurants",
            "GET"
        );

    const result =
        await response.json();

    console.log("result.data.restaurants", result.data.restaurants)

    renderRestaurantTable(
        result.data.restaurants
    );

}

async function loadDeliveryPending() {

    document.getElementById(
        "tableTitle"
    ).innerText =
        "Delivery Partner Pending Payouts";

    const response =
        await apiRequest(
            "/api/admin/payouts/delivery-partners",
            "GET"
        );

    const result =
        await response.json();


    console.log("result.data.deliveryPartners", result.data.deliveryPartners)
    renderDeliveryTable(
        result.data.deliveryPartners
    );

}

async function loadPendingSettlements() {

    document.getElementById(
        "tableTitle"
    ).innerText =
        "Recent Pending Settlements";

    const response =
        await apiRequest(
            "/api/payouts/settlements/pending",
            "GET"
        );

    const result =
        await response.json();

    renderPendingSettlements(
        result.data.settlements
    );

}

function renderRestaurantTable(restaurants) {

    const tbody =
        document.getElementById(
            "pendingSettlementBody"
        );

    tbody.innerHTML = "";

    restaurants.forEach(branch => {

        tbody.innerHTML += `

        <tr class="border-b">

            <td class="p-4">

                ${branch.branchName}

            </td>

            <td>

                ${branch.restaurantName}

            </td>

            <td>

                ₹${branch.pendingAmount}

            </td>

            <td>

                ${branch.pendingOrders}

            </td>

            <td>

                ${branch.lastSettlement
                ? new Date(
                    branch.lastSettlement
                ).toLocaleDateString()
                : "-"
            }

            </td>

            <td class="text-center">

                <button
                    onclick="createRestaurantSettlement('${branch.branchId}')"
                    class="bg-blue-500 text-white px-4 py-2 rounded-lg">

                    Settle

                </button>

            </td>

        </tr>

        `;

    });

}

function renderDeliveryTable(partners) {

    const tbody =
        document.getElementById(
            "pendingSettlementBody"
        );

    tbody.innerHTML = "";

    if (partners.length == 0) {
        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="text-center p-10 text-gray-500"
                >
                    No pending settlments
                </td>
            </tr>
        `;

        return;
    }

    partners.forEach(partner => {

        tbody.innerHTML += `

        <tr class="border-b">

            <td class="p-4">

                ${partner.deliveryPartnerName}

            </td>

            <td>

                ${partner.mobile}

            </td>

            <td>

                ₹${partner.pendingAmount}

            </td>

            <td>

                ${partner.pendingOrders}

            </td>

            <td>

                ${partner.lastSettlement
                ? new Date(
                    partner.lastSettlement
                ).toLocaleDateString()
                : "-"
            }

            </td>

            <td class="text-center">

                <button
                    onclick="createDeliverySettlement('${partner.deliveryPartnerId}')"
                    class="bg-purple-500 text-white px-4 py-2 rounded-lg">

                    Settle

                </button>

            </td>

        </tr>

        `;

    });

}

async function createRestaurantSettlement(branchId) {

    const response =
        await apiRequest(
            `http://localhost:8080/api/payouts/settlements/restaurants`,
            "POST",
            { branchId }
        );

    const result =
        await response.json();

    showToast(result.message, "success");

    loadDashboardStats();
    loadRestaurantPending();

}

async function createDeliverySettlement(partnerId) {

    const response =
        await apiRequest(
            `/api/payouts/delivery-partners/${partnerId}/settlement`,
            "POST"
        );

    const result =
        await response.json();

    showToast(result.message, "success");

    loadDashboardStats();
    loadDeliveryPending();

}