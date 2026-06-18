function openEditModal() {

    const modal =
        document.getElementById(
            "editAddressModal"
        );

    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );
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