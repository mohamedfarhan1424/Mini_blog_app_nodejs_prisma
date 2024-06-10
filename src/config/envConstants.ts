import "dotenv/config";

export const PORT = process.env.PORT || 3003;

export const JWT_SECRET = process.env.JWT_SECRET || "loreumipsumkjdnfkjnwekjfd";
export const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || "30m";
export const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || "7d";
