import { Controller, Get, Post, Put, Delete, Body, Headers, Query, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { DbService } from '../db/db.service';
import { AuthGuard } from '../admin/auth.guard';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly dbService: DbService) {}

  @Get()
  async getExperience() {
    const db = await this.dbService.readDB();
    return db.experience || [];
  }

  @UseGuards(AuthGuard)
  @Post()
  async addExperience(
    @Body() body: any,
    @Res() res: Response
  ) {
    try {
      const db = await this.dbService.readDB();
      const experience = db.experience || [];

      const newItem = {
        id: `exp-${Date.now()}`,
        date: body.date || '',
        role: body.role || '',
        company: body.company || '',
        description: body.description || '',
        bullets: body.bullets || []
      };

      experience.push(newItem);
      await this.dbService.writeSection('experience', experience);

      return res.status(HttpStatus.CREATED).json({ success: true, item: newItem });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }

  @UseGuards(AuthGuard)
  @Put()
  async updateExperience(
    @Body() body: any,
    @Res() res: Response
  ) {
    try {
      if (!body.id) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Missing item ID' });
      }

      const db = await this.dbService.readDB();
      const experience = db.experience || [];
      
      const index = experience.findIndex((item: any) => item.id === body.id);
      if (index === -1) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'Item not found' });
      }

      experience[index] = {
        ...experience[index],
        date: body.date !== undefined ? body.date : experience[index].date,
        role: body.role !== undefined ? body.role : experience[index].role,
        company: body.company !== undefined ? body.company : experience[index].company,
        description: body.description !== undefined ? body.description : experience[index].description,
        bullets: body.bullets !== undefined ? body.bullets : experience[index].bullets
      };

      await this.dbService.writeSection('experience', experience);

      return res.status(HttpStatus.OK).json({ success: true, item: experience[index] });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }

  @UseGuards(AuthGuard)
  @Delete()
  async deleteExperience(
    @Query('id') id: string,
    @Res() res: Response
  ) {
    try {
      if (!id) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Missing item ID' });
      }

      const db = await this.dbService.readDB();
      const experience = db.experience || [];

      const index = experience.findIndex((item: any) => item.id === id);
      if (index === -1) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'Item not found' });
      }

      experience.splice(index, 1);
      await this.dbService.writeSection('experience', experience);

      return res.status(HttpStatus.OK).json({ success: true, message: 'Experience deleted successfully' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }
}
