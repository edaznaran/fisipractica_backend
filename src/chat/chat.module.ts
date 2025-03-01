import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from 'src/job/entities/job.entity';
import { Message } from 'src/message/entities/message.entity';
import { MessageService } from 'src/message/message.service';
import { Recruiter } from 'src/recruiter/entities/recruiter.entity';
import { Student } from 'src/student/entities/student.entity';
import { User } from 'src/user/entities/user.entity';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Chat, Message, Job, Student, Recruiter, User]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, MessageService],
})
export class ChatModule {}
