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
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/user/oss';
import * as path from 'path';
import * as fs from 'fs';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('merge-file')
  async mergeFile(@Query('file') fileName: string) {
    const nameDir = 'uploads/chunks-' + fileName;
    const mergeDir = 'uploads/merge';
    
    // Đảm bảo thư mục merge tồn tại
    if (!fs.existsSync(mergeDir)) {
      fs.mkdirSync(mergeDir, { recursive: true });
    }

    // Đọc danh sách file chunks
    const files = fs.readdirSync(nameDir);
    const mergeFilePath = `${mergeDir}/${fileName}`;

    // Tạo Promise để đợi tất cả chunks được merge xong
    const mergePromises = files.map((file, index) => {
      return new Promise<void>((resolve, reject) => {
        const filePath = `${nameDir}/${file}`;
        const fileStat = fs.statSync(filePath);
        const startPos = files
          .slice(0, index)
          .reduce((pos, f) => pos + fs.statSync(`${nameDir}/${f}`).size, 0);

        console.log('filePath -> ', filePath, 'startPos -> ', startPos);

        const readStream = fs.createReadStream(filePath);
        const writeStream = fs.createWriteStream(mergeFilePath, {
          flags: index === 0 ? 'w' : 'r+',
          start: startPos,
        });

        readStream.pipe(writeStream);

        writeStream.on('finish', () => {
          resolve();
        });

        writeStream.on('error', (err) => {
          reject(err);
        });
      });
    });

    try {
      // Đợi tất cả chunks được merge xong
      await Promise.all(mergePromises);

      // Xóa thư mục chunks sau khi merge xong
      fs.rm(nameDir, { recursive: true }, (err) => {
        if (err) {
          console.log('Error deleting chunks directory -> ', err);
        }
      });

      return {
        link: `http://localhost:3000/uploads/merge/${fileName}`,
        fileName: fileName,
        message: 'Merge file thành công',
      };
    } catch (error) {
      throw new BadRequestException(`Lỗi khi merge file: ${error.message}`);
    }
  }

  @UseInterceptors(
      FilesInterceptor('file', 20, {
        dest: 'uploads',
      }),
    )
    @Post('upload/large-file')
  uploadLargeFile(@UploadedFiles() file: Array<Express.Multer.File>, @Body() body: any) {
    console.log('upload file body -> ', body);
    console.log('upload files -> ', file);
    return body;
  }

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
