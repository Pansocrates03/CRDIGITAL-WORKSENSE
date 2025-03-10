import express from "express";
import cors from "cors";
import morgan from "morgan";

import sqlRoutes from "./SQL/routes/sql.routes.js"
import firebaseRoutes from "./Firebase/routes/firebase.routes.js"
import geminiRoutes from "./Gemini/routes/gemini.routes.js"

const app = express();


app.use(cors());
app.use(morgan());
app.use(express.json());

app.use(sqlRoutes);
app.use(firebaseRoutes);
app.use("/api", geminiRoutes);

app.listen(5050, console.log("http://localhost:5050"));