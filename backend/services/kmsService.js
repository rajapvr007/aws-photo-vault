const {
  KMSClient,
  GenerateDataKeyCommand,
  DecryptCommand,
} = require("@aws-sdk/client-kms");

const kms = new KMSClient({
  region: process.env.AWS_REGION,
});

const KEY_ID = process.env.KMS_KEY_ID;

// =====================================================
// GENERATE DATA KEY
// =====================================================

const generateDataKey = async () => {
  if (!KEY_ID) {
    throw new Error("KMS_KEY_ID is missing from .env");
  }

  const command = new GenerateDataKeyCommand({
    KeyId: KEY_ID,
    KeySpec: "AES_256",
  });

  const response = await kms.send(command);

  return {
    // VERY IMPORTANT:
    // Convert AWS Uint8Array into Node Buffer
    plaintextKey: Buffer.from(response.Plaintext),
    encryptedKey: Buffer.from(response.CiphertextBlob),
  };
};

// =====================================================
// DECRYPT DATA KEY
// =====================================================

const decryptDataKey = async (encryptedKey) => {
  if (!encryptedKey) {
    throw new Error("Encrypted key is missing");
  }

  const ciphertext = Buffer.from(encryptedKey);

  const command = new DecryptCommand({
    CiphertextBlob: ciphertext,
  });

  const response = await kms.send(command);

  return Buffer.from(response.Plaintext);
};

module.exports = {
  generateDataKey,
  decryptDataKey,
};