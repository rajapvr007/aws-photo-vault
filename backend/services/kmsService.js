const {
  GenerateDataKeyCommand,
  DecryptCommand,
} = require("@aws-sdk/client-kms");

const kmsClient = require("../config/kms");

// ✅ Generate key
const generateDataKey = async () => {
  const command = new GenerateDataKeyCommand({
    KeyId: process.env.KMS_KEY_ID,
    KeySpec: "AES_256",
  });

  const response = await kmsClient.send(command);

  return {
    plaintextKey: response.Plaintext,        // Buffer
    encryptedKey: response.CiphertextBlob,  // Buffer
  };
};

// ✅ Decrypt key
const decryptDataKey = async (encryptedKeyBase64) => {
  try {
    const encryptedKey = Buffer.from(encryptedKeyBase64, "base64");

    const command = new DecryptCommand({
      CiphertextBlob: encryptedKey,
    });

    const response = await kmsClient.send(command);

    return response.Plaintext; // Buffer
  } catch (err) {
    console.error("❌ KMS Decrypt Error:", err);
    throw err;
  }
};

module.exports = {
  generateDataKey,
  decryptDataKey,
};