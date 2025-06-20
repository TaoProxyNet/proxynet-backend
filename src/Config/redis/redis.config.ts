import { RedisOptions } from "ioredis";
import Config from "..";
import { ERedisProvider } from "../utils/config.types";



const generateRedisConfig = () => {
    const RedisConfig: RedisOptions = {
        host: Config.redis.host,
        port: parseInt(Config.redis.port as string) || 6379,
        password: Config.redis.password,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
            if (times > 3) {
                console.log("Redis Client connection failed after retrying for 3 times");
                return null;
            }
            console.log("Redis Client connection failed. Retrying...");
            return 1 * 60 * 1000;
        }
    }

    if (Config.redis.provider === ERedisProvider.UPSTASH) {
        RedisConfig.tls = {
            rejectUnauthorized: false,
        }
    }
    return RedisConfig;
}

export const RedisConfigUtils = {
    generateRedisConfig
};