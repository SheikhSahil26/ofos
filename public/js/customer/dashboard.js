document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});

let token = localStorage.getItem("accessToken");

async function loadDashboard() {
  try {
    const profileResponse = await fetch("/api/users/profile");

    const profileData = await profileResponse.json();

    const user = profileData.data;

    document.getElementById("dashboardUserName").innerText = user.fullName;

    document.getElementById("dashboardEmail").innerText = user.email;

    document.getElementById("navUserName").innerText = user.fullName;

    if (user.profilePhoto) {
      document.getElementById("navProfilePhoto").src = user.profilePhoto;
    }

    const addressResponse = await fetch("/api/addresses", {
      credentials: "include",
    });

    const addressData = await addressResponse.json();

    const addresses = addressData.data || [];

    document.getElementById("addressCount").innerText = addresses.length;

    const defaultAddress = addresses.find((address) => address.isDefault);

    if (defaultAddress) {
      document.getElementById("defaultAddress").innerText =
        `${defaultAddress.label}
                - ${defaultAddress.city}`;
    } else {
      document.getElementById("defaultAddress").innerText =
        "No Default Address";
    }
  } 
  catch (error) {
    console.error(error);

    alert("Failed to load dashboard");
  }
}
