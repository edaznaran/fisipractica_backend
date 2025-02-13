import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBooleanString } from 'class-validator';
import { CreateStudentDto } from './create-student.dto';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiProperty()
  @IsBooleanString()
  studying: boolean;
}
