const crypto = require("crypto");

// =====================================================
// ENCRYPT
// =====================================================

const encryptBuffer = (buffer, key) => {

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    key,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Store:
  // encrypted data + auth tag

  const encryptedData = Buffer.concat([
    encrypted,
    authTag,
  ]);

  return {
    encryptedData,
    iv,
  };
};


// =====================================================
// DECRYPT
// =====================================================

const decryptBuffer = (
  encryptedData,
  key,
  iv
) => {

  // Last 16 bytes = authentication tag

  const authTag =
    encryptedData.subarray(
      encryptedData.length - 16
    );

  const encrypted =
    encryptedData.subarray(
      0,
      encryptedData.length - 16
    );


  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    iv
  );

  decipher.setAuthTag(authTag);


  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);


  return decrypted;
};


module.exports = {
  encryptBuffer,
  decryptBuffer,
};