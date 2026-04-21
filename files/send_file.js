const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB
  }
});

app.post("/upload", upload.single("file"), (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send("No file received");
    }

    console.log("HTTP upload received:", file.originalname);

    const transferId = Date.now().toString();

    const base64Data = file.buffer.toString("base64");

    io.emit("file:start", {
      transferId,
      fileName: file.originalname,
      fileType: file.mimetype,
      totalChunks: 1,
      hash: "",
      senderName: "BAT Upload"
    });

    io.emit("file:chunk", {
      transferId,
      index: 0,
      data: base64Data
    });

    io.emit("file:complete", {
      transferId
    });

    res.send("Upload successful");

  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});