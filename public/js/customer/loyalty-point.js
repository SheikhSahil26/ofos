document.addEventListener(
    "DOMContentLoaded",
    loadLoyaltyOverview
);

async function loadLoyaltyOverview() {

    try {

        const response =
            await apiRequest(
                "/api/users/loyalty-points"
            );

        if (!response) return;

        const result =
            await response.json();

        if (!response.ok) {

            showToast(
                result.message,
                "error"
            );

            return;
        }

        renderSummary(
            result.data.summary
        );

        renderTransactions(
            result.data.transactions
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to load loyalty points",
            "error"
        );
    }
}