
//load coupons on page load
document.addEventListener(
    "DOMContentLoaded",
    loadCoupons
);

async function loadCoupons() {

    const response =
        await apiRequest(
            "/api/coupons/admin/all?isDeleted=false",
            "GET"
        );

    if (!response) return;

    const result =
        await response.json();

    renderCoupons(
        result.data
    );
}

//render coupons
function renderCoupons(coupons) {

    const container =
        document.getElementById(
            "couponContainer"
        );

    container.innerHTML = "";

    coupons.forEach(coupon => {

        container.appendChild(
            createCouponCard(
                coupon
            )
        );
    });
}

function createCouponCard(coupon) {

    const template =
        document.getElementById(
            "couponTemplate"
        );

    const clone =
        template.content.cloneNode(
            true
        );

    clone.querySelector(
        ".coupon-code"
    ).textContent =
        coupon.code;

    clone.querySelector(
        ".coupon-type"
    ).textContent =
        coupon.type;

    clone.querySelector(
        ".coupon-discount"
    ).textContent =
        coupon.type === "PERCENTAGE"
            ? `${coupon.discountValue}% OFF`
            : `₹${coupon.discountValue} OFF`;

    clone.querySelector(
        ".coupon-min-order"
    ).textContent =
        `Min Order ₹${coupon.minOrderAmount || 0}`;

    clone.querySelector(
        ".coupon-max-discount"
    ).textContent =
        coupon.maxDiscount
            ? `Max Discount ₹${coupon.maxDiscount}`
            : "";

    clone.querySelector(
        ".coupon-usage-limit"
    ).textContent =
        coupon.usageLimit
            ? `Usage Limit ${coupon.usageLimit}`
            : "Unlimited Usage";

    clone.querySelector(
        ".coupon-validity"
    ).textContent =
        `${formatDate(coupon.startDate)} - ${formatDate(coupon.endDate)}`;
            
    
    //active inactive toggle
    const toggle =
        clone.querySelector(
            ".coupon-status-toggle"
        );


    toggle.checked =
        coupon.isActive;

    //show active inactive badge
    const badge =
        clone.querySelector(
            ".coupon-status-badge"
        );

    if (coupon.isActive) {

        badge.textContent =
            "Active";

        badge.className =
            "coupon-status-badge text-xs px-2 py-1 rounded-full bg-green-100 text-green-700";

    } else {

        badge.textContent =
            "Inactive";

        badge.className =
            "coupon-status-badge text-xs px-2 py-1 rounded-full bg-red-100 text-red-700";
    }
        
    toggle.addEventListener(
        "change",
        async () => {
           
            const success =
                await updateCouponStatus(
                    coupon.id,
                    toggle.checked
                );

              
            if (!success) return;
            if (toggle.checked) {
                
                badge.textContent =
                    "Active";

                badge.className =
                    "coupon-status-badge text-xs px-2 py-1 rounded-full bg-green-100 text-green-700";

            } else {

                badge.textContent =
                    "Inactive";

                badge.className =
                    "coupon-status-badge text-xs px-2 py-1 rounded-full bg-red-100 text-red-700";
            }
        }
    );

    

    //edit button
    clone.querySelector(
        ".edit-coupon-btn"
    ).addEventListener(
        "click",
        () => openEditCouponModal(
            coupon
        )
    );

    //stats button
    clone.querySelector(
        ".stats-coupon-btn"
    ).addEventListener(
        "click",
        () => openCouponStatsModal(
            coupon.id
        )
    );

    //delete btn
    clone.querySelector(".delete-coupon-btn")
    .addEventListener(
        "click",
        () => openDeleteCouponModal(coupon.id)
    );

    return clone;
}

//helper
function formatDate(date) {

    if (!date) return "N/A";

    return new Date(date)
        .toLocaleDateString();
}

//update coupon status (active / inactive)
async function updateCouponStatus(
    couponId,
    isActive
) {

    const response =
        await apiRequest(
            `/api/coupons/${couponId}/status`,
            "PATCH",
            { isActive }
        );

    if (!response) return;

    showToast(
        "Coupon status updated",
        "success"
    );
    return true;
}

