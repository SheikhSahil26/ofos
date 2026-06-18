async function refreshAccessToken() {

    try {

        const response = await fetch(
            "/api/auth/refresh-token",
            {
                method: "POST",
                credentials: "include"
            }
        );

        const result =
            await response.json();

        if (response.ok) {
            console.log("==============", result)

            localStorage.setItem(
                "accessToken",
                result.data.accessToken
            );

            return true;
        }
        showToast(
            result.message || "Session Expire",
            "error"
        );

        return false;

    } catch (error) {

        console.error(error);

        return false;
    }
}