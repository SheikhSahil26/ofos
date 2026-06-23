function openAddAddressModal() {

    const modal =
        document.getElementById(
            "addAddressModal"
        );

    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );
}

function closeAddAddressModal() {

    const modal =
        document.getElementById(
            "addAddressModal"
        );

    modal.classList.add(
        "hidden"
    );

    modal.classList.remove(
        "flex"
    );
}

//event listeners for modal
document
    .getElementById(
        "openAddAddressModal"
    )
    ?.addEventListener(
        "click",
        openAddAddressModal
    );

document
    .getElementById(
        "closeAddAddressModal"
    )
    ?.addEventListener(
        "click",
        closeAddAddressModal
    );

document
    .getElementById(
        "cancelAddAddress"
    )
    ?.addEventListener(
        "click",
        closeAddAddressModal
    );

//create address
document
    .getElementById(
        "addAddressForm"
    )
    ?.addEventListener(
        "submit",
        createAddress
    );

async function createAddress(event) {

    event.preventDefault();

    const payload = {
        label:
            document.getElementById(
                "newLabel"
            ).value.trim(),

        addressLine1:
            document.getElementById(
                "newAddressLine1"
            ).value.trim(),

        addressLine2:
            document.getElementById(
                "newAddressLine2"
            ).value.trim(),

        city:
            document.getElementById(
                "newCity"
            ).value.trim(),

        state:
            document.getElementById(
                "newState"
            ).value.trim(),

        pincode:
            document.getElementById(
                "newPincode"
            ).value.trim(),

        latitude:
            document.getElementById(
                "newLatitude"
            ).value || null,

        longitude:
            document.getElementById(
                "newLongitude"
            ).value || null,

        isDefault:
            document.getElementById(
                "newIsDefault"
            ).checked
    };

    const errors =
        validateAddress(payload);

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
                "/api/addresses",
                "POST",
                payload
            );

        if (!response) return;

        const result =
            await response.json();

        if (!response.ok) {

            showToast(
                result.message ||
                "Failed to create address",
                "error"
            );

            return;
        }

        showToast(
            result.message ||
            "Address added successfully",
            "success"
        );

        closeAddAddressModal();

        document
            .getElementById(
                "addAddressForm"
            )
            .reset();

        loadAddresses();

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to create address",
            "error"
        );
    }
}