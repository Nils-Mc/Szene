document.addEventListener("DOMContentLoaded", () => {
    // Fetch the list of files from the server
    fetch("/list")
        .then((response) => response.json())
        .then((files) => {
            const list = document.getElementById("file-list");
            files.forEach((file) => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span>${file}</span>
                    <button onclick="deleteFile('${file}')">Delete</button>
                `;
                list.appendChild(li);
            });
        })
        .catch((err) => console.error("Error loading files:", err));
    fetch("/list-schueler")
        .then((response) => response.json())
        .then((files) => {
            const list = document.getElementById("file-list");
            files.forEach((file) => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span>${file}</span>
                    <button onclick="deleteFile('${file}')">Delete</button>
                `;
                list.appendChild(li);
            });
        })
        .catch((err) => console.error("Error loading files:", err));
});

// Function to delete a file
function deleteFile(filename) {
    const confirmDelete = confirm(`Are you sure you want to delete ${filename}?`);
    if (confirmDelete) {
        fetch(`/delete/${filename}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.message);  // Show success message
                location.reload();  // Reload the page to refresh the file list
            })
            .catch((err) => {
                alert("Error deleting file!");
                console.error("Error:", err);
            });
    }
}