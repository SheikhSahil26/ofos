document.addEventListener("DOMContentLoaded", async () => {

    const $ = (id) => document.getElementById(id);

    const promotionsLoading = $("promotionsLoading");
    const promotionsEmpty = $("promotionsEmpty");
    const promotionsContainer = $("promotionsContainer");

    const modal = $("createPromotionModal");
    const openBtn = $("openCreatePromotionModal");
    const closeBtn = $("closeCreatePromotionModal");
    const cancelBtn = $("cancelCreatePromotionBtn");
    const form = $("createPromotionForm");
    const errorEl = $("createPromotionError");
    const btnText = $("createPromotionBtnText");
    const btnSpinner = $("createPromotionBtnSpinner");

    // Form inputs
    const promoType = $("promoType");
    const discountValueContainer = $("discountValueContainer");
    const maxDiscountContainer = $("maxDiscountContainer");
    const minOrderContainer = $("minOrderContainer");
    const bogoContainer = $("bogoContainer");
    const promoBranchSelect = $("promoBranchSelect");
    const menuItemsSelectionBlock = $("menuItemsSelectionBlock");
    const promoMenuItemsList = $("promoMenuItemsList");

    let currentRestaurantId = null;
    let restaurantBranches = [];

    // ── Fetch Initial Data ──────────────────────────────────────────────────
    async function init() {
        try {
            promotionsLoading.style.display = "flex";
            promotionsContainer.style.display = "none";
            promotionsEmpty.style.display = "none";

            // 1. Fetch user's restaurants
            const restaurantsRes = await apiRequest("/api/restaurants/owner/my-restaurants", "GET");
            if (!restaurantsRes || !restaurantsRes.ok) throw new Error("Failed to fetch restaurants");
            const resData = await restaurantsRes.json();
            
            if (!resData.success || !Array.isArray(resData.data) || resData.data.length === 0) {
                // No restaurant exists
                window.location.href = "/restaurants/create";
                return;
            }

            const restaurant = resData.data[0];
            currentRestaurantId = restaurant.id;
            restaurantBranches = restaurant.branches || [];

            // 2. Fetch promotions
            await loadPromotions();

        } catch (err) {
            console.error(err);
            showToast("Failed to load dashboard data.", "error");
        }
    }

    async function loadPromotions() {
        try {
            const res = await apiRequest(`/api/restaurants/promotion/${currentRestaurantId}`, "GET");
            if (!res || !res.ok) throw new Error("Failed to fetch promotions");
            
            const json = await res.json();
            const promotions = json.data?.promotions || [];

            promotionsLoading.style.display = "none";

            if (promotions.length === 0) {
                promotionsEmpty.style.display = "flex";
                promotionsContainer.style.display = "none";
            } else {
                promotionsEmpty.style.display = "none";
                promotionsContainer.style.display = "flex";
                renderPromotions(promotions);
            }
        } catch (err) {
            console.error(err);
            showToast("Error loading promotions", "error");
            promotionsLoading.style.display = "none";
            promotionsEmpty.style.display = "flex";
        }
    }

    function renderPromotions(promotions) {
        const activePromotions = [];
        const pausedPromotions = [];
        const expiredPromotions = [];

        const now = new Date();

        promotions.forEach(promo => {
            const endDate = new Date(promo.endDate);
            const promoEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
            
            if (promoEndDate < now) {
                expiredPromotions.push(promo);
            } else if (promo.isActive) {
                activePromotions.push(promo);
            } else {
                pausedPromotions.push(promo);
            }
        });

        const activeContainer = $("activePromotionsContainer");
        const pausedContainer = $("pausedPromotionsContainer");
        const expiredContainer = $("expiredPromotionsContainer");

        if (activePromotions.length > 0) {
            activeContainer.style.display = "block";
            $("activePromotionsGrid").innerHTML = activePromotions.map(p => generatePromotionCard(p, "ACTIVE")).join("");
        } else {
            activeContainer.style.display = "none";
        }

        if (pausedPromotions.length > 0) {
            pausedContainer.style.display = "block";
            $("pausedPromotionsGrid").innerHTML = pausedPromotions.map(p => generatePromotionCard(p, "PAUSED")).join("");
        } else {
            pausedContainer.style.display = "none";
        }

        if (expiredPromotions.length > 0) {
            expiredContainer.style.display = "block";
            $("expiredPromotionsGrid").innerHTML = expiredPromotions.map(p => generatePromotionCard(p, "EXPIRED")).join("");
        } else {
            expiredContainer.style.display = "none";
        }
    }

    function generatePromotionCard(promo, category) {
        let typeColor = "bg-blue-100 text-blue-800";
        let typeLabel = promo.type;
        let valLabel = "";
        if (promo.type === "PERCENTAGE") { valLabel = `${promo.discountValue}% OFF`; typeColor = "bg-purple-100 text-purple-800"; }
        else if (promo.type === "FIXED") { valLabel = `₹${promo.discountValue} OFF`; typeColor = "bg-green-100 text-green-800"; }
        else if (promo.type === "FREE_DELIVERY") { valLabel = "Free Delivery"; typeColor = "bg-orange-100 text-orange-800"; }
        else if (promo.type === "BOGO") { valLabel = "Buy 1 Get 1"; typeColor = "bg-red-100 text-red-800"; }

        const isActive = promo.isActive;
        const toggleBg = isActive ? "bg-[#014f38]" : "bg-gray-200";
        const toggleBtn = isActive ? "translate-x-5" : "translate-x-1";

        const startDate = new Date(promo.startDate).toLocaleDateString();
        const endDate = new Date(promo.endDate).toLocaleDateString();

        let toggleHtml = "";
        if (category !== "EXPIRED") {
            toggleHtml = `
                <button onclick="togglePromotion('${promo.id}', ${!isActive})" class="w-10 h-5 rounded-full ${toggleBg} relative transition-colors duration-300 focus:outline-none">
                    <span class="w-3 h-3 bg-white rounded-full absolute top-1 left-0 transition-transform duration-300 transform ${toggleBtn}"></span>
                </button>
            `;
        }

        let badgeHtml = "";
        if (category === "ACTIVE") {
            badgeHtml = `<span class="text-green-600 font-bold">Active</span>`;
        } else if (category === "PAUSED") {
            badgeHtml = `<span class="text-gray-500 font-bold">Paused</span>`;
        } else {
            badgeHtml = `<span class="text-red-500 font-bold">Expired</span>`;
        }

        return `
            <div class="bg-white rounded-2xl p-6 border ${category === 'ACTIVE' ? 'border-[#014f38]/30 shadow-md' : 'border-[#ececec] shadow-sm opacity-70'} relative transition-all">
                
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${typeColor} mb-2 inline-block">${typeLabel}</span>
                        <h3 class="text-xl font-bold text-gray-900 line-clamp-1" title="${promo.title}">${promo.title}</h3>
                        ${promo.code ? `<p class="text-xs font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block border border-gray-200">${promo.code}</p>` : ''}
                    </div>
                    ${toggleHtml}
                </div>

                <div class="mb-4">
                    <p class="text-2xl font-black text-[#014f38]">${valLabel}</p>
                    ${promo.minimumOrderAmount ? `<p class="text-xs text-gray-500 mt-1">Min. Order: ₹${promo.minimumOrderAmount}</p>` : ''}
                    ${promo.maximumDiscountAmount ? `<p class="text-xs text-gray-500">Max Discount: ₹${promo.maximumDiscountAmount}</p>` : ''}
                </div>

                <div class="border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <div class="flex items-center gap-1">
                        <i class="fa-regular fa-calendar"></i>
                        <span>${startDate} - ${endDate}</span>
                    </div>
                    ${badgeHtml}
                </div>

            </div>
        `;
    }

    // ── Toggle Status API ─────────────────────────────────────────────────────
    window.togglePromotion = async (id, newStatus) => {
        try {
            const res = await apiRequest(`/api/restaurants/promotion/${id}/toggle`, "PATCH", { isActive: newStatus });
            if (!res || !res.ok) throw new Error("Failed to toggle promotion");
            showToast(`Promotion ${newStatus ? 'activated' : 'paused'}!`, "success");
            loadPromotions(); // refresh
        } catch(err) {
            console.error(err);
            showToast("Failed to toggle promotion status.", "error");
        }
    };

    // ── Form UI Logic ─────────────────────────────────────────────────────────

    function updateFormFields() {
        const type = promoType.value;
        
        // Reset hiding
        discountValueContainer.style.display = "block";
        maxDiscountContainer.style.display = "block";
        minOrderContainer.style.display = "block";
        bogoContainer.style.display = "none";
        $("promoDiscountValue").required = true;
        $("promoMaxDiscount").required = false;

        if (type === "FIXED") {                   
            maxDiscountContainer.style.display = "none";
        } else if (type === "PERCENTAGE") {
            $("promoMaxDiscount").required = true;
        } else if (type === "FREE_DELIVERY") {
            discountValueContainer.style.display = "none";
            maxDiscountContainer.style.display = "none";
            $("promoDiscountValue").required = false;
        } else if (type === "BOGO") {
            discountValueContainer.style.display = "none";
            maxDiscountContainer.style.display = "none";
            minOrderContainer.style.display = "none"; // based on user request
            bogoContainer.style.display = "block";
            $("promoDiscountValue").required = false;
            
            populateBranchesDropdown();
        }
    }

    promoType.addEventListener("change", updateFormFields);

    // BOGO Branch & Menu Logic
    function populateBranchesDropdown() {
        promoBranchSelect.innerHTML = `<option value="">-- Choose Branch --</option>` + 
            restaurantBranches.map(b => `<option value="${b.id}">${b.branchName}</option>`).join("");
    }

    promoBranchSelect.addEventListener("change", async (e) => {
        const branchId = e.target.value;
        if (!branchId) {
            menuItemsSelectionBlock.style.display = "none";
            return;
        }

        try {
            promoMenuItemsList.innerHTML = `<div class="text-center p-4"><i class="fa-solid fa-spinner fa-spin text-gray-400"></i></div>`;
            menuItemsSelectionBlock.style.display = "block";

            const res = await apiRequest(`/api/menu/full/${branchId}`, "GET");
            if(!res || !res.ok) throw new Error("Failed to fetch menu");
            const json = await res.json();
            const categories = json.data || [];

            let html = "";
            categories.forEach(cat => {
                if(cat.menuItems && cat.menuItems.length > 0) {
                    html += `<div class="font-bold text-xs text-gray-500 uppercase mt-2 mb-1 pl-1">${cat.name}</div>`;
                    cat.menuItems.forEach(item => {
                        html += `
                            <label class="flex items-center gap-3 p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition cursor-pointer">
                                <input type="checkbox" name="bogoItems" value="${item.id}" class="w-4 h-4 text-[#014f38] rounded border-gray-300 focus:ring-[#014f38]">
                                <span class="text-sm text-gray-800 font-medium">${item.name}</span>
                            </label>
                        `;
                    });
                }
            });

            if (html === "") html = `<p class="text-xs text-gray-500 p-2">No menu items found for this branch.</p>`;
            promoMenuItemsList.innerHTML = html;

        } catch (err) {
            console.error(err);
            promoMenuItemsList.innerHTML = `<p class="text-xs text-red-500 p-2">Error loading menu items.</p>`;
        }
    });

    // ── Create Modal Handlers ─────────────────────────────────────────────────

    function openModalHandler() {
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        updateFormFields();
    }

    function closeModalHandler() {
        modal.classList.add("hidden");
        document.body.style.overflow = "";
        errorEl.classList.add("hidden");
        form.reset();
        menuItemsSelectionBlock.style.display = "none";
    }

    if (openBtn) openBtn.addEventListener("click", openModalHandler);
    if (closeBtn) closeBtn.addEventListener("click", closeModalHandler);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModalHandler);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModalHandler(); });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!currentRestaurantId) {
            showToast("Restaurant not found.", "error");
            return;
        }

        const type = promoType.value;
        const payload = {
            title: $("promoTitle").value.trim(),
            type: type,
            startDate: $("promoStartDate").value,
            endDate: $("promoEndDate").value,
        };

        const codeVal = $("promoCode").value.trim();
        if (codeVal) payload.code = codeVal;

        if (type === "FIXED" || type === "PERCENTAGE") {
            payload.discountValue = parseFloat($("promoDiscountValue").value);
        }

        const minOrder = $("promoMinOrder").value;
        if (minOrder && type !== "BOGO") payload.minimumOrderAmount = parseFloat(minOrder);

        const maxDiscount = $("promoMaxDiscount").value;
        if (maxDiscount && type === "PERCENTAGE") payload.maximumDiscountAmount = parseFloat(maxDiscount);

        if (type === "BOGO") {
            const checkboxes = document.querySelectorAll('input[name="bogoItems"]:checked');
            const itemIds = Array.from(checkboxes).map(cb => cb.value);
            if (itemIds.length === 0) {
                errorEl.textContent = "Please select at least one menu item for BOGO.";
                errorEl.classList.remove("hidden");
                return;
            }
            payload.menuItemIds = itemIds;
        }

        btnText.textContent = "Creating...";
        btnSpinner.classList.remove("hidden");
        errorEl.classList.add("hidden");

        try {
            const res = await apiRequest(`/api/restaurants/promotion/${currentRestaurantId}`, "POST", payload);
            if (!res) return;
            const result = await res.json();

            if (res.ok && result.success) {
                showToast("Promotion created successfully!", "success");
                closeModalHandler();
                loadPromotions();
            } else {
                errorEl.textContent = result.message || "Failed to create promotion.";
                errorEl.classList.remove("hidden");
            }
        } catch (err) {
            console.error(err);
            errorEl.textContent = "An unexpected error occurred.";
            errorEl.classList.remove("hidden");
        } finally {
            btnText.textContent = "Create Promotion";
            btnSpinner.classList.add("hidden");
        }
    });

    // Start
    init();
});
