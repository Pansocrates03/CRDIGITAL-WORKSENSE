import admin from "firebase-admin";
import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();


const serviceAccount = JSON.parse(
  readFileSync("./Firebase/utils/firebaseServiceAccount.json", "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export { db };
