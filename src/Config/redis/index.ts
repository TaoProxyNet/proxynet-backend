import { Redis } from "ioredis";
import { RedisConfigUtils } from "./redis.config";


const RedisClient = new Redis(RedisConfigUtils.generateRedisConfig())

// const RedisClient = new Redis({
//     host: config.redis.host,
//     port: parseInt(config.redis.port as string) || 6379,
//     password: config.redis.password,
//     retryStrategy: (times) => {
//         if (times > 3) {
//             console.log("Redis Client connection failed after retrying for 3 times");
//             return null;
//         }
//         console.log("Redis Client connection failed. Retrying...");
//         return 1 * 60 * 1000;
//     },
//     maxRetriesPerRequest: 1
// })

// checking redis server connection
RedisClient.on("connect", () => {
    console.log("Client is connecting to Redis server");
    RedisClient.ping((err, result) => {
        if (err) {
            console.log("Redis Ping failed:");
        } else {
            console.log("Redis Ping response:", result);
        }
        // RedisClient.quit();
    });
});

RedisClient.on('ready', () => {
    console.log("Client successfully connected to Redis and ready to use");
})

RedisClient.on("error", (err) => {
    console.log("Redis error:", err, { logType: "error", errorType: "system" });
});


export { RedisClient };
