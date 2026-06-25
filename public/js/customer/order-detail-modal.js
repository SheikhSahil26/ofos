//global states
let currentMenuItemId = null;
let currentModifierGroups = [];

document.addEventListener(
    "click",
    async (e) => {

        const btn =
            e.target.closest(
                ".view-order-btn"
            );

        if (!btn) return;

        const orderId = btn.getAttribute("data-id");

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
            await apiRequest(
                `/api/orders/get-order/${orderId}`
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
                        + Add 
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

//re order button
document.addEventListener(
    "click",
    async (e) => {

        const btn =
            e.target.closest(
                ".add-again-btn"
            );

        if (!btn) return;

        const menuItemId =
            btn.dataset.menuItemId;

        console.log(
            "Add to cart:",
            menuItemId
        );

        closeOrderModal();

        //modifier modal service called here
        await openModifierModal(
            menuItemId
        );
    }
);

//open modifier modal and fetch the data for modifiers
async function openModifierModal(
    menuItemId
) {

    currentMenuItemId =
        menuItemId;

    const response =
        await apiRequest(
            `/api/modifier/menu-items/${menuItemId}/groups`
        );

    if (!response?.ok) {

        showToast(
            "Failed to load modifiers",
            "error"
        );

        return;
    }

    const groups =
        await response.json();

    currentModifierGroups =
        groups.data;

    console.log(currentModifierGroups);

    renderModifierModal(
        groups.data
    );

    const modal =
        document.getElementById(
            "modifierModal"
        );

    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );
}

//render modifier modal
function renderModifierModal(
    groups
) {

    const body =
        document.getElementById(
            "modifierModalBody"
        );

    body.innerHTML = `

        <form id="modifierForm">

            ${groups.map(group => {

                const inputType =
                    group.maxSelection === 1
                        ? "radio"
                        : "checkbox";

                return `

                    <div class="mb-6">

                        <div class="mb-3">

                            <h3 class="font-semibold">
                                ${group.name}
                                ${group.isRequired
                                    ? '<span class="text-red-500">*</span>'
                                    : ''
                                }
                            </h3>

                            <p class="text-sm text-gray-500">

                                ${
                                    group.maxSelection === 1
                                    ? "Choose 1"
                                    : `Choose up to ${group.maxSelection}`
                                }

                            </p>

                        </div>

                        <div class="space-y-2">

                            ${group.options.map(option => `

                                <label
                                    class="flex items-center justify-between border rounded-xl p-3 cursor-pointer"
                                >

                                    <div class="flex items-center gap-3">

                                        <input
                                            class="modifier-option"
                                            type="${inputType}"
                                            name="group-${group.id}"
                                            value="${option.id}"
                                            data-name="${option.name}"
                                            data-price="${option.extraPrice}"
                                        >

                                        <span>
                                            ${option.name}
                                        </span>

                                    </div>

                                    <span
                                        class="text-sm text-gray-500"
                                    >
                                        +₹${option.extraPrice}
                                    </span>

                                </label>

                            `).join("")}

                        </div>

                    </div>

                `;
            }).join("")}

            <div class="mb-6">

                <label
                    class="block font-semibold mb-2"
                >
                    Special Instructions
                </label>

                <textarea
                    id="specialInstruction"
                    rows="3"
                    class="w-full border rounded-xl p-3"
                    placeholder="Any special requests?"
                ></textarea>

            </div>

            <button
                type="submit"
                class="w-full bg-[#014f38] text-white py-3 rounded-xl"
            >
                Add To Cart
            </button>

        </form>

    `;

    attachModifierFormSubmit();
}

//it will handle submit
function attachModifierFormSubmit() {

    const form =
        document.getElementById(
            "modifierForm"
        );

    form.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            try {

                validateModifierGroups();

                const payload = {

                    menuItemId:
                        currentMenuItemId,

                    quantity: 1,

                    modifiers:
                        getSelectedModifiers(),

                    specialInstruction:
                        document
                            .getElementById(
                                "specialInstruction"
                            )
                            .value
                            .trim()
                };

                const response =
                    await apiRequest(
                        "/api/cart/add-to-cart",
                        "POST",
                        payload
                    );

                if (!response?.ok) {

                    const error =
                        await response.json();

                    throw new Error(
                        error.message ||
                        "Failed to add item"
                    );
                }

                closeModifierModal();

                showToast(
                    "Item added to cart",
                    "success"
                );

            } catch (error) {

                showToast(
                    error.message,
                    "error"
                );
            }
        }
    );
}

//selected modifiers
function getSelectedModifiers() {

    return [
        ...document.querySelectorAll(
            ".modifier-option:checked"
        )
    ].map(input => ({

        modifierName:
            input.dataset.name,

        extraPrice:
            Number(
                input.dataset.price
            )
    }));
}

//close modifier modal
function closeModifierModal() {

    const modal =
        document.getElementById(
            "modifierModal"
        );

    modal.classList.add(
        "hidden"
    );

    modal.classList.remove(
        "flex"
    );

    currentMenuItemId = null;

    currentModifierGroups = [];
}

//close button
document
    .getElementById(
        "closeModifierModal"
    )
    ?.addEventListener(
        "click",
        closeModifierModal
    );