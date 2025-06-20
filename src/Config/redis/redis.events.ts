import { Redis } from "ioredis";
import { RedisConfigUtils } from "./redis.config";

const RedisEventClient = new Redis(RedisConfigUtils.generateRedisConfig())

const chanel_name = '__keyevent@0__:expired'
RedisEventClient.config('SET', 'notify-keyspace-events', 'Ex');
RedisEventClient.subscribe('__keyevent@0__:expired');

RedisEventClient.on('message', async (channel: string, message: string) => {
    console.log('message', { message, channel });
    if (channel === chanel_name) {
        const id = message.split(':')
        console.log('id', id, id[0]);
    }
})