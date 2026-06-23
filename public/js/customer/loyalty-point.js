// document.addEventListener(
//     "DOMContentLoaded",
//     () => {
//         loadLoyaltyOverview();
//     }
// );

// let currentPage = 1;

// let totalPages = 1;

// let currentType = "all";

// let currentDate = "all";

// async function loadLoyaltyOverview() {

//     try {

//         const response =
//             await apiRequest(
//                 `/api/users/loyalty-points?page=${currentPage}&limit=10&type=${currentType}&date=${currentDate}`
//             );

//         if (!response) return;

//         const result =
//             await response.json();

//         if (!response.ok) {

//             showToast(
//                 result.message,
//                 "error"
//             );

//             return;
//         }

//         renderStats(
//             result.data.summary
//         );

//         renderTransactions(
//             result.data.transactions
//         );

//         renderPagination(
//             result.data.pagination
//         );

//     } catch (error) {

//         console.error(error);

//         showToast(
//             "Failed to load loyalty data",
//             "error"
//         );
//     }
// }

// //render stats
// function renderStats(summary) {

//     setText(
//         "currentPoints",
//         summary.currentPoints
//     );

//     setText(
//         "totalEarned",
//         summary.totalEarned
//     );

//     setText(
//         "totalRedeemed",
//         summary.totalRedeemed
//     );

//     setText(
//         "totalTransactions",
//         summary.totalTransactions
//     );
// }

// function setText(
//     elementId,
//     value
// ) {

//     const element =
//         document.getElementById(
//             elementId
//         );

//     if (element) {
//         element.textContent =
//             value;
//     }
// }

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeFilters();

        loadLoyaltyOverview();
    }
);

let currentPage = 1;

let currentType = "all";

let currentDate = "all";

// =========================
// LOAD DASHBOARD
// =========================

async function loadLoyaltyOverview() {

    try {

        const response =
            await apiRequest(
                `/api/users/loyalty-points?page=${currentPage}&limit=10&type=${currentType}&date=${currentDate}`
            );

        if (!response) return;

        const result =
            await response.json();

        if (!response.ok) {

            showToast(
                result.message ||
                "Failed to load loyalty data",
                "error"
            );

            return;
        }

        renderStats(
            result.data.summary
        );

        renderTransactions(
            result.data.transactions
        );

        renderPagination(
            result.data.pagination
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to load loyalty data",
            "error"
        );
    }
}

// =========================
// STATS
// =========================

function renderStats(summary) {

    setText(
        "currentPoints",
        summary.currentPoints
    );

    setText(
        "totalEarned",
        summary.totalEarned
    );

    setText(
        "totalRedeemed",
        summary.totalRedeemed
    );

    setText(
        "totalTransactions",
        summary.totalTransactions
    );
}

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (element) {

        element.textContent =
            value ?? 0;
    }
}

// =========================
// FILTERS
// =========================

function initializeFilters() {

    document
        .getElementById(
            "transactionTypeFilter"
        )
        ?.addEventListener(
            "change",
            event => {

                currentType =
                    event.target.value;

                currentPage = 1;

                loadLoyaltyOverview();
            }
        );

    document
        .getElementById(
            "transactionDateFilter"
        )
        ?.addEventListener(
            "change",
            event => {

                currentDate =
                    event.target.value;

                currentPage = 1;

                loadLoyaltyOverview();
            }
        );
}

// =========================
// TRANSACTIONS
// =========================

function renderTransactions(
    transactions
) {

    const container =
        document.getElementById(
            "transactionTableBody"
        );

    if (!container) return;

    container.innerHTML = "";

    if (!transactions.length) {

        container.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="text-center py-6 text-gray-500">

                    No transactions found

                </td>
            </tr>
        `;

        return;
    }

    transactions.forEach(
        transaction => {

            const isEarned =
                transaction.points > 0;

            container.insertAdjacentHTML(
                "beforeend",
                `
                <tr class="border-b">

                    <td class="py-4">

                        <span class="
                            ${
                                isEarned
                                ? "text-green-600"
                                : "text-red-500"
                            }
                            font-medium">

                            ${
                                transaction.type === "EARN"
                                ? "Earned"
                                : "Redeemed"
                            }

                        </span>

                    </td>

                    <td class="py-4 font-semibold">

                        <span class="
                            ${
                                isEarned
                                ? "text-green-600"
                                : "text-red-500"
                            }
                            font-medium">
                            ${
                                isEarned
                                ? "+"
                                : "-"
                            }
                            ${Math.abs(transaction.points)}
                        </span>

                    </td>

                    <td class="py-4 text-gray-500">

                        ${formatDate(
                            transaction.createdAt
                        )}

                    </td>

                </tr>
                `
            );
        }
    );
}

// =========================
// PAGINATION
// =========================

function renderPagination(
    pagination
) {

    const container =
        document.getElementById(
            "paginationContainer"
        );

    if (!container) return;

    container.innerHTML = "";

    const {
        page,
        totalPages
    } = pagination;

    if (totalPages <= 1) {

        return;
    }

    container.insertAdjacentHTML(
        "beforeend",
        `
        <button
            ${
                page === 1
                    ? "disabled"
                    : ""
            }
            onclick="changePage(${page - 1})"
            class="px-4 py-2 border rounded-xl">

            Previous

        </button>
        `
    );

    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        container.insertAdjacentHTML(
            "beforeend",
            `
            <button
                onclick="changePage(${i})"
                class="
                    px-4 py-2 rounded-xl
                    ${
                        i === page
                            ? "bg-[#014f38] text-white"
                            : "border"
                    }
                ">

                ${i}

            </button>
            `
        );
    }

    container.insertAdjacentHTML(
        "beforeend",
        `
        <button
            ${
                page === totalPages
                    ? "disabled"
                    : ""
            }
            onclick="changePage(${page + 1})"
            class="px-4 py-2 border rounded-xl">

            Next

        </button>
        `
    );
}

function changePage(
    page
) {

    currentPage = page;

    loadLoyaltyOverview();
}

// =========================
// DATE FORMATTER
// =========================

function formatDate(
    date
) {

    return new Date(date)
        .toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
}