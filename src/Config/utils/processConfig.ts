import { TEnv } from "./config.types";
import { EnvValidation } from "./config.validation";

const processEnvConfig = (config: NodeJS.ProcessEnv): TEnv => {
    const env = config.NODE_ENV?.toLowerCase() === 'prod' ? 'PROD' : 'DEV';

    const preConfig = {
        app_name: config[`APP_NAME_${env}`],
        port: Number(config[`PORT_${env}`]),
        mongo_uri: config[`MONGO_URI_${env}`],
        node_env: env.toLowerCase(),
        bcrypt_saltRounds: config[`BCRYPT_SALTROUND_${env}`],
        cloud_name: config[`CLOUD_NAME_${env}`],
        api_key: config[`API_KEY_${env}`],
        api_secret: config[`API_SECRET_${env}`],
        google: {
            client_id: config[`GOOGLE_CLIENT_ID_${env}`],
            client_secret: config[`GOOGLE_CLIENT_SECRET_${env}`]
        },
        backend_base_url: config[`BACKEND_BASE_URL_${env}`],
        jwt: {
            accessToken: {
                secret: config[`JWT_ACCESSTOKEN_SECRET_${env}`],
                exp: config[`JWT_ACCESSTOKEN_EXP_${env}`]
            },
            refreshToken: {
                secret: config[`JWT_REFRESHTOKEN_SECRET_${env}`],
                exp: config[`JWT_REFRESHTOKEN_EXP_${env}`]
            },
            common: config[`JWT_${env}`]
        },
        mail: {
            resend_api_key: config[`RESEND_API_KEY_${env}`]
        },
        redis: {
            host: config[`REDIS_HOST_${env}`],
            port: config[`REDIS_PORT_${env}`],
            password: config[`REDIS_PASSWORD_${env}`],
            provider: config[`REDIS_SERVICE_PROVIDER_${env}`]
        },
        frontend: {
            reset_page_url: config[`RESET_PAGE_URL_${env}`],
            verify_page_url: config[`VERIFY_PAGE_URL_${env}`]
        }
    };

    const validateConfig = EnvValidation.envZodSchema.parse(preConfig);
    return validateConfig;
}

export default processEnvConfig;

/*  */