import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import * as nodemailer from 'nodemailer';

@Controller('contact')
export class ContactController {
  
  @Post()
  async sendContactEmail(
    @Body() body: any,
    @Res() res: Response
  ) {
    const { reporter, email, severity, type, summary, description, ticketId } = body;

    // 1. Immediately return success to frontend for instant UX
    res.status(HttpStatus.OK).json({ success: true, message: 'Ticket received and queued for processing.' });

    // 2. Log ticket to server console as fallback
    console.log(`\n--- NEW TICKET RECEIVED: ${ticketId} ---`);
    console.log(`Reporter: ${reporter} (${email}) | Severity: ${severity} | Type: ${type}`);
    console.log(`Summary: ${summary}`);
    console.log(`Description: \n${description}\n---------------------------------------\n`);

    // 3. Process SMTP asynchronously in the background if configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('[SMTP] No credentials found. Email notification skipped for ticket:', ticketId);
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"${reporter}" <${process.env.EMAIL_USER}>`,
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

      transporter.sendMail(mailOptions).then(() => {
        console.log(`[SMTP] Notification email successfully sent for ticket: ${ticketId}`);
      }).catch(err => {
        console.error(`[SMTP] Error sending notification for ticket ${ticketId}:`, err.message);
      });
      
    } catch (error) {
      console.error('[SMTP] Nodemailer Configuration Error:', error.message);
    }
  }
}
