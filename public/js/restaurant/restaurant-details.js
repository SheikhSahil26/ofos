const restaurantPage =
    document.getElementById("restaurantPage");

const heroContainer =
    document.getElementById("restaurantHero");

const promotionContainer =
    document.getElementById("promotionContainer");

const categoryTabsContainer =
    document.getElementById("categoryTabs");

const menuContainer =
    document.getElementById("menuContainer");

const modifierModal =
    document.getElementById("modifierModal");

const modifierContent =
    document.getElementById("modifierContent");

const closeModifierModalBtn =
    document.getElementById("closeModifierModal");

let branchData = null;

let menuData = [];

let promotionsData = [];

let restaurantId = null;

/* =====================================
INIT
===================================== */
console.log("Restaurant js file");



/* =====================================
PAGE INITIALIZATION
===================================== */

async function initializePage(
    branchId
) {


    try {

        const pageData =
            await fetchRestaurantPageData(
                branchId
            );

        branchData =
            pageData.branch;

        menuData =
            pageData.menu;

        promotionsData =
            pageData.promotions;

        restaurantId =
            branchData.restaurant?.id;

        // Render all components after data is fetched
        renderHeroSection();
        renderPromotions();
        renderCategoryTabs();
        renderMenu();


    } catch (error) {

        console.error(error);

        renderErrorState();
    }


}

/* =====================================
FETCH APIS
===================================== */

async function fetchRestaurantPageData(
    branchId
) {

    const response =
        await apiRequest(
            `/api/restaurants/restaurant-page/${branchId}`
        );

    if (!response.ok) {

        throw new Error(
            "Failed to fetch page data"
        );

    }

    const result =
        await response.json();

    return result.data;
}




/* =====================================
HERO SECTION
===================================== */

