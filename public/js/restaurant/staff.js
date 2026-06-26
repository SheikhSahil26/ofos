document.addEventListener("DOMContentLoaded", async () => {
    const $ = (id) => document.getElementById(id);

    // Elements
    const branchSelector = $("branchSelector");
    const staffLoading = $("staffLoading");
    const staffBoard = $("staffBoard");
    const staffTableBody = $("staffTableBody");
    const emptyStaffState = $("emptyStaffState");

    // Modals
    const addStaffBtn = $("addStaffBtn");
    
    // Step 1 Modal
    const checkEmailModal = $("checkEmailModal");
    const checkEmailPanel = $("checkEmailPanel");
    const closeCheckEmailModal = $("closeCheckEmailModal");
    const checkEmailForm = $("checkEmailForm");
    const submitCheckEmailBtn = $("submitCheckEmailBtn");

    // Existing User Modal
    const existingUserModal = $("existingUserModal");

    // Step 2 Modal
    const addStaffModal = $("addStaffModal");
    const addStaffPanel = $("addStaffPanel");
    const closeAddStaffModal = $("closeAddStaffModal");
    const addStaffForm = $("addStaffForm");
    const submitStaffBtn = $("submitStaffBtn");

    // Delete Modal
    const deleteModal = $("deleteModal");
    const confirmDeleteBtn = $("confirmDeleteBtn");
    const deleteStaffName = $("deleteStaffName");

    // State
    let currentRestaurantId = null;
    let branches = [];
    let currentBranchId = null;
    let allStaff = [];
    let staffToDelete = null;

    // ── 1. Init ─────────────────────────────────────────────────────────────
    async function init() {
        try {
            // Fetch User's restaurants to get branches
            const res = await apiRequest("/api/restaurants/owner/my-restaurants", "GET");
            if (!res || !res.ok) throw new Error("Failed to fetch restaurants");
            
            const data = await res.json();
            if (!data.success || !data.data || data.data.length === 0) {
                showToast("No restaurant found. Create one first.", "error");
                return;
            }

            const restaurant = data.data[0];
            currentRestaurantId = restaurant.id;
            branches = restaurant.branches || [];

            if (branches.length === 0) {
                branchSelector.innerHTML = `<option value="">No branches found</option>`;
                staffLoading.style.display = "none";
                addStaffBtn.classList.add("opacity-50", "pointer-events-none");
                return;
            }

            // Populate selector
            branchSelector.innerHTML = branches.map(b => `<option value="${b.id}">${b.branchName}</option>`).join("");
            
            // Set initial branch
            currentBranchId = branches[0].id;
            
            // Fetch staff
            await loadStaff();

        } catch (err) {
            console.error(err);
            showToast("Failed to initialize dashboard", "error");
        }
    }

    // ── 2. Load Staff ──────────────────────────────────────────────────────
    async function loadStaff() {
        if (!currentBranchId) return;

        staffLoading.style.display = "flex";
        staffBoard.style.display = "none";
        emptyStaffState.classList.add("hidden");

        try {
            const res = await apiRequest(`/api/staff/${currentBranchId}`, "GET");
            if (!res || !res.ok) throw new Error("Failed to fetch staff");

            const data = await res.json();
            allStaff = data.data || [];
            
            renderStaff();

        } catch (err) {
            console.error(err);
            showToast("Failed to load staff list.", "error");
        } finally {
            staffLoading.style.display = "none";
            staffBoard.style.display = "block";
        }
    }

    // ── 3. Render Staff ─────────────────────────────────────────────────────
    function renderStaff() {
        if (allStaff.length === 0) {
            staffTableBody.parentElement.classList.add("hidden");
            emptyStaffState.classList.remove("hidden");
            emptyStaffState.classList.add("flex");
            return;
        }

        staffTableBody.parentElement.classList.remove("hidden");
        emptyStaffState.classList.add("hidden");
        emptyStaffState.classList.remove("flex");

        staffTableBody.innerHTML = allStaff.map(staff => `
            <tr class="hover:bg-gray-50 transition-colors group">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-[#014f38]/10 text-[#014f38] flex items-center justify-center font-bold text-sm">
                            ${staff.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p class="font-bold text-gray-900">${staff.fullName}</p>
                            <p class="text-xs text-gray-500">ID: ${staff.id.substring(0,8).toUpperCase()}</p>
                        </div>
                    </div>
                </td>
                <td class="p-4">
                    <p class="text-gray-700"><i class="fa-solid fa-envelope text-gray-400 mr-2 text-xs"></i>${staff.email}</p>
                    <p class="text-gray-700 mt-1"><i class="fa-solid fa-phone text-gray-400 mr-2 text-xs"></i>${staff.mobile}</p>
                </td>
                <td class="p-4">
                    ${staff.isHead ? `
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <i class="fa-solid fa-crown text-[10px]"></i> Branch Head
                        </span>
                    ` : `
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Staff
                        </span>
                    `}
                </td>
                <td class="p-4 text-right flex items-center justify-end gap-2">
                    ${!staff.isHead ? `
                        <button onclick="window.makeBranchHead('${staff.staffId}')" class="text-gray-400 hover:text-purple-600 hover:bg-purple-50 p-2 rounded-lg transition-colors" title="Make Branch Head">
                            <i class="fa-solid fa-crown"></i>
                        </button>
                    ` : ''}
                    <button onclick="window.confirmRemoveStaff('${staff.id}', '${staff.fullName.replace(/'/g, "\\'")}')" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Remove Staff">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `).join("");
    }

    // ── 4. Add Staff Flow Logic ─────────────────────────────────────────────
    
    // Step 1: Check Email Modal
    function openCheckEmailModal() {
        checkEmailForm.reset();
        checkEmailModal.classList.remove("hidden");
        setTimeout(() => {
            checkEmailPanel.classList.remove("scale-95");
            checkEmailPanel.classList.add("scale-100");
        }, 10);
    }

    function closeCheckEmailModalFn() {
        checkEmailPanel.classList.remove("scale-100");
        checkEmailPanel.classList.add("scale-95");
        setTimeout(() => {
            checkEmailModal.classList.add("hidden");
        }, 300);
    }

    addStaffBtn.addEventListener("click", openCheckEmailModal);
    closeCheckEmailModal.addEventListener("click", closeCheckEmailModalFn);
    checkEmailModal.addEventListener("click", (e) => {
        if (e.target === checkEmailModal) closeCheckEmailModalFn();
    });

    checkEmailForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentBranchId) return;

        const email = $("checkStaffEmail").value.trim();
        const originalBtnHTML = submitCheckEmailBtn.innerHTML;
        submitCheckEmailBtn.disabled = true;
        submitCheckEmailBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Checking...`;

        try {
            const res = await apiRequest(`/api/staff/check-email/${currentBranchId}`, "POST", { email });
            
            if (!res || !res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to check email");
            }

            const data = await res.json();
            
            closeCheckEmailModalFn();

            if (data.data && data.data.exists) {
                // User existed and was added
                setTimeout(() => {
                    existingUserModal.classList.remove("hidden");
                }, 300);
                await loadStaff(); // refresh list behind the scenes
            } else {
                // User does not exist, go to Step 2
                setTimeout(() => {
                    openAddStaffModal(email);
                }, 300);
            }

        } catch (err) {
            console.error(err);
            showToast(err.message || "An error occurred", "error");
        } finally {
            submitCheckEmailBtn.disabled = false;
            submitCheckEmailBtn.innerHTML = originalBtnHTML;
        }
    });

    // Existing User Modal
    window.closeExistingUserModal = () => {
        existingUserModal.classList.add("hidden");
    };

    // Step 2: Full Details Modal
    function openAddStaffModal(email) {
        addStaffForm.reset();
        $("staffEmail").value = email; // Prefill disabled field
        addStaffModal.classList.remove("hidden");
        setTimeout(() => {
            addStaffPanel.classList.remove("scale-95");
            addStaffPanel.classList.add("scale-100");
        }, 10);
    }

    function closeAddStaffModalFn() {
        addStaffPanel.classList.remove("scale-100");
        addStaffPanel.classList.add("scale-95");
        setTimeout(() => {
            addStaffModal.classList.add("hidden");
        }, 300);
    }

    closeAddStaffModal.addEventListener("click", closeAddStaffModalFn);
    addStaffModal.addEventListener("click", (e) => {
        if (e.target === addStaffModal) closeAddStaffModalFn();
    });

    addStaffForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentBranchId) return;

        const fullName = $("staffName").value.trim();
        const email = $("staffEmail").value.trim(); // Get from disabled field
        const mobile = $("staffMobile").value.trim();
        const password = $("staffPassword").value;
        const confirmPassword = $("staffConfirmPassword").value;

        if (password !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        const originalBtnHTML = submitStaffBtn.innerHTML;
        submitStaffBtn.disabled = true;
        submitStaffBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

        try {
            const payload = { fullName, email, mobile, password, confirmPassword };
            const res = await apiRequest(`/api/staff/${currentBranchId}`, "POST", payload);
            
            if (!res || !res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to create staff");
            }

            showToast("Staff member created successfully!", "success");
            closeAddStaffModalFn();
            await loadStaff(); // Refresh list

        } catch (err) {
            console.error(err);
            showToast(err.message || "An error occurred", "error");
        } finally {
            submitStaffBtn.disabled = false;
            submitStaffBtn.innerHTML = originalBtnHTML;
        }
    });

    // ── 5. Delete Staff Logic ───────────────────────────────────────────────
    window.confirmRemoveStaff = (id, name) => {
        staffToDelete = id;
        deleteStaffName.textContent = name;
        deleteModal.classList.remove("hidden");
        deleteModal.classList.add("flex");
    };

    window.closeDeleteModal = () => {
        deleteModal.classList.add("hidden");
        deleteModal.classList.remove("flex");
        staffToDelete = null;
    };

    confirmDeleteBtn.addEventListener("click", async () => {
        if (!staffToDelete || !currentBranchId) return;

        const originalHTML = confirmDeleteBtn.innerHTML;
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

        try {
            const res = await apiRequest(`/api/staff/${currentBranchId}/${staffToDelete}`, "DELETE");
            
            if (!res || !res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to remove staff");
            }

            showToast("Staff member removed successfully", "success");
            closeDeleteModal();
            await loadStaff();

        } catch (err) {
            console.error(err);
            showToast(err.message || "Failed to remove staff member", "error");
        } finally {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.innerHTML = originalHTML;
        }
    });

    // ── 6. Make Branch Head ──────────────────────────────────────────────────
    window.makeBranchHead = async (staffId) => {
        if (!currentBranchId) return;

        try {
            const res = await apiRequest(`/api/staff/head/${currentBranchId}`, "PUT", { staffId });
            
            if (!res || !res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to update branch head");
            }

            showToast("Branch head updated successfully!", "success");
            await loadStaff(); // Refresh list to show new head
        } catch (err) {
            console.error(err);
            showToast(err.message || "An error occurred", "error");
        }
    };

    // ── 6. Event Listeners ──────────────────────────────────────────────────
    branchSelector.addEventListener("change", (e) => {
        currentBranchId = e.target.value;
        loadStaff();
    });

    // Run
    init();
});
