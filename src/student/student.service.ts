import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { MinioService } from 'src/minio/minio.service';
import { User } from 'src/user/entities/user.entity';
import { UserProfile } from 'src/user/entities/user_profile.entity';
import { Role } from 'src/user/enums/role.enum';
import { DataSource, Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Skill } from './entities/skill.entity';
import { Student } from './entities/student.entity';
import { StudentSkill } from './entities/student_skill.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly dataSource: DataSource,
    private readonly minioService: MinioService,
  ) {}

  async create(
    createStudentDto: CreateStudentDto,
    photo: Express.Multer.File[],
    cv: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userExists = await queryRunner.manager.findOne(User, {
        where: { email: createStudentDto.email, role: Role.STUDENT },
      });
      if (userExists) {
        throw new ConflictException('El usuario ya existe');
      }
      console.log('createStudentDto:', createStudentDto);
      // Crea un nuevo usuario estudiante
      const saltOrRounds = 10;
      const hashedpassword = await bcrypt.hash(
        createStudentDto.password,
        saltOrRounds,
      );
      createStudentDto.password = hashedpassword;
      const user = queryRunner.manager.create(User, {
        email: createStudentDto.email,
        password: createStudentDto.password,
        role: Role.STUDENT,
      });
      const savedUser = await queryRunner.manager.save(user);
      // Crea datos de usuario
      const userProfile = queryRunner.manager.create(UserProfile, {
        user: savedUser,
        first_name: createStudentDto.first_name,
        last_name: createStudentDto.last_name,
        email: createStudentDto.email,
        phone: createStudentDto.phone,
        location: createStudentDto.location,
        photo: photo ? photo[0].buffer : undefined,
      });
      const savedUserProfile = await queryRunner.manager.save(userProfile);
      // Crea un nuevo estudiante
      const student = queryRunner.manager.create(Student, {
        user: savedUser,
        userProfile: savedUserProfile,
        institution: createStudentDto.institution,
        education_start_date: createStudentDto.education_start_date,
        education_end_date: createStudentDto.education_end_date,
        studying: createStudentDto.studying,
        description: createStudentDto.description,
        availability: createStudentDto.availability,
      });

      // Sube el archivo al servidor Minio
      if (cv) {
        const fileBuffer = Buffer.isBuffer(cv[0].buffer)
          ? cv[0].buffer
          : Buffer.from(cv[0].buffer);

        const url = await this.minioService.uploadFile(
          'student-files',
          cv[0].originalname,
          fileBuffer,
          'pdf',
        );
        student.cv_url = url;
      }
      const savedStudent = await queryRunner.manager.save(student);
      // Busca skills
      const Skills = new Array<Skill>();
      const skillsArray = createStudentDto.skills
        .split(',')
        .map((skill) => skill.trim());
      for (const skill of skillsArray) {
        const foundedSkill = await queryRunner.manager.findOne(Skill, {
          where: { name: skill },
        });
        let studentSkill: StudentSkill;
        if (foundedSkill) {
          Skills.push(foundedSkill);
          studentSkill = queryRunner.manager.create(StudentSkill, {
            student: savedStudent,
            skill: foundedSkill,
          });
        } else {
          const newSkill = queryRunner.manager.create(Skill, { name: skill });
          const savedSkill = await queryRunner.manager.save(newSkill);
          Skills.push(savedSkill);
          studentSkill = queryRunner.manager.create(StudentSkill, {
            student: savedStudent,
            skill: savedSkill,
          });
        }
        await queryRunner.manager.save(studentSkill);
      }
      await queryRunner.commitTransaction();
      return savedStudent;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno al crear estudiante.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    try {
      return await this.studentRepository.find({ relations: ['userProfile'] });
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno al listar estudiantes',
      );
    }
  }

  async findOne(id: number) {
    try {
      const student = await this.studentRepository.findOne({
        where: { id },
        relations: ['userProfile'],
      });
      if (!student) {
        throw new NotFoundException('Estudiante no encontrado');
      }
      return student;
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno al buscar estudiante',
      );
    }
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Actualiza perfil de usuario
      const student = await queryRunner.manager.findOne(Student, {
        where: { id },
        relations: ['userProfile'],
      });
      if (!student) {
        throw new NotFoundException('Estudiante no encontrado');
      }
      const userProfile = await queryRunner.manager.findOne(UserProfile, {
        where: { id: student.userProfile.id },
      });
      if (!userProfile) {
        throw new NotFoundException('Perfil de usuario no encontrado');
      }
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userProfile.user.id },
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      const userProfileDto = {
        first_name: updateStudentDto.first_name,
        last_name: updateStudentDto.last_name,
        email: updateStudentDto.email,
        phone: updateStudentDto.phone,
        location: updateStudentDto.location,
      };
      queryRunner.manager.merge(UserProfile, userProfile, userProfileDto);
      await queryRunner.manager.save(userProfile);
      // Actualiza datos de estudiante
      const studentDto = {
        institution: updateStudentDto.institution,
        education_start_date: updateStudentDto.education_start_date,
        education_end_date: updateStudentDto.education_end_date,
        studying: updateStudentDto.studying,
        description: updateStudentDto.description,
        availability: updateStudentDto.availability,
      };
      // Busca skills
      const Skills = new Array<Skill>();
      if (updateStudentDto.skills && updateStudentDto.skills.length > 0) {
        for (const skill of updateStudentDto.skills) {
          const foundedSkill = await queryRunner.manager.findOne(Skill, {
            where: { name: skill },
          });
          if (foundedSkill) {
            Skills.push(foundedSkill);
          } else {
            const newSkill = queryRunner.manager.create(Skill, { name: skill });
            const savedSkill = await queryRunner.manager.save(newSkill);
            Skills.push(savedSkill);
          }
        }
        student.skills = Skills;
      }
      queryRunner.manager.merge(Student, student, studentDto);
      await queryRunner.manager.save(student);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno al actualizar estudiante.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    try {
      const student = await this.studentRepository.findOneBy({ id });
      if (!student) {
        throw new NotFoundException('Estudiante no encontrado');
      }
      return await this.studentRepository.remove(student);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno al eliminar estudiante.',
      );
    }
  }
}
