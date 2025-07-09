import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  salary: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url_job_pdf: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  job_requirements: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  job_functions: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  company_id: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  user_creator_id: number;
}
