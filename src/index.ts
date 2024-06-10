import express from "express";
import cors from "cors";
import router from "./routes/route";
import { PORT } from "./config/envConstants";
import { getCachedRSAKeyPair } from "./common/EncryptionDecryption";
import { seedPermissions } from "./seed/seedPermission";
import { seedRole } from "./seed/seedRole";
import { seedUser } from "./seed/seedUser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

getCachedRSAKeyPair();

async function seed() {
  await seedPermissions();
  await seedRole();
  await seedUser();
}

seed()
  .then(() => {
    console.log("Seeding completed");
  })
  .catch((error: any) => {
    console.log("Seeding error: " + error);
  });

app.use("/", router);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
