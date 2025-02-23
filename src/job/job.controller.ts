import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobService } from './job.service';

@ApiBearerAuth('JWT-auth')
@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @ApiOperation({ summary: 'Crear trabajo' })
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobService.create(createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los trabajos' })
  findAll() {
    return this.jobService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar trabajo por ID' })
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar trabajo por ID' })
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService.update(+id, updateJobDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar trabajo por ID' })
  remove(@Param('id') id: string) {
    return this.jobService.remove(+id);
  }
}
