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
    .addEventListener("submit", createCategory);

async function createCategory(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("categoryName")
            .value
            .trim();

    const displayOrder =
        Number(
            document
                .getElementById("displayOrder")
                .value
        );

    if (!name) {

        showToast(
            "Category name is required",
            "error"
        );

        return;
    }

    if (displayOrder < 0) {
        showToast(
            "Display order cannot be negative",
            "error"
        );
        return;
    }

    const response =
        await fetch(
            `/api/v1/branches/${branchId}/categories`,
            "POST",
            {
                name,
                displayOrder
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