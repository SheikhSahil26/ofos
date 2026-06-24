window.addEventListener("DOMContentLoaded",()=>{

    const customerLat = 23.0225;
    const customerLng = 72.5714;

    const partnerLat = 23.028;
    const partnerLng = 72.563;

    const map = L.map("map").setView(
        [customerLat, customerLng],
        14
    );

    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom:19
        }
    ).addTo(map);

    L.marker([
        customerLat,
        customerLng
    ])
    .addTo(map);

    L.marker([
        partnerLat,
        partnerLng
    ])
    .addTo(map);

});


// js/orders/trackOrder.js

const STEPPER_STAGES = [
  { key: "PLACED",            label: "Placed" },
  { key: "CONFIRMED",         label: "Assigned" },
  { key: "PREPARING",         label: "Preparing" },
  { key: "PICKED_UP",         label: "Picked Up" },
  { key: "OUT_FOR_DELIVERY",  label: "Out For Delivery" },
  { key: "DELIVERED",         label: "Delivered" },
];

// READY_FOR_PICKUP visually sits at "Preparing" step until partner picks up
const STATUS_TO_STEP_INDEX = {
  PLACED: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  READY_FOR_PICKUP: 2,
  PICKED_UP: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
};

const STATUS_BADGE_TEXT = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for Pickup",
  PICKED_UP: "Picked Up",
  OUT_FOR_DELIVERY: "Out For Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_HEADLINE = {
  PLACED: "Your order has been placed",
  CONFIRMED: "Restaurant accepted your order",
  PREPARING: "Your food is being prepared",
  READY_FOR_PICKUP: "Your order is ready for pickup",
  PICKED_UP: "Your order has been picked up",
  OUT_FOR_DELIVERY: "Your order is on the way",
  DELIVERED: "Your order has been delivered",
  CANCELLED: "Your order was cancelled",
};

let map, routeLine, partnerMarker, branchMarker;
let pollTimer = null;

const orderId = window.location.pathname.split("/").pop();

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  fetchTrackingDetails();
  pollTimer = setInterval(fetchTrackingDetails, 5000);
});

window.addEventListener("beforeunload", () => clearInterval(pollTimer));

// ──────────────────────────────────────────────
// Fetch
// ──────────────────────────────────────────────
async function fetchTrackingDetails() {
  try {
    const response = await apiRequest(`/api/orders/status-history/${orderId}`, "GET");
    
    const result = await response.json();

    console.log(result, "tracking details fetched successfully");

    if (!result) {
      showToast(result.error || "Unable to load order", "error");
      return;
    }

    console.log(result[result.length-1]," tracking details fetched successfully");

    renderPage(result[result.length-1]);

    if (result[result.length-1].newStatus === "DELIVERED" || result[result.length-1].newStatus === "CANCELLED") {
      clearInterval(pollTimer);
    }

  } catch (err) {
    console.error("Failed to fetch tracking details:", err);
  }
}

// ──────────────────────────────────────────────
// Render everything
// ──────────────────────────────────────────────
function renderPage(data) {
  document.querySelector("h2.text-3xl").textContent = `#${data.orderNumber}`;
  renderStatusBadge(data.newStatus);
  renderStepper(data.newStatus);
  renderStatusSection(data.newStatus, data.etaMinutes);
  renderPartner(data.deliveryPartner);
  renderAddress(data.address);
  renderMap(data.branchLocation, data.partnerLocation);
}

function renderStatusBadge(status) {
  const badge = document.querySelector("span.bg-orange-100");
  if (!badge) return;

  badge.textContent = STATUS_BADGE_TEXT[status] || status;

  if (status === "DELIVERED") {
    badge.className = "bg-green-100 text-green-600 px-5 py-3 rounded-2xl font-semibold";
  } else if (status === "CANCELLED") {
    badge.className = "bg-red-100 text-red-600 px-5 py-3 rounded-2xl font-semibold";
  } else {
    badge.className = "bg-orange-100 text-orange-600 px-5 py-3 rounded-2xl font-semibold";
  }
}

