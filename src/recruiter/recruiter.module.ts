import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recruiter } from './entities/recruiter.entity';
import { RecruiterController } from './recruiter.controller';
import { RecruiterService } from './recruiter.service';

@Module({
  imports: [TypeOrmModule.forFeature([Recruiter])],
  controllers: [RecruiterController],
  providers: [RecruiterService],
})
export class RecruiterModule {}
