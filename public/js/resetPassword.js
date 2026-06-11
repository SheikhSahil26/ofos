const form =
    document.getElementById(
        "resetPasswordForm"
    );

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

form.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const password =
            form.password.value.trim();

        const confirmPassword =
            form.confirmPassword.value.trim();

        if (
            !password ||
            !confirmPassword
        ) {
            return showToast(
                "All fields are required",
                "error"
            );
        }

        if (
            !passwordRegex.test(password)
        ) {
            return showToast(
                "Password must contain uppercase, lowercase, number and special character",
                "error"
            );
        }

        if (
            password !== confirmPassword
        ) {
            return showToast(
                "Passwords do not match",
                "error"
            );
        }

        try {

            const response =
                await apiRequest(
                    "/api/auth/api/reset-password",
                    "PATCH",
                    {
                        password,
                        confirmPassword
                    }
                );

            if (!response) {
                return;
            }

            const result =
                await response.json();

            if (response.ok) {

                showToast(
                    result.message ||
                    "Password updated successfully",
                    "success"
                );

                form.reset();

                setTimeout(() => {

                    localStorage.removeItem(
                        "accessToken"
                    );

                    window.location.href =
                        "/api/auth/customer/static/login";

                }, 1500);

            } else {

                showToast(
                    result.message ||
                    "Failed to reset password",
                    "error"
                );
            }

        } catch (error) {

            console.error(error);

            showToast(
                "Something went wrong",
                "error"
            );
        }
    }
);