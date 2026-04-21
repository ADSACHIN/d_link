const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Absolute path to the "files" directory ───
const FILES_DIR = path.join(__dirname, "files");

// ─── CORS (allow requests from any origin) ───
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// ─── 1. Serve the HTML download page ───
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ─── 2. Serve static files (browser may preview them) ───
//       URL: http://localhost:3000/files/example.pdf
app.use("/files", express.static(FILES_DIR));

// ─── 3. Forced download route ───
//       URL: http://localhost:3000/download/example.pdf
app.get("/download/:filename", (req, res) => {
  const { filename } = req.params;

  // --- Security: validate filename ---
  // Block path traversal characters and null bytes
  if (
    !filename ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("\0")
  ) {
    return res.status(400).json({ error: "Invalid filename." });
  }

  // Only allow safe characters: letters, digits, hyphens, underscores, dots
  const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;
  if (!SAFE_NAME.test(filename)) {
    return res.status(400).json({ error: "Filename contains invalid characters." });
  }

  // Build full path and make sure it stays inside FILES_DIR
  const filePath = path.join(FILES_DIR, filename);
  const resolved = path.resolve(filePath);

  if (!resolved.startsWith(FILES_DIR)) {
    return res.status(403).json({ error: "Access denied." });
  }

  // --- Check file exists ---
  if (!fs.existsSync(resolved)) {
    return res.status(404).json({ error: "File not found." });
  }

  // --- Force download (Content-Disposition: attachment) ---
  // Explicitly set headers so the browser uses the correct filename
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`
  );

  res.sendFile(resolved, (err) => {
    if (err) {
      console.error("Download error:", err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to download file." });
      }
    }
  });
});

// ─── 404 handler ───
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ─── Start server ───
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n  ✅  Download server running on port ${PORT}`);
  console.log(`  📂  Static files:      /files/<filename>`);
  console.log(`  ⬇️   Forced download:   /download/<filename>\n`);
});
