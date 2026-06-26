document.addEventListener(
    "DOMContentLoaded",
    loadOrders
);

async function loadOrders() {

    try {

        const response =
            await fetch("/api/orders/list-orders");

        const orders =
            await response.json();

        document
            .getElementById("ordersLoading")
            .classList.add("hidden");

        if (!orders.length) {

            document
                .getElementById("emptyOrders")
                .classList.remove("hidden");

            return;
        }

        const container =
            document.getElementById(
                "ordersContainer"
            );

        container.classList.remove(
            "hidden"
        );

        container.innerHTML =
            orders.map(createOrderCard)
                .join("");

    } catch (error) {

        console.error(error);

        document
            .getElementById("ordersLoading")
            .classList.add("hidden");

        document
            .getElementById("emptyOrders")
            .classList.remove("hidden");
    }
}