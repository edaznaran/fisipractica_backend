import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Company } from '../company/entities/company.entity';
import { UserProfile } from '../user/entities/user_profile.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createJobDto: CreateJobDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { company_id, user_creator_id, ...jobData } = createJobDto;
      const company = await queryRunner.manager.findOne(Company, {
        where: { id: company_id },
      });
      if (!company) {
        throw new NotFoundException('Company not found');
      }

      const userProfile = await queryRunner.manager.findOne(UserProfile, {
        where: { id: user_creator_id },
      });
      if (!userProfile) {
        throw new NotFoundException('User profile not found');
      }
      const job = this.jobRepository.create({
        ...jobData,
        company,
        userProfile,
      });
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
    try {
      const jobs = await this.jobRepository.find({
        relations: ['company', 'userProfile'],
      });
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
    try {
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { company_id, user_creator_id, ...jobData } = updateJobDto;
      const job = await this.jobRepository.findOne({
        where: { id },
        relations: ['company', 'userProfile'],
      });
      if (!job) {
        throw new NotFoundException('Job not found');
      }

      const company = await queryRunner.manager.findOne(Company, {
        where: { id: company_id },
      });
      if (!company) {
        throw new NotFoundException('Company not found');
      }

      const userProfile = await queryRunner.manager.findOne(UserProfile, {
        where: { id: user_creator_id },
      });
      if (!userProfile) {
        throw new NotFoundException('User profile not found');
      }

      this.jobRepository.merge(job, jobData, { company, userProfile });
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
    try {
      const job = await this.jobRepository.findOne({
        where: { id },
        relations: ['company', 'userProfile'],
      });
      if (!job) {
        throw new NotFoundException(`Trabajo con id ${id} no encontrado`);
      }
      return await this.jobRepository.remove(job);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el trabajo');
    }
  }
}
