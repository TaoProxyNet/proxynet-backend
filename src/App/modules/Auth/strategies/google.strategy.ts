import Config from '@/Config';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AuthServices } from '../auth.services';
import { ESocialLoginProvider } from '../auth.types';

passport.use(new GoogleStrategy({
    clientID: Config.google.client_id,
    clientSecret: Config.google.client_secret,
    callbackURL: `${Config.backend_base_url}/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // console.log("google strategy", { profile, accessToken, refreshToken })
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Google account missing email'));

        const data = await AuthServices.socialLogin({
            email,
            name: profile.displayName,
            profilePicture: profile.photos?.[0]?.value,
            socialLoginId: profile.id,
            socialLoginProvider: ESocialLoginProvider.GOOGLE,
        })

        done(null, { ...data });
    } catch (error) {
        done(error);
    }
}));

// passport.serializeUser((user: any, done) => done(null, user));
// passport.deserializeUser((user: any, done) => done(null, user));
