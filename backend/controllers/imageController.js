const db = require("../config/db");
const s3Client = require("../config/s3");

const { GetObjectCommand,DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { generateDataKey, decryptDataKey } = require("../services/kmsService");
const { encryptBuffer, decryptBuffer } = require("../utils/encryption");

const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];

    stream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    stream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
};

//get images for logged in user
exports.getImages = (req, res) => {
  const userId = req.user.sub;

  db.query(
    "SELECT * FROM images WHERE uploaded_by = ? ORDER BY uploaded_at DESC",
    [userId],
    async (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      try {
        const images = await Promise.all(
          results.map(async (image) => {
            const command = new GetObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: image.file_name,
            });

            const signedUrl = await getSignedUrl(
              s3Client,
              command,
              {
                expiresIn: 3600,
              }
            );

            return {
              id: image.id,
              fileName: image.file_name,
              originalName: image.original_name,
              uploadedAt: image.uploaded_at,
              imageUrl: signedUrl,
            };
          })
        );

        res.json({
          success: true,
          total: images.length,
          images,
        });

      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }
  );
};

// get image by id
// exports.getImageById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     db.query(
//       "SELECT * FROM images WHERE id = ?",
//       [id],
//       async (err, results) => {
//         if (err) throw err;

//         const image = results[0];

//         // 🔐 Decrypt key
//         const plaintextKey = await decryptDataKey(image.encrypted_key);

//         // ☁️ Get encrypted file from S3
//         const data = await s3Client.send(
//           new GetObjectCommand({
//             Bucket: process.env.AWS_BUCKET_NAME,
//             Key: image.file_name,
//           })
//         );

//         const chunks = [];
//         for await (const chunk of data.Body) {
//           chunks.push(chunk);
//         }

//         const encryptedBuffer = Buffer.concat(chunks);

//         // 🔐 Decrypt image
//         const decryptedBuffer = decryptBuffer(
//           encryptedBuffer,
//           plaintextKey,
//           Buffer.from(image.iv, "base64")
//         );

//         res.set("Content-Type", "image/jpeg");
//         res.send(decryptedBuffer);
//       }
//     );
//   } catch (err) {
//     console.error("Image fetch error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getImageById = async (req, res) => {

  try {

    console.log("\n");
    console.log("======================================");
    console.log("========= GET IMAGE BY ID ============");
    console.log("======================================");


    const imageId = req.params.id;
    const userId = req.user.sub;


    console.log("Image ID:", imageId);
    console.log("User ID:", userId);


    // ================================================
    // DATABASE
    // ================================================

    const [results] =
      await db.promise().query(
        `
        SELECT *
        FROM images
        WHERE id = ?
        AND uploaded_by = ?
        `,
        [imageId, userId]
      );


    console.log(
      "DB rows:",
      results.length
    );


    if (results.length === 0) {

      console.log(
        "❌ IMAGE NOT FOUND IN DATABASE"
      );

      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }


    const image = results[0];


    console.log("\nDATABASE RECORD:");

    console.log({
      id: image.id,
      file_name: image.file_name,
      original_name: image.original_name,
      encrypted_key_exists:
        !!image.encrypted_key,
      encrypted_key_length:
        image.encrypted_key?.length,
      iv_exists:
        !!image.iv,
      iv_length:
        image.iv?.length,
    });


    // ================================================
    // CHECK ENCRYPTED KEY
    // ================================================

    if (!image.encrypted_key) {

      console.error(
        "❌ encrypted_key is NULL"
      );

      return res.status(500).json({
        success: false,
        message:
          "Encrypted key missing from database",
      });
    }


    // ================================================
    // BASE64 -> BUFFER
    // ================================================

    console.log(
      "\nSTEP 1: Converting encrypted key"
    );


    const encryptedKey =
      Buffer.from(
        image.encrypted_key,
        "base64"
      );


    console.log(
      "Encrypted key Buffer:",
      Buffer.isBuffer(encryptedKey)
    );

    console.log(
      "Encrypted key length:",
      encryptedKey.length
    );

    console.log(
      "First bytes:",
      encryptedKey.subarray(0, 10)
    );


    // ================================================
    // S3
    // ================================================

    console.log(
      "\nSTEP 2: Fetching encrypted image from S3"
    );


    const s3Object =
      await s3Client.send(
        new GetObjectCommand({

          Bucket:
            process.env.AWS_BUCKET_NAME,

          Key:
            image.file_name,

        })
      );


    console.log(
      "✅ S3 OBJECT FOUND"
    );


    const encryptedData =
      await streamToBuffer(
        s3Object.Body
      );


    console.log(
      "Encrypted image size:",
      encryptedData.length
    );


    // ================================================
    // KMS
    // ================================================

    console.log(
      "\nSTEP 3: Calling KMS decrypt"
    );


    const plaintextKey =
      await decryptDataKey(
        encryptedKey
      );


    console.log(
      "✅ KMS DECRYPT SUCCESS"
    );


    console.log(
      "Plaintext key length:",
      plaintextKey.length
    );


    // ================================================
    // IV
    // ================================================

    if (!image.iv) {

      throw new Error(
        "IV missing from database"
      );
    }


    const iv =
      Buffer.from(
        image.iv,
        "base64"
      );


    console.log(
      "IV length:",
      iv.length
    );


    // ================================================
    // AES DECRYPT
    // ================================================

    console.log(
      "\nSTEP 4: AES DECRYPT"
    );


    const decrypted =
      decryptBuffer(
        encryptedData,
        plaintextKey,
        iv
      );


    console.log(
      "✅ AES DECRYPT SUCCESS"
    );


    console.log(
      "Decrypted image size:",
      decrypted.length
    );


    // ================================================
    // SEND IMAGE
    // ================================================

    console.log(
      "\nSTEP 5: SENDING IMAGE TO BROWSER"
    );


    // Temporarily use JPEG.
    // Later we will store MIME type in DB.

    res.set(
      "Content-Type",
      "image/jpeg"
    );


    return res.send(
      decrypted
    );

  } catch (error) {

    console.error(
      "\n❌ GET IMAGE ERROR"
    );

    console.error(
      "Error name:",
      error.name
    );

    console.error(
      "Error message:",
      error.message
    );

    console.error(
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message,

    });
  }
};

exports.deleteImage = (req, res) => {
  const imageId = req.params.id;
  const userId = req.user.sub;

  db.query(
    "SELECT * FROM images WHERE id = ? AND uploaded_by = ?",
    [imageId, userId],
    async (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Image not found",
        });
      }

      const image = results[0];

      try {
        // Delete from S3
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: image.file_name,
          })
        );

        // Delete from MySQL
        db.query(
          "DELETE FROM images WHERE id = ?",
          [imageId],
          (err) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: err.message,
              });
            }

            res.json({
              success: true,
              message: "Image deleted successfully",
            });
          }
        );
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }
  );
};