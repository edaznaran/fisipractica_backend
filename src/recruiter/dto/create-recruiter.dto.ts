import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBooleanString,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRecruiterDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  first_name: string

  @ApiProperty()
  @IsString()
  last_name: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  location: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsDateString()
  position_start_date: Date

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  company: string

}
