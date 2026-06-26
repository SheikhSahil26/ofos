console.log("hello")
async function apiRequest(url,method = "GET",body = null) {
    let token =
        localStorage.getItem("accessToken");
        console.log(token);

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

    console.log(response);

    if (response.status === 401) {

        showToast(
            "Session expired. Refreshing...",
            "error"
        );

        const refreshed =
            await refreshAccessToken();

        if (!refreshed) {

            localStorage.removeItem(
                "accessToken"
            );

            setTimeout(() => {

                // window.location.href =
                //     `http://localhost:8080/${role}/login`;

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