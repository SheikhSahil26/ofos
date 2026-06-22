
//load coupons on page load
document.addEventListener(
    "DOMContentLoaded",
    loadCoupons
);

async function loadCoupons() {

    const response =
        await apiRequest(
            "/api/coupons/admin/all",
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

    toggle.addEventListener(
        "change",
        () => updateCouponStatus(
            coupon.id,
            toggle.checked
        )
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
        () => openCouponStats(
            coupon.id
        )
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
}