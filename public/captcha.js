document.addEventListener("DOMContentLoaded", function () {
    const loadingScreen = document.getElementById("loading-screen");
    const captchaContainer = document.getElementById("captcha-container");
    const navbar = document.querySelector(".navbar");
    const main_page = document.querySelector(".Main-Page");
    const buttons = document.getElementById("button-container");
    const datenschutzt = document.getElementById("datenschutzt");
    // Function to set a cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Cookie expiry
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
    }

    // Function to get a cookie
    function getCookie(name) {
        const cookies = document.cookie.split('; ');
        for (let i = 0; i < cookies.length; i++) {
            const [cookieName, cookieValue] = cookies[i].split('=');
            if (cookieName === name) return cookieValue;
        }
        return null;
    }

    // Check if CAPTCHA verification is valid
    function isVerificationValid() {
        const verifiedTimestamp = getCookie("captchaVerified");
        if (verifiedTimestamp) {
            const diffDays = (new Date() - new Date(parseInt(verifiedTimestamp, 10))) / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        }
        return false;
    }

    // Simulate loading and then show content
    setTimeout(() => {
        // Check if the CAPTCHA verification is valid
        if (isVerificationValid()) {
        // Show the content elements when verification is successful
            captchaContainer.style.display = "none";
            navbar.style.display = "flex";
            buttons.style.display = "flex";
            main_page.style.display = "flex";
        } else {
        // Show the CAPTCHA container when verification fails
            captchaContainer.style.display = "block";
            navbar.style.display = "none";
            buttons.style.display = "none";
            datenschutzt.style.display = "block";
            main_page.style.display = "none";
        }

    // Hide the loading screen and show the content
      loadingScreen.style.display = "none";
    }, 750);

    // Callback function for successful CAPTCHA verification
    window.onCaptchaSuccess = function () {
        setCookie("captchaVerified", Date.now(), 7);
        captchaContainer.style.display = "none";
        navbar.style.display = "flex";
        main_page.style.display = "flex";
        buttons.style.display = "flex";
    };
});