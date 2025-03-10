function logout() {
  if (getCookie('user')) {
    setCookie("user", 0);
    window.location.href = "https://schuelerzeitung-gew.glitch.me/";
    console.log("hi")
  }
}
function setCookie(name, value) {
      const date = new Date();
      document.cookie = `${name}=${value};expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
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