function renderHeroSection() {


    const restaurant =
        branchData.restaurant || {};

    const branch =
        branchData;

    const image =
        restaurant.coverImageUrl ||
        restaurant.logoUrl ||
        "/images/restaurant-placeholder.jpg";

    heroContainer.innerHTML = `

    <div class="lg:flex">

        <div class="lg:w-[420px]">

            <img
                src="${image}"
                alt="${restaurant.name || ''}"
                class="
                w-full
                h-[320px]
                lg:h-full
                object-cover
                "
            >

        </div>

        <div class="flex-1 p-6 lg:p-8">

            <div
                class="
                flex
                flex-col
                lg:flex-row
                lg:justify-between
                gap-6
                "
            >

                <div>

                    <h1
                        class="
                        text-3xl
                        lg:text-4xl
                        font-bold
                        text-gray-900
                        "
                    >
                        ${restaurant.name || "Restaurant"}
                    </h1>

                    <p
                        class="
                        mt-3
                        text-gray-500
                        leading-relaxed
                        "
                    >
                        ${restaurant.description ||
        "Delicious food delivered fresh to your doorstep."
        }
                    </p>

                </div>

                <div
                    class="
                    bg-[#014f38]
                    text-white
                    px-5
                    py-4
                    rounded-2xl
                    min-w-[140px]
                    "
                >

                    <p
                        class="
                        text-2xl
                        font-bold
                        "
                    >
                        N/A
                    </p>

                    <p
                        class="
                        text-xs
                        mt-1
                        "
                    >
                        Ratings
                    </p>

                </div>

            </div>

            <div
                class="
                flex
                flex-wrap
                gap-6
                mt-8
                text-sm
                text-gray-600
                "
            >

                <div>
                    <i class="fa-solid fa-location-dot mr-2"></i>
                    ${branch.city || ""}, ${branch.state || ""}
                </div>

                <div>
                    <i class="fa-solid fa-phone mr-2"></i>
                    ${branch.contactNumber ||
        "N/A"
        }
                </div>

                <div>
                    <i class="fa-regular fa-clock mr-2"></i>
                    ${getTodayHours() ||
        "Open Today"
        }
                </div>

            </div>

            <div
                class="
                flex
                flex-wrap
                gap-4
                mt-6
                "
            >

                <div
                    class="
                    px-4
                    py-2
                    rounded-xl
                    bg-green-50
                    text-green-700
                    text-sm
                    "
                >
                    Delivery Radius:
                    ${branch.deliveryRadiusKm ??
        0
        } km
                </div>

                ${branch.isPrimary
            ? `
                    <div
                        class="
                        px-4
                        py-2
                        rounded-xl
                        bg-[#fff1e5]
                        text-[#ff7a00]
                        text-sm
                        "
                    >
                        Primary Branch
                    </div>
                `
            : ""
        }

            </div>

        </div>

    </div>

`;


}

/* =====================================
PROMOTIONS
===================================== */

function renderPromotions() {


    if (
        !promotionsData.length
    ) {

        promotionContainer.classList.add(
            "hidden"
        );

        return;
    }

    const promotion =
        promotionsData[0];

    promotionContainer.classList.remove(
        "hidden"
    );

    promotionContainer.innerHTML = `

    <div
        class="
        bg-[#014f38]
        text-white
        rounded-[24px]
        p-5
        "
    >

        <div
            class="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-4
            "
        >

            <div>

                <h3
                    class="
                    text-xl
                    font-semibold
                    "
                >
                    ${promotion.title}
                </h3>

                <p
                    class="
                    mt-2
                    text-white/80
                    "
                >
                    Coupon:
                    ${promotion.code}
                </p>

            </div>

            <div
                class="
                text-right
                "
            >

                <p
                    class="
                    text-2xl
                    font-bold
                    "
                >
                    ${promotion.discountValue}
                </p>

                <p
                    class="
                    text-sm
                    text-white/70
                    "
                >
                    Min Order ₹
                    ${promotion.minimumOrderAmount ||
        0
        }
                </p>

            </div>

        </div>

    </div>

`;


}

/* =====================================
CATEGORY TABS
===================================== */

function renderCategoryTabs() {


    categoryTabsContainer.innerHTML =
        "";

    if (
        !menuData.length
    ) {

        return;
    }

    menuData.forEach(
        (
            category,
            index
        ) => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                `
            category-tab
            shrink-0
            px-4
            lg:px-6
            py-2
            lg:py-3
            rounded-lg
            border
            transition
            whitespace-nowrap
            text-sm
            lg:text-base
            font-medium
            ${index === 0
                    ? "bg-[#ff7a00] text-white border-[#ff7a00]"
                    : "bg-white border-[#e5e7eb] text-gray-700 hover:border-[#ff7a00] hover:text-[#ff7a00]"
                }
        `;

            button.textContent =
                category.name;

            button.dataset.categoryId =
                category.id;

            categoryTabsContainer.appendChild(
                button
            );

        }
    );


}

/* =====================================
MENU RENDERING
===================================== */

function renderMenu() {


    if (!menuData.length) {

        const template =
            document
                .getElementById(
                    "emptyMenuTemplate"
                );

        menuContainer.innerHTML =
            "";

        menuContainer.appendChild(
            template.content.cloneNode(
                true
            )
        );

        return;
    }

    menuContainer.innerHTML =
        "";

    menuData.forEach(
        (category) => {

            const section =
                document.createElement(
                    "section"
                );

            section.id =
                `category-${category.id}`;

            section.dataset.categoryId =
                category.id;

            section.className =
                "bg-white rounded-[24px] border border-[#ececec] p-6 lg:p-8 shadow-sm";

            section.innerHTML = `

            <div class="mb-6 pb-6 border-b border-gray-100">

                <div class="flex items-center justify-between">
                    <h2 class="text-2xl lg:text-3xl font-bold text-gray-900">
                        ${category.name}
                    </h2>

                    <span class="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                        ${category.menuItems
                    ?.length || 0
                } Items
                    </span>
                </div>

            </div>

            <div
                class="space-y-5"
                id="items-${category.id}"
            ></div>

        `;

            menuContainer.appendChild(
                section
            );

            const itemsContainer =
                document.getElementById(
                    `items-${category.id}`
                );

            (
                category.menuItems || []
            ).forEach(
                (item) => {

                    itemsContainer
                        .appendChild(
                            createMenuItemCard(
                                item,
                                category.id
                            )
                        );

                }
            );

        }
    );

    bindCategoryScrolling();


}

/* =====================================
MENU ITEM CARD
===================================== */

function createMenuItemCard(
    item,
    categoryId
) {


    const card =
        document.createElement(
            "div"
        );

    const isVeg =
        item.tags?.some(
            tag =>
                tag.dietaryTag
                    ?.name
                    ?.toLowerCase()
                    .includes("veg")
        );

    const isAvailable =
        item.isAvailable;

    const hasModifiers =
        item.modifierGroups
            ?.length > 0;

    card.className = `
    bg-white
    rounded-[24px]
    border
    border-[#ececec]
    p-5
    shadow-sm
`;

    card.innerHTML = `

    <div class="flex flex-col md:flex-row gap-5">

        <img
            src="${item.imageUrl ||
        '/images/food-placeholder.jpg'
        }"
            alt="${item.name}"
            class="
            w-full
            md:w-40
            h-40
            object-cover
            rounded-2xl
            "
        >

        <div class="flex-1 flex flex-col justify-between">

            <div>

                <div class="flex flex-wrap gap-2 mb-3">

                    ${isVeg
            ? `
                        <span class="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                            Veg
                        </span>
                    `
            : ""
        }

                    ${item.isBestseller
            ? `
                        <span class="px-2 py-1 rounded-full text-xs bg-[#fff1e5] text-[#ff7a00]">
                            Bestseller
                        </span>
                    `
            : ""
        }

                </div>

                <h3 class="text-xl font-semibold text-gray-900">
                    ${item.name}
                </h3>

                <p class="text-gray-500 mt-2 leading-relaxed">
                    ${item.description ||
        "No description available."
        }
                </p>

            </div>

            <div class="mt-5 flex items-center justify-between">

                <div>

                    <p class="text-2xl font-bold text-gray-900">
                        ₹${item.price}
                    </p>

                    <p class="
                        text-sm
                        mt-1
                        ${isAvailable
            ? "text-green-600"
            : "text-red-500"
        }
                    ">
                        ${isAvailable
            ? "Available"
            : "Currently Unavailable"
        }
                    </p>

                </div>

                <button
                    class="
                    add-to-cart-btn
                    bg-[#ff7a00]
                    hover:bg-[#ea6f00]
                    text-white
                    px-6
                    py-3
                    rounded-xl
                    font-semibold
                    transition
                    disabled:bg-gray-400
                    disabled:hover:bg-gray-400
                    disabled:cursor-not-allowed
                    "
                    data-item-id="${item.id}"
                    data-category-id="${categoryId}"
                    data-branch-id="${getBranchIdFromUrl()}"
                    data-has-modifiers="${hasModifiers}"
                    ${!isAvailable
            ? "disabled"
            : ""
        }
                >
                    Add +
                </button>

            </div>

        </div>

    </div>

`;

    return card;


}

/* =====================================
CATEGORY SCROLLING
===================================== */

function bindCategoryScrolling() {


    const tabs =
        document.querySelectorAll(
            ".category-tab"
        );

    tabs.forEach(
        (tab) => {

            tab.addEventListener(
                "click",
                () => {

                    const categoryId =
                        tab.dataset
                            .categoryId;

                    const section =
                        document.getElementById(
                            `category-${categoryId}`
                        );

                    if (!section)
                        return;

                    section.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start"
                    });

                }
            );

        }
    );

    setupScrollSpy();


}

