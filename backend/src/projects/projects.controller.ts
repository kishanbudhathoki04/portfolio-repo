import { Controller, Get, Post, Put, Delete, Body, Headers, Query, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { DbService } from '../db/db.service';
import { AuthGuard } from '../admin/auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly dbService: DbService) {}

  @Get()
  async getProjects() {
    const db = await this.dbService.readDB();
    const projects = db.projects || [];
    // Now that photos are stored as lightning-fast string URLs instead of Base64 blobs,
    // we can return the entire payload without causing bandwidth issues or memory crashes.
    return projects.map((p: any) => ({ ...p, hasPhoto: !!p.photo }));
  }

  @UseGuards(AuthGuard)
  @Post()
  async addProject(
    @Body() body: any,
    @Res() res: Response
  ) {

    try {
      const db = await this.dbService.readDB();
      const projects = db.projects || [];

      const newItem = {
        id: `proj-${Date.now()}`,
        name: body.name || '',
        description: body.description || '',
        photo: body.photo || '',
        featured: body.featured || false
      };

      projects.push(newItem);
      db.projects = projects;
      await this.dbService.writeDB(db);

      return res.status(HttpStatus.CREATED).json({ success: true, item: newItem });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }

  @UseGuards(AuthGuard)
  @Put()
  async updateProject(
    @Body() body: any,
    @Res() res: Response
  ) {

    try {
      if (!body.id) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Missing item ID' });
      }

      const db = await this.dbService.readDB();
      const projects = db.projects || [];
      
      const index = projects.findIndex((item: any) => item.id === body.id);
      if (index === -1) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'Item not found' });
      }

      projects[index] = {
        ...projects[index],
        name: body.name !== undefined ? body.name : projects[index].name,
        description: body.description !== undefined ? body.description : projects[index].description,
        photo: body.photo !== undefined ? body.photo : projects[index].photo,
        featured: body.featured !== undefined ? body.featured : projects[index].featured
      };

      db.projects = projects;
      await this.dbService.writeDB(db);

      return res.status(HttpStatus.OK).json({ success: true, item: projects[index] });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }

  @UseGuards(AuthGuard)
  @Delete()
  async deleteProject(
    @Query('id') id: string,
    @Res() res: Response
  ) {

    try {
      if (!id) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Missing item ID' });
      }

      const db = await this.dbService.readDB();
      const projects = db.projects || [];

      const index = projects.findIndex((item: any) => item.id === id);
      if (index === -1) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'Item not found' });
      }

      projects.splice(index, 1);
      db.projects = projects;
      await this.dbService.writeDB(db);

      return res.status(HttpStatus.OK).json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }
}
