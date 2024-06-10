import * as crypto from "crypto";
import * as fs from "fs";

let cachedKeys: { publicKey: string; privateKey: string } | undefined;
const keyFilePath = "rsa_keys.json";

// Generate RSA key pair if not already generated and cache them
export function generateAndCacheRSAKeyPair() {
  if (!cachedKeys) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    cachedKeys = {
      publicKey: publicKey.toString(),
      privateKey: privateKey.toString(),
    };
    saveKeysToFile(cachedKeys);
  }
}

// Save keys to a file
function saveKeysToFile(keys: { publicKey: string; privateKey: string }) {
  fs.writeFileSync(keyFilePath, JSON.stringify(keys));
}

// Load keys from a file
function loadKeysFromFile():
  | { publicKey: string; privateKey: string }
  | undefined {
  try {
    const data = fs.readFileSync(keyFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return undefined;
  }
}

// Get cached or load RSA key pair
export function getCachedRSAKeyPair(): {
  publicKey: string;
  privateKey: string;
} {
  if (!cachedKeys) {
    cachedKeys = loadKeysFromFile();
    if (!cachedKeys) {
      console.log("NEW RSA KEY GENERATED!!!");
      generateAndCacheRSAKeyPair();
    }
  }
  return cachedKeys!;
}

// Encrypt JSON object using RSA public key
export function encryptJSON(data: object): Buffer {
  const { publicKey } = getCachedRSAKeyPair();
  const jsonData = Buffer.from(JSON.stringify(data));
  return crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    jsonData
  );
}

// Decrypt using RSA private key
export function decryptJSON(encryptedData: Buffer): object {
  const { privateKey } = getCachedRSAKeyPair();
  const decryptedData = crypto
    .privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      encryptedData
    )
    .toString("utf8");

  return JSON.parse(decryptedData);
}
