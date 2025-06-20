/* 
    node application root file
*/

import app from "@/app";
import config from "@/Config";
import connectDB from "@/Config/db";
import '@/Config/redis';
import '@/Config/redis/redis.events';

import http from "http";

const server = http.createServer(app)
const { port } = config


const main = async () => {
    try {
        await connectDB()

        server.listen(port, () => {
            console.log(`Server is listening on ${port}. Url: http://localhost:${port}`)
        })
    } catch (e) {
        console.log((e as Error).message);
    }
}

main()


//handle unHandleRejection errors
process.on('unhandledRejection', (err) => {
    console.log('unhandledRejection =>', { err })
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    } else {
        process.exit(1)
    }
})

//handle unCaught exceptions
process.on('uncaughtException', (err) => {
    console.log('unhandledException =>', { err })
    if (server)
        process.exit(1)
})

// sigterm errors
process.on('SIGTERM', (err) => {
    console.log('SIGTERM =>', { err })
    if (server)
        server.close()
})