import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/user/oss';
import * as path from 'path';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads/avatar',
      storage: storage,
      limits: {
        fileSize: 1024 * 1024 * 3,
      },
      fileFilter(req, file, callback) {
        const extName = path.extname(file.originalname);
        if (['.jpg', '.png', 'gif'].includes(extName)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Upload file Error'), false);
        }
      },
    }),
  )
  @Post('upload/avt')
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('upload file -> ', file.path);
    return file.path;
  }

  @Post('new')
  register(@Body() registerUserDto: RegisterUserDto) {
    console.log('register: ', registerUserDto);
    return this.userService.register(registerUserDto);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
