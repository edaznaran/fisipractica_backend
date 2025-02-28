import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, photo: Express.Multer.File) {
    try {
      const company = this.companyRepository.create({
        name: createCompanyDto.name,
        address: createCompanyDto.address,
        description: createCompanyDto.description,
        website: createCompanyDto.website,
        location: createCompanyDto.location,
        color: createCompanyDto.color,
        photo: photo ? photo.buffer : undefined,
      });
      return await this.companyRepository.save(company);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear la empresa');
    }
  }

  async findAll() {
    try {
      const companies = await this.companyRepository.find();
      return companies;
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al listar las empresas');
    }
  }

  async findOne(id: number) {
    try {
      const company = await this.companyRepository.findOne({
        where: { id },
        relations: ['recruiters', 'jobs'],
      });
      if (!company) {
        throw new NotFoundException('Empresa no encontrada');
      }
      return company;
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar la empresa');
    }
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    try {
      const company = await this.companyRepository.findOneBy({ id });
      if (!company) {
        throw new NotFoundException('Empresa no encontrada');
      }
      Object.assign(company, updateCompanyDto);
      return await this.companyRepository.save(company);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la empresa');
    }
  }

  async remove(id: number) {
    try {
      const company = await this.companyRepository.findOne({
        where: { id },
        relations: ['recruiters', 'jobs'],
      });
      if (!company) {
        throw new NotFoundException('Empresa no encontrada');
      }
      if (company.recruiters.length) {
        throw new ConflictException(
          'No se puede eliminar una empresa con reclutadores asociados',
        );
      }
      if (company.jobs.length) {
        throw new ConflictException(
          'No se puede eliminar una empresa con trabajos asociados',
        );
      }
      return await this.companyRepository.remove(company);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la empresa');
    }
  }
}
