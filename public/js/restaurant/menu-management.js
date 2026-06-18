let selectedCategoryId = null;
let selectedCategoryName = "";
let selectedCategoryCount = 0;
let selectedCategoryDisplayOrder = null;
let dietaryTags = [];
let selectedTags = [];

const branchId  = document.getElementById('branchId').value;

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
            data-id="${category.id}" data-name="${category.name}" data-count="${category._count?.menuItems || 0}" data-displayOrder="${category.displayOrder}"
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

    if(index == 0){
        //set global variables
            selectedCategoryId = category.id;
            selectedCategoryName = category.name;
            selectedCategoryCount = category._count?.menuItems || 0;
            selectedCategoryDisplayOrder = category.displayOrder;
            updateCategoryHeader();
    }

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

            const categoryId = button.dataset.id;

            //set global variables
            selectedCategoryId = categoryId;
            selectedCategoryName = button.dataset.name;
            selectedCategoryCount = button.dataset.count;
            selectedCategory = button.dataset.displayOrder;

            updateCategoryHeader();

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


//category creation 

// open modal for create category
document
    .getElementById("addCategoryBtn")
    .addEventListener("click", () => {

        document
            .getElementById("categoryModal")
            .classList.remove("hidden");

    });

// close modal for create category
document
    .getElementById("closeCategoryModal")
    .addEventListener("click", () => {

        document
            .getElementById("categoryModal")
            .classList.add("hidden");

    });


// submit create category
document
    .getElementById("categoryForm")
    .addEventListener("submit", saveCategory);

// if there is editing id then edit or create
async function saveCategory(event) {

    event.preventDefault();

    const editingCategoryId =
        document.getElementById("editingCategoryId").value;

    if (editingCategoryId) {

        await updateCategory(editingCategoryId);

    } else {

        await createCategory(event);

    }
}

async function createCategory(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("categoryName")
            .value
            .trim();

    if (!name) {

        showToast(
            "Category name is required",
            "error"
        );

        return;
    }

    const response =
        await apiRequest(
            `/api/menu/branches/${branchId}/categories`,
            "POST",
            {
                name
            }
        );

    if (!response) return;

    const result =
        await response.json();

    if (result.success) {

        showToast(
            "Category created successfully",
            "success"
        );

        document
            .getElementById("categoryModal")
            .classList.add("hidden");

        document
            .getElementById("categoryForm")
            .reset();

        await loadCategories();
    }
}

//update the category header
function updateCategoryHeader() {

    document.getElementById("selectedCategoryName").textContent = selectedCategoryName;

    document.getElementById("selectedCategoryCount").textContent = `${selectedCategoryCount} Items`;

}

//delete category

//open delete category modal
document
    .getElementById("deleteCategoryBtn")
    .addEventListener("click", () => {

        document.getElementById(
            "deleteCategoryName"
        ).textContent =
            selectedCategoryName;

        const modal =
            document.getElementById(
                "deleteCategoryModal"
            );

        modal.classList.remove("hidden");
        modal.classList.add("flex");

    });

//cancel delete category modal
document
    .getElementById("cancelDeleteBtn")
    .addEventListener("click", closeDeleteModal);

