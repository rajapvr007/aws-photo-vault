const {
  ListBucketsCommand,
} = require("@aws-sdk/client-s3");

const s3Client = require("../config/s3");

const testS3 = async (req, res) => {
  try {
    const data = await s3Client.send(
      new ListBucketsCommand({})
    );

    res.json({
      success: true,
      buckets: data.Buckets,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  testS3,
};