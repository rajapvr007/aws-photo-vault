const db = require("../config/db");
const s3Client = require("../config/s3");

const { GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
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

// get images for logged in user
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

exports.getImageById = async (req, res) => {
  try {
    const imageId = req.params.id;
    const userId = req.user.sub;

    const [results] = await db.promise().query(
      `
        SELECT *
        FROM images
        WHERE id = ?
        AND uploaded_by = ?
      `,
      [imageId, userId]
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    const image = results[0];

    if (!image.encrypted_key) {
      return res.status(500).json({
        success: false,
        message: "Encrypted key missing from database",
      });
    }

    const encryptedKey = Buffer.from(image.encrypted_key, "base64");

    const s3Object = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: image.file_name,
      })
    );

    const encryptedData = await streamToBuffer(s3Object.Body);

    const plaintextKey = await decryptDataKey(encryptedKey);

    if (!image.iv) {
      throw new Error("IV missing from database");
    }

    const iv = Buffer.from(image.iv, "base64");

    const decrypted = decryptBuffer(
      encryptedData,
      plaintextKey,
      iv
    );

    res.set("Content-Type", "image/jpeg");

    return res.send(decrypted);
  } catch (error) {
    console.error("\n❌ GET IMAGE ERROR");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
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
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: image.file_name,
          })
        );

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