import { Controller, Post, Body, Get, HttpStatus } from '@nestjs/common';
import { Resend } from 'resend';

@Controller('contact')
export class ContactController {

  /**
   * GET /api/contact/debug
   * Diagnose email configuration on production.
   */
  @Get('debug')
  getDebug() {
    const resendKey = process.env.RESEND_API_KEY;
    const smtpUser = process.env.SMTP_USER;
    return {
      RESEND_API_KEY_SET: !!resendKey,
      RESEND_KEY_PREFIX: resendKey ? resendKey.substring(0, 6) + '...' : '(not set)',
      SMTP_USER_SET: !!smtpUser,
      NODE_ENV: process.env.NODE_ENV || '(not set)',
    };
  }

  @Post()
  async sendContactEmail(@Body() body: any) {
    const { reporter, email, severity, type, summary, description, ticketId } = body;

    // 1. Log ticket to server console as a permanent fallback
    console.log(`\n--- NEW TICKET RECEIVED: ${ticketId} ---`);
    console.log(`Reporter: ${reporter} (${email}) | Severity: ${severity} | Type: ${type}`);
    console.log(`Summary: ${summary}`);
    console.log(`Description: \n${description}\n---------------------------------------\n`);

    // 2. Check for Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Email] RESEND_API_KEY not configured. Email skipped for ticket:', ticketId);
      return { success: true, message: 'Ticket received (email notification not configured).' };
    }

    // 3. Send email via Resend (uses HTTPS, works on Render free tier)
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: ['kishanbudhathoki04@gmail.com'],
        replyTo: email,
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
      });

      if (error) {
        console.error(`[Email] Resend error for ticket ${ticketId}:`, error);
        return { success: true, message: 'Ticket received! (Email delivery may be delayed.)' };
      }

      console.log(`[Email] Sent for ticket ${ticketId}: ${data?.id}`);
      return { success: true, message: 'Ticket received and email notification sent.' };

    } catch (err) {
      console.error(`[Email] Failed for ticket ${ticketId}:`, err.message);
      return { success: true, message: 'Ticket received! (Email delivery may be delayed.)' };
    }
  }
}
