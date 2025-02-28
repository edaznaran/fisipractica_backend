import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  website: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  location: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  color: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  photo: Express.Multer.File;
}
