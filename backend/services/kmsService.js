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
  console.log("\n========== KMS GENERATE DATA KEY ==========");

  console.log("KMS Region:", process.env.AWS_REGION);
  console.log("KMS Key ID:", KEY_ID);

  if (!KEY_ID) {
    throw new Error("KMS_KEY_ID is missing from .env");
  }

  const command = new GenerateDataKeyCommand({
    KeyId: KEY_ID,
    KeySpec: "AES_256",
  });

  const response = await kms.send(command);

  console.log("KMS GenerateDataKey successful");

  console.log(
    "Plaintext type:",
    response.Plaintext?.constructor?.name
  );

  console.log(
    "Ciphertext type:",
    response.CiphertextBlob?.constructor?.name
  );

  console.log(
    "Plaintext length:",
    response.Plaintext?.length
  );

  console.log(
    "Ciphertext length:",
    response.CiphertextBlob?.length
  );

  console.log("============================================\n");

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
  console.log("\n========== KMS DECRYPT DATA KEY ==========");

  if (!encryptedKey) {
    throw new Error("Encrypted key is missing");
  }

  console.log(
    "Input type:",
    encryptedKey.constructor?.name
  );

  console.log(
    "Is Buffer:",
    Buffer.isBuffer(encryptedKey)
  );

  console.log(
    "Input length:",
    encryptedKey.length
  );

  console.log(
    "First bytes:",
    Buffer.from(encryptedKey).subarray(0, 20)
  );

  const ciphertext = Buffer.from(encryptedKey);

  console.log(
    "Converted Buffer:",
    Buffer.isBuffer(ciphertext)
  );

  console.log(
    "Converted length:",
    ciphertext.length
  );

  const command = new DecryptCommand({
    CiphertextBlob: ciphertext,
  });

  try {
    const response = await kms.send(command);

    console.log("KMS decrypt SUCCESS");

    console.log(
      "Plaintext key type:",
      response.Plaintext?.constructor?.name
    );

    console.log(
      "Plaintext key length:",
      response.Plaintext?.length
    );

    console.log("==========================================\n");

    return Buffer.from(response.Plaintext);

  } catch (error) {

    console.error("\n❌ KMS DECRYPT FAILED");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.Code);
    console.error("==========================================\n");

    throw error;
  }
};


module.exports = {
  generateDataKey,
  decryptDataKey,
};