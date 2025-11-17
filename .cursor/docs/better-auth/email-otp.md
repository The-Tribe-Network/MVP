# plugins: Email OTP
URL: /docs/plugins/email-otp
Source: https://raw.githubusercontent.com/better-auth/better-auth/refs/heads/main/docs/content/docs/plugins/email-otp.mdx

Email OTP plugin for Better Auth.
        
***

title: Email OTP
description: Email OTP plugin for Better Auth.
----------------------------------------------

The Email OTP plugin allows user to sign in, verify their email, or reset their password using a one-time password (OTP) sent to their email address.

## Installation

<Steps>
  <Step>
    ### Add the plugin to your auth config

    Add the `emailOTP` plugin to your auth config and implement the `sendVerificationOTP()` method.

    ```ts title="auth.ts"
    import { betterAuth } from "better-auth"
    import { emailOTP } from "better-auth/plugins" // [!code highlight]

    export const auth = betterAuth({
        // ... other config options
        plugins: [
            emailOTP({ // [!code highlight]
                async sendVerificationOTP({ email, otp, type }) { // [!code highlight]
                    if (type === "sign-in") { // [!code highlight]
                        // Send the OTP for sign in // [!code highlight]
                    } else if (type === "email-verification") { // [!code highlight]
                        // Send the OTP for email verification // [!code highlight]
                    } else { // [!code highlight]
                        // Send the OTP for password reset // [!code highlight]
                    } // [!code highlight]
                }, // [!code highlight]
            }) // [!code highlight]
        ]
    })
    ```
  </Step>

  <Step>
    ### Add the client plugin

    ```ts title="auth-client.ts"
    import { createAuthClient } from "better-auth/client"
    import { emailOTPClient } from "better-auth/client/plugins"

    export const authClient = createAuthClient({
        plugins: [
            emailOTPClient()
        ]
    })
    ```
  </Step>
</Steps>

## Usage

### Send an OTP

Use the `sendVerificationOtp()` method to send an OTP to the user's email address.

### Client Side

```ts
const { data, error } = await authClient.emailOtp.sendVerificationOtp({
    email: user@example.com,
    type: sign-in,
});
```

### Server Side

```ts
const data = await auth.api.sendVerificationOTP({
    body: {
        email: user@example.com,
        type: sign-in,
    }
});
```

### Type Definition

```ts
type sendVerificationOTP = {
    /**
     * Email address to send the OTP. 
     */
    email: string = "user@example.com"
    /**
     * Type of the OTP. `sign-in`, `email-verification`, or `forget-password`. 
     */
    type: "email-verification" | "sign-in" | "forget-password" = "sign-in"

}
```

### Check an OTP (optional)

Use the `checkVerificationOtp()` method to check if an OTP is valid.

### Client Side

```ts
const { data, error } = await authClient.emailOtp.checkVerificationOtp({
    email: user@example.com,
    type: sign-in,
    otp: 123456,
});
```

### Server Side

```ts
const data = await auth.api.checkVerificationOTP({
    body: {
        email: user@example.com,
        type: sign-in,
        otp: 123456,
    }
});
```

### Type Definition

```ts
type checkVerificationOTP = {
    /**
     * Email address to send the OTP. 
     */
    email: string = "user@example.com"
    /**
     * Type of the OTP. `sign-in`, `email-verification`, or `forget-password`. 
     */
    type: "email-verification" | "sign-in" | "forget-password" = "sign-in"
    /**
     * OTP sent to the email. 
     */
    otp: string = "123456"

}
```

### Sign In with OTP

To sign in with OTP, use the `sendVerificationOtp()` method to send a "sign-in" OTP to the user's email address.

### Client Side

```ts
const { data, error } = await authClient.emailOtp.sendVerificationOtp({
    email: user@example.com,
    type: sign-in,
});
```

### Server Side

```ts
const data = await auth.api.sendVerificationOTP({
    body: {
        email: user@example.com,
        type: sign-in,
    }
});
```

### Type Definition

```ts
type sendVerificationOTP = {
    /**
     * Email address to send the OTP. 
     */
    email: string = "user@example.com"
    /**
     * Type of the OTP.
     */
    type: "sign-in" = "sign-in"

}
```

Once the user provides the OTP, you can sign in the user using the `signIn.emailOtp()` method.

### Client Side

```ts
const { data, error } = await authClient.signIn.emailOtp({
    email: user@example.com,
    otp: 123456,
});
```

### Server Side

```ts
const data = await auth.api.signInEmailOTP({
    body: {
        email: user@example.com,
        otp: 123456,
    }
});
```

### Type Definition

```ts
type signInEmailOTP = {
    /**
     * Email address to sign in. 
     */
    email: string = "user@example.com"
    /**
     * OTP sent to the email. 
     */
    otp: string = "123456"

}
```

<Callout>
  If the user is not registered, they'll be automatically registered. If you want to prevent this, you can pass `disableSignUp` as `true` in the [options](#options).
</Callout>

### Verify Email with OTP

To verify the user's email address with OTP, use the `sendVerificationOtp()` method to send an "email-verification" OTP to the user's email address.

### Client Side

```ts
const { data, error } = await authClient.emailOtp.sendVerificationOtp({
    email: user@example.com,
    type: email-verification,
});
```

### Server Side

```ts
const data = await auth.api.sendVerificationOTP({
    body: {
        email: user@example.com,
        type: email-verification,
    }
});
```

### Type Definition

```ts
type sendVerificationOTP = {
    /**
     * Email address to send the OTP. 
     */
    email: string = "user@example.com"
    /**
     * Type of the OTP.
     */
    type: "email-verification" = "email-verification"

}
```

