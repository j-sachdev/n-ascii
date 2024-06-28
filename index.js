const express = require("express");
const path = require("path");
const AsciiArt = require("ascii-art");
const multer = require("multer");
var cors = require("cors");
const dotenv = require("dotenv");
const fs = require('fs');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const uploadsDir = process.env.UPLOADS_DIR || "uploads";

app.use(cors());

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, uploadsDir));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

app.use(express.static(path.join(__dirname, "public")));

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send("Working");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const imagePath = path.join(__dirname, uploadsDir, req.file.filename);

    // Generate ASCII art from uploaded image
    const asciiImage = await AsciiArt.image({
      filepath: imagePath,
      alphabet: "variant4",
      width: 80,
    });

    // Remove ANSI escape codes
    const cleanAsciiImage = asciiImage.replace(
      /\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g,
      ""
    );

    // Send the clean ASCII art as HTML response
    res.send(
      `<pre style="white-space: pre-wrap; font-family: monospace;">${cleanAsciiImage}</pre>`
    );
  } catch (err) {
    console.error("Error generating ASCII art:", err);
    res.status(500).send("Error generating ASCII art.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
