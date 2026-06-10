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

//this will initiate all the routes 
app.use("/api", buildApiRouter());


//working fine redis
app.get("/redis-test",async(req:any,res:any)=>{
    await redisClient.set("name", "Sahil");
    console.log("redis value added successfully")
    const value = await redisClient.get("name")
    console.log(value,"this is redis value")
})


// app.get("/",(req:Request, res:Response) => {
//    res.render("home")
// })



app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
});

