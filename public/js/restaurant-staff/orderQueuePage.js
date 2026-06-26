// js/restaurantStaff/orderQueuePage.js

// ──────────────────────────────────────────────
// Maps order.status -> which column it renders in
// and what the action button should say/do next
// ──────────────────────────────────────────────
const STATUS_COLUMN_MAP = {
  PLACED: "new",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY_FOR_PICKUP: "ready",
};

const NEXT_ACTION_LABEL = {
  PLACED: "Accept Order",
  CONFIRMED: "Start Preparing",
  PREPARING: "Mark Ready for Pickup",
};

const NEXT_ACTION_COLOR = {
  PLACED: "bg-orange-500 hover:bg-orange-600",
  CONFIRMED: "bg-blue-500 hover:bg-blue-600",
  PREPARING: "bg-green-600 hover:bg-green-700",
};

let pollTimer = null;
let orderTimers = {}; // tracks "time ago" labels without re-fetching

document.addEventListener("DOMContentLoaded", () => {
  fetchBranchOrders();
  pollTimer = setInterval(fetchBranchOrders, 500000);
});

window.addEventListener("beforeunload", () => clearInterval(pollTimer));

// ──────────────────────────────────────────────
// Fetch + render
// ──────────────────────────────────────────────
async function fetchBranchOrders() {
  try {
    const response = await apiRequest("/api/orders/branch-orders-active", "GET");
    const result = await response.json();

    console.log("Fetched branch orders:", result);

    if (!result.success) {
      showToast(result.error || "Failed to load orders", "error");
      return;
    }

    renderBoard(result.data.orders);

  } catch (err) {
    console.error("Failed to fetch branch orders:", err);
  }
}
let allOrders = []; // store latest fetched orders for modal lookup

function renderBoard(orders) {
  allOrders = orders; // keep reference for modal click handler

  const columns = { new: [], confirmed: [], preparing: [], ready: [] };

  orders.forEach((order) => {
    const colKey = STATUS_COLUMN_MAP[order.status];
    if (colKey) columns[colKey].push(order);
  });

  document.getElementById("col-new").innerHTML = columns.new.map((o) => buildCard(o, true)).join("") || emptyState();
  document.getElementById("col-confirmed").innerHTML = columns.confirmed.map((o) => buildCard(o)).join("") || emptyState();
  document.getElementById("col-preparing").innerHTML = columns.preparing.map((o) => buildCard(o)).join("") || emptyState();
  document.getElementById("col-ready").innerHTML = columns.ready.map((o) => buildCard(o, false, true)).join("") || emptyState();

  document.getElementById("count-new").textContent = columns.new.length;
  document.getElementById("count-confirmed").textContent = columns.confirmed.length;
  document.getElementById("count-preparing").textContent = columns.preparing.length;
  document.getElementById("count-ready").textContent = columns.ready.length;

  attachButtonListeners();
  attachCardClickListeners(); // ← new
}


function attachCardClickListeners() {
  document.querySelectorAll(".order-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      // Don't open modal if the click was on the action button inside the card
      if (e.target.closest(".status-action-btn")) return;

      const orderId = card.dataset.orderId;
      const order = allOrders.find((o) => o.id === orderId);
      if (order) showOrderDetailModal(order);
    });
  });
}

function showOrderDetailModal(order) {
  const modal = document.getElementById("order-detail-modal");

  const itemsHtml = order.orderItems.map((item) => `
    <div class="flex justify-between text-slate-200 text-sm py-2 border-b border-white/5 last:border-0">
      <div>
        <span class="text-orange-400 font-bold mr-2">${item.quantity}x</span>${item.menuItemName}
        ${item.specialInstruction ? `<div class="text-slate-500 text-xs mt-1 ml-6">${item.specialInstruction}</div>` : ""}
        ${item.modifiers && item.modifiers.length > 0
          ? `<div class="text-slate-500 text-xs mt-1 ml-6">+ ${item.modifiers.map((m) => m.modifierName).join(", ")}</div>`
          : ""}
      </div>
    </div>
  `).join("");

  const statusLabel = order.status.replace(/_/g, " ");
  const timeAgo = formatTimeAgo(order.placedAt);

  modal.innerHTML = `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" id="modal-backdrop">
      <div class="bg-[#16241C] rounded-2xl p-6 max-w-md w-full border border-white/10 max-h-[85vh] overflow-y-auto">

        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-white font-bold text-lg">#${order.orderNumber}</h2>
            <p class="text-slate-500 text-xs mt-1">${timeAgo}</p>
          </div>
          <button id="close-modal-btn" class="text-slate-400 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div class="bg-white/5 rounded-xl p-3 mb-4">
          <span class="text-slate-300 text-xs font-semibold uppercase tracking-wide">${statusLabel}</span>
        </div>

        <div class="mb-4">
          <p class="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Customer</p>
          <p class="text-white text-sm font-medium">${order.customer.fullName}</p>
          <p class="text-slate-400 text-sm">${order.customer.mobile}</p>
        </div>

        <div class="mb-4">
          <p class="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Order Items</p>
          ${itemsHtml}
        </div>

        <div class="flex justify-between items-center pt-3 border-t border-white/10">
          <span class="text-slate-400 text-sm">Total Amount</span>
          <span class="text-white font-bold text-lg">₹${order.totalAmount}</span>
        </div>

      </div>
    </div>
  `;

  document.getElementById("close-modal-btn").onclick = closeOrderDetailModal;

  // Close on clicking outside the card
  document.getElementById("modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") closeOrderDetailModal();
  });
}

