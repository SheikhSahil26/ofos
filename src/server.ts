// const express = require("express")
import express from "express"
import dotenv from "dotenv"

dotenv.config();
// import fs from "fs"
import path from "path"
// import { buildApiRouter } from './routes/index.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildApiRouter } from "./routes";
import redisClient from "./config/redis";
// import { errorHandler, notFoundMiddleware } from "./middlewares/errorHandler";
import cookieParser from 'cookie-parser';
import "./config/jwtAuth";
import passport from "passport";
import { Request, Response } from "express";
import { errorHandler, notFoundMiddleware } from "./middlewares/errorHandler";
import { buildWebRoutes } from "./routes/web.route";


const PORT = process.env.PORT;


const __filename = fileURLToPath(import.meta.url);

// Get the directory name from the file path
const __dirname = dirname(__filename);

// const upload = require("./middlewares/file-upload")
// import upload from "./middlewares/file-upload.js"
const app = express();
// app.use(cors());
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "../views"));
app.use('/public', express.static(path.join(process.cwd(), 'src/public')));

app.use(express.static(path.join(__dirname,"../public")))
// app.use("/uploads",express.static(path.join(process.cwd(), 'src/public')));

// app.use("/uploads",express.static('uploads'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize());
app.use(errorHandler);

//this will initiate all frontend routes
app.use(buildWebRoutes());

//this will initiate all backend routes 
app.use("/api", buildApiRouter());
app.use("/", buildWebRoutes());


//working fine redis
app.get("/redis-test",async(req:any,res:any)=>{
    await redisClient.set("name", "Sahil");
    console.log("redis value added successfully")
    const value = await redisClient.get("name")
    console.log(value,"this is redis value")
})

app.use(notFoundMiddleware);




app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
});

