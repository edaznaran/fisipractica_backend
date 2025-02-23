import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CreateRecruiterDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';
import { RecruiterService } from './recruiter.service';

@ApiBearerAuth('JWT-auth')
@Controller('recruiter')
export class RecruiterController {
  constructor(private readonly recruiterService: RecruiterService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear reclutador' })
  create(
    @Body() createRecruiterDto: CreateRecruiterDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.recruiterService.create(createRecruiterDto, photo);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los reclutadores' })
  findAll() {
    return this.recruiterService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar reclutador por ID' })
  findOne(@Param('id') id: string) {
    return this.recruiterService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar reclutador por ID' })
  update(
    @Param('id') id: string,
    @Body() updateRecruiterDto: UpdateRecruiterDto,
  ) {
    return this.recruiterService.update(+id, updateRecruiterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar reclutador por ID' })
  remove(@Param('id') id: string) {
    return this.recruiterService.remove(+id);
  }
}
