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
      return { success: true, message: 'Ticket received (email notification skipped — SMTP not configured).' };
    }

    // 3. Send email — use direct SSL connection on port 465 (works on Render/hosts that block port 587)
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // SSL — avoids STARTTLS on port 587 which some hosts block
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000, // 10s connection timeout
        greetingTimeout: 10000,
        socketTimeout: 15000,
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
      // Still return success for the ticket — user's message IS logged on server
      // But include a note that email delivery failed
      return { success: true, message: 'Ticket received! (Email notification may be delayed.)' };
    }
  }
}
