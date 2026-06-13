import { Controller, Get, Post, Body, Query, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { DbService } from '../db/db.service';
import { AuthGuard } from '../admin/auth.guard';

@Controller('skills')
export class SkillsController {
  constructor(private readonly dbService: DbService) {}

  @Get()
  async getSkills(@Query('include_details') includeDetails: string) {
    const isDetailed = includeDetails === 'true';
    const db = await this.dbService.readDB();
    const skills = db.skills || {};

    const data = {
      manual_testing: (skills.manual_testing || []).map((s: any) => s.name),
      api_testing: (skills.api_testing || []).map((s: any) => s.name)
    };

    const detailedData = {
      manual_testing: (skills.manual_testing || []).reduce((acc: any, curr: any) => {
        const key = curr.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        acc[key] = `${curr.level} proficiency`;
        return acc;
      }, {}),
      api_testing: (skills.api_testing || []).reduce((acc: any, curr: any) => {
        const key = curr.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        acc[key] = `${curr.level} proficiency`;
        return acc;
      }, {}),
      tools_and_ecosystem: {
        tools: skills.tools_and_ecosystem || []
      },
      raw: skills
    };

    return isDetailed ? detailedData : data;
  }

  @UseGuards(AuthGuard)
  @Post()
  async updateSkills(
    @Body() body: any,
    @Res() res: Response
  ) {
    try {
      const db = await this.dbService.readDB();
      db.skills = {
        ...db.skills,
        ...body
      };
      await this.dbService.writeDB(db);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: "Skills updated successfully",
        skills: db.skills,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
    }
  }
}
