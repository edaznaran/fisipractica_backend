import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { Company } from '../company/entities/company.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/enums/role.enum';
import { CreateRecruiterDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';
import { Recruiter } from './entities/recruiter.entity';

@Injectable()
export class RecruiterService {
  constructor(
    @InjectRepository(Recruiter)
    private readonly recruiterRepository: Repository<Recruiter>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createRecruiterDto: CreateRecruiterDto,
    photo: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userExists = await queryRunner.manager.findOne(User, {
        where: { email: createRecruiterDto.email, role: Role.RECRUITER },
      });
      if (userExists) {
        throw new ConflictException('El usuario ya existe');
      }
      console.log('createStudentDto:', createRecruiterDto);

      // Crea un nuevo usuario reclutador
      const saltOrRounds = 10;
      const hashedpassword = await bcrypt.hash(
        createRecruiterDto.password,
        saltOrRounds,
      );
      createRecruiterDto.password = hashedpassword;
      const user = queryRunner.manager.create(User, {
        email: createRecruiterDto.email,
        password: createRecruiterDto.password,
        role: Role.RECRUITER,
        first_name: createRecruiterDto.first_name,
        last_name: createRecruiterDto.last_name,
        phone: createRecruiterDto.phone,
        location: createRecruiterDto.location,
        photo: photo ? photo.buffer : undefined,
      });
      const savedUser = await queryRunner.manager.save(user);
      // Crea un nuevo reclutador
      const company = await queryRunner.manager.findOneBy(Company, {
        id: createRecruiterDto.company_id,
      });
      if (!company) {
        throw new NotFoundException('Empresa no encontrada');
      }
      const recruiter = queryRunner.manager.create(Recruiter, {
        user: savedUser,
        company: company,
        description: createRecruiterDto.description,
        position_start_date: createRecruiterDto.position_start_date,
      });
      const savedRecruiter = await queryRunner.manager.save(recruiter);

      await queryRunner.commitTransaction();
      return savedRecruiter;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno al crear reclutador.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    try {
      return await this.recruiterRepository.find({
        relations: ['user', 'company'],
      });
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al listar los reclutadores',
      );
    }
  }

  async findOne(userId: number) {
    try {
      console.log('userId:', userId);
      const recruiter = await this.recruiterRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user', 'company'],
      });
      if (!recruiter) {
        throw new NotFoundException('Reclutador no encontrado');
      }
      return recruiter;
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el reclutador');
    }
  }

  async update(id: number, updateRecruiterDto: UpdateRecruiterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Actualiza perfil de usuario
      const recruiter = await queryRunner.manager.findOne(Recruiter, {
        where: { id },
        relations: ['user', 'company'],
      });
      if (!recruiter) {
        throw new NotFoundException('Reclutador no encontrado');
      }
      const user = await queryRunner.manager.findOne(User, {
        where: { id: recruiter.user.id },
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      Object.assign(user, {
        first_name: updateRecruiterDto.first_name,
        last_name: updateRecruiterDto.last_name,
        email: updateRecruiterDto.email,
        phone: updateRecruiterDto.phone,
        location: updateRecruiterDto.location,
      });
      await queryRunner.manager.save(user);

      let company: Company | null = null;
      if (updateRecruiterDto.company_id) {
        company = await queryRunner.manager.findOne(Company, {
          where: { id: updateRecruiterDto.company_id },
        });
        if (!company) {
          throw new NotFoundException('Empresa no encontrada');
        }
      }
      // Actualiza datos de reclutador
      Object.assign(recruiter, {
        company: company !== null ? company : recruiter.company,
        description: updateRecruiterDto.description,
        position_start_date: updateRecruiterDto.position_start_date,
      });
      await queryRunner.manager.save(recruiter);
      await queryRunner.commitTransaction();
      return recruiter;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al actualizar el reclutador',
      );
    }
  }

  async remove(id: number) {
    try {
      const recruiter = await this.recruiterRepository.findOne({
        where: { id },
        relations: ['user', 'company'],
      });
      if (!recruiter) {
        throw new NotFoundException('Reclutador no encontrado');
      }
      if (recruiter.user) {
        throw new ConflictException(
          'No se puede eliminar el reclutador porque tiene un perfil de usuario',
        );
      }
      return await this.recruiterRepository.remove(recruiter);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el reclutador');
    }
  }
}
