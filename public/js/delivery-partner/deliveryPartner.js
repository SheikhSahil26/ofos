// /public/js/orders/deliveryPartner.js

let offerPollTimer = null;
let currentOffer = null;
let currentOrder = null;
let isPartnerOnline = false;

// ──────────────────────────────────────────────
// OFFER POLLING — the ONLY acceptance mechanism
// ──────────────────────────────────────────────
function startOfferPolling() {
  if (offerPollTimer) return;
  pollForOffer();
  offerPollTimer = setInterval(pollForOffer, 5000);
}

function stopOfferPolling() {
  if (!offerPollTimer) return;
  clearInterval(offerPollTimer);
  offerPollTimer = null;
}

async function pollForOffer() {
  if (!isPartnerOnline) return;
  if (currentOffer) return;
  if (currentOrder) return; // NEW — don't offer new orders while one is already in progress

  try {
    const response = await apiRequest("/api/delivery/pending-offer", "GET");
    const result = await response.json();

    if (result.success && result.data) {
      currentOffer = result.data;
      showOfferModal(currentOffer);
    }
  } catch (err) {
    console.error("Failed to poll for offers:", err);
  }
}

function showOfferModal(offer) {
  const modal = document.getElementById("offer-modal");
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full">
        <h2 class="text-2xl font-bold mb-2">New Delivery Offer!</h2>
        <p class="text-gray-500 mb-4">Order #${offer.orderNumber}</p>
        <div class="space-y-2 mb-6">
          <p><span class="font-semibold">Pickup:</span> ${offer.pickupBranch}</p>
          <p><span class="font-semibold">Drop:</span> ${offer.dropCity}, ${offer.dropPincode}</p>
          <p><span class="font-semibold">Earnings:</span> ₹${offer.earnings}</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button id="reject-offer-btn" class="border border-red-500 text-red-500 py-3 rounded-xl font-semibold">Reject</button>
          <button id="accept-offer-btn" class="bg-green-600 text-white py-3 rounded-xl font-semibold">Accept</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("accept-offer-btn").onclick = () => respondToOffer("ACCEPTED");
  document.getElementById("reject-offer-btn").onclick = () => respondToOffer("REJECTED");
}

async function respondToOffer(response) {
  try {
    const res = await apiRequest(`/api/delivery/offer/${currentOffer.assignmentId}/respond`, "PATCH", { response });
    const result = await res.json();

    if (result.success) {
      showToast(response === "ACCEPTED" ? "Offer accepted!" : "Offer rejected", "success");

      if (response === "ACCEPTED") {
        // Only refresh what's relevant — current order + stats
        // (no more loadActiveOrders — that mechanism is retired)
        await loadCurrentOrder();
        loadStats();
      }
    } else {
      showToast(result.error || "Failed to respond", "error");
    }
  } catch (err) {
    console.error("Respond to offer failed:", err);
  } finally {
    document.getElementById("offer-modal").innerHTML = "";
    currentOffer = null;
  }
}

// ──────────────────────────────────────────────
// PROFILE GATING (unchanged)
// ──────────────────────────────────────────────
async function loadPartnerProfile() {
  try {
    const response = await apiRequest("/api/delivery/profile");
    const result = await response.json();

    if (!result.success) {
      renderVerificationPending();
      return false;
    }

    const partner = result.data;

    if (partner.status === "PENDING_VERIFICATION") {
      renderVerificationPending();
      return false;
    }

    if (partner.status === "SUSPENDED") {
      renderSuspendedAccount();
      return false;
    }

    const toggle = document.querySelector('input[type="checkbox"]');
    if (toggle) {
      toggle.checked = partner.status === "ACTIVE";
      updateAvailabilityLabel(partner.status === "ACTIVE");
    }

    isPartnerOnline = partner.status === "ACTIVE";

    if (isPartnerOnline) {
      startLocationTracking();
      startOfferPolling();
    }

    return true;

  } catch (error) {
    console.error(error);
    renderVerificationPending();
    return false;
  }
}

