async function loadCategories() {

    try {

        const branchId = document.getElementById('branchId').value;

        const response =
            await fetch(
                `/api/menu/branches/${branchId}/categories`
            );

        if (!response) return;

        const result =
            await response.json();

            console.log(result);

        renderCategories(result.data);

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to load categories",
            "error"
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadCategories();

    }
);


//render the categories
function renderCategories(categories) {

    const categoryList =
        document.getElementById("categoryList");

    categoryList.innerHTML = "";

    categories.forEach((category, index) => {

        categoryList.innerHTML += `
        <button
            class="
                category-btn
                w-full
                flex
                justify-between
                items-center
                px-4
                py-3
                rounded-xl
                transition
                ${index === 0
                    ? "bg-[#ff7a00] text-white"
                    : "hover:bg-gray-100"}
            "
            data-id="${category.id}"
        >

            <span class="font-medium">
                ${category.name}
            </span>

            <span
                class="
                    category-count
                    text-sm
                    px-2
                    py-1
                    rounded-full
                    ${index === 0
                        ? "bg-white/20"
                        : "bg-gray-100 text-gray-600"}
                "
            >
                ${category._count?.menuItems || 0}
            </span>

        </button>
    `;

    });

    bindCategoryEvents();

    if (categories.length > 0) {

        loadMenuItems(
            categories[0].id
        );

    }

}

function bindCategoryEvents() {

    const buttons =
        document.querySelectorAll(".category-btn");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(btn => {

                btn.classList.remove(
                    "bg-[#ff7a00]",
                    "text-white"
                );

                btn.classList.add(
                    "hover:bg-gray-100"
                );

                const count =
                    btn.querySelector(".category-count");

                count.classList.remove(
                    "bg-white/20"
                );

                count.classList.add(
                    "bg-gray-100",
                    "text-gray-600"
                );
            });

            button.classList.add(
                "bg-[#ff7a00]",
                "text-white"
            );

            button.classList.remove(
                "hover:bg-gray-100"
            );

            const activeCount =
                button.querySelector(".category-count");

            activeCount.classList.remove(
                "bg-gray-100",
                "text-gray-600"
            );

            activeCount.classList.add(
                "bg-white/20"
            );

            const categoryId =
                button.dataset.id;

             loadMenuItems(categoryId);

            console.log(categoryId);

        });

    });

}

//load menu item
async function loadMenuItems(categoryId) {

    const response =
        await fetch(
            `/api/menu-items/categories/${categoryId}/items`
        );

    const result =
        await response.json();

    console.log(result);

    renderMenuItems(result.data);
}


//creating menu card 
function createMenuItemCard(item) {

    const template =
        document
            .getElementById("menuItemTemplate");

    const clone =
        template.content.cloneNode(true);

    clone.querySelector(".item-name")
        .textContent = item.name;

    clone.querySelector(".item-description")
        .textContent =
            item.description ||
            "No description available";

    clone.querySelector(".item-price")
        .textContent =
            `₹${item.price}`;

    const image =
        clone.querySelector(".item-image");

    image.src =
        item.imageUrl ||
        "https://placehold.co/600x400?text=Food+Item";

    const type =
        clone.querySelector(".item-type");

    if (item.isVeg) {

        type.textContent = "Veg";

        type.classList.add(
            "bg-green-100",
            "text-green-700"
        );

    } else {

        type.textContent = "Non Veg";

        type.classList.add(
            "bg-red-100",
            "text-red-700"
        );

    }

    const badges =
        clone.querySelector(".item-badges");

    if (item.isBestseller) {

        badges.innerHTML += `
            <span
                class="
                    bg-orange-100
                    text-orange-600
                    text-xs
                    px-2
                    py-1
                    rounded-full
                "
            >
                Bestseller
            </span>
        `;
    }

    badges.innerHTML += `
        <span
            class="
                ${
                    item.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                }
                text-xs
                px-2
                py-1
                rounded-full
            "
        >
            ${
                item.isAvailable
                    ? "Available"
                    : "Unavailable"
            }
        </span>
    `;

    return clone;
}


//render the menu items
function renderMenuItems(items) {

    console.log("menu items called")

    const container =
        document.getElementById(
            "menuItemsContainer"
        );

    container.innerHTML = "";

    if (!items.length) {

        container.innerHTML = `
            <div
                class="
                    col-span-full
                    bg-white
                    rounded-2xl
                    p-10
                    text-center
                "
            >
                <h3
                    class="
                        text-xl
                        font-semibold
                    "
                >
                    No menu items found
                </h3>

                <p
                    class="
                        text-gray-500
                        mt-2
                    "
                >
                    Create your first menu item.
                </p>
            </div>
        `;

        return;
    }

    items.forEach(item => {

        container.appendChild(
            createMenuItemCard(item)
        );

    });
}