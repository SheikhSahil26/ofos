console.log("Forget password js")

let timerInterval;

async function fetchOTP(e) {
    console.log(e)
    const email = document.getElementById('email').value;
    const emailLink = document.getElementById('emailLink');
    if (email != '') {

        const response = await fetch(`http://localhost:8080/api/auth/forget-password/${email}`);

        const result = await response.json();
        console.log(result)

        if (response.ok) {

            showToast(
                result.message ||
                "OTP sent",
                "success"
            );

            localStorage.setItem('accessToken', result.data.resetToken)

            console.log(emailLink)
            let linkStr = `<a href=${result.data.otpLink}>Email</a>`
            emailLink.innerHTML = "OTP link : \t" + linkStr;
            emailLink.style.display = 'flex'

            document.getElementById("otpSection").style.display = "block";
            startTimer(10);
        }
        else {
            showToast(
                result.message ||
                "OTP can't sent",
                "error"
            );

        }

    }
}


// Work on OTP .............

const submitOTP =
    document.getElementById("submitOTP");

submitOTP.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("email").value;

        const otp =
            document.querySelector(
                'input[name="otp"]'
            ).value;

        if (!email || !otp) {

            showToast(
                "Email and OTP are required",
                "error"
            );

            return;
        }

        try {

            const response =
                await fetch(
                    `http://localhost:8080/api/auth/forget-password/${email}`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            otp
                        })
                    }
                );

            const result =
                await response.json();

            if (response.ok) {

                showToast(
                    result.message,
                    "success"
                );

                setTimeout(() => {

                    window.location.href =
                        "/reset-password";

                }, 1500);

            } else {

                showToast(
                    result.message,
                    "error"
                );
            }

        } catch (error) {

            console.error(error);

            showToast(
                "Unable to connect to server",
                "error"
            );
        }
    }
);

function startTimer(duration) {

    clearInterval(timerInterval);

    let time = duration;

    const timer =
        document.getElementById("timer");

    const resend =
        document.getElementById("resendOtp");

    resend.style.pointerEvents = "none";
    resend.style.color = "#999";

    timerInterval = setInterval(() => {

        const minutes =
            Math.floor(time / 60);

        const seconds =
            time % 60;

        timer.innerText =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (time <= 0) {

            clearInterval(timerInterval);

            timer.innerText = "Expired";

            resend.style.pointerEvents = "auto";
            resend.style.color = "#ff6b00";
        }

        time--;

    }, 1000);



    // Resend OTP .............

    const resendOtp =
        document.getElementById("resendOtp");

    resendOtp.addEventListener(
        "click",
        async (e) => {

            e.preventDefault();

            const email =
                document.getElementById("email").value;

            if (!email) {

                showToast(
                    "Please enter email first",
                    "error"
                );

                return;
            }

            try {

                resendOtp.style.pointerEvents = "none";
                resendOtp.style.color = "#999";

                const response =
                    await fetch(
                        `http://localhost:8080/api/auth/forget-password/${email}`
                    );

                const result =
                    await response.json();

                if (response.ok) {

                    showToast(
                        result.message ||
                        "OTP resent successfully",
                        "success"
                    );

                    const emailLink =
                        document.getElementById("emailLink");

                    if (result.data?.otpLink) {

                        emailLink.innerHTML =
                            `OTP Link : <a href="${result.data.otpLink}" target="_blank">Email</a>`;
                    }

                    // Start timer again
                    startTimer(10);

                } else {

                    showToast(
                        result.message ||
                        "Failed to resend OTP",
                        "error"
                    );

                    resendOtp.style.pointerEvents = "auto";
                    resendOtp.style.color = "#ff6b00";
                }

            } catch (error) {

                console.error(error);

                showToast(
                    "Unable to resend OTP",
                    "error"
                );

                resendOtp.style.pointerEvents = "auto";
                resendOtp.style.color = "#ff6b00";
            }
        }
    );
}

