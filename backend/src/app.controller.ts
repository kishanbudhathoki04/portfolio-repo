import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DbService } from './db/db.service';

@Controller()
export class AppController {
  constructor(private readonly dbService: DbService) {}

  @Get()
  getRoot(): string {
    return 'Server is running';
  }

  @Get('health')
  getHealth(): { status: string } {
    return { status: 'OK' };
  }

  @Get('api/images/:id')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    try {
      const imageDoc = await this.dbService.getImage(id);
      if (!imageDoc || !imageDoc.base64Data) {
        return res.status(HttpStatus.NOT_FOUND).send('Image not found');
      }

      const buffer = Buffer.from(imageDoc.base64Data, 'base64');
      res.setHeader('Content-Type', imageDoc.mimeType || 'image/jpeg');
      // Set to cache heavily in user's browser for extreme performance
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); 
      return res.status(HttpStatus.OK).send(buffer);
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error loading image');
    }
  }
}
