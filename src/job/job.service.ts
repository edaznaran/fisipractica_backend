import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ){};

  async create(createJobDto: CreateJobDto) {
    try{
      const job = this.jobRepository.create(createJobDto);
      return await this.jobRepository.save(job);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el trabajo');
    }
  }

  async findAll() {
    try{
      const jobs = await this.jobRepository.find();
      return jobs;
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al listar los trabajos');
    }
  }

  async findOne(id: number) {
    try{
      const job = await this.jobRepository.findOne({
        where: { id },
        relations: ['company', 'userProfile'],
      });
      if (!job) {
        throw new NotFoundException(`Trabajo con id ${id} no encontrado`);
      }
      return job;
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el trabajo');
    }
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    try{
      const job = await this.jobRepository.findOneBy({id});
      if (!job) {
        throw new NotFoundException(`Trabajo con id ${id} no encontrado`);
      }
      Object.assign(job, updateJobDto);
      return await this.jobRepository.save(job);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el trabajo');
    }
  }

  async remove(id: number) {
    try{
      const job = await this.jobRepository.findOne({
        where: { id },
        relations: ['company', 'userProfile'],
      });
      if (!job) {
        throw new NotFoundException(`Trabajo con id ${id} no encontrado`);
      }
      return await this.jobRepository.remove(job);
    }
    catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el trabajo');
    }
  }
}