function renderVerificationPending() {
  document.body.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
      <div class="bg-white rounded-3xl shadow-lg p-12 max-w-lg text-center">
        <div class="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
          <span class="text-5xl">⏳</span>
        </div>
        <h1 class="text-3xl font-bold mt-8">Verification Pending</h1>
        <p class="text-gray-500 mt-4">
          Your delivery partner profile is currently under review.
          Once approved by the admin, you will be able to accept delivery requests.
        </p>
        <button onclick="window.location.href='/delivery/profile'"
        class="mt-8 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl">
          View Profile
        </button>
      </div>
    </div>
  `;
}

function renderSuspendedAccount() {
  document.body.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
      <div class="bg-white rounded-3xl shadow-lg p-12 max-w-lg text-center">
        <div class="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <span class="text-5xl">⚠️</span>
        </div>
        <h1 class="text-3xl font-bold mt-8">Account Suspended</h1>
        <p class="text-gray-500 mt-4">
          Your delivery partner account has been suspended. Please contact support for further assistance.
        </p>
        <button class="mt-8 bg-orange-500 text-white px-8 py-4 rounded-2xl">Contact Support</button>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  const canAccess = await loadPartnerProfile();
  if (!canAccess) return;

  loadDashboard();
  setupAvailabilityToggle();
});

// ──────────────────────────────────────────────
// LOAD DASHBOARD — active orders removed, current order is the live source of truth
// ──────────────────────────────────────────────
async function loadDashboard() {
  try {
    await Promise.all([
      loadCurrentOrder(),
      loadStats(),
      loadRecentDeliveries(),
    ]);
  } catch (err) {
    console.error(err);
    showToast("Failed to load dashboard", "error");
  }
}

// ──────────────────────────────────────────────
// STATS
// ──────────────────────────────────────────────
async function loadStats() {
  try {
    const response = await apiRequest("/api/delivery/stats/today");
    const result = await response.json();

    if (!result.success) return;

    document.getElementById("stat-earnings").textContent = `₹${result.data.earnings}`;
    document.getElementById("stat-deliveries").textContent = result.data.deliveriesToday;
    document.getElementById("stat-rating").textContent = result.data.rating ?? "New";

  } catch (err) {
    console.error("Failed to load stats:", err);
  }
}

// ──────────────────────────────────────────────
// AVAILABILITY — same toggle, unchanged markup
// ──────────────────────────────────────────────
function updateAvailabilityLabel(isActive) {
  const label = document.getElementById("availability-label");
  if (!label) return;
  label.textContent = isActive ? "Online" : "Offline";
  label.className = isActive ? "text-xl font-bold mt-3 text-green-600" : "text-xl font-bold mt-3 text-gray-400";
}

function setupAvailabilityToggle() {
  const toggle = document.querySelector('input[type="checkbox"]');
  if (!toggle) return;

  toggle.addEventListener("change", async () => {
    try {
      const response = await apiRequest("/api/delivery/toggle-availability", "PATCH");
      const result = await response.json();

      if (result.data.currentStatus === "ACTIVE") {
        isPartnerOnline = true;
        toggle.checked = true;
        updateAvailabilityLabel(true);
        startLocationTracking();
        startOfferPolling();
        showToast("You are online", "success");
      } else {
        isPartnerOnline = false;
        toggle.checked = false;
        updateAvailabilityLabel(false);
        stopLocationTracking();
        stopOfferPolling();
        currentOffer = null;
        document.getElementById("offer-modal").innerHTML = "";
        showToast("You are offline", "success");
      }

    } catch (err) {
      toggle.checked = !toggle.checked;
      showToast("Failed to update availability", "error");
    }
  });
}

// ──────────────────────────────────────────────
// LOCATION TRACKING (unchanged)
// ──────────────────────────────────────────────
let locationInterval = null;

async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

async function sendLocation() {
  try {
    const currentLocation = await getCurrentLocation();
    const response = await apiRequest("/api/delivery/update-partner-location", "PATCH", {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    });
    if (!response) return;
    await response.json();
  } catch (error) {
    console.error("Location Tracking Error:", error);
  }
}

function startLocationTracking() {
  if (locationInterval) return;
  sendLocation();
  locationInterval = setInterval(sendLocation, 5000);
}

function stopLocationTracking() {
  if (!locationInterval) return;
  clearInterval(locationInterval);
  locationInterval = null;
}

// ──────────────────────────────────────────────
// CURRENT ORDER — the single source of truth for "what am I doing right now"
// ──────────────────────────────────────────────
async function loadCurrentOrder() {
  try {
    const response = await apiRequest("/api/delivery/current-order");
    const result = await response.json();

    if (result.success) {
      currentOrder = result.data;
      renderCurrentOrder();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderCurrentOrder() {
  const detailsEl = document.getElementById("current-order-details");
  const pickedUpBtn = document.getElementById("picked-up-btn");
  const outForDeliveryBtn = document.getElementById("out-for-delivery-btn");
  const deliveredBtn = document.getElementById("delivered-btn");

  if (!currentOrder) {
    detailsEl.innerHTML = `<p class="text-gray-400 text-sm">No active order — waiting for new offers</p>`;
    pickedUpBtn.style.display = "none";
    outForDeliveryBtn.style.display = "none";
    deliveredBtn.style.display = "none";
    return;
  }

  detailsEl.innerHTML = `
    <div>
      <p class="text-gray-500">Order ID</p>
      <h3 class="font-bold text-xl">#${currentOrder.orderNumber}</h3>
    </div>
    <div>
      <p class="text-gray-500">Restaurant</p>
      <h3 class="font-bold">${currentOrder.restaurantName}</h3>
    </div>
    <div>
      <p class="text-gray-500">Customer</p>
      <h3 class="font-bold">${currentOrder.customerName}</h3>
    </div>
    <div>
      <p class="text-gray-500">Distance</p>
      <h3 class="font-bold">${currentOrder.distanceKm != null ? currentOrder.distanceKm + " km" : "—"}</h3>
    </div>
  `;

  pickedUpBtn.style.display = "none";
  outForDeliveryBtn.style.display = "none";
  deliveredBtn.style.display = "none";

  if (currentOrder.orderStatus === "READY_FOR_PICKUP") {
    pickedUpBtn.style.display = "";
  } else if (currentOrder.orderStatus === "PICKED_UP") {
    outForDeliveryBtn.style.display = "";
  } else if (currentOrder.orderStatus === "OUT_FOR_DELIVERY") {
    deliveredBtn.style.display = "";
  }
}

async function advanceCurrentOrderStatus() {
  if (!currentOrder) return;

  try {
    const response = await apiRequest(`/api/orders/delivery-status/${currentOrder.id}`, "PATCH");
    const result = await response.json();

    if (result.success) {
      showToast(`Status updated to ${result.data.newStatus.replace(/_/g, " ")}`, "success");

      if (result.data.newStatus === "DELIVERED") {
        currentOrder = null;
        renderCurrentOrder();
        loadStats();
        loadRecentDeliveries();
        // partner is now free — resume polling for the next offer
        pollForOffer();
      } else {
        loadCurrentOrder();
      }
    } else {
      showToast(result.error || "Failed to update status", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Something went wrong", "error");
  }
}

document.getElementById("picked-up-btn")?.addEventListener("click", advanceCurrentOrderStatus);
document.getElementById("out-for-delivery-btn")?.addEventListener("click", advanceCurrentOrderStatus);
document.getElementById("delivered-btn")?.addEventListener("click", advanceCurrentOrderStatus);

// ──────────────────────────────────────────────
// RECENT DELIVERIES
// ──────────────────────────────────────────────
async function loadRecentDeliveries() {
  try {
    const response = await apiRequest("/api/delivery/deliveries/recent");
    const result = await response.json();

    const tbody = document.getElementById("recent-deliveries-body");

    if (!result.success || result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-400">No deliveries yet</td></tr>`;
      return;
    }

    tbody.innerHTML = result.data.map((d) => `
      <tr class="border-t">
        <td class="px-8 py-5">#${d.orderNumber}</td>
        <td>${d.restaurantName}</td>
        <td class="text-green-600 font-bold">₹${d.earnings}</td>
        <td><span class="bg-green-100 text-green-700 px-4 py-2 rounded-xl">Delivered</span></td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("Failed to load recent deliveries:", err);
  }
}