document.addEventListener("DOMContentLoaded", async () => {
    const dashboardLoading = document.getElementById("dashboardLoading");
    const statsGrid = document.getElementById("statsGrid");
    const statTotalOrders = document.getElementById("statTotalOrders");
    const statOrdersToday = document.getElementById("statOrdersToday");
    const statTotalRevenue = document.getElementById("statTotalRevenue");

    async function loadDashboard() {
        try {
            dashboardLoading.style.display = "flex";
            statsGrid.style.display = "none";

            // 1. Check if the user has any restaurants
            const restaurantsRes = await apiRequest("/api/restaurants/owner/my-restaurants", "GET");
            if (!restaurantsRes || !restaurantsRes.ok) {
                throw new Error("Failed to fetch restaurants");
            }

            const resData = await restaurantsRes.json();

            // If they have no restaurants, redirect to the create page
            if (resData.success && (!Array.isArray(resData.data) || resData.data.length === 0)) {
                window.location.href = "/restaurants/create";
                return;
            }

            // 2. Fetch dashboard stats
            const statsRes = await apiRequest("/api/restaurants/owner/dashboard-stats", "GET");
            if (!statsRes || !statsRes.ok) {
                throw new Error("Failed to fetch dashboard stats");
            }

            const statsData = await statsRes.json();
            if (statsData.success) {
                const { totalOrders, ordersToday, totalRevenue } = statsData.data;

                statTotalOrders.innerText = totalOrders || 0;
                statOrdersToday.innerText = ordersToday || 0;
                statTotalRevenue.innerText = `₹${parseFloat(totalRevenue || 0).toFixed(2)}`;

                // Show the grid after loading
                dashboardLoading.style.display = "none";
                statsGrid.classList.remove("hidden");
                statsGrid.style.display = "grid";
            } else {
                showToast(statsData.message || "Failed to load statistics", "error");
                dashboardLoading.style.display = "none";
            }

        } catch (error) {
            console.error("Dashboard Load Error:", error);
            showToast("An error occurred while loading dashboard.", "error");
            dashboardLoading.style.display = "none";
        }
    }

    loadDashboard();
});
