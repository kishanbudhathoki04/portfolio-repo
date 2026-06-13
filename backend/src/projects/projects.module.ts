import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
