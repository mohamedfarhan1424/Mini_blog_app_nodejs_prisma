import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/envConstants";
import { decryptJSON, encryptJSON } from "./EncryptionDecryption";

interface IUserData {
  id: number;
  email: string;
}

export const createToken = (userData: IUserData, validity: string) => {
  const encryptedData = encryptJSON(userData);

  return jwt.sign({ encryptedData }, JWT_SECRET, {
    expiresIn: validity,
    algorithm: "HS256",
  });
};

export const validateJwtToken = (token: string): any => {
  try {
    const data = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    const { encryptedData } = data;

    const decryptedData = decryptJSON(Buffer.from(encryptedData, "base64"));

    return decryptedData;
  } catch (error: any) {
    console.error(error);
    throw new Error("Unauthorized");
  }
};
