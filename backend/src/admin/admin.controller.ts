import { Controller, Post, Body, Headers, Res, HttpStatus, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { AuthGuard } from './auth.guard';

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
      const base64Data = file.buffer.toString('base64');
      const mimeType = file.mimetype;
      
      const dbService = (this.adminService as any).dbService; // Cast to access if protected
      let url = '';

      if (dbService && typeof dbService.saveImage === 'function') {
        const imageId = await dbService.saveImage(base64Data, mimeType);
        url = `/api/images/${imageId}`;
      } else {
        url = `data:${mimeType};base64,${base64Data}`; // Fallback if dbService fails
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        url: url
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
