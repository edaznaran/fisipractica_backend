import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateChatDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  recruiter_id?: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  job_id: number;
}
