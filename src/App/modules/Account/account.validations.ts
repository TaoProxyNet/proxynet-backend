import { z } from 'zod';
import { EAccountStatus, EUserRole } from '../Auth/auth.types';


// Combined Schema for all fields
export const accountUpdateSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters'),
    phone: z.string()
        .optional(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    is2FaEnabled: z.boolean(),
    isEmailVerified: z.boolean(),
    isPhoneVerified: z.boolean(),
    role: z.nativeEnum(EUserRole),
    accountStatus: z.nativeEnum(EAccountStatus),
}).partial();

export const AccountValidation = {
    accountUpdateSchema
}