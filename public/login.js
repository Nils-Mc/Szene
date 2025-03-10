async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (getCookie("user")) {
          const logindata = JSON.parse(getCookie("user"));
          const testname = logindata.name;
          const savedtags = logindata.type;
          const codewort = logindata.codewort;
          if (testname === "admin" || savedtags.includes("admin")) {
              window.location.href = "/dashboard";
          } else if (testname === "Deleter" || savedtags.includes("Deleter")) {
              window.location.href = "/delete";
          } else if (savedtags.includes("schueler")) {
              window.location.href = "/schueler";
          }
          
        } else {
          if (!response.ok) {
              errorMessage.textContent = "Invalid username or password!";
              return;
          }
          const data = await response.json();
          localStorage.setItem("token", data.token); // Store JWT in localStorage
          const user = JSON.parse(atob(data.token.split(".")[1])); // Decode JWT payload
          const cookieData = {
            name: `${username}`,
            type: `${user.tags}`,
            codewort: `${password}`
          }
          setCookie("user", JSON.stringify(cookieData), 2);
          if (user.username === "admin" || user.tags.includes("admin")) {
              window.location.href = "/dashboard";
          } else if (user.username === "Deleter" || user.tags.includes("Deleter")) {
              window.location.href = "/delete";
          } else if (user.tags.includes("schueler")) {
              window.location.href = "/schueler";
          }
          }
        } catch (error) {
            errorMessage.textContent = "Fehler beim login!";
        }
}
document.addEventListener("DOMContentLoaded", function test() {
  if (getCookie("user")) {
    login();
  }
})
function setCookie(name, value, hours) {
      const date = new Date();
      date.setTime(date.getTime() + (hours * 60 * 60 * 1000)); // Cookie expiry
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
