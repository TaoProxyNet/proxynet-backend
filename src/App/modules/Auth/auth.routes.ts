import { AuthController } from '@/App/modules/Auth/auth.controller';
import { AccessMiddlewares } from '@/Middlewares/AccessValidation';
import { Router } from 'express';
import passport from 'passport';
import './strategies/google.strategy';

const AuthRoutes = Router();

AuthRoutes
    .post(
        '/register',
        AuthController.register
    )
    .post(
        '/login',
        AuthController.login
    )
    .post(
        '/resend-otp',
        AuthController.resendOtp
    )
    .post(
        '/validate-session',
        AuthController.validateSession
    )
    .post(
        '/forget-password',
        AuthController.forgetPassword
    )
    .post(
        '/reset-password',
        AuthController.resetPassword
    )
    .post(
        '/generate-2fa-session',
        AccessMiddlewares.checkValidateAccess,
        AuthController.generate2FaSession
    )
    .post(
        '/enable-2fa',
        AccessMiddlewares.checkValidateAccess,
        AuthController.enable2Fa
    )
    .post(
        '/disable-2fa',
        AccessMiddlewares.checkValidateAccess,
        AuthController.disable2Fa
    )
    .get(
        '/google',
        passport.authenticate('google', { scope: ['profile', "email"] })
    )
    .get(
        '/google/callback',
        passport.authenticate('google', { session: false, failureRedirect: '/login' }),
        AuthController.socialLogin
    )
    .post(
        '/logout',
        AuthController.logout
    )

export default AuthRoutes;
