document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadProfile();

        const deleteBtn =
            document.getElementById(
                "deleteAccountBtn"
            );

        if (deleteBtn) {

            deleteBtn.addEventListener(
                "click",
                deleteAccount
            );
        }
    }
); 

async function loadProfile() {

    try {

        const response =
            await apiRequest(
                "/api/users/profile"
            );

        if (!response) return;

        const result =
            await response.json();

        if (!response.ok) {

            showToast(
                result.message ||
                "Failed to load profile",
                "error"
            );

            return;
        }

        const user =
            result.data;

        renderProfile(user);

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to load profile",
            "error"
        );
    }
}

function renderProfile(user) {

    const profileImage =
        document.getElementById(
            "profileImage"
        );

    const imageUrl =
        user.profilePhoto ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.fullName
        )}&background=ff7a00&color=fff&size=256`;

    if (profileImage) {
        profileImage.src =
            imageUrl;
    }

    //dashboard name
    setText(
        "dashboardName",
        `Hello, ${user.fullName} 👋`
    )

    //sidebar user profile
    const sidebarProfile =
    document.getElementById(
        "sidebarProfile"
    );

    const sidebarProileUrl = user.profilePhoto ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.fullName
        )}&background=ff7a00&color=fff&size=256`;

    if (sidebarProfile) {
        sidebarProfile.src =
            sidebarProileUrl;
    }

    setText(
        "sidebarName",
        user.fullName
    );

    setText(
        "sidebarRole",
        "Customer"
    );

    setText(
        "profileName",
        user.fullName
    );

    setText(
        "profileEmail",
        user.email
    );

    setText(
        "fullName",
        user.fullName
    );

    setText(
        "email",
        user.email
    );

    setText(
        "mobile",
        user.mobile || "-"
    );

    setText(
        "userId",
        user.id
    );

    setText(
        "memberSince",
        formatDate(
            user.createdAt
        )
    );

    setText(
        "lastUpdated",
        formatDate(
            user.updatedAt
        )
    );

    renderStatus(
        user.isVerified,
        user.isActive
    );

    //edit profile page
    const editFullName =
    document.getElementById(
        "editFullName"
    );

    const editEmail =
        document.getElementById(
            "editEmail"
        );

    const editMobile =
        document.getElementById(
            "editMobile"
        );

    if (editFullName)
        editFullName.value =
            user.fullName || "";

    if (editEmail)
        editEmail.value =
            user.email || "";

    if (editMobile)
        editMobile.value =
            user.mobile || "";
}

function renderStatus(
    isVerified,
    isActive
) {

    const verifiedStatus =
        document.getElementById(
            "verifiedStatus"
        );

    const activeStatus =
        document.getElementById(
            "activeStatus"
        );

    if (verifiedStatus) {

        verifiedStatus.innerHTML =
            isVerified
                ? `<i class="fa-solid fa-circle-check mr-2"></i> Verified`
                : `<i class="fa-solid fa-circle-xmark mr-2"></i> Not Verified`;
    }

    if (activeStatus) {

        activeStatus.innerHTML =
            isActive
                ? `<i class="fa-solid fa-user-check mr-2"></i> Active`
                : `<i class="fa-solid fa-user-slash mr-2"></i> Inactive`;
    }
}

async function deleteAccount() {

    const confirmed =
        confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await apiRequest(
                "/api/users/profile",
                "DELETE"
            );

        if (!response) return;

        const result =
            await response.json();

        if (!response.ok) {

            showToast(
                result.message ||
                "Failed to delete account",
                "error"
            );

            return;
        }

        window.location.href =
            "/api/auth/customer/static/login";

        showToast(
            result.message ||
            "Account deleted successfully",
            "success"
        );

        localStorage.removeItem(
            "accessToken"
        );

        setTimeout(() => {

            window.location.href =
                "/api/auth/customer/static/login";

        }, 1500);

    } catch (error) {

        console.error(error);

        showToast(
            "Something went wrong",
            "error"
        );
    }
}

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (element) {
        element.textContent =
            value;
    }
}

function formatDate(date) {

    return new Date(date)
        .toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}