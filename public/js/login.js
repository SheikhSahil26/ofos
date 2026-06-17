console.log("Register JS Loaded");
console.log(role);



/* ==========================
   REGEX
========================== */

const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

/* ==========================
   REGISTER FORM
========================== */

const loginForm =
    document.getElementById("loginForm");

loginForm.addEventListener(
    "submit",
    async (e) => {

        console.log("Submit btn Cliked")

        e.preventDefault();

        const email =
            loginForm.email.value.trim();


        const password =
            loginForm.password.value;

        const rememberMe = loginForm.rememberMe.value;


        /* VALIDATIONS */

        if (
            !email ||
            !password
        ) {
            return showToast(
                "All fields are required",
                "error"
            );
        }




        if (!emailRegex.test(email)) {
            return showToast(
                "Invalid email address",
                "error"
            );
        }



        if (!passwordRegex.test(password)) {
            return showToast(
                "Password must contain uppercase, lowercase, number and special character",
                "error"
            );
        }




        try {

            const response =
                await fetch(
                    `http://localhost:8080/api/auth/${role}/api/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            password,
                            rememberMe
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
                localStorage.setItem(
                    "accessToken",
                    result.data.accessToken
                );
                // window.location.href = "http://localhost:8080/api/auth/customer/static/dashboard";
                window.location.href = "http://localhost:8080/dashboard";

            } else {

                showToast(
                    result.message ||
                    "Login Failed",
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