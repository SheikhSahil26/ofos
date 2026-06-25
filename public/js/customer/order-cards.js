function createOrderCard(order) {

    const totalItems =
        order.orderItems.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );

    const itemPreview =
        order.orderItems
            .slice(0, 2)
            .map(
                item =>
                    `${item.menuItemName} ×${item.quantity}`
            )
            .join(", ");

    return `
    
    <div
        class="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition p-6"
    >

        <div class="flex items-start justify-between">

            <div>

                <span class="
                    inline-flex
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-semibold
                    ${getStatusClass(order.status)}
                ">
                    ${formatStatus(order.status)}
                </span>

                <h3 class="font-bold text-lg mt-3">
                    Order #${getShortOrderNumber(order.orderNumber)}
                </h3>

                <p class="text-sm text-gray-500 mt-1">
                    ${formatDate(order.placedAt)}
                </p>

            </div>

            <div class="text-right">

                <p class="text-sm text-gray-500">
                    Total
                </p>

                <h4 class="font-bold text-xl text-[#014f38]">
                    ₹${order.totalAmount}
                </h4>

            </div>

        </div>

        <div
            class="border-t mt-5 pt-5"
        >

            <p
                class="text-gray-700 text-sm line-clamp-2"
            >
                ${itemPreview}
            </p>

            <div
                class="flex justify-between items-center mt-5"
            >

                <span
                    class="text-sm text-gray-500"
                >
                    ${totalItems} item(s)
                </span>

                <button
                    class="view-order-btn px-4 py-2 rounded-xl bg-[#014f38] text-white hover:bg-[#013728]"
                    data-id="${order.id}"
                >
                    View Details
                </button>

            </div>

        </div>

    </div>
    
    `;
}

//order status colors
function getStatusClass(status) {

    console.log(status);

    const styles = {

        PLACED:
            "bg-gray-100 text-gray-700",

        CONFIRMED:
            "bg-blue-100 text-blue-700",

        PREPARING:
            "bg-orange-100 text-orange-700",

        READY_FOR_PICKUP:
            "bg-purple-100 text-purple-700",

        PICKED_UP:
            "bg-indigo-100 text-indigo-700",

        DELIVERED:
            "bg-green-100 text-green-700",

        CANCELLED:
            "bg-red-100 text-red-700",
    };

    return styles[status] ||
        "bg-gray-100 text-gray-700";
}