//handle change in coupon type in creation
document
    .getElementById("couponType")
    .addEventListener(
        "change",
        handleCouponTypeChange
    );

function handleCouponTypeChange() {

    const couponType =
        document.getElementById(
            "couponType"
        ).value;

    const discountValueField =
        document.getElementById(
            "discountValueField"
        );

    const maxDiscountField =
        document.getElementById(
            "maxDiscountField"
        );

    if (!couponType) {

        discountValueField.classList.add("hidden");
        maxDiscountField.classList.add("hidden");

        return;
    }

    if (couponType === "PERCENTAGE") {

        discountValueField.classList.remove("hidden");
        maxDiscountField.classList.remove("hidden");

    }

    else if (couponType === "FLAT") {

        discountValueField.classList.remove("hidden");
        maxDiscountField.classList.add("hidden");

    }

    else if (
        couponType === "FREE_DELIVERY" ||
        couponType === "BOGO"
    ) {

        discountValueField.classList.add("hidden");
        maxDiscountField.classList.add("hidden");

    }

    
}

//open  create coupon modal
document
    .getElementById("addCouponBtn")
    .addEventListener(
        "click",
        openCouponModal
    );

function openCouponModal() {

    document
        .getElementById("editingCouponId")
        .value = "";

    document
        .getElementById("couponForm")
        .reset();

    document.querySelector(
        "#couponModal h2"
    ).textContent =
        "Create Coupon";

    document.querySelector(
        '#couponForm button[type="submit"]'
    ).textContent =
        "Create Coupon";

    handleCouponTypeChange();

    document
        .getElementById("couponModal")
        .classList.remove("hidden");

    document
        .getElementById("couponModal")
        .classList.add("flex");
}

//close create coupon modal
document
    .getElementById("closeCouponModal")
    .addEventListener(
        "click",
        closeCouponModal
    );

function closeCouponModal() {

    document
        .getElementById("couponModal")
        .classList.add("hidden");

    document
        .getElementById("couponModal")
        .classList.remove("flex");

    document
        .getElementById("couponForm")
        .reset();

    document
        .getElementById("editingCouponId")
        .value = "";

    document.querySelector(
        "#couponModal h2"
    ).textContent =
        "Create Coupon";

    document.querySelector(
        '#couponForm button[type="submit"]'
    ).textContent =
        "Create Coupon";
}

//handle create or edit coupon 
document
    .getElementById("couponForm")
    .addEventListener(
        "submit",
        handleCouponSubmit
    );

async function handleCouponSubmit(event) {

    const editingCouponId =
        document.getElementById(
            "editingCouponId"
        ).value;

    if (editingCouponId) {

        await updateCoupon(
            event,
            editingCouponId
        );

    } else {

        await createCoupon(event);
    }
}

//create coupon
async function createCoupon(event) {

    console.log("here")

    event.preventDefault();

    const type =
        document.getElementById(
            "couponType"
        ).value;

    const discountValue =
        document.getElementById(
            "discountValue"
        ).value;

    const maxDiscount =
        document.getElementById(
            "maxDiscount"
        ).value;

    const startDate =
        document.getElementById(
            "startDate"
        ).value;

    const endDate =
        document.getElementById(
            "endDate"
        ).value;

    if (
        startDate &&
        endDate &&
        new Date(endDate) <= new Date(startDate)
    ) {

        showToast(
            "End date must be after start date",
            "error"
        );

        return;
    }

    if (
        type === "PERCENTAGE" &&
        (!discountValue || !maxDiscount)
    ) {

        showToast(
            "Discount value and max discount are required",
            "error"
        );

        return;
    }

    if (
        type === "FLAT" &&
        !discountValue
    ) {

        showToast(
            "Discount value is required",
            "error"
        );

        return;
    }

    const payload = {

        code:
            document.getElementById(
                "couponCode"
            ).value.trim(),

        type,

        discountValue:
            discountValue
                ? Number(discountValue)
                : undefined,

        minOrderAmount:
            document.getElementById(
                "minOrderAmount"
            ).value
                ? Number(
                    document.getElementById(
                        "minOrderAmount"
                    ).value
                )
                : undefined,

        maxDiscount:
            maxDiscount
                ? Number(maxDiscount)
                : undefined,

        usageLimit:
            document.getElementById(
                "usageLimit"
            ).value
                ? Number(
                    document.getElementById(
                        "usageLimit"
                    ).value
                )
                : undefined,

        startDate: startDate
    ? new Date(startDate)
    : undefined,

endDate: endDate
    ? new Date(endDate)
    : undefined,

        isActive: true
    };

    console.log("payload",payload)

    const response =
        await apiRequest(
            "/api/coupons",
            "POST",
            payload
        );

    if (!response || !response.ok) {

    showToast(
        "Failed to create coupon",
        "error"
    );

    return;
}

    showToast(
        "Coupon created successfully",
        "success"
    );

    closeCouponModal();

    await loadCoupons();
}