function closeDeleteModal() {

    const modal =
        document.getElementById(
            "deleteCategoryModal"
        );

    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

//confirm delete
document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", deleteCategory);

//delete function 
async function deleteCategory() {

    try {

        const response =
            await apiRequest(
                `/api/menu/categories/${selectedCategoryId}`,
                "DELETE"
            );

        if (!response) return;

        const result =
            await response.json();

        if (result.success) {

            closeDeleteModal();

            showToast(
                "Category deleted successfully",
                "success"
            );

            await loadCategories();

        }

    } catch (error) {

        console.error(error);

        showToast(
            "Failed to delete category",
            "error"
        );
    }
}


//edit category
document
    .getElementById("editCategoryBtn")
    .addEventListener("click", openEditCategoryModal);

function openEditCategoryModal() {

    document.getElementById("editingCategoryId").value =
        selectedCategoryId;

    document.getElementById("categoryName").value =
        selectedCategoryName;

    document.getElementById("categoryModalTitle").textContent =
        "Edit Category";

    document.getElementById("saveCategoryBtn").textContent =
        "Update Category";

    document
        .getElementById("categoryModal")
        .classList.remove("hidden");
}

//update function 
async function updateCategory(categoryId) {

    const name =
        document.getElementById("categoryName").value.trim();

    const response =
        await apiRequest(
            `/api/menu/categories/${categoryId}`,
            "PUT",
            {
                name
            }
        );

    if (!response) return;

    const result =
        await response.json();

    if (result.success) {

        showToast(
            "Category updated successfully",
            "success"
        );

        closeCategoryModal();

        await loadCategories();
    }
}

function closeCategoryModal() {

    document
        .getElementById("categoryForm")
        .reset();

    document
        .getElementById("editingCategoryId")
        .value = "";

    document
        .getElementById("categoryModalTitle")
        .textContent =
        "Create Category";

    document
        .getElementById("saveCategoryBtn")
        .textContent =
        "Create Category";

    document
        .getElementById("categoryModal")
        .classList.add("hidden");
}

// for menu

//load diatary tag on page load
async function loadDietaryTags() {

    const response =
        await apiRequest(
            "/api/dietary-tags"
        );

    const result =
        await response.json();

    dietaryTags = result.data;

    renderDietaryTags();
}

//render tags
function renderDietaryTags() {

    const container =
        document.getElementById(
            "tagsContainer"
        );

    container.innerHTML = "";

    dietaryTags.forEach(tag => {

        container.innerHTML += `
            <button
                type="button"
                class="tag-btn px-3 py-2 bg-gray-100 rounded-full"
                data-id="${tag.id}">
                ${tag.name}
            </button>
        `;
    });

    document
        .querySelectorAll(".tag-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                toggleTag
            );
        });
}

//select tags
function toggleTag(event) {

    const button =
        event.target;

    const tagId =
        button.dataset.id;

    if (
        selectedTags.includes(tagId)
    ) {

        selectedTags =
            selectedTags.filter(
                id => id !== tagId
            );

        button.classList.remove(
            "bg-[#014f38]",
            "text-white"
        );

        button.classList.add(
            "bg-gray-100"
        );

    } else {

        selectedTags.push(tagId);

        button.classList.remove(
            "bg-gray-100"
        );

        button.classList.add(
            "bg-[#014f38]",
            "text-white"
        );
    }
}

//open create menu item modal
document
    .getElementById(
        "addMenuItemBtn"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "menuItemModal"
                )
                .classList.remove(
                    "hidden"
                );

            document
                .getElementById(
                    "menuItemModal"
                )
                .classList.add(
                    "flex"
                );
        }
    );

    //create menu item
document
    .getElementById(
        "menuItemForm"
    )
    .addEventListener(
        "submit",
        createMenuItem
    );

async function createMenuItem(event) {

    event.preventDefault();

    const formData = new FormData();

    formData.append("branchId", branchId);
    formData.append("categoryId", selectedCategoryId);
    formData.append("name", document.getElementById("itemName").value);
    formData.append("description", document.getElementById("itemDescription").value);
    formData.append("price", document.getElementById("itemPrice").value);
    formData.append("isVeg", document.querySelector('input[name="foodType"]:checked').value);
    formData.append("isAvailable", document.getElementById("isAvailable").checked);
    formData.append("isBestseller", document.getElementById("isBestseller").checked);

    selectedTags.forEach(tagId => formData.append("tagIds", tagId));

    const imageFile = document.getElementById("itemImage").files[0];

    if (imageFile) {
        formData.append("image", imageFile);
    }

    const token = localStorage.getItem("accessToken");

    const response = await fetch(
        `/api/menu-items/categories/${selectedCategoryId}/items`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        }
    );

    if (!response.ok) {
        showToast("Failed to create menu item", "error");
        return;
    }

    const result = await response.json();

    showToast("Menu item created successfully", "success");

    closeMenuItemModal();

    await loadMenuItems(selectedCategoryId);
}