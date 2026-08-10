const db = require("../config/db");
const s3Client = require("../config/s3");

const { GetObjectCommand,DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { generateDataKey, decryptDataKey } = require("../services/kmsService");
const { encryptBuffer, decryptBuffer } = require("../utils/encryption");

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
exports.getImageById = async (req, res) => {
  try {
    const { id } = req.params;

    db.query(
      "SELECT * FROM images WHERE id = ?",
      [id],
      async (err, results) => {
        if (err) throw err;

        const image = results[0];

        // 🔐 Decrypt key
        const plaintextKey = await decryptDataKey(image.encrypted_key);

        // ☁️ Get encrypted file from S3
        const data = await s3Client.send(
          new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: image.file_name,
          })
        );

        const chunks = [];
        for await (const chunk of data.Body) {
          chunks.push(chunk);
        }

        const encryptedBuffer = Buffer.concat(chunks);

        // 🔐 Decrypt image
        const decryptedBuffer = decryptBuffer(
          encryptedBuffer,
          plaintextKey,
          Buffer.from(image.iv, "base64")
        );

        res.set("Content-Type", "image/jpeg");
        res.send(decryptedBuffer);
      }
    );
  } catch (err) {
    console.error("Image fetch error:", err);
    res.status(500).json({ error: err.message });
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