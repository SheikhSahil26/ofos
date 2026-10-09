document.addEventListener("DOMContentLoaded", async () => {

    // ── Helpers ──────────────────────────────────────────────────────────────

    const $ = (id) => document.getElementById(id);

    function setText(id, value) {
        const el = $(id);
        if (el) el.textContent = value;
    }

    function formatTime(iso) {
        if (!iso) return "";
        try {
            return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
            return iso;
        }
    }

    // ── Extract branchId from URL ─────────────────────────────────────────────
    // URL pattern: /restaurants/branches/:branchId
    const pathParts = window.location.pathname.split("/");
    const branchId = pathParts[pathParts.length - 1];

    if (!branchId) {
        showToast("Branch ID not found in URL", "error");
        return;
    }

    // Expose to modal logic
    window.currentBranchId = branchId;

    //manage menu button 
    document.getElementById("manageMenuBtn").addEventListener("click", () => {
        window.location.href = `/restaurants/menu/menu-management/${branchId}`;
    });

    // ── Fetch branch details ──────────────────────────────────────────────────
    async function loadBranchData() {
        try {
            const res = await apiRequest(`/api/branches/${branchId}`, "GET");
            if (!res || !res.ok) throw new Error("Failed to fetch branch");
            const json = await res.json();
            if (!json.success || !json.data) throw new Error("Invalid branch response");
            return json.data;
        } catch (err) {
            console.error("Branch fetch error:", err);
            return null;
        }
    }

    // ── Fetch branch orders ───────────────────────────────────────────────────
    async function loadOrdersData() {
        try {
            const res = await apiRequest(`/api/branches/${branchId}/orders`, "GET");
            if (!res || !res.ok) return { orders: [], total: 0 };
            const json = await res.json();
            return {
                orders: json.data?.orders || [],
                total: json.data?.total || 0
            };
        } catch (err) {
            console.error("Orders fetch error:", err);
            return { orders: [], total: 0 };
        }
    }

    // ── Fetch branch menu ─────────────────────────────────────────────────────
    async function loadMenuData() {
        try {
            const res = await apiRequest(`/api/menu/full/${branchId}`, "GET");
            if (!res || !res.ok) return [];
            const json = await res.json();
            return json.data || [];
        } catch (err) {
            console.error("Menu fetch error:", err);
            return [];
        }
    }

    // ── Render branch header ──────────────────────────────────────────────────
    function renderBranchHeader(branch) {
        // Title
        document.title = `${branch.branchName || "Branch"} | Ziggy Restaurant`;

        setText("branchName", branch.branchName || "—");

        const badge = $("branchStatusBadge");
        if (badge) {
            if (branch.isActive) {
                badge.textContent = "Active";
                badge.className = "text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800";
            } else {
                badge.textContent = "Inactive";
                badge.className = "text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-800";
            }
        }

        const addr = [branch.addressLine1, branch.city].filter(Boolean).join(", ");
        setText("branchAddress", addr || "—");

        // Overview cards
        setText("branchContact", branch.contactNumber || "N/A");
        setText("branchFssai", branch.fssaiLicense || "N/A");
        setText("branchGstin", branch.gstin || "N/A");
        const radius = branch.deliveryRadiusKm != null ? `${branch.deliveryRadiusKm}` : "N/A";
        setText("branchDeliveryRadius", radius);

        // Pre-fill edit form
        if ($("edit_branchName")) $("edit_branchName").value = branch.branchName || "";
        if ($("edit_contactNumber")) $("edit_contactNumber").value = branch.contactNumber || "";
        if ($("edit_addressLine1")) $("edit_addressLine1").value = branch.addressLine1 || "";
        if ($("edit_addressLine2")) $("edit_addressLine2").value = branch.addressLine2 || "";
        if ($("edit_city")) $("edit_city").value = branch.city || "";
        if ($("edit_state")) $("edit_state").value = branch.state || "";
        if ($("edit_pincode")) $("edit_pincode").value = branch.pincode || "";
        if ($("edit_deliveryRadiusKm")) $("edit_deliveryRadiusKm").value = branch.deliveryRadiusKm || "";
    }

    // ── Render operating hours ────────────────────────────────────────────────
    function renderOperatingHours(hours) {
        const container = $("operatingHoursContainer");
        if (!container) return;

        if (!hours || hours.length === 0) {
            container.innerHTML = `<p class="text-gray-500">Not configured</p>`;
            return;
        }

        container.innerHTML = hours.map(hour => `
            <div class="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <span class="font-medium text-gray-700 w-24">${hour.dayOfWeek}</span>
                ${hour.isClosed
                    ? `<span class="text-red-500 font-medium px-2 py-0.5 bg-red-50 rounded text-xs">Closed</span>`
                    : `<span class="text-gray-900 font-medium">${formatTime(hour.openTime)} - ${formatTime(hour.closeTime)}</span>`
                }
            </div>
        `).join("");
    }

    // ── Render menu ───────────────────────────────────────────────────────────
    function renderMenu(menu) {
        const container = $("menuContainer");
        if (!container) return;

        if (!menu || menu.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fa-solid fa-utensils text-3xl mb-3 text-gray-300"></i>
                    <p>No menu items found for this branch.</p>
                </div>`;
            return;
        }

        container.innerHTML = menu.map(category => `
            <div class="menu-category border border-gray-100 rounded-xl overflow-hidden">
                <div class="bg-[#f8f7f4] px-4 py-3 border-b border-gray-100 font-bold text-gray-800 flex justify-between items-center">
                    <span class="category-name">${category.name || "Unnamed"}</span>
                    <span class="category-count text-xs bg-white px-2 py-1 rounded text-gray-500 font-medium border border-gray-200">
                        ${category.menuItems ? category.menuItems.length : 0} items
                    </span>
                </div>
                <div class="category-items divide-y divide-gray-100">
                    ${category.menuItems && category.menuItems.length > 0
                        ? category.menuItems.map(item => {
                            const isVeg = item.isVeg;
                            const vegBadge = isVeg
                                ? `<span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-green-200 text-green-700 bg-green-50">VEG</span>`
                                : `<span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-red-200 text-red-700 bg-red-50">NON-VEG</span>`;
                            const imgHtml = item.imageUrl
                                ? `<img src="${item.imageUrl}" alt="${item.name || ''}" class="w-full h-full object-cover">`
                                : `<div class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-image"></i></div>`;
                            return `
                                <div class="menu-item p-4 flex gap-4 hover:bg-[#fffcf9] transition">
                                    <div class="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                        ${imgHtml}
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-start">
                                            <h4 class="font-semibold text-gray-900">${item.name || "—"}</h4>
                                            <span class="font-bold text-[#014f38]">₹${Number(item.price || 0).toFixed(2)}</span>
                                        </div>
                                        <p class="text-xs text-gray-500 mt-1 line-clamp-2">${item.description || ""}</p>
                                        <div class="mt-2 flex gap-2">${vegBadge}</div>
                                    </div>
                                </div>`;
                        }).join("")
                        : `<div class="p-4 text-sm text-gray-500 text-center">No items in this category.</div>`
                    }
                </div>
            </div>
        `).join("");
    }

    // ── Render orders ─────────────────────────────────────────────────────────
    function renderOrders(orders, total) {
        setText("ordersTotalBadge", total || 0);

        const container = $("ordersContainer");
        if (!container) return;

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-10 text-gray-500">
                    <i class="fa-solid fa-receipt text-3xl mb-3 text-gray-300"></i>
                    <p>No orders received yet.</p>
                </div>`;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="p-4 rounded-xl border border-gray-100 bg-[#fbfbfb] hover:border-[#ff7a00] hover:bg-white transition cursor-pointer">
                <div class="flex justify-between items-start mb-2">
                    <span class="font-bold text-gray-900 text-sm">#${order.orderNumber}</span>
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-yellow-100 text-yellow-800">${order.status}</span>
                </div>
                <div class="text-xs text-gray-500 mb-2">
                    <i class="fa-regular fa-clock mr-1"></i>
                    <span>${new Date(order.placedAt).toLocaleString()}</span>
                </div>
                <div class="flex justify-between items-end border-t border-gray-100 pt-2 mt-1">
                    <span class="text-xs font-medium text-gray-700">${order.customer ? order.customer.fullName : "Guest"}</span>
                    <span class="font-bold text-[#014f38]">₹${Number(order.totalAmount).toFixed(2)}</span>
                </div>
            </div>
        `).join("");
    }

    // ── Main: fetch and render all data ───────────────────────────────────────
    const [branchData, ordersData, menuData] = await Promise.all([
        loadBranchData(),
        loadOrdersData(),
        loadMenuData()
    ]);

    if (!branchData) {
        showToast("Failed to load branch details.", "error");
        return;
    }

    const branch = branchData;
    renderBranchHeader(branch);
    renderOperatingHours(branch.operatingHours || []);
    renderMenu(menuData || []);
    renderOrders(ordersData.orders, ordersData.total);

    // ══════════════════════════════════════════════════════════════════════════
    // Edit Branch Modal Logic
    // ══════════════════════════════════════════════════════════════════════════

    const modal = document.getElementById("editBranchModal");
    const openBtn = document.getElementById("openEditBranchModal");
    const closeBtn = document.getElementById("closeEditBranchModal");
    const cancelBtn = document.getElementById("cancelEditBranchBtn");
    const form = document.getElementById("editBranchForm");
    const errorEl = document.getElementById("editBranchError");
    const btnText = document.getElementById("editBranchBtnText");
    const btnSpinner = document.getElementById("editBranchBtnSpinner");

    function openModal() {
        if(modal) {
            modal.classList.remove("hidden");
            document.body.style.overflow = "hidden";
        }
    }

    function closeModal() {
        if(modal) {
            modal.classList.add("hidden");
            document.body.style.overflow = "";
            if(errorEl) {
                errorEl.classList.add("hidden");
                errorEl.textContent = "";
            }
        }
    }

    if (openBtn) openBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    // Close on backdrop click
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Submit form
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const branchIdToUpdate = window.currentBranchId;
            if (!branchIdToUpdate) {
                showToast("Branch ID not found.", "error");
                return;
            }

            // Only include non-empty changed fields
            const payload = {};
            const fields = [
                "branchName", "contactNumber", "addressLine1", "addressLine2",
                "city", "state", "pincode", "deliveryRadiusKm"
            ];

            fields.forEach(field => {
                const el = document.getElementById(`edit_${field}`);
                if (el && el.value.trim() !== "") {
                    payload[field] = field === "deliveryRadiusKm"
                        ? parseFloat(el.value)
                        : el.value.trim();
                }
            });

            if (Object.keys(payload).length === 0) {
                errorEl.textContent = "No changes detected. Please update at least one field.";
                errorEl.classList.remove("hidden");
                return;
            }

            // Show loading state
            btnText.textContent = "Saving...";
            btnSpinner.classList.remove("hidden");
            errorEl.classList.add("hidden");

            try {
                const response = await apiRequest(`/api/branches/${branchIdToUpdate}`, "PUT", payload);

                if (!response) {
                    // apiRequest handles 401 and redirects
                    return;
                }

                const result = await response.json();


                if (response.ok && result.success) {
                    showToast("Branch updated successfully!", "success");
                    closeModal();

                    // Refresh page after short delay to show new data
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    errorEl.textContent = result.message || "Failed to update branch. Please try again.";
                    errorEl.classList.remove("hidden");
                }
            } catch (err) {
                console.error("Edit branch error:", err);
                errorEl.textContent = "An unexpected error occurred.";
                errorEl.classList.remove("hidden");
            } finally {
                btnText.textContent = "Save Changes";
                btnSpinner.classList.add("hidden");
            }
        });
    }
});
