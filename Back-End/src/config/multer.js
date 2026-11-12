const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const baseDir = "uploads";
    let subFolder = "";

    const ext = path.extname(file.originalname).toLowerCase();

    if (ext === ".png") {
      subFolder = "pngFiles";
    } else if (ext === ".pdf") {
      subFolder = "pdfFiles";
    } else if (ext === ".jpg" || ext === ".jpeg") {
      subFolder = "jpgFiles";
    } else if (ext === ".webp") {
      subFolder = "webpFiles";
    } else {
      subFolder = "otherFiles";
    }
    //Vai realizar a validação de cada um

    const uploadDir = path.join(__dirname, "..", "..", baseDir, subFolder);

    fs.mkdirSync(uploadDir, { recursive: true });

    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const nome = `${Date.now()}-${crypto.randomBytes(5).toString("hex")}${ext}`;

    cb(null, nome);
  },
});

const allowedImageTypes = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedImageTypes.get(extension) !== file.mimetype) {
      return cb(new Error("Envie uma imagem JPG, PNG ou WEBP."));
    }
    return cb(null, true);
  },
});

module.exports = upload;