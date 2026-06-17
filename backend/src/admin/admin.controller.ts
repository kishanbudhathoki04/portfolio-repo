import { Controller, Post, Body, Res, HttpStatus, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { DbService } from '../db/db.service';
import { AuthGuard } from './auth.guard';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly dbService: DbService,
  ) {}

  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    try {
      const email = body?.email;
      const password = body?.password;

      if (!email || !password) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Email and password required' });
      }

      const result = await this.adminService.login(email, password);
      return res.status(HttpStatus.OK).json({ success: true, token: result.token });
    } catch (err) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, error: err.message });
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: any, @Res() res: Response) {
    try {
      const email = body?.email;
      if (!email) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Email required' });
      }

      await this.adminService.requestPasswordReset(email);
      return res.status(HttpStatus.OK).json({ success: true, message: 'If an account exists, a reset link was sent' });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message });
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any, @Res() res: Response) {
    try {
      const otp = body?.otp;
      const newPassword = body?.newPassword;

      if (!otp || !newPassword) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'OTP and newPassword required' });
      }

      await this.adminService.resetPassword(otp, newPassword);
      return res.status(HttpStatus.OK).json({ success: true, message: 'Password has been reset' });
    } catch (err) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, error: err.message });
    }
  }

  // Upload image → Cloudinary. Cloudinary is already configured once at startup in db.service.
  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Res() res: Response
  ) {
    if (!file) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'No file uploaded' });
    }

    try {
      const cloudUrl = await this.dbService.uploadBufferToCloudinary(file.buffer);
      return res.status(HttpStatus.OK).json({ success: true, url: cloudUrl });
    } catch (error) {
      console.error('[Upload] Cloudinary upload failed:', error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  // One-time migration: converts all /api/images/:id blobs in MongoDB → Cloudinary URLs.
  // Call this once from Postman or curl after deployment:
  //   POST https://your-backend.onrender.com/api/admin/migrate-to-cloudinary
  //   Authorization: Bearer <your_token>
  @UseGuards(AuthGuard)
  @Post('migrate-to-cloudinary')
  async migrateToCloudinary(@Res() res: Response) {
    try {
      const result = await this.dbService.migrateAllImagesToCloudinary();
      return res.status(HttpStatus.OK).json({
        success: true,
        message: `Migration complete. ${result.migrated} image(s) migrated, ${result.errors} error(s).`,
        ...result
      });
    } catch (error) {
      console.error('[Migration] Error:', error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
  }
}
