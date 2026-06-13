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

    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Cannot send email: EMAIL_USER or EMAIL_PASS not configured in backend/.env');
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Email service is currently offline. Administrator needs to configure SMTP credentials.'
      });
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
        from: `"${reporter}" <${process.env.EMAIL_USER}>`, // Send through authenticating user
        replyTo: email,
        to: 'kishanbudhathoki04@gmail.com', // Target email
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

      await transporter.sendMail(mailOptions);
      
      return res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      console.error('Nodemailer Error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to send the email ticket.',
        error: error.message 
      });
    }
  }
}
