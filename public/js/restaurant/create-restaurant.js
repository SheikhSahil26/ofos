/* ==========================================
   ELEMENTS
========================================== */
console.log(
  document.getElementById("openAddRestaurantModal"),
  document.getElementById("emptyStateAddBtn"),
  document.getElementById("addRestaurantModal"),
);

const addRestaurantModal = document.getElementById("addRestaurantModal");

const openModalBtn = document.getElementById("openAddRestaurantModal");

const emptyStateBtn = document.getElementById("emptyStateAddBtn");

const closeModalBtn = document.getElementById("closeRestaurantModal");

const cancelRestaurantBtn = document.getElementById("cancelRestaurantBtn");

const restaurantForm = document.getElementById("restaurantForm");

/* ==========================================
   MODAL HANDLING
========================================== */

function openModal() {
  addRestaurantModal.classList.remove("hidden");

  document.body.style.overflow = "hidden";
}

function closeModal() {
  addRestaurantModal.classList.add("hidden");

  document.body.style.overflow = "";
}

openModalBtn?.addEventListener("click", openModal);

emptyStateBtn?.addEventListener("click", openModal);

closeModalBtn?.addEventListener("click", closeModal);

cancelRestaurantBtn?.addEventListener("click", closeModal);

addRestaurantModal?.addEventListener("click", (event) => {
  if (event.target === addRestaurantModal) {
    closeModal();
  }
});

/* ==========================================
   VALIDATION
========================================== */

function validateForm(payload) {
  if (!payload.name?.trim()) {
    throw new Error("Restaurant name is required");
  }

  if (payload.name.length < 3) {
    throw new Error("Restaurant name must be at least 3 characters");
  }

  if (!payload.branchName?.trim()) {
    throw new Error("Branch name is required");
  }

  if (!/^[6-9]\d{9}$/.test(payload.contactNumber)) {
    throw new Error("Invalid contact number");
  }

  if (!payload.addressLine1) {
    throw new Error("Address Line 1 is required");
  }

  if (!payload.city) {
    throw new Error("City is required");
  }

  if (!payload.state) {
    throw new Error("State is required");
  }

  if (!/^\d{6}$/.test(payload.pincode)) {
    throw new Error("Invalid pincode");
  }

  if (!payload.gstin) {
    throw new Error("GSTIN is required");
  }

  if (!payload.fssaiLicense) {
    throw new Error("FSSAI License is required");
  }

  if (Number(payload.deliveryRadiusKm) <= 0) {
    throw new Error("Delivery radius must be greater than zero");
  }
}

/* ==========================================
   OPERATING HOURS
========================================== */

function buildOperatingHours() {
  const days = [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN"
];

  return days.map((day) => {
    const openTime = document.querySelector(`[name="${day}Open"]`)?.value;

    const closeTime = document.querySelector(`[name="${day}Close"]`)?.value;

    const isClosed = document.querySelector(`[name="${day}Closed"]`)?.checked;

    return {
      dayOfWeek: day,

      openTime: isClosed ? null : openTime,

      closeTime: isClosed ? null : closeTime,

      isClosed,
    };
  });
}

/* ==========================================
   BUILD PAYLOAD
========================================== */

function buildPayload() {
  return {
    name: restaurantForm.name.value,

    description: restaurantForm.description.value,

    branchName: restaurantForm.branchName.value,

    contactNumber: restaurantForm.contactNumber.value,

    addressLine1: restaurantForm.addressLine1.value,

    addressLine2: restaurantForm.addressLine2.value,

    city: restaurantForm.city.value,

    state: restaurantForm.state.value,

    pincode: restaurantForm.pincode.value,

    gstin: restaurantForm.gstin.value,

    fssaiLicense: restaurantForm.fssaiLicense.value,

    latitude: Number(restaurantForm.latitude.value),

    longitude: Number(restaurantForm.longitude.value),

    deliveryRadiusKm: Number(restaurantForm.deliveryRadiusKm.value),

    operatingHours: buildOperatingHours(),
  };
}

/* ==========================================
   SUBMIT
========================================== */

restaurantForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitBtn = restaurantForm.querySelector('button[type="submit"]');

  try {
    submitBtn.disabled = true;

    submitBtn.textContent = "Creating...";

    const payload = buildPayload();

    validateForm(payload);

    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (key === "operatingHours") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    const logoFile = restaurantForm.logo?.files?.[0];

    const coverFile = restaurantForm.coverImage?.files?.[0];

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    if (coverFile) {
      formData.append("coverImage", coverFile);
    }

    const response = await fetch("/api/restaurants", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create restaurant");
    }

    showToast(result.message || "Restaurant created successfully", "success");

    closeModal();

    restaurantForm.reset();

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error(error);

    showToast(error.message || "Something went wrong", "error");
  } finally {
    submitBtn.disabled = false;

    submitBtn.textContent = "Create Restaurant";
  }
});

/* ==========================================
   TOAST
========================================== */

function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.className = `
        fixed
        top-5
        right-5
        px-5
        py-3
        rounded-xl
        text-white
        shadow-lg
        z-[99999]
        ${type === "success" ? "bg-green-600" : "bg-red-600"}
    `;

  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
