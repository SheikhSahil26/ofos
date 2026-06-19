async function openEditModal(addressId) {

    console.log("Clicked Address ID:", addressId);

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

    await editAddress(addressId);                                                             
}

async function closeEditModal() {

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

        document.getElementById(
            "latitude"
        ).value =
            address.latitude || "";

        document.getElementById(
            "longitude"
        ).value =
            address.longitude || "";

        document.getElementById(
            "isDefault"
        ).checked =
            address.isDefault || false;

        document.getElementById("editAddressModal")
            .classList.remove("hidden");

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to load address",
            "error"
        );
    }
}

//save edited address
document
    .getElementById(
        "editAddressForm"
    )
    ?.addEventListener(
        "submit",
        saveAddress
    );

async function saveAddress(event) {

    event.preventDefault();

    const addressId =
        document.getElementById(
            "addressId"
        ).value;

    const payload = {

        label:
            document.getElementById(
                "label"
            ).value.trim(),

        addressLine1:
            document.getElementById(
                "addressLine1"
            ).value.trim(),

        addressLine2:
            document.getElementById(
                "addressLine2"
            ).value.trim(),

        city:
            document.getElementById(
                "city"
            ).value.trim(),

        state:
            document.getElementById(
                "state"
            ).value.trim(),

        pincode:
            document.getElementById(
                "pincode"
            ).value.trim(),

        latitude:
            document.getElementById(
                "latitude"
            ).value || null,

        longitude:
            document.getElementById(
                "longitude"
            ).value || null,

        isDefault:
            document.getElementById(
                "isDefault"
            ).checked
    };

    
    const errors =
    validateAddress(payload);
    
    console.log(errors);

    if (Object.keys(errors).length) {

        showToast(
            Object.values(errors)[0],
            "error"
        );

        return;
    }

    try {

        const response =
            await apiRequest(
                `/api/addresses/${addressId}`,
                "PUT",
                payload
            );

        if (!response) return;

        const result =
            await response.json();

        if (!response.ok) {

            showToast(
                result.message ||
                "Failed to update address",
                "error"
            );

            return;
        }

        showToast(
            result.message ||
            "Address updated successfully",
            "success"
        );

        await closeEditModal();

        await loadAddresses();

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to update address",
            "error"
        );
    }
}