
const orderId =
    window.location.pathname.split("/").pop();

const orderItemsContainer =
    document.getElementById("orderItemsContainer");

const orderItemTemplate =
    document.getElementById("orderItemTemplate");

const reviewImagesContainer =
    document.getElementById("reviewImagesContainer");

const reviewImageTemplate =
    document.getElementById("reviewImageTemplate");

loadOrder();

async function loadOrder() {

    const response =
        await apiRequest(`/api/orders/details/${orderId}`);

    const result =
        await response.json();

    const order = result.data;

    populateHeader(order);

    populateCustomer(order);

    populateDelivery(order);

    populateBill(order);

    populateItems(order.orderItems);

    populateReview(order.review);
}


function populateHeader(order){

    console.log(order)

    document.querySelector(".order-date").textContent =
        `Placed on ${new Date(order.placedAt).toLocaleString()}`;

    document.querySelector(".order-number").textContent =
        order.orderNumber;

    const status =
        document.querySelector(".order-status");

    status.textContent =
        order.status;

    status.className =
        "order-status px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold";
}



function populateCustomer(order){

    document.querySelector(".customer-avatar").textContent =
        order.customer.fullName.charAt(0).toUpperCase();

    document.querySelector(".customer-name").textContent =
        order.customer.fullName;

    document.querySelector(".customer-mobile").textContent =
        order.customer.mobile;

    document.querySelector(".customer-address").textContent =
        `${order.address.addressLine1},
${order.address.addressLine2 ?? ""},
${order.address.city},
${order.address.state}
${order.address.pincode}`;
}



function populateDelivery(order){

    if(!order.delivery){

        document.querySelector(".partner-name").textContent =
            "Not Assigned";

        return;
    }

    document.querySelector(".partner-name").textContent =
        order.delivery.currentPartner?.user?.fullName ??
        "Not Assigned";

    document.querySelector(".accepted-time").textContent =
        order.delivery.acceptedAt ?
        new Date(order.delivery.acceptedAt).toLocaleTimeString() :
        "-";

    document.querySelector(".pickedup-time").textContent =
        order.delivery.pickedUpAt ?
        new Date(order.delivery.pickedUpAt).toLocaleTimeString() :
        "-";

    document.querySelector(".delivered-time").textContent =
        order.delivery.deliveredAt ?
        new Date(order.delivery.deliveredAt).toLocaleTimeString() :
        "-";
}



function populateBill(order){

    document.querySelector(".subtotal").textContent =
        `₹${order.subtotal}`;

    document.querySelector(".tax-amount").textContent =
        `₹${order.taxAmount}`;

    document.querySelector(".delivery-fee").textContent =
        `₹${order.deliveryFee}`;

    document.querySelector(".discount").textContent =
        `- ₹${order.discountAmount}`;

    document.querySelector(".total").textContent =
        `₹${order.totalAmount}`;
}



function populateItems(items){

    orderItemsContainer.innerHTML = "";

    items.forEach(item => {

        const clone =
            orderItemTemplate.content.cloneNode(true);

        clone.querySelector(".item-name").textContent =
            item.menuItemName;

        clone.querySelector(".item-price").textContent =
            `₹${item.price}`;

        clone.querySelector(".item-quantity").textContent =
            `x${item.quantity}`;

        if(item.specialInstruction){

            clone.querySelector(".special-instruction")
                .classList.remove("hidden");

            clone.querySelector(".instruction-text")
                .textContent =
                item.specialInstruction;

        }

        if(item.modifiers.length){

            clone.querySelector(".modifier-section")
                .classList.remove("hidden");

            const container =
                clone.querySelector(".modifier-container");

            item.modifiers.forEach(modifier=>{

                const badge =
                    document.createElement("span");

                badge.className =
                    "bg-[#014f38]/10 text-[#014f38] px-3 py-1 rounded-full text-sm";

                badge.textContent =
                    `${modifier.modifierName} (+₹${modifier.extraPrice})`;

                container.appendChild(badge);

            });

        }

        orderItemsContainer.appendChild(clone);

    });

}



function populateReview(review){

    if(!review){

        document.getElementById("reviewSection")
            .classList.add("hidden");

        document.getElementById("noReview")
            .classList.remove("hidden");

        return;
    }

    const overall =
        (
            (
                review.foodRating +
                review.deliveryRating +
                review.packagingRating
            ) / 3
        ).toFixed(1);

    document.querySelector(".overall-rating")
        .textContent =
        `⭐ ${overall}`;

    document.querySelector(".food-rating").innerHTML =
        renderStars(review.foodRating);

    document.querySelector(".delivery-rating").innerHTML =
        renderStars(review.deliveryRating);

    document.querySelector(".packaging-rating").innerHTML =
        renderStars(review.packagingRating);

    document.querySelector(".review-text")
        .textContent =
        review.reviewText ?? "-";

    console.log(review.images);
console.log(review.images?.length);

    const imagesSection =
        document.querySelector(".review-images");

    if (!review.images || review.images.length === 0) {

        imagesSection.classList.add("hidden");

    } else {

        imagesSection.classList.remove("hidden");

        reviewImagesContainer.innerHTML = "";

        review.images.forEach(image => {

            const clone =
                reviewImageTemplate.content.cloneNode(true);

            clone.querySelector(".review-image").src =
                image.imageUrl;

            reviewImagesContainer.appendChild(clone);

        });

    }

}

function renderStars(rating) {
    let html = "";

    for (let i = 1; i <= 5; i++) {
        html += `<i class="fa-solid fa-star ${
            i <= rating ? "text-[#ff7a00]" : "text-gray-300"
        }"></i>`;
    }

    return html;
}