Once the user provides the OTP, use the `verifyEmail()` method to complete email verification.

### Client Side

```ts
const { data, error } = await authClient.emailOtp.verifyEmail({
    email: user@example.com,
    otp: 123456,
});
```

### Server Side

```ts
const data = await auth.api.verifyEmailOTP({
    body: {
        email: user@example.com,
        otp: 123456,
    }
});
```

### Type Definition

```ts
type verifyEmailOTP = {
    /**
     * Email address to verify. 
     */
    email: string = "user@example.com"
    /**
     * OTP to verify. 
     */
    otp: string = "123456"

}
```

### Reset Password with OTP

To reset the user's password with OTP, use the `forgetPassword.emailOTP()` method to send a "forget-password" OTP to the user's email address.

### Client Side

```ts
const { data, error } = await authClient.forgetPassword.emailOtp({
    email: user@example.com,
});
```

### Server Side

```ts
const data = await auth.api.forgetPasswordEmailOTP({
    body: {
        email: user@example.com,
    }
});
```

### Type Definition

```ts
type forgetPasswordEmailOTP = {
    /**
     * Email address to send the OTP. 
     */
    email: string = "user@example.com"

}
```

Once the user provides the OTP, use the `checkVerificationOtp()` method to check if it's valid (optional).

### Client Side

```ts
const { data, error } = await authClient.emailOtp.checkVerificationOtp({
    email: user@example.com,
    type: forget-password,
    otp: 123456,
});
```

### Server Side

```ts
const data = await auth.api.checkVerificationOTP({
    body: {
        email: user@example.com,
        type: forget-password,
        otp: 123456,
    }
});
```

### Type Definition

```ts
type checkVerificationOTP = {
    /**
     * Email address to send the OTP. 
     */
    email: string = "user@example.com"
    /**
     * Type of the OTP.
     */
    type: "forget-password" = "forget-password"
    /**
     * OTP sent to the email. 
     */
    otp: string = "123456"

}
```

Then, use the `resetPassword()` method to reset the user's password.

### Client Side

```ts
const { data, error } = await authClient.emailOtp.resetPassword({
    email: user@example.com,
    otp: 123456,
    password: new-secure-password,
});
```

### Server Side

```ts
const data = await auth.api.resetPasswordEmailOTP({
    body: {
        email: user@example.com,
        otp: 123456,
        password: new-secure-password,
    }
});
```

### Type Definition

```ts
type resetPasswordEmailOTP = {
    /**
     * Email address to reset the password. 
     */
    email: string = "user@example.com"
    /**
     * OTP sent to the email. 
     */
    otp: string = "123456"
    /**
     * New password. 
     */
    password: string = "new-secure-password"

}
```

### Override Default Email Verification

To override the default email verification, pass `overrideDefaultEmailVerification: true` in the options. This will make the system use an email OTP instead of the default verification link whenever email verification is triggered. In other words, the user will verify their email using an OTP rather than clicking a link.

```ts title="auth.ts"
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true, // [!code highlight]
      async sendVerificationOTP({ email, otp, type }) {
        // Implement the sendVerificationOTP method to send the OTP to the user's email address
      },
    }),
  ],
});
```

## Options

* `sendVerificationOTP`: A function that sends the OTP to the user's email address. The function receives an object with the following properties:
  * `email`: The user's email address.
  * `otp`: The OTP to send.
  * `type`: The type of OTP to send. Can be "sign-in", "email-verification", or "forget-password".

* `otpLength`: The length of the OTP. Defaults to `6`.

* `expiresIn`: The expiry time of the OTP in seconds. Defaults to `300` seconds.

```ts title="auth.ts"
import { betterAuth } from "better-auth"

export const auth = betterAuth({
    plugins: [
        emailOTP({
            otpLength: 8,
            expiresIn: 600
        })
    ]
})
```

* `sendVerificationOnSignUp`: A boolean value that determines whether to send the OTP when a user signs up. Defaults to `false`.

* `disableSignUp`: A boolean value that determines whether to prevent automatic sign-up when the user is not registered. Defaults to `false`.

* `generateOTP`: A function that generates the OTP. Defaults to a random 6-digit number.

* `allowedAttempts`: The maximum number of attempts allowed for verifying an OTP. Defaults to `3`. After exceeding this limit, the OTP becomes invalid and the user needs to request a new one.

```ts title="auth.ts"
import { betterAuth } from "better-auth"

export const auth = betterAuth({
    plugins: [
        emailOTP({
            allowedAttempts: 5, // Allow 5 attempts before invalidating the OTP
            expiresIn: 300
        })
    ]
})
```

When the maximum attempts are exceeded, the `verifyOTP`, `signIn.emailOtp`, `verifyEmail`, and `resetPassword` methods will return an error with code `TOO_MANY_ATTEMPTS`.

* `storeOTP`: The method to store the OTP in your database, wether `encrypted`, `hashed` or `plain` text. Default is `plain` text.

<Callout>
  Note: This will not affect the OTP sent to the user, it will only affect the OTP stored in your database.
</Callout>

Alternatively, you can pass a custom encryptor or hasher to store the OTP in your database.

**Custom encryptor**

```ts title="auth.ts"
emailOTP({
    storeOTP: { 
        encrypt: async (otp) => {
            return myCustomEncryptor(otp);
        },
        decrypt: async (otp) => {
            return myCustomDecryptor(otp);
        },
    }
})
```

**Custom hasher**

```ts title="auth.ts"
emailOTP({
    storeOTP: {
        hash: async (otp) => {
            return myCustomHasher(otp);
        },
    }
})
```

