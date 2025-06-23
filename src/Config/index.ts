import { config } from "dotenv";
import path from "path";
import processEnvConfig from "./utils/processConfig";

config({
    path: path.join(process.cwd(), ".env"),
})

// Load environment specific variables
// const envFile = process.env.NODE_ENV === 'prod'
//     ? '.env'
//     : '.env.development';

const envFile = '.env';

config({
    path: path.join(process.cwd(), envFile)
});

const envConfig = processEnvConfig(process.env);

export default {
    app_name: envConfig.app_name,
    port: envConfig.port,
    mongo_uri: envConfig.mongo_uri,
    node_env: envConfig.node_env,
    bcrypt_saltRounds: envConfig.bcrypt_saltRounds,
    cloud_name: envConfig.cloud_name,
    api_key: envConfig.api_key,
    api_secret: envConfig.api_secret,
    jwt: {
        accessToken: {
            secret: envConfig.jwt.accessToken.secret,
            exp: envConfig.jwt.accessToken.exp
        },
        refreshToken: {
            secret: envConfig.jwt.refreshToken.secret,
            exp: envConfig.jwt.refreshToken.exp
        },
        common: envConfig.jwt.common
    },
    mail: {
        resend_api_key: envConfig.mail.resend_api_key
    },
    redis: {
        host: envConfig.redis.host,
        port: envConfig.redis.port,
        password: envConfig.redis.password,
        provider: envConfig.redis.provider
    },
    frontend: {
        reset_page_url: envConfig.frontend.reset_page_url,
        verify_page_url: envConfig.frontend.verify_page_url
    },
    google: {
        client_id: envConfig.google.client_id,
        client_secret: envConfig.google.client_secret
    },
    backend_base_url: envConfig.backend_base_url
}