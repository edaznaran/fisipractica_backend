import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRecruiterDto {
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

  // Recruiter data
  @ApiProperty()
  @IsNumberString()
  @IsOptional()
  company_id: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  position_start_date: Date;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  photo: Express.Multer.File;
}
