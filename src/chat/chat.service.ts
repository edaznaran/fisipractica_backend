import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'src/job/entities/job.entity';
import { Recruiter } from 'src/recruiter/entities/recruiter.entity';
import { Student } from 'src/student/entities/student.entity';
import { Repository } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { FilterChatDto } from './dto/filter-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Recruiter)
    private readonly recruiterRepository: Repository<Recruiter>,
  ) {}

  async create(createChatDto: CreateChatDto): Promise<Chat> {
    try {
      const [chatExists, student, recruiter, job] = await Promise.all([
        this.chatRepository.findOne({
          where: {
            student: { id: createChatDto.student_id },
            recruiter: { id: createChatDto.recruiter_id },
          },
        }),
        this.studentRepository.findOneBy({ id: createChatDto.student_id }),
        this.recruiterRepository.findOneBy({ id: createChatDto.recruiter_id }),
        this.jobRepository.findOneBy({ id: createChatDto.job_id }),
      ]);

      if (chatExists) {
        return chatExists;
      }
      if (!student) {
        throw new NotFoundException(
          `Estudiante con id ${createChatDto.student_id} no encontrado`,
        );
      }
      if (!recruiter) {
        throw new NotFoundException(
          `Reclutador con id ${createChatDto.recruiter_id} no encontrado`,
        );
      }
      if (!job) {
        throw new NotFoundException(
          `Trabajo con id ${createChatDto.job_id} no encontrado`,
        );
      }

      const chat = this.chatRepository.create({
        ...createChatDto,
        student,
        recruiter,
      });
      return await this.chatRepository.save(chat);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al crear chat.');
    }
  }

  async findAll(): Promise<Chat[]> {
    try {
      const chats = await this.chatRepository.find({
        relations: ['student', 'recruiter'],
      });
      return chats;
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al listar los chats');
    }
  }

  async findOne(filter: FilterChatDto): Promise<Chat> {
    try {
      console.log(filter);
      const chat = await this.chatRepository.findOne({
        where: {
          id: filter.id,
          student: { id: filter.student_id },
          recruiter: { id: filter.recruiter_id },
          job_id: filter.job_id,
        },
        relations: ['student', 'recruiter'],
      });
      if (!chat) {
        throw new NotFoundException(`Chat con id ${filter.id} no encontrado`);
      }
      return chat;
    } catch (error) {
      console.error(error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el chat');
    }
  }

  async update(id: number, updateChatDto: UpdateChatDto): Promise<Chat> {
    try {
      const chat = await this.chatRepository.findOneBy({ id });
      if (!chat) {
        throw new NotFoundException(`Chat con id ${id} no encontrado`);
      }
      Object.assign(chat, updateChatDto);
      return await this.chatRepository.save(chat);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el chat');
    }
  }

  async remove(id: number): Promise<Chat> {
    try {
      const chat = await this.chatRepository.findOneBy({ id });
      if (!chat) {
        throw new NotFoundException(`Chat con id ${id} no encontrado`);
      }
      return await this.chatRepository.remove(chat);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el chat');
    }
  }
}
