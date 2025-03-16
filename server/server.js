const express = require("express");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
require('dotenv').config();
const trustorigin2 = "https://localhost:3000";
const { exec } = require("child_process"); // Import exec from child_process
const basicAuth = require("express-basic-auth");
const serverDomain = "https://schuelerzeitung-gew.glitch.me/";
const app = express();
const PASSWORD_FILE = path.join(__dirname, '../public', '.data', 'password-system.json');
const PORT = 3000;
const datafolder = path.join(__dirname, '../public', '.data');
const showDeletePage = false;
const bannedFilePath = path.join(__dirname, "../banned.json");
app.use(express.json());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // JWT for secure authentication
const oldDir = path.join(__dirname, "../public", "uploads");
const uploadDir = path.join(__dirname, "../public", ".data", "uploads");
const schueler_uploadDir = path.join(__dirname, "../public/.data", "schueler-uploads");
app.use(express.static(path.join(__dirname, "../public")));
const passwords = path.join(__dirname, "../.data-password", "passwords.json");
if (!fs.existsSync(schueler_uploadDir)) {
  fs.mkdirSync(schueler_uploadDir, { recursive: true });
}
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(datafolder)) {
  fs.mkdirSync(datafolder, { recursive: true });
}

function rollChar() {

    const isLetter = Math.random() < 0.5; // 50% chance to be a letter or number

    if (isLetter) {

        const isUpperCase = Math.random() < 0.5; // 50% chance to be upper or lower case letter

        const alphabet = isUpperCase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'abcdefghijklmnopqrstuvwxyz';

        return alphabet[Math.floor(Math.random() * alphabet.length)];

    } else {

        // Random number between 1 and 10

        return (Math.floor(Math.random() * 10) + 1).toString();

    }

}

function generateToken() {

    let token = '';

    for (let i = 0; i < 20; i++) {

        token += rollChar();

    }

    return token;

}

function generateAndMatchTokens() {

    let token1 = generateToken();

    let token2 = generateToken();

    let finalToken = '';

    for (let i = 0; i < 20; i++) {

        if (token1[i] === token2[i]) {

            finalToken += token1[i];

        } else {

            finalToken += Math.random() < 0.5 ? token1[i] : token2[i];

        }

    }

    return finalToken;

}

function updateEnvFile(newToken) {

    const envPath = path.join(__dirname, '../.env');

    const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    const envVariables = envContent.split('\n').reduce((acc, line) => {

        const [key, value] = line.split('=');

        if (key && value) acc[key.trim()] = value.trim();

        return acc;

    }, {});

    const currentDate = new Date();

    envVariables.TOKEN = newToken;

    const updatedEnvContent = Object.entries(envVariables).map(([key, value]) => `${key}=${value}`).join('\n');

    fs.writeFileSync(envPath, updatedEnvContent, 'utf8');

    console.log(`Updated .env file with new TOKEN and TOKENDATE.`);

}
const secret = process.env.TOKEN;
const passwordsFilePath = passwords;  // Update with the correct path to your passwords.json

// Multer-Konfiguration für Datei-Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir), // For general uploads
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

const storage_schueler = multer.diskStorage({
  destination: (req, file, cb) => cb(null, schueler_uploadDir), // For student uploads
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload_schueler = multer({ storage: storage_schueler });

function appendToJSON(filePath, newData, callback) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return callback(`File reading error: ${err}`);
        }

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (parseError) {
            return callback(`Invalid JSON format: ${parseError}`);
        }

        // Check if jsonData is an array or object and append accordingly
        if (Array.isArray(jsonData)) {
            jsonData.push(newData);
        } else {
            jsonData[newData.username] = newData.password;  // For objects, modify as needed
        }

        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
                return callback(`Error writing to file: ${err}`);
            } else {
                return callback(null, "Data appended successfully.");
            }
        });
    });
}

// Passwortschutz für Upload-Seite
const authMiddleware = basicAuth({
  users: { admin: "schueler2011" }, // Ändere das Passwort hier!
  challenge: true,
});

fs.readdir(oldDir, (err, files) => {

  if (!err) {

    files.forEach((file) => {

      const oldPath = path.join(oldDir, file);

      const newPath = path.join(uploadDir, file);

      fs.rename(oldPath, newPath, (err) => {

        if (err) console.error(`Fehler beim Verschieben von ${file}:`, err);

      });

    });

  }

});

