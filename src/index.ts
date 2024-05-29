import express from "express";
import cors from "cors";
import router from "./routes/route";
import { PORT } from "./config/envConstants";
import { getCachedRSAKeyPair } from "./common/EncryptionDecryption";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

getCachedRSAKeyPair();

app.use("/", router);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