//open edit coupon modal
function openEditCouponModal(coupon) {

    document.getElementById(
        "editingCouponId"
    ).value = coupon.id;

    document.getElementById(
        "couponCode"
    ).value = coupon.code;

    document.getElementById(
        "couponType"
    ).value = coupon.type;

    document.getElementById(
        "discountValue"
    ).value =
        coupon.discountValue || "";

    document.getElementById(
        "minOrderAmount"
    ).value =
        coupon.minOrderAmount || "";

    document.getElementById(
        "maxDiscount"
    ).value =
        coupon.maxDiscount || "";

    document.getElementById(
        "usageLimit"
    ).value =
        coupon.usageLimit || "";

    if (coupon.startDate) {

        document.getElementById(
            "startDate"
        ).value =
            coupon.startDate.slice(0, 16);
    }

    if (coupon.endDate) {

        document.getElementById(
            "endDate"
        ).value =
            coupon.endDate.slice(0, 16);
    }

    handleCouponTypeChange();

    document.querySelector(
        "#couponModal h2"
    ).textContent =
        "Edit Coupon";

    document.querySelector(
        '#couponForm button[type="submit"]'
    ).textContent =
        "Update Coupon";

    document.getElementById(
        "couponModal"
    ).classList.remove("hidden");

    document.getElementById(
        "couponModal"
    ).classList.add("flex");
}

//edit  coupon
async function updateCoupon(
    event,
    couponId
) {

    event.preventDefault();

    const payload = {

        code:
            document.getElementById(
                "couponCode"
            ).value.trim(),

        type:
            document.getElementById(
                "couponType"
            ).value,

        discountValue:
            document.getElementById(
                "discountValue"
            ).value
                ? Number(
                    document.getElementById(
                        "discountValue"
                    ).value
                )
                : undefined,

        minOrderAmount:
            document.getElementById(
                "minOrderAmount"
            ).value
                ? Number(
                    document.getElementById(
                        "minOrderAmount"
                    ).value
                )
                : undefined,

        maxDiscount:
            document.getElementById(
                "maxDiscount"
            ).value
                ? Number(
                    document.getElementById(
                        "maxDiscount"
                    ).value
                )
                : undefined,

        usageLimit:
            document.getElementById(
                "usageLimit"
            ).value
                ? Number(
                    document.getElementById(
                        "usageLimit"
                    ).value
                )
                : undefined,

        startDate:
            document.getElementById(
                "startDate"
            ).value
                ? new Date(
                    document.getElementById(
                        "startDate"
                    ).value
                )
                : undefined,

        endDate:
            document.getElementById(
                "endDate"
            ).value
                ? new Date(
                    document.getElementById(
                        "endDate"
                    ).value
                )
                : undefined
    };

    const response =
        await apiRequest(
            `/api/coupons/${couponId}`,
            "PUT",
            payload
        );

    if (!response || !response.ok)
        return;

    showToast(
        "Coupon updated successfully",
        "success"
    );

    closeCouponModal();

    await loadCoupons();
}

