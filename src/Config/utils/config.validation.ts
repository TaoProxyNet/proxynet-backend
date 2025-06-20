import { z } from 'zod';
import { ENodeEnv, ERedisProvider } from './config.types';

const envZodSchema = z.object({
    app_name: z.string({ required_error: "App name is required" }),
    port: z.number({ required_error: "Port is required" }),
    mongo_uri: z.string({ required_error: "MongoDB URI is required" }),
    node_env: z.nativeEnum(ENodeEnv, { required_error: "Node environment is required" }),
    bcrypt_saltRounds: z.string({ required_error: "Bcrypt salt rounds is required" }),
    cloud_name: z.string({ required_error: "Cloud name is required" }),
    api_key: z.string({ required_error: "API key is required" }),
    api_secret: z.string({ required_error: "API secret is required" }),
    jwt: z.object({
        accessToken: z.object({
            secret: z.string({ required_error: "JWT access token secret is required" }),
            exp: z.string({ required_error: "JWT access token expiration is required" })
        }),
        refreshToken: z.object({
            secret: z.string({ required_error: "JWT refresh token secret is required" }),
            exp: z.string({ required_error: "JWT refresh token expiration is required" })
        }),
        common: z.string({ required_error: "JWT common token is required" })
    }),
    mail: z.object({
        resend_api_key: z.string({ required_error: "Resend API key is required" })
    }),
    redis: z.object({
        host: z.string({ required_error: "Redis host is required" }),
        port: z.string({ required_error: "Redis port is required" }),
        password: z.string({ required_error: "Redis password is required" }),
        provider: z.nativeEnum(ERedisProvider, {
            required_error: "Redis provider is required"
        })
    }),
    frontend: z.object({
        reset_page_url: z.string({ required_error: "Reset page URL is required" }),
        verify_page_url: z.string({ required_error: "Verify page URL is required" })
    }),
    google: z.object({
        client_id: z.string({ required_error: "Google client ID is required" }),
        client_secret: z.string({ required_error: "Google client secret is required" })
    }),
    backend_base_url: z.string({ required_error: "Backend base URL is required" })
});

export const EnvValidation = {
    envZodSchema
};