function closeOrderDetailModal() {
  document.getElementById("order-detail-modal").innerHTML = "";
}





function emptyState() {
  return `<div class="text-slate-600 text-xs text-center py-6">No orders here</div>`;
}
function buildCard(order, isNew = false, isReady = false) {
  const itemsHtml = order.orderItems.map((item) => `
    <div class="flex justify-between text-slate-300 text-[12.5px] py-0.5">
      <span><span class="text-orange-400 font-bold mr-1.5">${item.quantity}x</span>${item.menuItemName}</span>
    </div>
    ${item.specialInstruction ? `<div class="text-slate-500 text-[11px] ml-[26px]">${item.specialInstruction}</div>` : ""}
    ${item.modifiers && item.modifiers.length > 0
      ? `<div class="text-slate-500 text-[11px] ml-[26px]">+ ${item.modifiers.map((m) => m.modifierName).join(", ")}</div>`
      : ""}
  `).join("");

  const timeAgo = formatTimeAgo(order.placedAt);

  let buttonHtml;
  if (isReady) {
    buttonHtml = `
      <button class="w-full py-2.5 rounded-[10px] text-[13px] font-bold bg-white/5 text-slate-500 cursor-default" disabled>
        Waiting for delivery partner…
      </button>`;
  } else {
    const label = NEXT_ACTION_LABEL[order.status];
    const color = NEXT_ACTION_COLOR[order.status];
    buttonHtml = `
      <button
        class="status-action-btn w-full py-2.5 rounded-[10px] text-white text-[13px] font-bold ${color}"
        data-order-id="${order.id}">
        ${label}
      </button>`;
  }

  return `
    <div
      class="order-card bg-[#1E2D24] rounded-[14px] p-3.5 mb-3 border ${isNew ? "border-orange-500 shadow-[0_0_0_1px_rgba(249,115,22,0.3)]" : "border-white/5"} cursor-pointer hover:border-white/20 transition-colors"
      data-order-id="${order.id}">
      <div class="flex justify-between items-start mb-2">
        <div>
          <div class="text-white font-bold text-sm">#${order.orderNumber}</div>
          <div class="text-slate-500 text-[11px] mt-0.5">${timeAgo}</div>
        </div>
      </div>
      <div class="text-slate-400 text-xs mb-2">${order.customer.fullName} · ${order.customer.mobile}</div>
      <div class="mb-2.5">${itemsHtml}</div>
      ${buttonHtml}
    </div>
  `;
}

function formatTimeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Placed just now";
  if (diffMin === 1) return "Placed 1 min ago";
  return `Placed ${diffMin} min ago`;
}

// ──────────────────────────────────────────────
// Status update button clicks
// ──────────────────────────────────────────────
function attachButtonListeners() {
  document.querySelectorAll(".status-action-btn").forEach((btn) => {
    btn.addEventListener("click", () => updateOrderStatus(btn.dataset.orderId, btn));
  });
}

async function updateOrderStatus(orderId, btnEl) {
  btnEl.disabled = true;
  btnEl.textContent = "Updating…";

  try {
    const response = await apiRequest(`/api/orders/change-status/${orderId}`, "PATCH");
    const result = await response.json();

    if (result.success) {
      showToast(`Order #${result.data.orderNumber} → ${result.data.newStatus.replace(/_/g, " ")}`, "success");
      fetchBranchOrders(); // immediate refresh instead of waiting for next poll
    } else {
      showToast(result.error || "Failed to update status", "error");
      btnEl.disabled = false;
    }
  } catch (err) {
    console.error("Status update failed:", err);
    showToast("Something went wrong", "error");
    btnEl.disabled = false;
  }
}
