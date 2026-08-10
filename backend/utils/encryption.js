const crypto = require("crypto");

// AES-256-CBC
const encryptBuffer = (buffer, key) => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(buffer),
    cipher.final(),
  ]);

  return {
    encryptedData: encrypted,
    iv,
  };
};

const decryptBuffer = (encryptedData, key, iv) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return decrypted;
};

module.exports = {
  encryptBuffer,
  decryptBuffer,
};