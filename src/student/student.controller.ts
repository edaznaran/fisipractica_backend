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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentService } from './student.service';

@ApiBearerAuth('JWT-auth')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Public()
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo', maxCount: 1 },
      { name: 'cv', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear estudiante' })
  create(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFiles()
    files: { photo: Express.Multer.File[]; cv: Express.Multer.File[] },
  ) {
    console.log('cv:', files);
    return this.studentService.create(createStudentDto, files.photo, files.cv);
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
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualizar estudiante por ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.studentService.update(+id, updateStudentDto, photo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar estudiante por ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.remove(+id);
  }
}
