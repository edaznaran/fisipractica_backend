import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class FilterChatDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  id: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  student_id?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  recruiter_id?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  job_id?: number;
}
