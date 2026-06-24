document.addEventListener("DOMContentLoaded", async () => {
    const branchesLoading = document.getElementById("branchesLoading");
    const branchesEmpty = document.getElementById("branchesEmpty");
    const branchesGrid = document.getElementById("branchesGrid");
    const branchCardTemplate = document.getElementById("branchCardTemplate");

    async function loadBranches() {
        try {
            branchesLoading.style.display = "flex";
            branchesGrid.style.display = "none";
            branchesEmpty.style.display = "none";

            // 1. Fetch user's restaurants (which includes branches)
            const restaurantsRes = await apiRequest("/api/restaurants/owner/my-restaurants", "GET");
            if (!restaurantsRes || !restaurantsRes.ok) {
                throw new Error("Failed to fetch restaurants");
            }

            const resData = await restaurantsRes.json();
            
            // Check if user has restaurants and branches
            if (!resData.success || !Array.isArray(resData.data) || resData.data.length === 0) {
                branchesLoading.style.display = "none";
                branchesEmpty.style.display = "flex";
                return;
            }

            // Extract all branches from all restaurants
            const allBranches = [];
            resData.data.forEach(restaurant => {
                if (Array.isArray(restaurant.branches)) {
                    restaurant.branches.forEach(branch => {
                        branch.restaurantName = restaurant.name; // Tag it with restaurant name
                        allBranches.push(branch);
                    });
                }
            });

            if (allBranches.length === 0) {
                branchesLoading.style.display = "none";
                branchesEmpty.style.display = "flex";
                return;
            }

            // 2. Render Branches
            branchesGrid.innerHTML = "";
            allBranches.forEach(branch => {
                const card = branchCardTemplate.content.cloneNode(true);
                const cardEl = card.querySelector(".branch-card");
                
                cardEl.href = `/restaurants/branches/${branch.id}`;

                card.querySelector(".branch-name").textContent = branch.branchName || "Unnamed Branch";
                
                const typeEl = card.querySelector(".branch-type");
                if (branch.isPrimary) {
                    typeEl.textContent = "Primary";
                    typeEl.classList.add("bg-[#e6f4f0]", "text-[#014f38]");
                } else {
                    typeEl.textContent = "Secondary";
                    typeEl.classList.add("bg-gray-100", "text-gray-600");
                }

                const statusEl = card.querySelector(".branch-status");
                if (branch.isActive) {
                    statusEl.textContent = "Active";
                    statusEl.classList.add("bg-green-100", "text-green-800");
                } else {
                    statusEl.textContent = "Inactive";
                    statusEl.classList.add("bg-red-100", "text-red-800");
                }

                let addressParts = [];
                if (branch.city) addressParts.push(branch.city);
                if (branch.state) addressParts.push(branch.state);
                card.querySelector(".branch-address").textContent = addressParts.length > 0 ? addressParts.join(", ") : "Address not provided";
                
                card.querySelector(".branch-contact").textContent = branch.contactNumber || "No contact";

                branchesGrid.appendChild(card);
            });

            branchesLoading.style.display = "none";
            branchesGrid.classList.remove("hidden");
            branchesGrid.style.display = "grid";

            // Save restaurantId for adding branches
            window.currentRestaurantId = resData.data[0].id;

        } catch (error) {
            console.error("Branches Load Error:", error);
            showToast("An error occurred while loading branches.", "error");
            branchesLoading.style.display = "none";
        }
    }

    loadBranches();

    // Modal Logic
    const addBranchModal = document.getElementById("addBranchModal");
    const openAddBranchModalBtn = document.getElementById("openAddBranchModal");
    const closeBranchModalBtns = [
        document.getElementById("closeBranchModal"),
        document.getElementById("cancelBranchBtn")
    ];

    if (openAddBranchModalBtn) {
        openAddBranchModalBtn.addEventListener("click", () => {
            if (!window.currentRestaurantId) {
                showToast("You must have a restaurant to add a branch.", "error");
                return;
            }
            addBranchModal.classList.remove("hidden");
        });
    }

    closeBranchModalBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener("click", () => {
                addBranchModal.classList.add("hidden");
            });
        }
    });

    const branchForm = document.getElementById("branchForm");
    const submitBranchBtn = document.getElementById("submitBranchBtn");

    if (branchForm) {
        branchForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!window.currentRestaurantId) {
                showToast("Restaurant ID missing.", "error");
                return;
            }

            const formData = new FormData(branchForm);
            const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
            const dayMap = {
                "MONDAY": "MON",
                "TUESDAY": "TUE",
                "WEDNESDAY": "WED",
                "THURSDAY": "THU",
                "FRIDAY": "FRI",
                "SATURDAY": "SAT",
                "SUNDAY": "SUN"
            };
            const operatingHours = [];

            days.forEach(day => {
                const isClosed = formData.get(`${day}_closed`) === "on";
                let openTime = undefined;
                let closeTime = undefined;

                if (!isClosed) {
                    const openVal = formData.get(`${day}_open`);
                    const closeVal = formData.get(`${day}_close`);
                    if (openVal) {
                        openTime = `1970-01-01T${openVal}:00.000Z`;
                    }
                    if (closeVal) {
                        closeTime = `1970-01-01T${closeVal}:00.000Z`;
                    }
                }

                operatingHours.push({
                    dayOfWeek: dayMap[day],
                    isClosed: isClosed,
                    openTime: openTime,
                    closeTime: closeTime
                });
            });

            const payload = {
                branchName: formData.get("branchName"),
                contactNumber: formData.get("contactNumber"),
                deliveryRadiusKm: parseFloat(formData.get("deliveryRadiusKm")),
                isPrimary: formData.get("isPrimary") === "on",
                addressLine1: formData.get("addressLine1"),
                addressLine2: formData.get("addressLine2") || undefined,
                city: formData.get("city"),
                state: formData.get("state"),
                pincode: formData.get("pincode"),
                gstin: formData.get("gstin") || undefined,
                fssaiLicense: formData.get("fssaiLicense") || undefined,
                latitude: formData.get("latitude") ? parseFloat(formData.get("latitude")) : undefined,
                longitude: formData.get("longitude") ? parseFloat(formData.get("longitude")) : undefined,
                operatingHours: operatingHours
            };

            const originalBtnText = submitBranchBtn.innerHTML;
            submitBranchBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Creating...';
            submitBranchBtn.disabled = true;

            try {
                const res = await apiRequest(`/api/branches/add/${window.currentRestaurantId}`, "POST", payload);
                const data = await res.json();

                if (data.success) {
                    showToast("Branch created successfully!", "success");
                    addBranchModal.classList.add("hidden");
                    branchForm.reset();
                    // Reload branches
                    loadBranches();
                } else {
                    showToast(data.message || "Failed to create branch.", "error");
                }
            } catch (error) {
                console.error("Create Branch Error:", error);
                showToast("An error occurred. Please try again.", "error");
            } finally {
                submitBranchBtn.innerHTML = originalBtnText;
                submitBranchBtn.disabled = false;
            }
        });
    }
});
