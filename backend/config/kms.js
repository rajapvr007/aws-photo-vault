const { KMSClient } = require("@aws-sdk/client-kms");

const kmsClient = new KMSClient({
  region: process.env.AWS_REGION,
});

module.exports = kmsClient;