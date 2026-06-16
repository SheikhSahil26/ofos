console.log("here");
const modal = document.getElementById("editProfileModal");

const openBtn = document.getElementById("openEditProfileModal");

const closeBtn = document.getElementById("closeEditProfileModal");

const cancelBtn = document.getElementById("cancelEditProfileModal");

openBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
});

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

closeBtn.addEventListener("click", closeModal);

cancelBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});
