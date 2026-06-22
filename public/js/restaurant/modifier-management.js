let selectedMenuItemId = null;

//open modifier grps
async function openModifierModal(menuItemId) {

    selectedMenuItemId = menuItemId;

    document
        .getElementById("modifierModal")
        .classList.remove("hidden");

    document
        .getElementById("modifierModal")
        .classList.add("flex");

    await loadModifierGroups();
}

//close modifier grps
document
    .getElementById("closeModifierModal")
    .addEventListener(
        "click",
        closeModifierModal
    );

function closeModifierModal() {

    document
        .getElementById("modifierModal")
        .classList.add("hidden");

    document
        .getElementById("modifierModal")
        .classList.remove("flex");
}

async function loadModifierGroups() {

    const response =
        await apiRequest(
            `/api/modifier/menu-items/${selectedMenuItemId}/groups`
        );

    if (!response) return;

    const result =
        await response.json();

    renderModifierGroups(
        result.data
    );
}

function renderModifierGroups(groups) {

    const container =
        document.getElementById(
            "modifierGroupsContainer"
        );

    container.innerHTML = "";

    if (!groups.length) {

        container.innerHTML =
            `<div class="text-center text-gray-500 py-10">
                No modifier groups found
            </div>`;

        return;
    }

    groups.forEach(group => {

        container.appendChild(
            createModifierGroupCard(group)
        );
    });
}

function createModifierGroupCard(group) {

    const template =
        document.getElementById(
            "modifierGroupTemplate"
        );

    const clone =
        template.content.cloneNode(
            true
        );

    clone.querySelector(".group-name")
        .textContent =
        group.name;

    clone.querySelector(".group-details")
        .textContent =
        `Required: ${group.isRequired ? "Yes" : "No"} | Min: ${group.minSelection} | Max: ${group.maxSelection}`;

    clone.querySelector(".group-option-count")
        .textContent =
        `${group.options.length} options`;

    //options
    const optionsContainer =
    clone.querySelector(
        ".group-options"
    );

    group.options.forEach(option => {
        optionsContainer.appendChild(createModifierOptionRow(option));
    });

    clone.querySelector(".add-option-btn").dataset.id = group.id;

    clone.querySelector(".add-option-btn")
    .addEventListener(
        "click",
        () => openModifierOptionModal(group.id)
    );

    //edit and delete btn
    clone.querySelector(".edit-group-btn")
    .addEventListener(
        "click",
        () => openEditModifierGroupModal(group)
    );

    clone.querySelector(".delete-group-btn")
    .addEventListener(
        "click",
        () => deleteModifierGroup(group)
    );

    return clone;
}


//open create modifier group modal
document
    .getElementById("addModifierGroupBtn")
    .addEventListener(
        "click",
        openModifierGroupModal
    );

function openModifierGroupModal() {

    document
        .getElementById("modifierGroupModal")
        .classList.remove("hidden");

    document
        .getElementById("modifierGroupModal")
        .classList.add("flex");
}

//close create modifier group modal
document
    .getElementById("closeModifierGroupModal")
    .addEventListener(
        "click",
        closeModifierGroupModal
    );


function closeModifierGroupModal() {

    document
        .getElementById("modifierGroupModal")
        .classList.add("hidden");

    document
        .getElementById("modifierGroupModal")
        .classList.remove("flex");

    document
        .getElementById("modifierGroupForm")
        .reset();

    document
        .getElementById("editingGroupId")
        .value = "";

    document.querySelector(
        "#modifierGroupModal h2"
    ).textContent =
        "Create Modifier Group";

    document.querySelector(
        '#modifierGroupForm button[type="submit"]'
    ).textContent =
        "Create";
}


//create modifier group or edit 
document
    .getElementById("modifierGroupForm")
    .addEventListener(
        "submit",
        handleModifierGroupSubmit
    );

//handle create or edit of modifier grp
async function handleModifierGroupSubmit(event) {

    event.preventDefault();

    const editingGroupId =
        document.getElementById(
            "editingGroupId"
        ).value;

    if (editingGroupId) {

        await updateModifierGroup(
            editingGroupId
        );

    } else {

        await createModifierGroup(
            event
        );
    }
}

async function createModifierGroup(event) {

    event.preventDefault();

    const payload = {
        name: document.getElementById("groupName").value,
        isRequired: document.getElementById("isRequired").checked,
        minSelection: Number(document.getElementById("minSelection").value),
        maxSelection: Number(document.getElementById("maxSelection").value)
    };

    const response =
        await apiRequest(
            `/api/modifier/menu-items/${selectedMenuItemId}/groups`,
            "POST",
            payload
        );

    if (!response) return;

    showToast(
        "Modifier group created successfully",
        "success"
    );

    closeModifierGroupModal();

    await loadModifierGroups();
}

//open edit modifier grp modal
function openEditModifierGroupModal(group) {

    document.getElementById("editingGroupId").value =
        group.id;

    document.getElementById("groupName").value =
        group.name;

    document.getElementById("isRequired").checked =
        group.isRequired;

    document.getElementById("minSelection").value =
        group.minSelection;

    document.getElementById("maxSelection").value =
        group.maxSelection;

    document.querySelector(
        "#modifierGroupModal h2"
    ).textContent =
        "Edit Modifier Group";

    document.querySelector(
        '#modifierGroupForm button[type="submit"]'
    ).textContent =
        "Update Group";

    openModifierGroupModal();
}

