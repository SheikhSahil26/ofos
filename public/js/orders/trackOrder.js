// js/orders/trackOrder.js

const STEPPER_STAGES = [
  { key: "PLACED",            label: "Placed" },
  { key: "CONFIRMED",         label: "Assigned" },
  { key: "PREPARING",         label: "Preparing" },
  { key: "PICKED_UP",         label: "Picked Up" },
  { key: "OUT_FOR_DELIVERY",  label: "Out For Delivery" },
  { key: "DELIVERED",         label: "Delivered" },
];

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

let map = null;
let routeLine, partnerMarker, branchMarker;
let mapInitialized = false;
let pollTimer = null;
let previousPartnerId = null; // tracks whether we've already announced this partner

const orderId = window.location.pathname.split("/").pop();

document.addEventListener("DOMContentLoaded", () => {
  fetchTrackingDetails();
  pollTimer = setInterval(fetchTrackingDetails, 50000); // FIXED — was 500000
});

window.addEventListener("beforeunload", () => clearInterval(pollTimer));

// ──────────────────────────────────────────────
// Fetch
// ──────────────────────────────────────────────
async function fetchTrackingDetails() {
  try {
    const response = await apiRequest(`/api/orders/tracking-details/${orderId}`, "GET");
    const result = await response.json();

    if (!result.success) {
      showToast(result.error || "Unable to load order", "error");
      return;
    }

    const data = result.data; // FIXED — this is the object, not an array

    console.log("Fetched tracking details:", data);

    // ── Announce partner assignment once, on first appearance ──
    const newPartnerId = data.deliveryPartner ? data.deliveryPartner.partnerId : null;
    if (newPartnerId && !previousPartnerId) {
      showToast(`${data.deliveryPartner.fullName} has been assigned to your order!`, "success");
    }
    previousPartnerId = newPartnerId;

    renderPage(data);

    if (data.status === "DELIVERED" || data.status === "CANCELLED") {
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
  renderStatusBadge(data.status);
  renderStepper(data.status);
  renderStatusSection(data.status, data.etaMinutes);
  renderPartner(data.deliveryPartner, data.status);
  renderAddress(data.address);
  renderMapOrPlaceholder(data.branchLocation, data.partnerLocation, data.status);
}

function renderStatusBadge(status) {
  const badge = document.querySelector("span.bg-orange-100, span.bg-green-100, span.bg-red-100");
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
  const section = document.querySelectorAll("section.bg-white")[2];
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

function renderPartner(partner, status) {
  const section = document.querySelectorAll("section.bg-white")[4];
  if (!section) return;

  section.style.display = "";

  if (!partner) {
    section.innerHTML = `
      <h2 class="text-2xl font-bold mb-8">Delivery Partner</h2>
      <div class="flex flex-col items-center justify-center py-6 text-center">
        <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl mb-4">🔍</div>
        <p class="text-gray-500 font-medium">
          ${["PLACED", "CONFIRMED", "PREPARING"].includes(status)
            ? "Looking for a delivery partner…"
            : "Delivery partner will be assigned shortly"}
        </p>
      </div>
    `;
    return;
  }

  section.innerHTML = `
    <h2 class="text-2xl font-bold mb-8">Delivery Partner</h2>
    <div class="flex items-center justify-between">
      <div class="flex gap-5">
        <img src="${partner.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(partner.fullName)}`}"
             class="w-20 h-20 rounded-full object-cover">
        <div>
          <h3 class="font-bold text-xl">${partner.fullName}</h3>
          <div class="flex items-center gap-3 mt-3">
            <span class="text-orange-500">★</span>
            <span>${partner.rating ?? "New"}</span>
          </div>
          <p class="text-gray-500 mt-2">Your Delivery Partner</p>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4 mt-10">
      <button id="call-partner-btn" class="bg-green-600 text-white py-4 rounded-2xl font-semibold">Call</button>
      <button class="border border-green-600 text-green-600 py-4 rounded-2xl font-semibold">Chat</button>
    </div>
  `;

  const callBtn = document.getElementById("call-partner-btn");
  if (callBtn && partner.mobile) {
    callBtn.onclick = () => (window.location.href = `tel:${partner.mobile}`);
  }
}

function renderAddress(address) {
  const section = document.querySelectorAll("section.bg-white")[5];
  if (!section || !address) return;

  const lineEl = section.querySelector("p.font-semibold");
  const cityEl = section.querySelector("p.text-gray-500");

  lineEl.textContent = [address.addressLine1, address.addressLine2].filter(Boolean).join(", ");
  cityEl.textContent = [address.city, address.state, address.pincode].filter(Boolean).join(", ");
}

// ──────────────────────────────────────────────
// Map — handles placeholder <-> live map transitions safely
// ──────────────────────────────────────────────
function initMap() {
  map = L.map("map", { zoomControl: true, scrollWheelZoom: false })
    .setView([23.0225, 72.5714], 13);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
  }).addTo(map);
}

function renderMapOrPlaceholder(branchLoc, partnerLoc, status) {

    const mapContainer =
        document.getElementById("map");

    const mapSection =
        mapContainer.closest("section");

    const partner =
        partnerLoc &&
        partnerLoc.length > 0
            ? partnerLoc[0]
            : null;

    if (!branchLoc && !partner) {

        if (mapInitialized && map) {

            map.remove();

            map = null;

            mapInitialized = false;

        }

        mapSection.innerHTML = `
            <div
            id="map"
            class="h-[500px] w-full rounded-2xl bg-gray-50 flex items-center justify-center">

                <p class="text-gray-500">

                    ${
                        status === "DELIVERED"
                            ? "Delivery Completed"
                            : "Waiting for Delivery Partner"
                    }

                </p>

            </div>
        `;

        return;

    }

    if (!mapInitialized) {

        mapSection.innerHTML = `
            <div
            id="map"
            style="height:500px;width:100%">
            </div>
        `;

        initMap();

        mapInitialized = true;

    }

    renderMap(
        branchLoc,
        partner
    );

}

function renderMap(branchLoc, partnerLoc) {

    if (!map)
        return;

    if (branchMarker)
        map.removeLayer(branchMarker);

    if (partnerMarker)
        map.removeLayer(partnerMarker);

    if (routeLine)
        map.removeLayer(routeLine);

    const greenIcon =
        L.divIcon({

            html: `
            <div
            style="
                background:#166534;
                width:34px;
                height:34px;
                border-radius:50%;
                display:flex;
                justify-content:center;
                align-items:center;
                color:white;
                font-size:16px;
                border:2px solid white;">

                🍴

            </div>`,

            iconSize: [34,34],
            className: ""

        });

    const orangeIcon =
        L.divIcon({

            html: `
            <div
            style="
                background:#f97316;
                width:34px;
                height:34px;
                border-radius:50%;
                display:flex;
                justify-content:center;
                align-items:center;
                color:white;
                font-size:16px;
                border:2px solid white;">

                🛵

            </div>`,

            iconSize: [34,34],
            className: ""

        });

    const points = [];

    if (branchLoc) {

        branchMarker =
            L.marker(

                [
                    branchLoc.lat,
                    branchLoc.lng
                ],

                {
                    icon: greenIcon
                }

            ).addTo(map);

        points.push([
            branchLoc.lat,
            branchLoc.lng
        ]);

    }

    if (partnerLoc) {

        partnerMarker =
            L.marker(

                [
                    partnerLoc.latitude,
                    partnerLoc.longitude
                ],

                {
                    icon: orangeIcon
                }

            ).addTo(map);

        points.push([
            partnerLoc.latitude,
            partnerLoc.longitude
        ]);

    }

    if (points.length === 2) {

        routeLine =
            L.polyline(
                points,
                {
                    color: "#2563eb",
                    weight: 4
                }
            ).addTo(map);

        map.fitBounds(
            routeLine.getBounds(),
            {
                padding: [40,40]
            }
        );

    }
    else if (points.length === 1) {

        map.setView(
            points[0],
            14
        );

    }

}
// ──────────────────────────────────────────────
// Support button
// ──────────────────────────────────────────────
document.querySelector("section.bg-white button.bg-orange-500")?.addEventListener("click", () => {
  window.location.href = `/support/new?orderId=${orderId}`;
});