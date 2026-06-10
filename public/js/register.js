console.log("Register JS Loaded");
console.log(role);
/* ==========================
   PASSWORD TOGGLE
========================== */

const toggle =
    document.querySelector(".toggle");

const passwordInput =
    document.getElementById("password");

if (toggle) {

    toggle.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            toggle.classList.replace(
                "fa-eye",
                "fa-eye-slash"
            );

        } else {

            passwordInput.type = "password";

            toggle.classList.replace(
                "fa-eye-slash",
                "fa-eye"
            );

        }

    });

}

/* ==========================
   TOAST FUNCTION
========================== */

function showToast(message, type = "success") {

    const toast =
        document.getElementById("toast");

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

/* ==========================
   REGEX
========================== */

const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const mobileRegex =
    /^[6-9]\d{9}$/;

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

/* ==========================
   REGISTER FORM
========================== */

const signupForm =
    document.getElementById("signupForm");

signupForm.addEventListener(
    "submit",
    async (e) => {

        console.log("Submit btn Cliked")
        e.preventDefault();

        const fullName =
            signupForm.fullName.value.trim();

        const email =
            signupForm.email.value.trim();

        const mobile =
            signupForm.mobile.value.trim();

        const password =
            signupForm.password.value;

        const confirmPassword =
            signupForm.confirmPassword.value;

        /* VALIDATIONS */

        if (
            !fullName ||
            !email ||
            !mobile ||
            !password ||
            !confirmPassword
        ) {
            return showToast(
                "All fields are required",
                "error"
            );
        }

        if (fullName.length < 3) {
            return showToast(
                "Name must contain at least 3 characters",
                "error"
            );
        }

        if (!emailRegex.test(email)) {
            return showToast(
                "Invalid email address",
                "error"
            );
        }

        if (!mobileRegex.test(mobile)) {
            return showToast(
                "Invalid mobile number",
                "error"
            );
        }

        if (!passwordRegex.test(password)) {
            return showToast(
                "Password must contain uppercase, lowercase, number and special character",
                "error"
            );
        }

        if (password !== confirmPassword) {
            return showToast(
                "Passwords do not match",
                "error"
            );
        }

        try {
            
            const response =
                await fetch(
                    `http://localhost:8080/api/auth/${role}/api/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            fullName: fullName,
                            email,
                            mobile,
                            password,
                            confirmPassword
                        })
                    }
                );

            const result =
                await response.json();

                console.log(result)

            if (response.ok) {

                showToast(
                    result.message ||
                    "Registration Successful",
                    "success"
                );

                setTimeout(() => {

                    window.location.href =
                        `http://localhost:8080/api/auth/${role}/static/login`;

                }, 1500);

            } else {

                showToast(
                    result.message ||
                    "Registration Failed",
                    "error"
                );

            }

        } catch (error) {

            console.error(error);

            showToast(
                "Server Error. Please try again.",
                "error"
            );
        }
    }
);