/* =====================================
SCROLL SPY
===================================== */

function setupScrollSpy() {


    const sections =
        document.querySelectorAll(
            "[data-category-id]"
        );

    const observer =
        new IntersectionObserver(

            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        )
                            return;

                        const id =
                            entry.target
                                .dataset
                                .categoryId;

                        document
                            .querySelectorAll(
                                ".category-tab"
                            )
                            .forEach(
                                tab => {

                                    tab.classList.remove(
                                        "bg-[#ff7a00]",
                                        "text-white",
                                        "border-[#ff7a00]"
                                    );

                                    tab.classList.add(
                                        "bg-white",
                                        "border-[#e5e7eb]",
                                        "text-gray-700"
                                    );

                                    if (
                                        tab.dataset
                                            .categoryId ===
                                        id
                                    ) {

                                        tab.classList.remove(
                                            "bg-white",
                                            "border-[#e5e7eb]",
                                            "text-gray-700"
                                        );

                                        tab.classList.add(
                                            "bg-[#ff7a00]",
                                            "text-white",
                                            "border-[#ff7a00]"
                                        );

                                        // Scroll tab into view if needed
                                        tab.scrollIntoView({
                                            behavior: "smooth",
                                            block: "nearest",
                                            inline: "center"
                                        });

                                    }

                                }
                            );

                    }
                );

            },

            {
                threshold: 0.3
            }

        );

    sections.forEach(
        section =>
            observer.observe(
                section
            )
    );


}

/* =====================================
ADD BUTTONS
===================================== */

