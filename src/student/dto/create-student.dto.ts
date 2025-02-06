import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsString } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  cv_url: string;

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
  @IsBoolean()
  studying: boolean;

  @ApiProperty()
  @IsString()
  description: string;
}
