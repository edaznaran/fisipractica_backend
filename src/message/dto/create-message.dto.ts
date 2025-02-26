import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  chat_id: number;

  @ApiProperty()
  message: string;
}