//edit modifier grp
async function updateModifierGroup(groupId) {

    const minSelection =
        Number(document.getElementById("minSelection").value);

    const maxSelection =
        Number(document.getElementById("maxSelection").value);

    const isRequired =
        document.getElementById("isRequired").checked;

    if (minSelection < 0) {
        showToast("Minimum selection cannot be negative", "error");
        return;
    }

    if (maxSelection < 1) {
        showToast("Maximum selection must be at least 1", "error");
        return;
    }

    if (minSelection > maxSelection) {
        showToast("Minimum selection cannot exceed maximum selection", "error");
        return;
    }

    if (isRequired && minSelection === 0) {
        showToast("Required groups must have minimum selection of at least 1", "error");
        return;
    }

    const payload = {
        name: document.getElementById("groupName").value,
        isRequired: isRequired,
        minSelection: minSelection,
        maxSelection: maxSelection
    };

    const response =
        await apiRequest(
            `/api/modifier/groups/${groupId}`,
            "PUT",
            payload
        );

    if (!response) return;

    showToast(
        "Modifier group updated successfully",
        "success"
    );

    closeModifierGroupModal();

    await loadModifierGroups();
}

//delete modifier grp
async function deleteModifierGroup(group) {

    openConfirmModal(
        "Delete Modifier Group",
        `Are you sure you want to delete ${group.name}?`,
        async () => {

            const response =
                await apiRequest(
                    `/api/modifier/groups/${group.id}`,
                    "DELETE"
                );

            if (!response) return;

            showToast(
                "Modifier group deleted",
                "success"
            );

            await loadModifierGroups();
        }
    );
}

//open modal to create modifier option
function openModifierOptionModal(groupId) {

    selectedModifierGroupId =
        groupId;

    document
        .getElementById("modifierOptionModal")
        .classList.remove("hidden");

    document
        .getElementById("modifierOptionModal")
        .classList.add("flex");
}

//close create modifier option modal
document
    .getElementById("closeModifierOptionModal")
    .addEventListener(
        "click",
        closeModifierOptionModal
    );

function closeModifierOptionModal() {

    document.getElementById("modifierOptionModal")
        .classList.add("hidden");

    document.getElementById("modifierOptionModal")
        .classList.remove("flex");

    document.getElementById("modifierOptionForm")
        .reset();

    document.getElementById("editingOptionId").value =
        "";

    document.querySelector(
        "#modifierOptionModal h2"
    ).textContent =
        "Create Modifier Option";

    document.querySelector(
        '#modifierOptionForm button[type="submit"]'
    ).textContent =
        "Create";

    selectedModifierGroupId = null;
}

//create modifier option row
function createModifierOptionRow(option) {

    const row = document.createElement("div");
    row.className = "flex justify-between items-center py-2 border-b border-gray-100";

    const left = document.createElement("div");
    left.className = "flex items-center gap-3";

    const name = document.createElement("span");
    name.textContent = option.name;

    const price = document.createElement("span");
    price.className = "text-sm text-gray-500";
    price.textContent = `₹${option.extraPrice}`;

    left.appendChild(name);
    left.appendChild(price);

    const actions = document.createElement("div");
    actions.className = "flex items-center gap-3";

    const editBtn = document.createElement("button");
    editBtn.className = "text-[#014f38]";
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editBtn.addEventListener("click", () => openEditModifierOptionModal(option));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "text-red-500";
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.addEventListener("click", () => deleteModifierOption(option));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    row.appendChild(left);
    row.appendChild(actions);

    return row;
}

//creata modifier option or edit
document
    .getElementById("modifierOptionForm")
    .addEventListener(
        "submit",
        handleModifierOptionSubmit
    );

//handle create and edit option
async function handleModifierOptionSubmit(event) {

    event.preventDefault();

    const editingOptionId =
        document.getElementById(
            "editingOptionId"
        ).value;

    if (editingOptionId) {

        await updateModifierOption(
            editingOptionId
        );

    } else {

        await createModifierOption(
            event
        );
    }
}

async function createModifierOption(event) {

    event.preventDefault();

    const payload = {
        name: document.getElementById("optionName").value,
        extraPrice: Number(document.getElementById("extraPrice").value)
    };
    console.log("inside create")
    const response =
        await apiRequest(
            `/api/modifier/groups/${selectedModifierGroupId}/options`,
            "POST",
            payload
        );

    if (!response) return;

    showToast(
        "Modifier option created successfully",
        "success"
    );

    closeModifierOptionModal();

    await loadModifierGroups();
}

//delete modifier option
async function deleteModifierOption(option) {

    openConfirmModal(
        "Delete Modifier Option",
        `Are you sure you want to delete ${option.name}?`,
        async () => {

            await apiRequest(
                `/api/modifier/options/${option.id}`,
                "DELETE"
            );

            showToast(
                "Modifier option deleted",
                "success"
            );

            await loadModifierGroups();
        }
    );
}

//edit modifier option modal
function openEditModifierOptionModal(option) {

    document.getElementById("editingOptionId").value =
        option.id;

    document.getElementById("optionName").value =
        option.name;

    document.getElementById("extraPrice").value =
        option.extraPrice;

    document.querySelector(
        "#modifierOptionModal h2"
    ).textContent =
        "Edit Modifier Option";

    document.querySelector(
        '#modifierOptionForm button[type="submit"]'
    ).textContent =
        "Update Option";

    document.getElementById("modifierOptionModal")
        .classList.remove("hidden");

    document.getElementById("modifierOptionModal")
        .classList.add("flex");
}

//edit modifier option
async function updateModifierOption(optionId) {

    const payload = {
        name: document.getElementById("optionName").value,
        extraPrice: Number(document.getElementById("extraPrice").value)
    };

    const response =
        await apiRequest(
            `/api/modifier/options/${optionId}`,
            "PUT",
            payload
        );

    if (!response) return;

    showToast(
        "Modifier option updated successfully",
        "success"
    );

    closeModifierOptionModal();

    await loadModifierGroups();
}

