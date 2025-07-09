import { ApiProperty } from '@nestjs/swagger';
import {
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
  @IsOptional()
  institution: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  education_start_date: Date;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  education_end_date: Date;

  // @ApiProperty()
  // @IsBoolean()
  // @IsOptional()
  // studying: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  availability: string;

  @ApiProperty({ type: 'array', items: { type: 'string' } })
  @IsString()
  @IsOptional()
  skills: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  photo: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  cv: Express.Multer.File;
}
