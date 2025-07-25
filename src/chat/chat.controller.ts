import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '../user/enums/role.enum';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { FilterChatDto } from './dto/filter-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@ApiBearerAuth('JWT-auth')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto) {
    console.log('Creating chat with data:', createChatDto);
    return this.chatService.create(createChatDto);
  }

  @Get()
  findAll() {
    return this.chatService.findAll();
  }

  @Get(':userId')
  findByUser(@Param('userId') userId: string, @Query('type') type: Role) {
    console.log('Finding chats for user:', userId, 'Type:', type);
    return this.chatService.findByUser(+userId, type);
  }

  @Get()
  findOne(@Query() filter: FilterChatDto) {
    return this.chatService.findOne(filter);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(+id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id);
  }
}
