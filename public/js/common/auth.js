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
            console.log(result,"result in refeshAccessToken");

        if (response.ok) {

            localStorage.setItem(
                "accessToken",
                result.data.accessToken
            );

            return true;
        }

        return false;

    } catch (error) {

        console.error(error);

        return false;
    }
}