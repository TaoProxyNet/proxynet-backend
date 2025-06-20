import { z } from "zod"
import { AccountValidation } from "./account.validations"

const accountSearchFields = ['name', 'email', 'phone', 'userId']
const accountFilterFields = [
    'email',
    'socialLoginId',
    'phone',
    'role',
    'isEmailVerified',
    'isPhoneVerified',
    'accountStatus',
    'is2FaEnabled',
    'userId',
    'isSocialLogin',
    'socialLoginProvider'
]
const accountSortFields = ['name', 'email', 'createdAt', 'updatedAt']

const accountUpdatableFields = {
    // Basic Information
    basicInfo: [
        'name',
        // 'email',
        'phone'
    ],

    // Authentication & Security
    security: [
        'password',
        'is2FaEnabled'
    ],

    // Verification Status
    verification: [
        'isEmailVerified',
        'isPhoneVerified'
    ],

    // Account Management
    accountManagement: [
        'role',
        'accountStatus',
        // 'userId'
    ]
}

export { accountFilterFields, accountSearchFields, accountSortFields, accountUpdatableFields }

// Type inference
export type TAccountUpdatePayload = z.infer<typeof AccountValidation.accountUpdateSchema>;