import { Controller, Get, Post, Body, Query, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { DbService } from '../db/db.service';
import { AuthGuard } from '../admin/auth.guard';

@Controller('profile')
export class ProfileController {
  constructor(private readonly dbService: DbService) {}

  @Get()
  async getProfile(@Query('include_details') includeDetails: string) {
    const isDetailed = includeDetails === 'true';
    const db = await this.dbService.readDB();
    const profile = db.profile || {};

    const data = {
      name: profile.name || 'Quality Assurance Expert',
      title: profile.title || 'Senior QA Analyst / Engineer',
      current_employer: profile.current_employer || 'Synthbit Technology',
      specialization: profile.specialization || [],
      core_philosophies: profile.core_philosophies || []
    };

    const detailedData = {
      ...data,
      years_experience: profile.years_experience || 4.5,
      location: profile.location || 'Remote / Hybrid',
      languages: profile.languages || [],
      meta: profile.meta || {},
      photo: profile.photo || '/avatar.jpg',
      bio_summary: profile.bio_summary || ''
    };

    return isDetailed ? detailedData : data;
  }

  @UseGuards(AuthGuard)
  @Post()
  async updateProfile(
    @Body() body: any,
    @Res() res: Response
  ) {
    try {
      const db = await this.dbService.readDB();
      db.profile = {
        ...db.profile,
        ...body
      };
      await this.dbService.writeDB(db);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: "Profile updated successfully",
        profile: db.profile,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
    }
  }
}