//open delete modal
function openDeleteCouponModal(couponId) {

    document.getElementById(
        "deletingCouponId"
    ).value =
        couponId;

    document.getElementById(
        "deleteCouponModal"
    ).classList.remove(
        "hidden"
    );

    document.getElementById(
        "deleteCouponModal"
    ).classList.add(
        "flex"
    );
}

//close delete modal
function closeDeleteCouponModal() {

    document.getElementById(
        "deletingCouponId"
    ).value = "";

    document.getElementById(
        "deleteCouponModal"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "deleteCouponModal"
    ).classList.remove(
        "flex"
    );
}

document
    .getElementById(
        "cancelDeleteCouponBtn"
    )
    .addEventListener(
        "click",
        closeDeleteCouponModal
    );

//confirm delete coupon
document
    .getElementById(
        "confirmDeleteCouponBtn"
    )
    .addEventListener(
        "click",
        deleteCoupon
    );

//delete 
async function deleteCoupon() {

    const couponId =
        document.getElementById(
            "deletingCouponId"
        ).value;

    const response =
        await apiRequest(
            `/api/coupons/${couponId}`,
            "DELETE"
        );

    if (!response || !response.ok) {

        showToast(
            "Failed to delete coupon",
            "error"
        );

        return;
    }

    showToast(
        "Coupon deleted successfully",
        "success"
    );

    closeDeleteCouponModal();

    await loadCoupons();
}

//coupon stats mdoal
async function openCouponStatsModal(couponId) {

    const response =
        await apiRequest(
            `/api/coupons/${couponId}/usage-stats`
        );

    if (!response.ok) return;

    const result =
        await response.json();

    const stats =
        result.data;

    renderCouponStats(stats);

    document
        .getElementById("couponStatsModal")
        .classList.remove("hidden");

    document
        .getElementById("couponStatsModal")
        .classList.add("flex");
}

function renderCouponStats(stats) {

    document.getElementById(
        "statsCouponCode"
    ).textContent =
        stats.couponCode;

    document.getElementById(
        "statsUsageLimit"
    ).textContent =
        stats.usageLimit ?? "Unlimited";

    document.getElementById(
        "statsTotalUses"
    ).textContent =
        stats.totalUsageCount;

    document.getElementById(
        "statsUniqueCustomers"
    ).textContent =
        stats.uniqueCustomers;

    document.getElementById(
        "statsRemainingUsage"
    ).textContent =
        stats.remainingUsage ?? "Unlimited";

    document.getElementById(
        "statsRevenue"
    ).textContent =
        `₹${stats.totalRevenueGenerated}`;


        const usageLimit =
    stats.usageLimit || stats.totalUsageCount;

const progress =
    (stats.totalUsageCount / usageLimit) * 100;

document.getElementById(
    "statsUsageProgress"
).textContent =
    `${stats.totalUsageCount} / ${usageLimit}`;

document.getElementById(
    "statsProgressBar"
).style.width =
    `${Math.min(progress, 100)}%`;



    const tbody =
    document.getElementById(
        "couponUsageTableBody"
    );

    tbody.innerHTML = "";

   stats.recentUsages.forEach(usage => {

    const row =
        document.createElement("tr");

    row.className =
        "hover:bg-gray-50 transition-colors";

    row.innerHTML = `
       <td class="px-5 py-4">
            <div class="font-medium text-gray-900">
                ${usage.customerName}
            </div>
        </td>

        <td class="px-5 py-4 font-mono text-sm text-gray-600">
            ${usage.orderId.slice(0, 8)}
        </td>

        <td class="px-5 py-4 text-gray-500">
            ${new Date(
                usage.usedAt
            ).toLocaleDateString()}
        </td>
    `;

    tbody.appendChild(row);
});
}

//close coupon usage modal
document
    .getElementById(
        "closeCouponStatsModal"
    )
    .addEventListener(
        "click",
        closeCouponStatsModal
    );

function closeCouponStatsModal() {

    document
        .getElementById(
            "couponStatsModal"
        )
        .classList.add("hidden");

    document
        .getElementById(
            "couponStatsModal"
        )
        .classList.remove("flex");
}