import { z } from "zod";
import { EnvValidation } from "./config.validation";

export enum ENodeEnv {
    PROD = "prod",
    DEV = "dev",
}

export enum ERedisProvider {
    UPSTASH = "upstash",
    LOCALHOST = "localhost",
}

// export type TEnv = {
//     port: number;
//     mongo_uri: string;
//     node_env: ENodeEnv;
//     bcrypt_saltRounds: string;
//     cloud_name: string;
//     api_key: string;
//     api_secret: string;
//     jwt: {
//         accessToken: {
//             secret: string;
//             exp: string;
//         };
//         refreshToken: {
//             secret: string;
//             exp: string;
//         };
//         common: string;
//     };
//     mail: {
//         resend_api_key: string;
//     };
//     redis: {
//         host: string;
//         port: string;
//         password: string;
//         provider: ERedisProvider;
//     };
//     frontend: {
//         reset_page_url: string;
//         verify_page_url: string;
//     }
// };

export type TEnv = z.infer<typeof EnvValidation.envZodSchema>;