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
}