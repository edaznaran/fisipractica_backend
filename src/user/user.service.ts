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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Verifica si el usuario ya existe
      const userExists = await queryRunner.manager.findOne(User, {
        where: { email: createUserDto.email, role: createUserDto.role },
      });
      if (userExists) {
        throw new ConflictException('El usuario ya existe');
      }

      const saltOrRounds = 10;
      const hashedpassword = await bcrypt.hash(
        createUserDto.password,
        saltOrRounds,
      );
      const user = queryRunner.manager.create(User, {
        email: createUserDto.email,
        password: hashedpassword,
        role: createUserDto.role,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        phone: createUserDto.phone,
        location: createUserDto.location,
      });
      const response = await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      return {
        id: response.id,
        email: response.email,
        role: response.role,
        active: response.active,
        create_date: response.create_date,
        update_date: response.update_date,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al crear usuario.');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find({
        relations: ['student', 'recruiter'],
      });
      const response = users.map((user) => {
        delete user.password; // Elimina la contraseña del objeto de respuesta
        return user;
      });

      return response;
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno al listar usuarios',
      );
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['student', 'recruiter'],
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      delete user.password; // Elimina la contraseña del objeto de respuesta
      return user;
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al buscar usuario');
    }
  }

  async findByEmail(email: string, role: Role): Promise<User> {
    let relations: string[] = [];
    if (role === Role.STUDENT) {
      relations = ['student'];
    } else if (role === Role.RECRUITER) {
      relations = ['recruiter'];
    }
    const user = await this.userRepository.findOne({
      where: { email, role },
      relations: relations,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (updateUserDto.password) {
        const saltOrRounds = 10;
        const hashedpassword = await bcrypt.hash(
          updateUserDto.password,
          saltOrRounds,
        );
        updateUserDto.password = hashedpassword;
      }

      const newUserDto = {
        email: updateUserDto.email,
        password: updateUserDto.password,
        role: updateUserDto.role,
        first_name: updateUserDto.first_name,
        last_name: updateUserDto.last_name,
        phone: updateUserDto.phone,
        location: updateUserDto.location,
      };

      await this.userRepository.update({ id: user.id }, newUserDto);
      return {
        ...user,
        ...updateUserDto,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno al actualizar usuario',
      );
    }
  }

  async remove(id: number) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      await this.userRepository.delete({ id: user.id });
      return {
        message: 'User eliminado con éxito',
      };
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno al eliminar usuario',
      );
    }
  }
}
