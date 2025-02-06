import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      // Verifica si el usuario ya existe
      const userExists = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (userExists) {
        throw new ConflictException('El usuario ya existe');
      }
      const saltOrRounds = 10; /* 
      const password = Array(8)
        .fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
        .map((x: string) => x[Math.floor(Math.random() * x.length)])
        .join(''); */
      const hashedpassword = await bcrypt.hash(
        createUserDto.password,
        saltOrRounds,
      );
      createUserDto.password = hashedpassword;
      const user = this.userRepository.create(createUserDto);
      const response = await this.userRepository.save(user);
      return {
        id: response.id,
        name: response.name,
        email: response.email,
        active: response.active,
        created_date: response.created_date,
        updated_date: response.updated_date,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al crear usuario.');
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find();
      const response = users.map((user) => {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          active: user.active,
          created_date: user.created_date,
          updated_date: user.updated_date,
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
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        active: user.active,
        created_date: user.created_date,
        updated_date: user.updated_date,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al buscar usuario');
    }
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
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
