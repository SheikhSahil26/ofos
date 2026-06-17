async function updateProfile(e) {

    e.preventDefault();

    const fullName =
        document.getElementById(
            "editFullName"
        ).value.trim();

    const mobile =
        document.getElementById(
            "editMobile"
        ).value.trim();

    const photo =
        document.getElementById(
            "profilePhoto"
        ).files[0];

    const errors = {};

    // Name Validation
    if (!fullName) {
        errors.fullName =
            "Full name is required";
    }

    // Mobile Validation
    if (
        mobile &&
        !/^[6-9]\d{9}$/.test(mobile)
    ) {
        errors.mobile =
            "Invalid mobile number";
    }

    if (
        Object.keys(errors)
            .length
    ) {

        showToast(
            Object.values(errors)[0],
            "error"
        );

        return;
    }

    // Image Validation
    if (photo) {

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (
            !allowedTypes.includes(
                photo.type
            )
        ) {

            showToast(
                "Only jpg, png and webp images are allowed",
                "error"
            );

            return;
        }

        if (
            photo.size >
            2 * 1024 * 1024
        ) {

            showToast(
                "Image size must be below 2MB",
                "error"
            );

            return;
        }
    }

    try {

        const formData =
            new FormData();

        formData.append(
            "fullName",
            fullName
        );

        formData.append(
            "mobile",
            mobile
        );

        if (photo) {

            formData.append(
                "profilePhoto",
                photo
            );
        }

        const token =
            localStorage.getItem(
                "accessToken"
            );

        const response =
            await fetch(
                "/api/users/profile",
                {
                    method: "PATCH",
                    credentials:
                        "include",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },

                    body: formData
                }
            );

        const result =
            await response.json();

        if (!response.ok) {

            showToast(
                result.message,
                "error"
            );

            return;
        }

        showToast(
            result.message,
            "success"
        );

        renderProfile(
            result.data
        );

        document
            .getElementById(
                "editProfileModal"
            )
            .classList.add(
                "hidden"
            );

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to update profile",
            "error"
        );
    }
}