document.addEventListener(
    "click",
    async (event) => {


        const button =
            event.target.closest(
                ".add-to-cart-btn"
            );

        if (!button)
            return;

        // Check if button is disabled
        if (button.disabled) {
            return;
        }

        const itemId =
            button.dataset.itemId;

        const hasModifiers =
            button.dataset
                .hasModifiers ===
            "true";

        if (
            hasModifiers
        ) {

            openModifierModal(
                itemId
            );

            return;
        }

        addToCart(
            itemId
        );

    }


);

/* =====================================
MODIFIER MODAL
===================================== */

function openModifierModal(
    itemId
) {


    const category =
        menuData.find(
            category =>
                category.menuItems?.some(
                    item =>
                        item.id ===
                        itemId
                )
        );

    const item =
        category?.menuItems?.find(
            item =>
                item.id === itemId
        );

    if (!item)
        return;

    modifierContent.innerHTML = `

    <div>

        <h3 class="text-xl font-semibold mb-4">
            ${item.name}
        </h3>
        
        ${item.modifierGroups
            ?.map(
                group => `
                    
                    ${console.log(group)}
                <div class="mb-6">

                    <h4 class="font-medium mb-3">
                        ${group.name}
                    </h4>

                    <div class="space-y-2">
                

                        ${group.options
                        ?.map(
                            option => `

                            <label class="flex items-center justify-between border rounded-xl p-3 cursor-pointer hover:bg-gray-50">
                                <div class="flex items-center flex-1">
                                    <input 
                                        type="checkbox" 
                                        class="modifier-option"
                                        data-group-id="${group.id}"
                                        data-option-id="${option.id}"
                                        data-option-name="${option.name}"
                                        data-price="${option.extraPrice}"
                                        value="${option.id}"
                                    />
                                    <span class="ml-3">${option.name}</span>
                                </div>

                                <div>
                                    ₹${option.extraPrice}
                                </div>

                            </label>

                        `
                        )
                        .join("")
                    }

                    </div>

                </div>

            `
            )
            .join("")
        }

        <button
            class="add-modifiers-btn w-full mt-6 bg-[#ff7a00] hover:bg-[#ea6f00] text-white py-3 rounded-xl font-semibold transition"
            data-item-id="${itemId}"
        >
            Add To Cart
        </button>

    </div>

`;

    // Add event listener for the add to cart button in modal
    const addBtn = modifierContent.querySelector('.add-modifiers-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const selectedModifiers = document.querySelectorAll('.modifier-option:checked');
            const modifierData = Array.from(selectedModifiers).map(mod => ({
                optionId: mod.dataset.optionId,
                name: mod.dataset.optionName,
                price: parseFloat(mod.dataset.price)
            }));

            addToCartWithModifiers(itemId, modifierData);
            modifierModal.classList.add('hidden');
        });
    }

    modifierModal.classList.remove(
        "hidden"
    );


}

closeModifierModalBtn
    ?.addEventListener(
        "click",
        () => {


            modifierModal.classList.add(
                "hidden"
            );

        }

    );


document
    .getElementById(
        "backBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            window.location.href =
                "/home";

        }
    );


// loading state

function showPageLoading() {


    heroContainer.innerHTML = `
    <div class="h-[400px] flex items-center justify-center">
        <i class="fa-solid fa-spinner fa-spin text-4xl text-[#ff7a00]"></i>
    </div>
`;


}

// error state

function renderErrorState() {


    const template =
        document.getElementById(
            "errorTemplate"
        );

    heroContainer.innerHTML =
        "";

    heroContainer.appendChild(
        template.content.cloneNode(
            true
        )
    );


}

//utilities

function getBranchIdFromUrl() {


    const parts =
        window.location.pathname
            .split("/")
            .filter(Boolean);

    return parts[
        parts.length - 1
    ];


}

function getTodayHours() {


    if (
        !branchData
            ?.operatingHours
    )
        return null;

    const days = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY"
    ];

    const today =
        days[
        new Date()
            .getDay()
        ];

    const schedule =
        branchData
            .operatingHours
            .find(
                item =>
                    item.dayOfWeek ===
                    today
            );

    if (
        !schedule ||
        schedule.isClosed
    ) {
        return "Closed Today";
    }

    return `${schedule.openTime} - ${schedule.closeTime}`;


}

// Page rendering is now handled by initializePage() after data is successfully fetched

document.addEventListener("DOMContentLoaded", () => {
    const branchId = getBranchIdFromUrl();
    if (branchId) {
        initializePage(branchId);
    } else {
        console.error("No branch ID found in URL");
        renderErrorState();
    }
});