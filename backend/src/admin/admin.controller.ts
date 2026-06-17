import { Controller, Post, Body, Headers, Res, HttpStatus, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { AuthGuard } from './auth.guard';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'portfolio' },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      return res.status(HttpStatus.OK).json({
        success: true,
        url: uploadResult.secure_url
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
