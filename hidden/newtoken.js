require("dotenv").config();
function showPopup(message) {
    // Create the popup div
    let popup = document.createElement("div");
    popup.innerText = message;

    // Style the popup
    popup.style.position = "fixed";
    popup.style.bottom = "20px";
    popup.style.right = "20px";
    popup.style.background = "black";
    popup.style.color = "white";
    popup.style.opacity = "1";
    popup.style.padding = "10px 20px";
    popup.style.borderRadius = "5px";
    popup.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.5)";
    popup.style.zIndex = "1";

    // Append the popup to the body
    document.body.appendChild(popup);

    // Remove the popup after 10 seconds
    setTimeout(() => {
        let i = 100; // Start opacity at 1.0
        let fadeInterval = setInterval(() => {
            let opacity = i / 100;
            popup.style.opacity = `${opacity}`;
            i--;

            if (i < 0) {
                clearInterval(fadeInterval); // Stop fading when opacity reaches 0
                popup.remove(); // Remove the popup after fade-out
            }
        }, 10); // Change opacity every 100ms
    }, 3000); // Start fade-out after 3 seconds
}

function requestNewToken() {
    // Get the CODEWORD from environment variables
    const CODEWORD = "Dk6vhwxH0i3R245jhiE1hGdCJzkf_Rd_5wVps0qf49U"; // Or use process.env for production
    
    const API_URL = "https://schuelerzeitung-gew.glitch.me/newtoken";
    
    // Prepare the headers for the fetch request
    const headers = {
        "codeword": CODEWORD,
        "Content-Type": "application/json"
    };
    
    // Make the POST request using fetch
    fetch(API_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({}) // Send an empty body, adjust as needed
    })
    .then(response => response.json())  // Parse the response as JSON
    .then(data => {
        // Handle successful response
        if (data.success) {
            console.log("Token received:", data.token);
            showPopup('Success updating the Token');
        } else {
            // Handle error from the server (e.g., invalid codeword)
            console.error("Error:", data.message);
            showPopup(`Error updating Token: ${data.message}`);
        }
    })
    .catch(error => {
        // Handle fetch or network errors
        console.error("Fetch error:", error);
        showPopup(`Error: ${error}`);
    });
}
