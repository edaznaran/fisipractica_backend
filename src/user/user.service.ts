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
import { UserProfile } from './entities/user_profile.entity';
import { Role } from './enums/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
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
      });
      const response = await queryRunner.manager.save(user);

      const profile = queryRunner.manager.create(UserProfile, {
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        email: createUserDto.email,
        phone: createUserDto.phone,
        location: createUserDto.location,
        user: user,
      });
      await queryRunner.manager.save(profile);

      return {
        id: response.id,
        email: response.email,
        role: response.role,
        active: response.active,
        profile: profile,
        created_date: response.create_date,
        updated_date: response.update_date,
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
      const users = await this.userRepository.find({ relations: ['profile'] });
      const response = users.map((user) => {
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          active: user.active,
          profile: user.profile,
          created_date: user.create_date,
          updated_date: user.update_date,
        };
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
        relations: ['profile'],
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        active: user.active,
        profile: user.profile,
        created_date: user.create_date,
        updated_date: user.update_date,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al buscar usuario');
    }
  }

  async findByEmail(email: string, role: Role): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email, role } });
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
      await this.userRepository.update({ id: user.id }, updateUserDto);
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
