import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ActiveToken } from './auth/entities/active-token.entity';
import { BlacklistedToken } from './auth/entities/blacklisted-token.entity';
import { Log } from './auth/entities/log.entity';
import { JwtAuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { CompanyModule } from './company/company.module';
import { Company } from './company/entities/company.entity';
import { Recruiter } from './recruiter/entities/recruiter.entity';
import { RecruiterModule } from './recruiter/recruiter.module';
import { Skill } from './student/entities/skill.entity';
import { StudentSkill } from './student/entities/student_skill.entity';
import { Student } from './student/entities/student.entity';
import { StudentModule } from './student/student.module';
import { User } from './user/entities/user.entity';
import { UserProfile } from './user/entities/user_profile.entity';
import { UserModule } from './user/user.module';
import { JobModule } from './job/job.module';
import { Job } from './job/entities/job.entity';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PGHOST,
      port: +(process.env.PGPORT || 5432),
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      entities: [
        User,
        UserProfile,
        Company,
        Recruiter,
        Student,
        StudentSkill,
        Skill,
        ActiveToken,
        BlacklistedToken,
        Log,
        Job,
      ],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    CompanyModule,
    RecruiterModule,
    StudentModule,
    JobModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
