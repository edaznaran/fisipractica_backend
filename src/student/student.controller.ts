import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentService } from './student.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth('JWT-auth')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @UseInterceptors(FileInterceptor('cv'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear estudiante' })
  create(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFile() cv: Express.Multer.File,
  ) {
    return this.studentService.create(createStudentDto, cv);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los estudiantes' })
  findAll() {
    return this.studentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar estudiante por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar estudiante por ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar estudiante por ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.remove(+id);
  }
}
