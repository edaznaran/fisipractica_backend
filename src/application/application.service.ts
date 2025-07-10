import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../job/entities/job.entity';
import { Student } from '../student/entities/student.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application } from './entities/application.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto) {
    try {
      const { job_id, student_id } = createApplicationDto;
      const job = await this.jobRepository.findOne({
        where: { id: job_id },
      });
      const student = await this.studentRepository.findOne({
        where: { id: student_id },
      });
      if (!job || !student) {
        throw new NotFoundException(
          `No se encontró el trabajo o el estudiante con los IDs proporcionados: job_id=${job_id}, student_id=${student_id}`,
        );
      }
      const application = this.applicationRepository.create({
        job,
        student,
      });
      await this.applicationRepository.save(application);
      return application;
    } catch (error) {
      console.error('Error creating application:', error);
      throw new InternalServerErrorException('Failed to create application');
    }
  }

  async findAll() {
    try {
      return await this.applicationRepository.find();
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw new InternalServerErrorException('Failed to fetch applications');
    }
  }

  async findOne(id: number) {
    try {
      const application = await this.applicationRepository.findOne({
        where: { id },
        relations: ['job', 'student'],
      });
      if (!application) {
        throw new NotFoundException(`Application with ID ${id} not found`);
      }
      return application;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw new InternalServerErrorException(
        `Application with ID ${id} not found`,
      );
    }
  }

  async update(id: number, updateApplicationDto: UpdateApplicationDto) {
    try {
      const application = await this.applicationRepository.findOne({
        where: { id },
      });
      if (!application) {
        throw new NotFoundException(`Application with ID ${id} not found`);
      }
      Object.assign(application, updateApplicationDto);
      await this.applicationRepository.save(application);
      return application;
    } catch (error) {
      console.error('Error updating application:', error);
      throw new InternalServerErrorException('Failed to update application');
    }
  }

  async remove(id: number) {
    try {
      const application = await this.applicationRepository.findOne({
        where: { id },
      });
      if (!application) {
        throw new NotFoundException(`Application with ID ${id} not found`);
      }
      await this.applicationRepository.remove(application);
    } catch (error) {
      console.error('Error removing application:', error);
      throw new InternalServerErrorException('Failed to remove application');
    }
  }
}
