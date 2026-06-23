document.addEventListener(
    "click",
    async (e) => {

        const btn =
            e.target.closest(
                ".view-order-btn"
            );

        if (!btn) return;

        const orderId =
            btn.dataset.orderId;

        await openOrderModal(
            orderId
        );
    }
);


//open order modal
async function openOrderModal(
    orderId
) {

    const modal =
        document.getElementById(
            "orderModal"
        );

    const body =
        document.getElementById(
            "orderModalBody"
        );

    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );

    body.innerHTML = `
        <div class="text-center py-10">
            Loading order...
        </div>
    `;

    try {

        const response =
            await fetch(
                `/api/orders/${orderId}`
            );

        const order =
            await response.json();

        renderOrderDetails(
            order
        );

    } catch (error) {

        body.innerHTML = `
            <p class="text-red-500">
                Failed to load order.
            </p>
        `;
    }
}

//render modal content
function renderOrderDetails(
    order
) {

    const body =
        document.getElementById(
            "orderModalBody"
        );

    body.innerHTML = `

        <div class="mb-6">

            <h3 class="font-bold text-lg">
                Order #${getShortOrderNumber(order.orderNumber)}
            </h3>

            <p class="text-gray-500">
                ${formatDate(order.placedAt)}
            </p>

            <span class="
                inline-flex
                mt-3
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                ${getStatusClass(order.status)}
            ">
                ${formatStatus(order.status)}
            </span>

        </div>

        <div class="space-y-4">

            ${order.orderItems.map(item => `
                
                <div
                    class="border rounded-2xl p-4 flex items-center justify-between"
                >

                    <div>

                        <h4
                            class="font-medium"
                        >
                            ${item.menuItemName}
                        </h4>

                        <p
                            class="text-sm text-gray-500"
                        >
                            Ordered Qty: ${item.quantity}
                        </p>

                    </div>

                    <button
                        class="add-again-btn px-4 py-2 rounded-xl bg-[#014f38] text-white"
                        data-menu-item-id="${item.menuItemId}"
                    >
                        + Add Again
                    </button>

                </div>

            `).join("")}

        </div>

    `;
}

//close modal
document
    .getElementById(
        "closeOrderModal"
    )
    .addEventListener(
        "click",
        closeOrderModal
    );

function closeOrderModal() {

    const modal =
        document.getElementById(
            "orderModal"
        );

    modal.classList.add(
        "hidden"
    );

    modal.classList.remove(
        "flex"
    );
}