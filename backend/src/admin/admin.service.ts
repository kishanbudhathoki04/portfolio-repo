import { Injectable, OnModuleInit, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class AdminService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly dbService: DbService,
    private readonly jwtService: JwtService
  ) {}

  async onModuleInit() {
    this.setupMailer();
    await this.seedDefaultAdmin();
  }

  private setupMailer() {
    // If SMTP_USER is set in .env, use real transport, else use fallback logic
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('[Mailer] SMTP credentials found. Real emails will be sent.');
    } else {
      console.warn('[Mailer] No SMTP_USER configured. Reset emails will be printed to console only.');
      this.transporter = null;
    }
  }

  private async seedDefaultAdmin() {
    const db = await this.dbService.readDB();
    if (!db.adminUser) {
      console.log('Seeding default admin user: kishanbudhathoki04@gmail.com');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.adminUser = {
        email: 'kishanbudhathoki04@gmail.com',
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      };
      await this.dbService.writeDB(db);
    }
  }

  async login(email: string, pass: string): Promise<{ token: string }> {
    const db = await this.dbService.readDB();
    const admin = db.adminUser;

    if (!admin || admin.email !== email) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(pass, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { email: admin.email, sub: 'admin' };
    return {
      token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'fallback_secret_kishan',
        expiresIn: '24h'
      }),
    };
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const db = await this.dbService.readDB();
    const admin = db.adminUser;

    if (!admin || admin.email !== email) {
      // Return true to avoid email enumeration
      return true;
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    // OTP expires in 15 minutes
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    admin.resetToken = hashedOtp;
    admin.resetTokenExpiry = tokenExpiry.toISOString();
    
    db.adminUser = admin;
    await this.dbService.writeDB(db);

    if (this.transporter) {
      const mailOptions = {
        from: `Admin Portal <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset OTP',
        text: `You requested a password reset. Here is your 6-digit OTP: \n\n${rawOtp}\n\nThis OTP will expire in 15 minutes.`,
      };

      try {
        await this.transporter.sendMail(mailOptions);
        console.log(`[Mailer] Reset OTP successfully sent to ${email}`);
      } catch (err) {
        console.error('[Mailer] Error sending email:', err.message);
        throw new InternalServerErrorException('Failed to send reset email');
      }
    } else {
      console.log(`\n==============================================`);
      console.log(`[MOCK EMAIL SENT TO ${email}]`);
      console.log(`Password reset OTP: ${rawOtp}`);
      console.log(`==============================================\n`);
    }

    return true;
  }

  async resetPassword(otp: string, newPass: string): Promise<boolean> {
    const db = await this.dbService.readDB();
    const admin = db.adminUser;

    if (!admin || !admin.resetToken || !admin.resetTokenExpiry) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const isMatch = await bcrypt.compare(otp, admin.resetToken);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (new Date() > new Date(admin.resetTokenExpiry)) {
      throw new UnauthorizedException('OTP has expired');
    }

    // Success, reset the password
    admin.passwordHash = await bcrypt.hash(newPass, 10);
    admin.resetToken = null;
    admin.resetTokenExpiry = null;

    db.adminUser = admin;
    await this.dbService.writeDB(db);

    return true;
  }
}
