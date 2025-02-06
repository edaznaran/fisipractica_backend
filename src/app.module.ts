import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { Company } from './company/entities/company.entity';
import { Recruiter } from './recruiter/entities/recruiter.entity';
import { RecruiterModule } from './recruiter/recruiter.module';
import { Student } from './student/entities/student.entity';
import { StudentModule } from './student/student.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

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
      entities: [User, Company, Recruiter, Student],
      synchronize: true,
    }),
    UserModule,
    CompanyModule,
    RecruiterModule,
    StudentModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
