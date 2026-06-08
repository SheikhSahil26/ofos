import { createClient} from "redis";
const redisClient = createClient({
    url:'redis://localhost:6379'
})

redisClient.on('error',(err)=>{
    console.log("Redis Error ,",err);
})

try{
    await redisClient.connect();
    console.log("Redis server connect succesfully")
}catch(e){
    console.log("Redis not connected")
}

export default redisClient;