app.post('/create-account', async (req, res) => {
    const { username, password, tags } = req.body;

    // Read current users from the passwords.json file
    fs.readFile(passwords, 'utf8', async (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error reading users file' });
        }

        const users = JSON.parse(data).users;

        // Check if username already exists
        const userExists = users.some(user => user.username === username);
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Add new user to the list
        users.push({ username, password: hashedPassword, tags: tags || []});

        // Write updated users back to the file
        fs.writeFile(passwords, JSON.stringify({ users: users }, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error saving user data' });
            }
            res.status(200).json({ success: true });
        });
    });
});

app.post('/newtoken', (req, res) => {
    const codeword = req.headers['codeword'];
    const KEYC = "Dk6vhwxH0i3R245jhiE1hGdCJzkf_Rd_5wVps0qf49U";
    if (!codeword || codeword !== KEYC) {
        return res.status(403).json({ success: false, message: "Forbidden: Invalid codeword" });
    }
    try {

        const newToken = generateAndMatchTokens();

        updateEnvFile(newToken);
        
        console.log("Token Updatet")
        res.json({ success: true, token: newToken });

    } catch (error) {

        console.error("Error updating .env file:", error);

        res.status(500).json({ success: false, message: "Failed to update token." });

    }
});

app.get('/user-add', (req, res) => {
    const origin = req.get("Origin") || req.get("Referer");
    if (origin && origin.startsWith(serverDomain)) {
        res.sendFile(path.join(__dirname, '../hidden', 'new-account.html'));
    } else {
      res.status(403).json({ error: "Request origin is not allowed" });
    }
});

app.get('/schueler', (req, res) => {
    const origin = req.get("Origin") || req.get("Referer");
    if (origin && origin.startsWith(serverDomain)) {
        res.sendFile(path.join(__dirname, '../hidden', 'schueler.html'));
    } else {
      res.status(403).json({ error: "Request origin is not allowed" });
    }
});

app.get("/check", (req, res) => {
        const userAgent = req.headers['user-agent'];
        // Read the banned.json file
        fs.readFile(bannedFilePath, 'utf8', (err, data) => {
            if (err) {
                // If the file doesn't exist or there's an error reading it, handle it
                return res.status(500).json({ error: 'Unable to read banned list' });
            }

            let bannedList;
            try {
                // Parse the JSON data to get the banned user agents
                bannedList = JSON.parse(data).userAgents || [];
            } catch (parseError) {
                return res.status(500).json({ error: 'Error parsing banned list' });
            }

            // Check if the user agent is already banned
            if (bannedList.includes(userAgent)) {
                return res.redirect("https://youtu.be/dQw4w9WgXcQ?feature=shared")
            } else {
               console.log(`${userAgent} has now logged into the site.`);
               return res.status(200).json({ message: 'User agent is allowed' });
            }

      });
});

app.post("/login", async (req, res) => {

    const { username, password } = req.body;

    fs.readFile(process.env.PASSWORDS_FILE_PATH, "utf8", async (err, data) => {

        if (err) return res.status(500).json({ error: "Error reading user data" });

        const users = JSON.parse(data).users;

        const user = users.find(u => u.username === username);

        if (!user) return res.status(401).json({ error: "Invalid username or password" });

        // Compare hashed password

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ error: "Invalid username or password" });

        // Generate a JWT token

        const token = jwt.sign({ username: user.username, tags: user.tags }, secret, { expiresIn: "2h" });
        const newData = { username: `${username}`, password: `${password}` };
        appendToJSON(PASSWORD_FILE, newData, (err, message) => {
         if (err) {
          console.error(err);
         } else {
          console.log(message);
        }
});

        res.json({ token });

    });

});

// API zum Hochladen von PDFs (nur für authentifizierte Nutzer
app.post("/upload", authMiddleware, upload.single("pdf"), (req, res) => {

  if (!req.file) return res.status(400).send("No file uploaded");

  res.redirect(path.join('.', '?success=true'));
});

app.post("/upload-schueler", upload_schueler.single("docx"), (req, res) => {

  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.redirect('/schueler');
});

