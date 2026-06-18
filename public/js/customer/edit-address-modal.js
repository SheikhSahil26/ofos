function openEditModal() {

    const modal =
        document.getElementById(
            "editAddressModal"
        );

    modal.classList.remove(
        "hidden",
    );
    
    modal.classList.add(
        "flex"
    );

    editAddress();                                                             
}

function closeEditModal() {

    const modal =
        document.getElementById(
            "editAddressModal"
        );

    modal.classList.add(
        "hidden"
    );

    modal.classList.remove(
        "flex"
    );
}

document
    .getElementById(
        "closeEditAddressModal"
    )
    ?.addEventListener(
        "click",
        closeEditModal
    );

document
    .getElementById(
        "cancelEditAddress"
    )
    ?.addEventListener(
        "click",
        closeEditModal
    );

//fetching data for edit modal
async function editAddress(addressId) {

    try {

        const response = await apiRequest(
            `/api/addresses/${addressId}`
        );

        if (!response) return;

        const result = await response.json();

        if (!response.ok) {

            showToast(
                result.message || "Failed to load address",
                "error"
            );

            return;
        }

        const address = result.data;

        document.getElementById("addressId").value =
            address.id;

        document.getElementById("label").value =
            address.label || "";

        document.getElementById("addressLine1").value =
            address.addressLine1 || "";

        document.getElementById("addressLine2").value =
            address.addressLine2 || "";

        document.getElementById("city").value =
            address.city || "";

        document.getElementById("state").value =
            address.state || "";

        document.getElementById("pincode").value =
            address.pincode || "";

        document.getElementById("addressModal")
            .classList.remove("hidden");

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to load address",
            "error"
        );
    }
}