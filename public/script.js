document.addEventListener("DOMContentLoaded", () => {
    fetch("/list")
        .then(res => res.json())
        .then(files => {
            const list = document.getElementById("pdf-list");
            list.innerHTML = ""; // Clear existing content
            list.style.justifyContent = "center";

            files.forEach(file => {
                const li = document.createElement("li");
                li.style.margin = "15px";
                li.textAlign = "center";
                li.style.justifyContent = "center";
                li.style.background = "none";
                li.style.display = "inline-block";
                li.style.transitions = "all 0.3 ease";
                // Create the button with an icon
                const button = document.createElement("button");
                
                button.style.background = "none";
                button.style.backgroundSize = "1%";
                button.style.border = "none";
                button.style.padding = "0 0";
                button.style.cursor = "pointer";
                button.style.justifyContent = "center";
                button.textAlign = "center";
                button.style.color = "unset";
                button.style.opacity = "1";
                
                
                let icon = document.createElement("i");
                icon.classList.add("fas", "fa-file-pdf"); // FontAwesome classes
                icon.style.fontSize = "64px"; // Adjust icon siz
                icon.style.fontWeight = "900";
                icon.style.background = "none";
                icon.style.justifyContent = "center";
                icon.style.visibility = "visible";
                icon.pointerEvents = "none";
                icon.style.color = "#33BFD1"; // Icon color
                button.appendChild(icon);
                button.style.width = "64px";
                button.style.height = "80px";
                // Set up button click event
                button.addEventListener("click", () => {
                    // Remove existing preview
                    const existingPreview = document.getElementById("pdf-preview-container");
                    if (existingPreview) {
                        existingPreview.remove();
                    }

                    // Create preview container
                    const previewContainer = document.createElement("div");
                    previewContainer.id = "pdf-preview-container";
                    previewContainer.style.textAlign = "center";
                    previewContainer.style.alignItems = "center";
                    previewContainer.style.marginTop = "20px";
                    previewContainer.style.justifyContent = "center";

                    const iframe = document.createElement("iframe");
                    iframe.src = `https://schuelerzeitung-gew.glitch.me/reader/index.html?fileweb=https://schuelerzeitung-gew.glitch.me/.data/uploads/${file}`;
                    iframe.style.width = "100%";
                    iframe.style.height = "100%";
                    iframe.style.border = "none";
                    iframe.style.borderRadius = "8px";

                    // Create wrapper for iframe
                    const wrapper = document.createElement("div");
                    wrapper.style.display = "flex";
                    wrapper.style.justifyContent = "center";
                    wrapper.style.alignItems = "center";
                    wrapper.style.top = "50%";
                    wrapper.style.left = "50%";
                    if (window.innerWidth >= 1000) {
                      wrapper.style.width = "600px";
                      wrapper.style.height = "800px";
                    } else {
                      wrapper.style.height = `${window.innerHeight-250}px`;
                      wrapper.style.width = `${window.innerWidth-600}px`;
                      wrapper.style.transform = "translate(-50%, -50%)";
                    }

                    wrapper.appendChild(iframe);
                    // Close button
                    const closeButton = document.createElement("button");
                    closeButton.textContent = "Schließen";
                    closeButton.textAlign = "center";
                    closeButton.style.fontSize = "15px";
                    closeButton.style.marginTop = "10px";
                    closeButton.style.padding = "5px 10px";
                    closeButton.style.background = "#f44336";
                    closeButton.style.color = "white";
                    closeButton.style.border = "none";
                    closeButton.style.borderRadius = "5px";
                    closeButton.style.cursor = "pointer";
                    closeButton.addEventListener("click", () => {
                        previewContainer.remove();
                    });

                    // "Lesen" button for individual URLs based on filename
                    const lesenButton = document.createElement("button");
                    lesenButton.textAlign = "center";
                    lesenButton.textContent = "Lesen";
                    lesenButton.style.fontSize = "15px";
                    lesenButton.style.marginTop = "10px";
                    lesenButton.style.padding = "5px 10px";
                    lesenButton.style.background = "#33BFD1";
                    lesenButton.style.color = "white";
                    lesenButton.style.border = "none";
                    lesenButton.style.cursor = "pointer";
                    lesenButton.addEventListener("click", () => {
                      window.location.href = `https://schuelerzeitung-gew.glitch.me/reader/index.html?fileweb=https://schuelerzeitung-gew.glitch.me/.data/uploads/${file}`;
                    });
                    // Download button
                    const downloadButton = document.createElement("a");
                    downloadButton.textContent = "Herunterladen";
                    downloadButton.style.display = "inline-block";
                    downloadButton.textAlign = "center";
                    downloadButton.style.marginTop = "5px";
                    downloadButton.style.padding = "5px 10px";
                    downloadButton.style.background = "#33BFD1";
                    downloadButton.style.color = "white";
                    downloadButton.style.textDecoration = "none";
                    downloadButton.style.border = "none";
                    downloadButton.style.borderRadius = "5px";
                    downloadButton.style.cursor = "pointer";
                    downloadButton.href = `.data/uploads/${file}`;
                    downloadButton.download = file;
                    downloadButton.target = "_blank";

                    // Append elements
                    previewContainer.appendChild(wrapper);
                    previewContainer.appendChild(closeButton);
                    previewContainer.appendChild(lesenButton); // "Lesen" button
                    previewContainer.appendChild(downloadButton);

                    li.appendChild(previewContainer);
                });

                // File name below icon
                const filenameText = document.createElement("span");
                filenameText.textContent = file;
                filenameText.style.display = "block";
                filenameText.style.marginTop = "2px";
                filenameText.style.fontSize = "14px";
                filenameText.style.color = "#333";

                li.appendChild(button);
                li.appendChild(filenameText);
                list.appendChild(li);
            });
        })
        .catch(err => console.error("Fehler beim Laden der PDFs:", err));
});