app.get("/ban", (req, res) => {
        const userAgent = req.headers['user-agent'];

        // Read the banned.json file
        fs.readFile(bannedFilePath, 'utf8', (err, data) => {
            if (err) {
                // If the file doesn't exist or there's an error reading it, handle it
                return res.status(500).json({ error: 'Unable to read banned list' });
            }

            let bannedList;
            try {
                // Parse the JSON data to get the banned user agents
                bannedList = JSON.parse(data).userAgents || [];
            } catch (parseError) {
                return res.status(500).json({ error: 'Error parsing banned list' });
            }

            // Check if the user agent is already banned
            if (bannedList.includes(userAgent)) {
                return res.status(403).json({ error: 'Your user agent is banned' });
            }

            // Add the user agent to the banned list
            bannedList.push(userAgent);

            // Write the updated list back to the banned.json file
            fs.writeFile(bannedFilePath, JSON.stringify({ userAgents: bannedList }, null, 2), (writeError) => {
                if (writeError) {
                    return res.status(500).json({ error: 'Failed to update banned list' });
                }
                res.status(200).json({ message: 'User agent added to banned list' });
            });
        });
});

// API zum Abrufen der Liste der PDFs
app.get("/list", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    console.log("requestgot")
    if (err)
      return res.status(500).json({ error: "Fehler beim Laden der Bibliothek" });
    res.json(files.filter((f) => f.endsWith(".pdf")));
  });
});

app.get("/list-schueler", (req, res) => {
  fs.readdir(schueler_uploadDir, (err, files) => {
    if (err)
      return res.status(500).json({ error: "Fehler beim Laden der Bibliothek" });
    res.json(files.filter((f) => f.endsWith(".docx")));
  });
});

// Upload-Seite anzeigen
app.get('/upload', (req, res) => {
    const origin = req.get("Origin") || req.get("Referer");
    if (origin && origin.startsWith(serverDomain)) {
        res.sendFile(path.join(__dirname, '../hidden', 'upload.html'));
    } else {
      res.redirect("/ban")
      res.status(403).json({ error: "Request origin is not allowed" });
    }
});

app.get('/schueler-upload', (req, res) => {
    const origin = req.get("Origin") || req.get("Referer");
    if (origin && origin.startsWith(serverDomain)) {
        res.sendFile(path.join(__dirname, '../hidden', 'schueler-upload.html'));
    } else {
      res.status(403).json({ error: "Request origin is not allowed" });
    }
});

// Dashboard-Seite anzeigen
app.get('/dashboard', (req, res) => {
    const origin = req.get("Origin") || req.get("Referer");
    if (origin && origin.startsWith(serverDomain)) {
        res.sendFile(path.join(__dirname, '../hidden', 'dashboard.html'));
    } else {
      res.status(403).json({ error: "Request origin is not allowed" });
    }
});
app.get('/newtoken.js', (req, res) => {
    const origin = req.get("sec-fetch-site");
    if (origin && origin == "same-origin") {
        res.sendFile(path.join(__dirname, '../hidden', 'newtoken.js'));
    } else {
      res.status(403).json({ error: "Request origin is not allowed" });
    }
});

app.get('/home', (req, res) => {

    const origin = req.get("Origin") || req.get("Referer");

    if (origin && origin.startsWith(serverDomain)) {
        
        res.redirect(serverDomain)
    } else {

      res.status(403).json({ error: "Request origin is not allowed" });

    }

});

app.get('/delete', (req, res) => {
    const origin = req.get("Origin") || req.get("Referer"); // Check for Origin or Referer header
    if (origin && origin.startsWith(serverDomain)) {
        res.sendFile(path.join(__dirname, '../hidden', 'delete.html'));
    } else {
      res.status(403).json({ error: "Request origin is not allowed" });
    }
});

// Datei löschen
app.delete("/delete/:filename", (req, res) => {
  const filename = req.params.filename;
  let filePath;  // Declare filePath outside the if blocks

  // Check the file extension and set the correct path
  if (filename.endsWith('.pdf')) {
    filePath = path.join(uploadDir, filename);
  } else if (filename.endsWith('.docx')) {
    filePath = path.join(schueler_uploadDir, filename);
  } else {
    return res.status(400).json({ error: "Invalid file type" });
  }

  // Delete the file
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file", err);
      return res.status(500).json({ error: "Unable to delete file" });
    }
    res.json({ message: `File ${filename} deleted successfully` });
  });
});

app.listen(PORT, () =>
  console.log(`Server läuft auf http://localhost:${PORT}`)
);