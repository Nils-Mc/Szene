document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("success")) {
    document.getElementById("status").textContent = "Upload erfolgreich!";
    console.log('uploaded')
  }
});
