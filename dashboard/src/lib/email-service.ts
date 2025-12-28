/**
 * Resend Email Service Integration
 * Documentation: https://resend.com/docs
 */

import { Resend } from 'resend'

// Lazy-load Resend client to avoid build-time errors
let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resend = new Resend(apiKey)
  }
  return resend
}

// Default sender email (use your verified domain)
const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const DEFAULT_FROM_NAME = process.env.RESEND_FROM_NAME || 'Punchi Car Niwasa'

interface EmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

interface EmailResponse {
  status: 'success' | 'error'
  message: string
  data?: any
  error?: string
}

/**
 * Send email using Resend API
 */
export async function sendEmail({ to, subject, html, text }: EmailParams): Promise<EmailResponse> {
  try {
    console.log('Sending email to:', to)
    console.log('Subject:', subject)

    const client = getResendClient()
    const { data, error } = await client.emails.send({
      from: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    })

    if (error) {
      console.error('Resend API Error:', error)
      return {
        status: 'error',
        message: error.message || 'Failed to send email',
        error: JSON.stringify(error)
      }
    }

    console.log('Email sent successfully:', data)
    return {
      status: 'success',
      message: 'Email sent successfully',
      data
    }
  } catch (error) {
    console.error('Email Service Error:', error)
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to send email',
      error: String(error)
    }
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Email Templates for different scenarios
 */
export const emailTemplates = {
  /**
   * Password Reset OTP Email
   */
  passwordResetOTP: (firstName: string, otpCode: string) => ({
    subject: 'Password Reset OTP - Punchi Car Niwasa',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚗 Punchi Car Niwasa</h1>
            <p style="color: #d1d5db; margin: 10px 0 0 0; font-size: 14px;">Management System</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Password Reset Request</h2>
            
            <p style="margin: 0 0 20px 0;">Hi <strong>${firstName}</strong>,</p>
            
            <p style="margin: 0 0 20px 0;">You requested to reset your password. Use the following OTP code to proceed:</p>
            
            <div style="background: #1f2937; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #9ca3af;">Your OTP Code</p>
              <p style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${otpCode}</p>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                ⚠️ <strong>Important:</strong> This code will expire in <strong>5 minutes</strong>. Do not share this code with anyone.
              </p>
            </div>
            
            <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
              If you didn't request this password reset, please ignore this email or contact support immediately.
            </p>
          </div>
          
          <div style="background: #1f2937; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              © ${new Date().getFullYear()} Punchi Car Niwasa. All rights reserved.
            </p>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
              📞 0112 413 865 | ✉️ admin@punchicar.com
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Punchi Car Niwasa - Password Reset

Hi ${firstName},

You requested to reset your password. Your OTP code is: ${otpCode}

This code will expire in 5 minutes. Do not share this code with anyone.

If you didn't request this password reset, please ignore this email or contact support.

– Punchi Car Niwasa Support
📞 0112 413 865 | ✉️ admin@punchicar.com`
  }),

  /**
   * Welcome Email with Credentials
   */
  welcome: (firstName: string, username: string, email: string, password: string) => ({
    subject: 'Welcome to Punchi Car Niwasa Management System',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Punchi Car Niwasa</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚗 Punchi Car Niwasa</h1>
            <p style="color: #d1d5db; margin: 10px 0 0 0; font-size: 14px;">Management System</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Welcome Aboard! 🎉</h2>
            
            <p style="margin: 0 0 20px 0;">Hi <strong>${firstName}</strong>,</p>
            
            <p style="margin: 0 0 20px 0;">Your account has been successfully created. Here are your login credentials:</p>
            
            <div style="background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Username</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${username}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Email</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">Password</td>
                  <td style="padding: 10px 0; font-weight: bold;">${password}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                🔒 <strong>Security Notice:</strong> Please keep these credentials confidential and do not share them with anyone.
              </p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/login" 
                 style="display: inline-block; background: #1f2937; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Login to Dashboard
              </a>
            </div>
          </div>
          
          <div style="background: #1f2937; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              © ${new Date().getFullYear()} Punchi Car Niwasa. All rights reserved.
            </p>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
              📞 0112 413 865 | ✉️ admin@punchicar.com
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to Punchi Car Niwasa Management System!

Hi ${firstName},

Your account has been successfully created. Here are your login credentials:

Username: ${username}
Email: ${email}
Password: ${password}

Please keep these credentials confidential and do not share them with anyone.

Login at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/login

Thank you,
Punchi Car Niwasa Team
📞 0112 413 865 | ✉️ admin@punchicar.com`
  }),

  /**
   * Account Status Update Email
   */
  accountStatus: (firstName: string, status: string) => ({
    subject: `Account Status Updated - Punchi Car Niwasa`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1f2937; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">🚗 Punchi Car Niwasa</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>Your PCN System account status has been updated to: <strong>${status}</strong></p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              If you have any questions, please contact support.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${firstName}, your PCN System account status has been updated to: ${status}.`
  })
}
