const profileForm = document.getElementById("profileForm");
const profileImage = document.getElementById("profileImage");

const deletePhotoBtn =
  document.getElementById("deletePhotoBtn");

const deleteAccountBtn =
  document.getElementById("deleteAccountBtn");

async function loadProfile() {
  try {
    const response = await fetch(
      "/api/users/profile",
      {
        method: "GET",
        credentials: "include",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    const user = result.data;

    document.getElementById("fullName").value =
      user.fullName || "";

    document.getElementById("mobile").value =
      user.mobile || "";

    if (user.profilePhoto) {
      profileImage.src = user.profilePhoto;
    }
  } catch (error) {
    alert(error.message || "Failed to load profile");
  }
}

profileForm.addEventListener(
  "submit",
  async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append(
        "fullName",
        document.getElementById("fullName").value
      );

      formData.append(
        "mobile",
        document.getElementById("mobile").value
      );

      const file =
        document.getElementById("profilePhoto")
          .files[0];

      if (file) {
        formData.append(
          "profilePhoto",
          file
        );
      }

      const response = await fetch(
        "/api/users/profile",
        {
          method: "PATCH",
          credentials: "include",
          body: formData,
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      alert(result.message);

      loadProfile();
    } catch (error) {
      alert(
        error.message ||
          "Profile update failed"
      );
    }
  }
);

deletePhotoBtn.addEventListener(
  "click",
  async () => {
    const confirmed = confirm(
      "Delete profile photo?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        "/api/users/profile/photo",
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      alert(result.message);

      profileImage.src =
        "/images/default-user.png";
    } catch (error) {
      alert(
        error.message || "Failed"
      );
    }
  }
);

deleteAccountBtn.addEventListener(
  "click",
  async () => {
    const confirmed = confirm(
      "Delete account permanently?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        "/api/users/profile",
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      alert(result.message);

      window.location.href =
        "/login";
    } catch (error) {
      alert(
        error.message || "Failed"
      );
    }
  }
);

loadProfile();