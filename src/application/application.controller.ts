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
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@ApiBearerAuth('JWT-auth')
@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Postular a un trabajo' })
  create(@Body() createApplicationDto: CreateApplicationDto) {
    console.log('Creating application with data:', createApplicationDto);
    return this.applicationService.create(createApplicationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las postulaciones' })
  findAll() {
    return this.applicationService.findAll();
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Listar postulaciones por estudiante' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.applicationService.findByStudent(+studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar postulacion por ID' })
  findOne(@Param('id') id: string) {
    return this.applicationService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar postulacion por ID' })
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationService.update(+id, updateApplicationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar postulacion por ID' })
  remove(@Param('id') id: string) {
    return this.applicationService.remove(+id);
  }
}
