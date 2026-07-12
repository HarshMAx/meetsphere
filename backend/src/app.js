import express from "express";

import { createServer } from "node:http";
import userRoutes from "./routes/users.route.js"
import dotenv from "dotenv";

import mongoose from "mongoose";
import connectToSocket from "./controller/socketManager.js"

import cors from "cors";

const app = express();
const server = createServer(app)
const io = connectToSocket(server)

dotenv.config();
app.set("port", process.env.PORT || 8000);
app.use(cors())
app.use(express.json({ limit: "40kb" }))
app.use(express.urlencoded({ extended: true, limit: "40kb" }))

app.use("/api/v1/users" ,userRoutes)

const start = async () => {
    
    const connectionDb = await mongoose.connect(process.env.MONGO_URI);
    // console.log(`Database connected successfully : ${connectionDb.connection.host}`)
    server.listen(app.get("port"), () => {
        console.log("Server is running on port " + app.get("port"))
    })
}

start();