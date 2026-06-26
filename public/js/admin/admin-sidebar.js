document.addEventListener("DOMContentLoaded", () => {

    const currentPath = window.location.pathname;
    console.log(currentPath)

    document.querySelectorAll("nav a").forEach(link => {

        if (link.href.includes(currentPath)) {

            link.classList.remove("hover:bg-white/10");

            link.classList.add(
                "bg-orange-500",
                "text-white"
            );
        }
    });

});