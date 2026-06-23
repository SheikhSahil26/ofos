document.addEventListener(
    "DOMContentLoaded",
    loadAddresses
);

//fetch all address
async function loadAddresses() {

    try {

        const response =
            await apiRequest(
                "/api/addresses"
            );

        if (!response?.ok) {
            throw new Error();
        }

        const result =
            await response.json();

        const addresses =
            result.data || [];

        renderAddresses(addresses);

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to load addresses",
            "error"
        );
    }
}

function renderAddresses(addresses) {

    const defaultContainer =
        document.getElementById(
            "defaultAddressContainer"
        );

    const otherContainer =
        document.getElementById(
            "otherAddressesContainer"
        );

    const emptyState =
        document.getElementById(
            "emptyAddressState"
        );

    defaultContainer.innerHTML = "";
    otherContainer.innerHTML = "";

    if (!addresses.length) {

        emptyState.classList.remove(
            "hidden"
        );

        return;
    }

    emptyState.classList.add(
        "hidden"
    );

    const defaultAddress =
        addresses.find(
            address =>
                address.isDefault
        );

    const otherAddresses =
        addresses.filter(
            address =>
                !address.isDefault
        );

    if (defaultAddress) {

        defaultContainer.innerHTML =
            createDefaultCard(
                defaultAddress
            );
    }

    otherAddresses.forEach(
        address => {

            otherContainer.insertAdjacentHTML(
                "beforeend",
                createAddressCard(
                    address
                )
            );
        }
    );
}

//default address card
function createDefaultCard(address) {

    return `
        <div class="bg-white rounded-2xl border shadow-sm p-6">

            <div class="flex justify-between items-start">

                <h3 class="font-semibold text-lg">
                    ${address.label || "Address"}
                </h3>

                <span
                    class="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">

                    Default

                </span>

            </div>

            <div class="mt-4 text-gray-600">

                <p>${address.addressLine1 || ""}</p>

                ${
                    address.addressLine2
                    ? `<p>${address.addressLine2}</p>`
                    : ""
                }

                <p>
                    ${address.city},
                    ${address.state}
                </p>

                <p>
                    ${address.pincode}
                </p>

            </div>

            <div class="mt-5 flex gap-3">

                <button
                    class="text-[#014f38] font-medium" onClick='openEditModal("${address.id}")'>

                    Edit

                </button>

                <button
                    class="text-red-500 font-medium" onclick="deleteAddress('${address.id}')">

                    Delete

                </button>

            </div>

        </div>
    `;
}

//other address card
function createAddressCard(address) {

    return `
        <div class="bg-white rounded-2xl border shadow-sm p-6">

            <h3 class="font-semibold text-lg">
                ${address.label || "Address"}
            </h3>

            <div class="mt-4 text-gray-600">

                <p>${address.addressLine1 || ""}</p>

                ${
                    address.addressLine2
                    ? `<p>${address.addressLine2}</p>`
                    : ""
                }

                <p>
                    ${address.city},
                    ${address.state}
                </p>

                <p>
                    ${address.pincode}
                </p>

            </div>

            <div class="mt-5 flex flex-wrap gap-3">

                <button
                    class="text-[#014f38] font-medium"
                    onclick="setDefaultAddress('${address.id}')">

                    Make Default

                </button>

                <button
                    class="text-[#014f38] font-medium" onClick='openEditModal("${address.id}")'>

                    Edit

                </button>

                <button
                    class="text-red-500 font-medium" onclick="deleteAddress('${address.id}')">

                    Delete

                </button>

            </div>

        </div>
    `;
}

//delete address
async function deleteAddress(addressId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this address?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await apiRequest(
                `/api/addresses/${addressId}`,
                "DELETE"
            );

        if (!response) return;

        const result =
            await response.json();

        if (!response.ok) {

            showToast(
                result.message ||
                "Failed to delete address",
                "error"
            );

            return;
        }

        showToast(
            result.message ||
            "Address deleted successfully",
            "success"
        );

        loadAddresses();

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to delete address",
            "error"
        );
    }
}

//set default address
async function setDefaultAddress(addressId) {

    try {

        const response =
            await apiRequest(
                `/api/addresses/default/${addressId}`,
                "PATCH"
            );

        if (!response) return;

        const result =
            await response.json();

        if (!response.ok) {

            showToast(
                result.message ||
                "Failed to set default address",
                "error"
            );

            return;
        }

        showToast(
            result.message ||
            "Default address updated",
            "success"
        );

        await loadAddresses();

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to set default address",
            "error"
        );
    }
}

