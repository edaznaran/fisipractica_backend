import { ApiProperty } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateStudentDto {
  // User data
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  // UserProfile data
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty()
  @IsString()
  last_name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  location: string;

  // Student data
  @ApiProperty()
  @IsString()
  institution: string;

  @ApiProperty()
  @IsDateString()
  education_start_date: Date;

  @ApiProperty()
  @IsDateString()
  education_end_date: Date;

  @ApiProperty()
  @IsBooleanString()
  studying: boolean;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  availability: string;

  @ApiProperty({ type: 'array', items: { type: 'string' } })
  @IsString()
  skills: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  photo: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  cv: Express.Multer.File;
}
