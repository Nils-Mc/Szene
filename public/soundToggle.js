function setCookie(name, value) {
      const date = new Date();
      date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
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
document.addEventListener("DOMContentLoaded", function () {
    // Find existing audio element
    const audio = document.getElementById("audio");
    if (!audio) {
        console.error("No <audio id='audio'> element found!");
        return;
    }
    audio.volume = 0.00;
    audio.pause(); 
    const soundToggle = document.createElement("ion-icon");
    soundToggle.id = "sound-toggle";
    soundToggle.style.bottom = "60px";
    soundToggle.style.right = "10px";
    soundToggle.setAttribute("name", "volume-mute-outline");
    soundToggle.setAttribute("alt", "Toggle Sound");
    document.body.appendChild(soundToggle);
    const defaultBackground = document.body.style.backgroundColor;
    function fadeOutAudio() {
      soundToggle.setAttribute("name", "volume-mute-outline");
      soundToggle.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
      let fadeInterval = setInterval(() => {
          if (audio.volume > 0.01) {
              audio.volume -= 0.01; // Reduce volume gradually
          } else {
              clearInterval(fadeInterval);
              audio.pause(); // Pause only after fade out
              audio.volume = 0.00; // Reset volume for next play
              soundToggle.style.background = defaultBackground;
              soundToggle.setAttribute("name", "volume-mute-outline");
          }
      }, 30); // Speed of fade-out (50ms per step)
    }
    function fadeInAudio() {
      soundToggle.setAttribute("name", "volume-high-outline");
      soundToggle.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
      audio.play(); // Pause only after fade out
      let fadeInterval = setInterval(() => {
          if (audio.volume < 0.49) {
              audio.volume += 0.01; 
          } else {
              clearInterval(fadeInterval);
              audio.play(); // Pause only after fade out
              soundToggle.style.backgroundColor = defaultBackground;
              soundToggle.setAttribute("name", "volume-high-outline");
          }
      }, 50); // Speed of fade-out (50ms per step)
    }

    // Create sound toggle icon
  
    // Load external CSS file
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "bg.css";
    document.head.appendChild(link);

    // Toggle play/pause on click
    soundToggle.addEventListener("click", function () {
        if (audio.paused) {
            fadeInAudio();
        } else {
            fadeOutAudio();
        }
    });
});