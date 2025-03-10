import express from "express";
import cors from "cors";
import morgan from "morgan";

import sqlRoutes from "./SQL/routes/sql.routes.js"
import firebaseRoutes from "./Firebase/routes/firebase.routes.js"

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use(sqlRoutes);
app.use(firebaseRoutes);

app.listen(5000, console.log("http://localhost:5000"));