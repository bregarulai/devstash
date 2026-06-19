export function getVerificationEmailHtml(verificationLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #fafafa; padding: 40px 20px; margin: 0;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #171717; border-radius: 8px; padding: 32px; border: 1px solid #262626;">
          <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0; color: #fafafa;">
            Welcome to DevStash
          </h1>
          <p style="font-size: 16px; line-height: 1.5; color: #a1a1aa; margin: 0 0 24px 0;">
            Thanks for signing up! Please verify your email address by clicking the button below.
          </p>
          <a href="${verificationLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
            Verify Email Address
          </a>
          <p style="font-size: 14px; line-height: 1.5; color: #71717a; margin: 24px 0 0 0;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #262626; margin: 24px 0;">
          <p style="font-size: 12px; color: #52525b; margin: 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationLink}" style="color: #3b82f6; word-break: break-all;">${verificationLink}</a>
          </p>
        </div>
      </body>
    </html>
  `
}

export function getVerificationEmailText(verificationLink: string): string {
  return `Welcome to DevStash!

Thanks for signing up! Please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.`
}
