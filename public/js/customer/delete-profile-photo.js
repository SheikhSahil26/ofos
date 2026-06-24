async function deleteProfilePhoto() {

    const confirmed =
        confirm(
            "Delete profile photo?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const deleteProfile = document.getElementById("profilePhoto");
        deleteProfile.value = "";

        const response =
            await apiRequest(
                "/api/users/profile/photo",
                "DELETE"
            );

        if (!response) return;

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

        window.renderProfile(
            result.data
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to delete photo",
            "error"
        );
    }
}