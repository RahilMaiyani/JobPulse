import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// We use AES-256-CBC. It requires a 32-byte key and a 16-byte IV.
const algorithm = "aes-256-cbc";
const secretKey = crypto.createHash("sha256").update(process.env.JWT_SECRET).digest();
// console.log(secretKey)
export const encryptData = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return `${iv.toString("hex")}:${encrypted}`;
};

export const decryptData = (hash) => {
  const [ivHex, encryptedText] = hash.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
};