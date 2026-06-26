let currentPage = 1;

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadStats();
        loadPartners(1);

    }
);

async function loadStats() {

    try {

        const response =
            await apiRequest(
                "http://localhost:8080/api/admin/delivery-partners/stats",
                "GET"
            );

        const result = await response.json();
        const stats = result.data;

        console.log(stats)

        document.getElementById(
            "totalPartners"
        ).innerText =
            stats.totalPartners;

        document.getElementById(
            "activePartners"
        ).innerText =
            stats.activePartners;

        document.getElementById(
            "onDeliveryPartners"
        ).innerText =
            stats.onDeliveryPartners;

        document.getElementById(
            "inactivePartners"
        ).innerText =
            stats.inactivePartners;

        document.getElementById(
            "suspendedPartners"
        ).innerText =
            stats.suspendedPartners;

    } catch (error) {

        console.error(error);

    }
}

async function loadPartners(page = 1) {

    currentPage = page;

    try {

        const search =
            document.getElementById(
                "searchInput"
            ).value;

        const status =
            document.getElementById(
                "statusFilter"
            ).value;

        const vehicleType =
            document.getElementById(
                "vehicleFilter"
            ).value;

        const response =
            await apiRequest(
                `http://localhost:8080/api/admin/delivery-partners?page=${page}&search=${search}&status=${status}&vehicleType=${vehicleType}`,
                "GET"
            );

        const result = await response.json();

        renderTable(
            result.data.partners
        );

        renderPagination(
            result.data.pagination
        );

    } catch (error) {

        console.error(error);

    }
}

function renderTable(partners) {

    const tbody =
        document.getElementById(
            "partnerTableBody"
        );

    tbody.innerHTML = "";

    console.log(partners)

    partners.forEach(partner => {

        tbody.innerHTML += `
        <tr class="border-b">

            <td class="p-4">

                <div class="flex items-center gap-3">

                    <img
                        src="${partner.profilePhoto || '/images/default-user.png'}"
                        class="w-12 h-12 rounded-full object-cover">

                    <div>

                        <h4 class="font-semibold">
                            ${partner.fullName}
                        </h4>

                        <p class="text-sm text-gray-500">
                            ${partner.email}
                        </p>

                    </div>

                </div>

            </td>

            <td>${partner.mobile}</td>

            <td>${partner.vehicleType}</td>

            <td>${partner.vehicleNumber}</td>

            <td class="text-center">
                ${partner.totalDeliveries}
            </td>

            <td class="text-center">
                ₹${partner.totalEarnings}
            </td>

            <td class="text-center">
                ⭐ ${partner.rating || 0}
            </td>

            <td class="text-center">

                <span class="
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    font-medium
                    bg-green-100
                    text-green-700
                ">
                    ${partner.status}
                </span>

            </td>

            <td class="text-center">

                <button
                    onclick="viewPartner('${partner.id}')"
                    class="
                        bg-blue-500
                        text-white
                        px-3
                        py-2
                        rounded-lg
                    ">
                    View
                </button>

            </td>

        </tr>
        `;
    });
}

function renderPagination(pagination) {

    const container =
        document.getElementById(
            "paginationContainer"
        );

    container.innerHTML = "";

    const totalPages =
        Math.ceil(
            pagination.total /
            pagination.limit
        );

    for (let i = 1; i <= totalPages; i++) {

        container.innerHTML += `
            <button
                onclick="loadPartners(${i})"
                class="
                px-4
                py-2
                rounded
                ${i === currentPage
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200'}
            ">
                ${i}
            </button>
        `;
    }
}

function viewPartner(id) {

    window.location.href =
        `http://localhost:8080/api/admin/delivery-partners/${id}`;

}