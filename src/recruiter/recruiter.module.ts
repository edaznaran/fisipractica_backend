import { Module } from '@nestjs/common';
import { RecruiterService } from './recruiter.service';
import { RecruiterController } from './recruiter.controller';

@Module({
  controllers: [RecruiterController],
  providers: [RecruiterService],
})
export class RecruiterModule {}
