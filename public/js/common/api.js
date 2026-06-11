
async function apiRequest(url,method = "GET",body = null) {
    let token =
        localStorage.getItem("accessToken");

    let response = await fetch(url, {
            method,
            credentials: "include",

            headers: {
                "Content-Type":
                    "application/json",

                Authorization:
                    `Bearer ${token}`
            },

            body: body? JSON.stringify(body): null
        });

    if (response.status === 401) {

        showToast(
            "Session expired. Refreshing...",
            "warning"
        );

        const refreshed =
            await refreshAccessToken();

        if (!refreshed) {

            showToast(
                "Please login again",
                "error"
            );

            localStorage.removeItem(
                "accessToken"
            );

            setTimeout(() => {

                window.location.href =
                    "/api/auth/customer/static/login";

            }, 1500);

            return null;
        }

        token =
            localStorage.getItem(
                "accessToken"
            );

        response =
            await fetch(url, {
                method,
                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body:
                    body
                        ? JSON.stringify(body)
                        : null
            });
    }

    return response;
}