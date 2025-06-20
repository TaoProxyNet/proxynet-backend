/* 
    type: login, 2fa, otp, forgotPassword, resetPassword, emailVerification, phoneVerification

    each type has some common methods, some different methods
    common methods:
        - get single value
        - get all values with search, pagination
        - generate key
        - update value
        - delete value

    different methods:
        - 2fa:
            - generate 2fa code
            - verify 2fa code
            - disable 2fa
            - enable 2fa
            - get 2fa status
            - get 2fa secret
    can be be other types as well
    
    so i want to create a class where i can init that class with type and then i can use the common methods and the different methods for that type

    how can i do this?
*/