function renderStepper(status) {
  const container = document.querySelector("section.bg-white .flex.justify-between");
  if (!container) return;

  if (status === "CANCELLED") {
    container.innerHTML = `
      <div class="w-full text-center text-red-500 font-semibold text-lg py-4">
        This order was cancelled
      </div>`;
    return;
  }

  const currentIndex = STATUS_TO_STEP_INDEX[status] ?? 0;

  container.innerHTML = STEPPER_STAGES.map((stage, i) => {
    const isDone = i < currentIndex;
    const isCurrent = i === currentIndex;

    const circleClasses = isDone
      ? "bg-green-500 text-white"
      : isCurrent
      ? "bg-orange-500 text-white"
      : "bg-gray-200 text-gray-400";

    const labelClasses = isCurrent
      ? "mt-3 font-medium text-orange-500"
      : isDone
      ? "mt-3 font-medium"
      : "mt-3 font-medium text-gray-400";

    return `
      <div class="flex flex-col items-center flex-1">
        <div class="w-12 h-12 rounded-full ${circleClasses} flex items-center justify-center">
          ${isDone ? "✓" : isCurrent ? "🚴" : ""}
        </div>
        <p class="${labelClasses}">${stage.label}</p>
      </div>
    `;
  }).join("");
}

function renderStatusSection(status, etaMinutes) {
  const section = document.querySelectorAll("section.bg-white")[2]; // 3rd card = status section
  if (!section) return;

  const headline = section.querySelector("h1");
  const subline = section.querySelector("p");

  headline.textContent = STATUS_HEADLINE[status] || "Tracking your order";

  if (status === "DELIVERED") {
    subline.textContent = "Enjoy your meal!";
    subline.className = "text-green-600 text-xl mt-4 font-semibold";
  } else if (status === "CANCELLED") {
    subline.textContent = "";
  } else if (etaMinutes != null) {
    subline.textContent = `Arriving in ${etaMinutes} mins`;
    subline.className = "text-green-600 text-xl mt-4 font-semibold";
  } else {
    subline.textContent = "";
  }
}

function renderPartner(partner) {
  const section = document.querySelectorAll("section.bg-white")[4]; // Delivery Partner card
  if (!section) return;

  if (!partner) {
    section.style.display = "none";
    return;
  }

  section.style.display = "";

  const img = section.querySelector("img");
  const nameEl = section.querySelector("h3");
  const ratingEl = section.querySelectorAll("span")[1]; // rating number span

  img.src = partner.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(partner.fullName)}`;
  nameEl.textContent = partner.fullName;
  if (ratingEl) ratingEl.textContent = partner.rating ?? "New";

  const callBtn = section.querySelector("button.bg-green-600");
  if (callBtn && partner.mobile) {
    callBtn.onclick = () => (window.location.href = `tel:${partner.mobile}`);
  }
}

function renderAddress(address) {
  const section = document.querySelectorAll("section.bg-white")[5]; // Address card
  if (!section || !address) return;

  const lineEl = section.querySelector("p.font-semibold");
  const cityEl = section.querySelector("p.text-gray-500");

  lineEl.textContent = [address.addressLine1, address.addressLine2].filter(Boolean).join(", ");
  cityEl.textContent = [address.city, address.state, address.pincode].filter(Boolean).join(", ");
}

// ──────────────────────────────────────────────
// Map
// ──────────────────────────────────────────────
function initMap() {
  map = L.map("map", { zoomControl: true, scrollWheelZoom: false })
    .setView([23.0225, 72.5714], 13);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
  }).addTo(map);
}

function renderMap(branchLoc, partnerLoc) {
  if (!branchLoc && !partnerLoc) return;

  if (branchMarker) map.removeLayer(branchMarker);
  if (partnerMarker) map.removeLayer(partnerMarker);
  if (routeLine) map.removeLayer(routeLine);

  const greenIcon = L.divIcon({
    html: `<div style="background:#166534;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)">🍴</div>`,
    iconSize: [34, 34], className: "",
  });

  const orangeIcon = L.divIcon({
    html: `<div style="background:#f97316;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)">🛵</div>`,
    iconSize: [34, 34], className: "",
  });

  const points = [];

  if (branchLoc) {
    branchMarker = L.marker([branchLoc.lat, branchLoc.lng], { icon: greenIcon }).addTo(map);
    points.push([branchLoc.lat, branchLoc.lng]);
  }

  if (partnerLoc) {
    partnerMarker = L.marker([partnerLoc.lat, partnerLoc.lng], { icon: orangeIcon }).addTo(map);
    points.push([partnerLoc.lat, partnerLoc.lng]);
  }

  if (points.length === 2) {
    routeLine = L.polyline(points, { color: "#2563eb", weight: 4 }).addTo(map);
    map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
  } else if (points.length === 1) {
    map.setView(points[0], 14);
  }
}

// ──────────────────────────────────────────────
// Support button
// ──────────────────────────────────────────────
document.querySelector("section.bg-white button.bg-orange-500")?.addEventListener("click", () => {
  window.location.href = `/support/new?orderId=${orderId}`;
});