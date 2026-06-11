console.log("Customer Dashboard js")

document.addEventListener('DOMContentLoaded', fetchProfile);
const token =
    localStorage.getItem("accessToken");
async function fetchProfile() {
    try {
        const response = await apiRequest(
            "/api/users/profile"
        );

        const result =
            await response.json();
        console.log(result)

        if (response) {

            showToast(
                `Welcome ${result.data.fullName}`,
                "success"
            );

            document
                .getElementById("attatchProfile")
                .innerHTML =
                result.data.fullName;
        }
    } catch (e) {
        console.error("Internal Server Errro..")
    }
}