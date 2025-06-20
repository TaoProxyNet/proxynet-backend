import { EAccountStatus, ESocialLoginProvider, EUserRole, IAuth } from "@/App/modules/Auth/auth.types";
import { Model, model, Schema } from 'mongoose';

const AuthSchema = new Schema<IAuth>({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: [EUserRole.ADMIN, EUserRole.USER],
        default: EUserRole.USER
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    accountStatus: {
        type: String,
        enum: [EAccountStatus.ACTIVE, EAccountStatus.INACTIVE, EAccountStatus.BLOCKED],
        default: EAccountStatus.ACTIVE
    },
    is2FaEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        default: ""
    },
    userId: {
        type: String,
        default: ""
    },
    statusNote: {
        type: String,
        default: ""
    },
    isSocialLogin: {
        type: Boolean,
        default: false
    },
    socialLoginProvider: {
        type: String,
        enum: [ESocialLoginProvider.GOOGLE, ESocialLoginProvider.FACEBOOK, ESocialLoginProvider.APPLE],
        default: ""
    },
    profilePicture: {
        type: String,
        default: ""
    },
    socialLoginId: {
        type: String,
        default: ""
    }
}, {
    timestamps: true,
    versionKey: false
});

const AuthModel = model<IAuth>('Auth', AuthSchema);

export default AuthModel;
