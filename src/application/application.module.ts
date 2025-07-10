import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '../job/entities/job.entity';
import { Student } from '../student/entities/student.entity';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { Application } from './entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Job, Student])],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
