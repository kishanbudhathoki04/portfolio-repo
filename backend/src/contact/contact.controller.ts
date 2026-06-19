import { Controller, Post, Body, Get, HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Controller('contact')
export class ContactController {

  /**
   * GET /api/contact/debug
   * Helps diagnose SMTP configuration on Render without exposing secrets.
   */
  @Get('debug')
  getSmtpDebug() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    return {
      SMTP_USER_SET: !!user,
      SMTP_USER_VALUE: user ? `${user.substring(0, 4)}...` : '(not set)',
      SMTP_PASS_SET: !!pass,
      SMTP_PASS_LENGTH: pass ? pass.length : 0,
      NODE_ENV: process.env.NODE_ENV || '(not set)',
    };
  }

  @Post()
  async sendContactEmail(@Body() body: any) {
    const { reporter, email, severity, type, summary, description, ticketId } = body;

    // 1. Log ticket to server console as fallback
    console.log(`\n--- NEW TICKET RECEIVED: ${ticketId} ---`);
    console.log(`Reporter: ${reporter} (${email}) | Severity: ${severity} | Type: ${type}`);
    console.log(`Summary: ${summary}`);
    console.log(`Description: \n${description}\n---------------------------------------\n`);

    // 2. Check SMTP credentials
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('[SMTP] MISSING CREDENTIALS - SMTP_USER:', !!process.env.SMTP_USER, 'SMTP_PASS:', !!process.env.SMTP_PASS);
      // Still return success so the user knows the message was logged,
      // but warn in logs that email was skipped.
      return { success: true, message: 'Ticket received (email notification skipped — SMTP not configured).' };
    }

    // 3. Send email synchronously — AWAIT the result so we know if it actually worked
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"${reporter}" <${process.env.SMTP_USER}>`,
        replyTo: email,
        to: 'kishanbudhathoki04@gmail.com',
        subject: `New QA Ticket [${severity}]: ${summary}`,
        text: `
New Portfolio Collaboration / Ticket Logged

Ticket ID: ${ticketId}
Reporter: ${reporter}
Email: ${email}
Severity: ${severity}
Type: ${type}
Summary: ${summary}

Description:
${description}
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[SMTP] Email sent for ticket ${ticketId}: ${info.messageId}`);

      return { success: true, message: 'Ticket received and email notification sent.' };

    } catch (error) {
      console.error(`[SMTP] FAILED for ticket ${ticketId}:`, error.message);
      // Return success for the ticket itself, but include the SMTP error for debugging
      throw new HttpException(
        { success: false, message: `Ticket logged, but email failed: ${error.message}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
