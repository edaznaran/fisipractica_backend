import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/chat/entities/chat.entity';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      const chat = await this.chatRepository.findOneBy({
        id: createMessageDto.chat_id,
      });
      if (!chat) {
        throw new NotFoundException(
          `Chat con id ${createMessageDto.chat_id} no encontrado`,
        );
      }
      const message = this.messageRepository.create({
        ...createMessageDto,
        chat,
      });
      return await this.messageRepository.save(message);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el mensaje');
    }
  }

  async findAll(chat_id?: number): Promise<Message[]> {
    try {
      const messages = await this.messageRepository.find({
        where: chat_id ? { chat: { id: chat_id } } : {},
        order: { create_date: 'ASC' },
      });
      return messages;
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al listar los mensajes');
    }
  }
  /* 
  async findOne(id: number): Promise<Message> {
    try {
      const message = await this.messageRepository.findOne({
        where: { id },
      });
      if (!message) {
        throw new NotFoundException(`Mensaje con id ${id} no encontrado`);
      }
      return message;
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el mensaje');
    }
  }
 */
  async update(
    id: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    try {
      const message = await this.messageRepository.findOneBy({ id });
      if (!message) {
        throw new NotFoundException(`Mensaje con id ${id} no encontrado`);
      }
      Object.assign(message, updateMessageDto);
      return await this.messageRepository.save(message);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el mensaje');
    }
  }

  async remove(id: number): Promise<Message> {
    try {
      const message = await this.messageRepository.findOneBy({ id });
      if (!message) {
        throw new NotFoundException(`Mensaje con id ${id} no encontrado`);
      }
      return await this.messageRepository.remove(message);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el mensaje');
    }
  }
}
