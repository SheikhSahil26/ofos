const reviewContainer = document.getElementById("reviewContainer");
const reviewTemplate = document.getElementById("reviewTemplate");

const reviews = [
    {
        id: "1",
        customerName: "Rahul Sharma",
        branchName: "Satellite Branch",
        rating: 4.8,
        orderNumber: "ORD-10024",
        reviewDate: "25 Jun 2026",
        comment:
            "The pizza was absolutely delicious. The crust was perfectly baked and delivery was faster than expected.",
        ownerReply:
            "Thank you for your wonderful feedback ❤️",
        images: [],
    },
    {
        id: "2",
        customerName: "Priya Patel",
        branchName: "CG Road Branch",
        rating: 5,
        orderNumber: "ORD-10045",
        reviewDate: "24 Jun 2026",
        comment:
            "Loved the burger and fries. Will definitely order again.",
        ownerReply: null,
        images: [],
    },
    {
        id: "3",
        customerName: "Amit Shah",
        branchName: "SG Highway Branch",
        rating: 3.5,
        orderNumber: "ORD-10082",
        reviewDate: "22 Jun 2026",
        comment:
            "Food tasted good but delivery took almost an hour.",
        ownerReply: null,
        images: [],
    },
];

//render reviews
function renderReviews(data) {

    reviewContainer.innerHTML = "";


    if (reviews.length === 0) {

        reviewContainer.innerHTML = `
            <div class="col-span-full bg-white rounded-2xl shadow-sm p-16 text-center">

                <i class="fa-regular fa-star text-6xl text-[#014f38] mb-6"></i>

                <h2 class="text-2xl font-semibold text-gray-700">
                    No Reviews Yet
                </h2>

                <p class="text-gray-500 mt-3">
                    Customer reviews will appear here once orders are completed.
                </p>

            </div>
        `;

        return;
    }

    data.forEach(review => {

        const clone = reviewTemplate.content.cloneNode(true);

        clone.querySelector(".review-avatar").textContent =
            review.user.fullName.charAt(0).toUpperCase();

        clone.querySelector(".review-customer").textContent =
            review.user.fullName;

        clone.querySelector(".review-branch").textContent =
            review.branch.branchName;

        // Format the date nicely
        clone.querySelector(".review-date").textContent =
            new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });

        // Overall rating (average of the three ratings)
        const overallRating =
            (
                (review.foodRating +
                    review.deliveryRating +
                    review.packagingRating) / 3
            ).toFixed(1);

        clone.querySelector(".review-rating").innerHTML =
            `<i class="fa-solid fa-star mr-1 text-yellow-500"></i> ${overallRating}`;

        // Order number isn't in the response
        clone.querySelector(".review-order").innerHTML =
            `<i class="fa-solid fa-receipt"></i> ${review.orderId}`;

        clone.querySelector(".review-comment").textContent =
            review.reviewText || "No review provided.";

    

        const viewOrderButton =
            clone.querySelector(".view-order-btn");

        viewOrderButton.addEventListener("click", () => {
            window.location.href = `/restaurants/orders/${review.orderId}`;
        });

        reviewContainer.appendChild(clone);

    });

}

loadReviews();

async function loadReviews() {

    try {

        reviewContainer.innerHTML = `
            <div class="col-span-full flex justify-center py-16">
                <i class="fa-solid fa-spinner fa-spin text-3xl text-[#014f38]"></i>
            </div>
        `;

        const response = await apiRequest("/api/review");

        if (!response) {
            return;
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to load reviews.");
        }

        renderReviews(result.data.reviews);

    } catch (error) {

        console.error(error);

        reviewContainer.innerHTML = `
            <div class="col-span-full bg-white rounded-2xl p-10 text-center">

                <i class="fa-solid fa-circle-exclamation text-5xl text-red-500 mb-4"></i>

                <h3 class="text-xl font-semibold text-gray-700">
                    Unable to load reviews
                </h3>

                <p class="text-gray-500 mt-2">
                    Please try again later.
                </p>

            </div>
        `;

    }

}