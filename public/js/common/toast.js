function showToast(message, type = "success") {

    const toast =
    document.getElementById("toast");
    console.log(toast)
    toast.textContent = message;

    toast.className = "";

    toast.classList.add(type);

    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}
