document
.getElementById(
    "partner-profile-form"
)
.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        try {

            const payload = {

                vehicleType:
                    document.getElementById(
                        "vehicleType"
                    ).value,

                vehicleNumber:
                    document.getElementById(
                        "vehicleNumber"
                    ).value,

                governmentId:
                    document.getElementById(
                        "governmentId"
                    ).value

            };

            const response =
                await apiRequest(
                    "/api/delivery/profile",
                    "PUT",
                    payload
                );

            const result =
                await response.json();

            if (
                !result.success
            ) {

                showToast(
                    result.error ||
                    "Failed to update profile",
                    "error"
                );

                return;
            }

            showToast(
                "Profile updated successfully",
                "success"
            );

            console.log(
                result.data
            );

        }
        catch(error){

            console.error(
                error
            );

            showToast(
                "Something went wrong",
                "error"
            );

        }

    }
);