const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const s3Client = require("../config/s3");
const db = require("../config/db");

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

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);

    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
console.log("Logged in user:", req.user);
    db.query(
      "INSERT INTO images (image_url, file_name, original_name,uploaded_by) VALUES (?, ?, ?,?)",
      [imageUrl,
      s3Key,
      originalName,
      req.user.sub,
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
          imageUrl,
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