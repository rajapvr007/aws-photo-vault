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

    console.log("\n");
    console.log("==========================================");
    console.log("========== IMAGE UPLOAD START ============");
    console.log("==========================================");


    // =================================================
    // STEP 1 - CHECK FILE
    // =================================================

    if (!req.file) {

      console.log("❌ No file received");

      return res.status(400).json({
        success: false,
        message: "No image selected",
      });
    }

    console.log("STEP 1: FILE RECEIVED");

    console.log("Original name:", req.file.originalname);
    console.log("MIME type:", req.file.mimetype);
    console.log("Original buffer size:", req.file.buffer.length);


    // =================================================
    // STEP 2 - CREATE S3 KEY
    // =================================================

    const originalName = req.file.originalname;

    const fileName =
      `${uuidv4()}-${originalName}`;

    const s3Key =
      `${req.user.sub}/${fileName}`;

    console.log("\nSTEP 2: S3 KEY CREATED");

    console.log("S3 Key:", s3Key);


    // =================================================
    // STEP 3 - GENERATE KMS DATA KEY
    // =================================================

    console.log("\nSTEP 3: GENERATING KMS DATA KEY");

    const {
      plaintextKey,
      encryptedKey,
    } = await generateDataKey();


    console.log("Plaintext key is Buffer:",
      Buffer.isBuffer(plaintextKey)
    );

    console.log("Plaintext key length:",
      plaintextKey.length
    );

    console.log("Encrypted key is Buffer:",
      Buffer.isBuffer(encryptedKey)
    );

    console.log("Encrypted key length:",
      encryptedKey.length
    );


    // =================================================
    // STEP 4 - ENCRYPT IMAGE
    // =================================================

    console.log("\nSTEP 4: ENCRYPTING IMAGE");

    const {
      encryptedData,
      iv,
    } = encryptBuffer(
      req.file.buffer,
      plaintextKey
    );


    console.log(
      "Encrypted image size:",
      encryptedData.length
    );

    console.log(
      "IV type:",
      iv.constructor?.name
    );

    console.log(
      "IV length:",
      iv.length
    );


    // =================================================
    // STEP 5 - CONVERT KMS CIPHERTEXT TO BASE64
    // =================================================

    console.log("\nSTEP 5: CONVERTING KMS KEY");

    // VERY IMPORTANT
    // Always convert AWS Uint8Array -> Buffer FIRST

    const encryptedKeyBuffer =
      Buffer.from(encryptedKey);

    const encryptedKeyBase64 =
      encryptedKeyBuffer.toString("base64");

    const ivBuffer =
      Buffer.from(iv);

    const ivBase64 =
      ivBuffer.toString("base64");


    console.log(
      "Encrypted key Buffer:",
      Buffer.isBuffer(encryptedKeyBuffer)
    );

    console.log(
      "Encrypted key length:",
      encryptedKeyBuffer.length
    );

    console.log(
      "Encrypted key base64 length:",
      encryptedKeyBase64.length
    );

    console.log(
      "Encrypted key base64 first 50 chars:",
      encryptedKeyBase64.substring(0, 50)
    );

    console.log(
      "IV base64:",
      ivBase64
    );


    // =================================================
    // STEP 6 - UPLOAD ENCRYPTED IMAGE TO S3
    // =================================================

    console.log("\nSTEP 6: UPLOADING TO S3");

    const command = new PutObjectCommand({

      Bucket:
        process.env.AWS_BUCKET_NAME,

      Key:
        s3Key,

      Body:
        encryptedData,

      ContentType:
        "application/octet-stream",
    });


    await s3Client.send(command);

    console.log("✅ S3 UPLOAD SUCCESS");
    console.log("Bucket:",
      process.env.AWS_BUCKET_NAME
    );

    console.log("Key:", s3Key);


    // =================================================
    // STEP 7 - INSERT DATABASE
    // =================================================

    console.log("\nSTEP 7: INSERTING DATABASE");

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


    console.log("DB values:");

    console.log({
      file_name: s3Key,
      original_name: originalName,
      uploaded_by: req.user.sub,
      encrypted_key_length:
        encryptedKeyBase64.length,
      iv: ivBase64,
    });


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


        console.log(
          "✅ DATABASE INSERT SUCCESS"
        );

        console.log(
          "Inserted image ID:",
          result.insertId
        );


        console.log(
          "=========================================="
        );

        console.log(
          "========== IMAGE UPLOAD COMPLETE ========="
        );

        console.log(
          "=========================================="
        );


        return res.status(201).json({

          success: true,

          message:
            "Image uploaded successfully 🔐",

          imageId:
            result.insertId,

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

      message:
        error.message,

    });
  }
};


module.exports = {
  uploadImage,
};