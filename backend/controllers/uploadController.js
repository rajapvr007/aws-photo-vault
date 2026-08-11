const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const {
  generateDataKey,
} = require("../services/kmsService");

const {
  encryptBuffer,
} = require("../utils/encryption");

const s3Client = require("../config/s3");
const db = require("../config/db");

const uploadImage = async (req, res) => {
  try {
    // =================================================
    // STEP 1 - CHECK FILE
    // =================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image selected",
      });
    }

    // =================================================
    // STEP 2 - CREATE S3 KEY
    // =================================================

    const originalName = req.file.originalname;

    const fileName = `${uuidv4()}-${originalName}`;

    const s3Key = `${req.user.sub}/${fileName}`;

    // =================================================
    // STEP 3 - GENERATE KMS DATA KEY
    // =================================================

    const {
      plaintextKey,
      encryptedKey,
    } = await generateDataKey();

    // =================================================
    // STEP 4 - ENCRYPT IMAGE
    // =================================================

    const {
      encryptedData,
      iv,
    } = encryptBuffer(
      req.file.buffer,
      plaintextKey
    );

    // =================================================
    // STEP 5 - CONVERT KMS CIPHERTEXT TO BASE64
    // =================================================

    const encryptedKeyBuffer = Buffer.from(encryptedKey);

    const encryptedKeyBase64 = encryptedKeyBuffer.toString("base64");

    const ivBuffer = Buffer.from(iv);

    const ivBase64 = ivBuffer.toString("base64");

    // =================================================
    // STEP 6 - UPLOAD ENCRYPTED IMAGE TO S3
    // =================================================

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: encryptedData,
      ContentType: "application/octet-stream",
    });

    await s3Client.send(command);

    // =================================================
    // STEP 7 - INSERT DATABASE
    // =================================================

    const sql = `
      INSERT INTO images
      (
        file_name,
        original_name,
        uploaded_by,
        encrypted_key,
        iv
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      s3Key,
      originalName,
      req.user.sub,
      encryptedKeyBase64,
      ivBase64,
    ];

    db.query(
      sql,
      values,
      (err, result) => {
        if (err) {
          console.error(
            "❌ DATABASE INSERT FAILED:",
            err
          );

          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        return res.status(201).json({
          success: true,
          message: "Image uploaded successfully 🔐",
          imageId: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error(
      "\n❌ IMAGE UPLOAD ERROR"
    );

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadImage,
};