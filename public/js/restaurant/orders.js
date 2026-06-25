document.addEventListener("DOMContentLoaded", async () => {
    const $ = (id) => document.getElementById(id);

    // Elements
    const branchSelector = $("branchSelector");
    const refreshOrdersBtn = $("refreshOrdersBtn");
    const ordersLoading = $("ordersLoading");
    const ordersBoard = $("ordersBoard");
    
    // Tabs
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    const emptyTabState = $("emptyTabState");

    // Modal
    const modal = $("orderDetailsModal");
    const panel = $("orderDetailsPanel");
    const closeBtn = $("closeOrderModal");

    let currentRestaurantId = null;
    let branches = [];
    let currentBranchId = null;
    let allOrders = [];

    // State
    const statusMap = {
        'PENDING': 'new',
        'ACCEPTED': 'preparing',
        'PREPARING': 'preparing',
        'READY_FOR_PICKUP': 'ready',
        'OUT_FOR_DELIVERY': 'ready',
        'DELIVERED': 'completed',
        'CANCELLED': 'completed'
    };

    // ── 1. Init ─────────────────────────────────────────────────────────────
    async function init() {
        try {
            // Fetch User's restaurants
            const res = await apiRequest("/api/restaurants/owner/my-restaurants", "GET");
            if (!res || !res.ok) throw new Error("Failed to fetch restaurants");
            
            const data = await res.json();
            if (!data.success || !data.data || data.data.length === 0) {
                showToast("No restaurant found. Create one first.", "error");
                return;
            }

            const restaurant = data.data[0];
            currentRestaurantId = restaurant.id;
            branches = restaurant.branches || [];

            if (branches.length === 0) {
                branchSelector.innerHTML = `<option value="">No branches found</option>`;
                ordersLoading.style.display = "none";
                return;
            }

            // Populate selector
            branchSelector.innerHTML = branches.map(b => `<option value="${b.id}">${b.branchName}</option>`).join("");
            
            // Set initial branch
            currentBranchId = branches[0].id;
            
            // Fetch orders
            await loadOrders();

        } catch (err) {
            console.error(err);
            showToast("Failed to initialize dashboard", "error");
        }
    }

    // ── 2. Load Orders ──────────────────────────────────────────────────────
    async function loadOrders() {
        if (!currentBranchId) return;

        ordersLoading.style.display = "flex";
        ordersBoard.style.display = "none";

        try {
            const res = await apiRequest(`/api/branches/${currentBranchId}/orders?limit=100`, "GET");
            if (!res || !res.ok) throw new Error("Failed to fetch orders");

            const data = await res.json();
            allOrders = data.data?.orders || [];
            
            renderOrders();

        } catch (err) {
            console.error(err);
            showToast("Failed to load orders.", "error");
        } finally {
            ordersLoading.style.display = "none";
            ordersBoard.style.display = "flex";
        }
    }

    // ── 3. Render Orders into Tabs ──────────────────────────────────────────
    function renderOrders() {
        const categorized = {
            new: [],
            preparing: [],
            ready: [],
            completed: []
        };

        allOrders.forEach(order => {
            const tab = statusMap[order.status] || 'new';
            categorized[tab].push(order);
        });

        // Update badges
        Object.keys(categorized).forEach(tab => {
            const badge = $(`badge-${tab}`);
            if (badge) {
                const count = categorized[tab].length;
                badge.textContent = count;
                if (count > 0 && tab !== 'completed') {
                    badge.classList.remove("hidden");
                } else {
                    badge.classList.add("hidden");
                }
            }
        });

        // Render HTML for each tab
        Object.keys(categorized).forEach(tab => {
            const container = $(`tab-${tab}`);
            if (container) {
                container.innerHTML = categorized[tab].map(order => createOrderCard(order)).join("");
            }
        });

        // Refresh currently active tab to show/hide empty state
        const activeTabBtn = document.querySelector(".tab-btn.active");
        if (activeTabBtn) {
            switchTab(activeTabBtn.dataset.tab);
        }
    }

    function createOrderCard(order) {
        const timeElapsed = getTimeElapsed(order.placedAt);
        const itemCount = order.orderItems ? order.orderItems.length : 0;
        
        let statusColor = "bg-gray-100 text-gray-800";
        if (order.status === 'PENDING') statusColor = "bg-red-100 text-red-800";
        if (order.status === 'ACCEPTED' || order.status === 'PREPARING') statusColor = "bg-blue-100 text-blue-800";
        if (order.status === 'READY_FOR_PICKUP' || order.status === 'OUT_FOR_DELIVERY') statusColor = "bg-orange-100 text-orange-800";
        if (order.status === 'DELIVERED') statusColor = "bg-green-100 text-green-800";

        return `
            <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm order-card flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start mb-3">
                        <span class="status-badge ${statusColor}">${order.status.replace(/_/g, ' ')}</span>
                        <span class="text-xs font-medium text-gray-400"><i class="fa-regular fa-clock"></i> ${timeElapsed}</span>
                    </div>
                    
                    <h3 class="font-bold text-gray-900 text-lg mb-1">#${order.orderNumber || order.id.substring(0,8).toUpperCase()}</h3>
                    <p class="text-sm text-gray-600 mb-3 line-clamp-1"><i class="fa-regular fa-user mr-1"></i> ${order.customer?.fullName || 'Customer'}</p>
                </div>
                
                <div class="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total</p>
                        <p class="font-bold text-gray-900">₹${order.totalAmount} <span class="text-xs font-normal text-gray-500">(${itemCount} items)</span></p>
                    </div>
                    <button onclick="window.openOrderDetails('${order.id}')" class="px-4 py-2 bg-[#e6f4f0] text-[#014f38] hover:bg-[#014f38] hover:text-white transition rounded-xl text-sm font-semibold">
                        View
                    </button>
                </div>
            </div>
        `;
    }

    // ── 4. Tab Switching Logic ──────────────────────────────────────────────
    function switchTab(tabId) {
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabId) btn.classList.add("active");
            else btn.classList.remove("active");
        });

        tabContents.forEach(content => {
            if (content.id === `tab-${tabId}`) {
                content.classList.remove("hidden");
                // Show empty state if no children
                if (content.children.length === 0) {
                    emptyTabState.classList.remove("hidden");
                } else {
                    emptyTabState.classList.add("hidden");
                }
            } else {
                content.classList.add("hidden");
            }
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    // ── 5. Order Details Modal ──────────────────────────────────────────────
    window.openOrderDetails = (orderId) => {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) return;

        // Populate Modal Data
        $("modalOrderId").textContent = `Order #${order.orderNumber || order.id.substring(0,8).toUpperCase()}`;
        $("modalOrderTime").textContent = new Date(order.placedAt).toLocaleString();
        
        // Status Banner
        const statusText = order.status.replace(/_/g, ' ');
        $("modalStatusText").textContent = statusText;
        const banner = $("modalStatusBanner");
        banner.className = "mb-6 rounded-xl p-4 flex items-center justify-between"; // reset
        
        if (order.status === 'PENDING') banner.classList.add("bg-red-50", "text-red-700", "border", "border-red-100");
        else if (order.status === 'ACCEPTED' || order.status === 'PREPARING') banner.classList.add("bg-blue-50", "text-blue-700", "border", "border-blue-100");
        else if (order.status === 'DELIVERED') banner.classList.add("bg-green-50", "text-green-700", "border", "border-green-100");
        else banner.classList.add("bg-gray-50", "text-gray-700", "border", "border-gray-100");

        // Customer
        $("modalCustomerName").textContent = order.customer?.fullName || 'Guest Customer';
        $("modalCustomerPhone").innerHTML = `<i class="fa-solid fa-phone text-xs mr-1"></i> ${order.customer?.mobile || 'N/A'}`;
        
        if (order.address) {
            $("modalDeliveryAddressBlock").classList.remove("hidden");
            const addr = order.address;
            const parts = [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode].filter(Boolean);
            $("modalDeliveryAddress").textContent = parts.join(", ");
        } else {
            $("modalDeliveryAddressBlock").classList.add("hidden");
        }

        // Items
        const items = order.orderItems || [];
        $("modalItemsCount").textContent = items.length;
        $("modalItemsList").innerHTML = items.map(item => {
            const mods = item.modifiers && item.modifiers.length > 0 
                ? item.modifiers.map(m => m.modifierName).join(", ") 
                : '';
            return `
            <div class="flex justify-between items-start">
                <div class="flex gap-3">
                    <span class="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded text-xs h-fit">${item.quantity}x</span>
                    <div>
                        <p class="font-medium text-sm text-gray-900">${item.menuItemName || 'Unknown Item'}</p>
                        ${mods ? `<p class="text-xs text-gray-500 mt-0.5">${mods}</p>` : ''}
                        ${item.specialInstruction ? `<p class="text-xs text-orange-600 mt-0.5"><i class="fa-solid fa-note-sticky mr-1"></i>${item.specialInstruction}</p>` : ''}
                    </div>
                </div>
                <span class="text-sm font-medium text-gray-900">₹${item.price * item.quantity}</span>
            </div>
            `
        }).join("");

        // Financials
        $("modalSubtotal").textContent = `₹${order.subtotal || 0}`;
        $("modalTax").textContent = `₹${order.taxAmount || 0}`;
        $("modalDeliveryFee").textContent = `₹${order.deliveryFee || 0}`;
        
        if (order.discountAmount && order.discountAmount > 0) {
            $("modalDiscountRow").classList.remove("hidden");
            $("modalDiscount").textContent = `-₹${order.discountAmount}`;
            
            if (order.coupon) {
                $("modalCouponBadge").classList.remove("hidden");
                $("modalCouponBadge").textContent = order.coupon.code;
            } else {
                $("modalCouponBadge").classList.add("hidden");
            }
        } else {
            $("modalDiscountRow").classList.add("hidden");
        }
        
        $("modalTotal").textContent = `₹${order.totalAmount}`;

        // Payment
        const paymentMethod = order.payments && order.payments.length > 0 ? order.payments[0].paymentMethod : 'CASH';
        $("modalPaymentStatus").textContent = `PAID VIA ${paymentMethod}`;

        // Actions
        renderActionButtons(order);

        // Open Modal
        modal.classList.remove("hidden");
        // slight delay to allow display block to apply before transforming
        setTimeout(() => {
            panel.classList.remove("translate-x-full");
        }, 10);
    };

    function closeOrderModal() {
        panel.classList.add("translate-x-full");
        setTimeout(() => {
            modal.classList.add("hidden");
        }, 300); // match transition duration
    }

    closeBtn.addEventListener("click", closeOrderModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeOrderModal();
    });

    // ── 6. Actions ──────────────────────────────────────────────────────────
    function renderActionButtons(order) {
        const container = $("modalActionButtons");
        container.innerHTML = "";

        if (order.status === 'PENDING') {
            container.innerHTML = `
                <div class="flex gap-3">
                    <button onclick="updateOrderStatus('${order.id}', 'CANCELLED')" class="flex-1 py-3 px-4 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition">Reject</button>
                    <button onclick="updateOrderStatus('${order.id}', 'ACCEPTED')" class="flex-1 py-3 px-4 rounded-xl bg-[#014f38] text-white font-bold hover:bg-[#013d2c] transition shadow-md">Accept Order</button>
                </div>
            `;
        } else if (order.status === 'ACCEPTED') {
            container.innerHTML = `
                <button onclick="updateOrderStatus('${order.id}', 'PREPARING')" class="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-md">Start Preparing</button>
            `;
        } else if (order.status === 'PREPARING') {
            container.innerHTML = `
                <button onclick="updateOrderStatus('${order.id}', 'READY_FOR_PICKUP')" class="w-full py-3 px-4 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition shadow-md">Mark as Ready</button>
            `;
        } else if (order.status === 'READY_FOR_PICKUP') {
            container.innerHTML = `
                <p class="text-center text-sm font-medium text-gray-500">Waiting for Delivery Partner to pick up...</p>
            `;
        }
    }

    window.updateOrderStatus = async (orderId, newStatus) => {
        try {
            // Using the API endpoint for staff to update order status
            const res = await apiRequest(`/api/orders/change-status/${orderId}`, "PATCH", { status: newStatus });
            if (!res || !res.ok) throw new Error("Failed to update status");

            showToast("Order status updated successfully", "success");
            closeOrderModal();
            loadOrders(); // Refresh board

        } catch (err) {
            console.error(err);
            showToast("Error updating order status.", "error");
        }
    };

    // ── Utils ───────────────────────────────────────────────────────────────
    function getTimeElapsed(dateString) {
        const past = new Date(dateString);
        const now = new Date();
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
        
        const diffDays = Math.floor(diffHrs / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    // ── Event Listeners ─────────────────────────────────────────────────────
    branchSelector.addEventListener("change", (e) => {
        currentBranchId = e.target.value;
        loadOrders();
    });

    refreshOrdersBtn.addEventListener("click", () => {
        refreshOrdersBtn.classList.add("animate-spin");
        loadOrders().then(() => {
            setTimeout(() => refreshOrdersBtn.classList.remove("animate-spin"), 500);
        });
    });

    // Run
    init();
});
