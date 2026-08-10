const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const s3Client = require("../config/s3");
const db = require("../config/db");

const { generateDataKey, decryptDataKey } = require("../services/kmsService");
const { encryptBuffer, decryptBuffer } = require("../utils/encryption");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image selected",
      });
    }

    const originalName = req.file.originalname;
    const fileName = `${uuidv4()}-${originalName}`;
    const s3Key = `${req.user.sub}/${fileName}`;

    // 🔐 Generate key
    const { plaintextKey, encryptedKey } = await generateDataKey();

    // 🔐 Encrypt image
    const { encryptedData, iv } = encryptBuffer(
      req.file.buffer,
      plaintextKey
    );

    // ☁️ Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: encryptedData,
        ContentType: "application/octet-stream",
      })
    );

    // await s3Client.send(command);

    // const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    // console.log("Logged in user:", req.user);
    db.query(
      "INSERT INTO images ( file_name, original_name,uploaded_by, encrypted_key, iv) VALUES (?,?, ?, ?,?)",
      [s3Key,
        originalName,
        req.user.sub,
        encryptedKey.toString("base64"), // ✅ ONLY HERE
        iv.toString("base64"),
      ],
      (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        res.status(201).json({
          success: true,
          message: "Image uploaded successfully",
        });
      }
    );
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  uploadImage,
};