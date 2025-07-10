import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty()
  @IsNotEmpty()
  job_id: number;

  @ApiProperty()
  @IsNotEmpty()
  student_id: number;
}
