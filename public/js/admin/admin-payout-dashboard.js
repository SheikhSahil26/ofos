document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDashboardStats();
        loadPendingSettlements();

    }
);

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

        console.log(result.data.settlements)
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
                `/payouts/settlements/${settlementId}/complete`,
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